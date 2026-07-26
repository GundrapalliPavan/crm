import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PasswordService } from '../auth/services/password.service';
import { SessionService } from '../auth/services/session.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  // PasswordService and SessionService are not exported by AuthModule (they
  // are login/session internals), so this module provides its own instances
  // rather than widening AuthModule's public surface for one consumer.
  providers: [UsersService, PasswordService, SessionService],
})
export class UsersModule {}
