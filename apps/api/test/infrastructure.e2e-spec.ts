import { Body, Controller, Get, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { REQUEST_ID_HEADER } from '@crm/types';
import { IsEmail, IsInt, Min } from 'class-validator';
import request from 'supertest';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { APP_CREATE_OPTIONS, configureApp } from '../src/app';
import { AppModule } from '../src/app.module';
import { BusinessRuleError, NotFoundError } from '../src/common/errors/app-error';
import { Public } from '../src/modules/auth/decorators/public.decorator';

class SampleDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  email!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

/**
 * Exercises the infrastructure through routes that exist only in this suite, so
 * no business endpoint has to be invented to test validation and error mapping.
 *
 * @Public(): this suite tests generic request-handling infrastructure, not
 * authentication - it must keep working the same way regardless of the global
 * auth guards added for Step 4.
 */
@Public()
@Controller('test-fixtures')
class TestFixturesController {
  @Post('validate')
  validate(@Body() body: SampleDto): SampleDto {
    return body;
  }

  @Get('domain-error')
  domainError(): never {
    throw new BusinessRuleError('INVALID_STATE_TRANSITION', 'This order cannot be confirmed.');
  }

  @Get('not-found')
  notFound(): never {
    throw new NotFoundError();
  }

  @Get('unexpected')
  unexpected(): never {
    throw new Error('Connection string postgres://user:hunter2@db:5432 failed');
  }
}

describe('API infrastructure', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestFixturesController],
    }).compile();

    // Configured through the same helper production uses, so middleware
    // ordering is genuinely under test rather than approximated.
    app = moduleRef.createNestApplication<NestExpressApplication>(APP_CREATE_OPTIONS);
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('health', () => {
    it('reports liveness without touching dependencies', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });

    it('reports readiness with the real database state', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health/ready');

      // No database is required for this suite: the probe must honestly report
      // whichever state it finds, and pair the status code to it.
      expect([200, 503]).toContain(response.status);
      expect(response.body).toMatchObject({
        status: response.status === 200 ? 'ready' : 'not_ready',
        dependencies: { database: response.status === 200 ? 'up' : 'down' },
      });
    });
  });

  describe('request correlation', () => {
    it('returns a generated request ID', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

      expect(response.headers[REQUEST_ID_HEADER]).toMatch(/^req_/);
    });

    it('propagates a well-formed inbound request ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set(REQUEST_ID_HEADER, 'req_trace-from-client')
        .expect(200);

      expect(response.headers[REQUEST_ID_HEADER]).toBe('req_trace-from-client');
    });

    it('replaces an inbound request ID containing unsafe characters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .set(REQUEST_ID_HEADER, 'not a valid id')
        .expect(200);

      expect(response.headers[REQUEST_ID_HEADER]).toMatch(/^req_/);
      expect(response.headers[REQUEST_ID_HEADER]).not.toBe('not a valid id');
    });
  });

  describe('error contract', () => {
    it('returns the standard envelope for an unknown route', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/no-such-route').expect(404);

      expect(response.body.error).toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
      expect(response.body.error.requestId).toEqual(expect.any(String));
    });

    it('normalises validation failures into per-field messages', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/test-fixtures/validate')
        .send({ email: 'not-an-email', quantity: 0 })
        .expect(422);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields.email).toContain('Enter a valid email address.');
      expect(response.body.error.fields.quantity).toEqual(expect.any(Array));
      expect(response.body.error.requestId).toEqual(expect.any(String));
    });

    it('rejects unknown properties rather than silently accepting them', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/test-fixtures/validate')
        .send({ email: 'user@example.com', quantity: 2, isAdmin: true })
        .expect(422);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('surfaces domain errors with their own stable code', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/test-fixtures/domain-error')
        .expect(409);

      expect(response.body.error).toMatchObject({
        code: 'INVALID_STATE_TRANSITION',
        message: 'This order cannot be confirmed.',
      });
    });

    it('maps a not-found domain error to 404', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/test-fixtures/not-found')
        .expect(404);

      expect(response.body.error.code).toBe('RESOURCE_NOT_FOUND');
    });

    it('reports an oversized request body as 413, not a server fault', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/test-fixtures/validate')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ email: 'a@b.co', padding: 'x'.repeat(1_200_000) }))
        .expect(413);

      expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
      // Body-parser rejects the request before it reaches any route, so this
      // also proves the correlation ID is established ahead of body parsing.
      expect(response.body.error.requestId).toMatch(/^req_/);
    });

    it('reports malformed JSON as a client error', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/test-fixtures/validate')
        .set('Content-Type', 'application/json')
        .send('{"email": broken')
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('never leaks internals from an unexpected error', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/test-fixtures/unexpected')
        .expect(500);

      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.requestId).toEqual(expect.any(String));

      const serialised = JSON.stringify(response.body);
      expect(serialised).not.toContain('hunter2');
      expect(serialised).not.toContain('postgres://');
      expect(serialised).not.toContain('stack');
    });
  });
});
