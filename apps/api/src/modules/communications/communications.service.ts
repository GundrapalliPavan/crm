import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, Communication, RelatedEntityType } from '@crm/types';
import { resolveTemplate } from '../../common/communication/template-variables';
import { BusinessRuleError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import {
  COMMUNICATION_PROVIDER,
  type CommunicationProvider,
} from '../../infrastructure/messaging/communication-provider.interface';
import { CreateCommunicationDto } from './dto/create-communication.dto';
import { ListCommunicationsQuery } from './dto/list-communications.query';
import { COMMUNICATION_INCLUDE, toCommunication, type CommunicationWithRelations } from './communication.mapper';

@Injectable()
export class CommunicationsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(COMMUNICATION_PROVIDER) private readonly provider: CommunicationProvider,
  ) {}

  async list(query: ListCommunicationsQuery): Promise<ApiCollectionResponse<Communication>> {
    const where: Prisma.CommunicationWhereInput = {};
    if (query.channel) where.channel = query.channel;
    if (query.status) where.status = query.status;
    if (query.relatedEntityType) where.relatedEntityType = query.relatedEntityType;
    if (query.relatedEntityId) where.relatedEntityId = query.relatedEntityId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setUTCDate(to.getUTCDate() + 1);
        where.createdAt.lt = to;
      }
    }

    const [rows, totalItems] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        include: COMMUNICATION_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.communication.count({ where }),
    ]);

    return {
      data: rows.map(toCommunication),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<Communication> {
    const communication = await this.prisma.communication.findUnique({ where: { id }, include: COMMUNICATION_INCLUDE });
    if (!communication) {
      throw new NotFoundError('Communication not found.');
    }
    return toCommunication(communication);
  }

  /**
   * API.md sections 85-86: create the record, then attempt to send - never
   * the reverse. Even though the only provider configured today always
   * reports failure (no real WhatsApp/Email/SMS integration exists), the
   * record is created first so the attempt is never lost if the provider
   * call itself throws.
   */
  async create(dto: CreateCommunicationDto, actorUserId: string): Promise<Communication> {
    if (dto.relatedEntityType || dto.relatedEntityId) {
      if (!dto.relatedEntityType || !dto.relatedEntityId) {
        throw new ValidationError({
          relatedEntityType: ['relatedEntityType and relatedEntityId must be provided together.'],
        });
      }
      await this.assertEntityExists(dto.relatedEntityType, dto.relatedEntityId);
    }

    const { subject, messageBody } = await this.resolveContent(dto);

    let communication: CommunicationWithRelations = await this.prisma.communication.create({
      data: {
        channel: dto.channel,
        direction: 'outbound',
        status: 'queued',
        recipient: dto.recipient,
        subject,
        messageBody,
        templateId: dto.templateId,
        relatedEntityType: dto.relatedEntityType,
        relatedEntityId: dto.relatedEntityId,
        createdBy: actorUserId,
        queuedAt: new Date(),
      },
      include: COMMUNICATION_INCLUDE,
    });

    const result = await this.provider.send({ channel: dto.channel, recipient: dto.recipient, subject: subject ?? undefined, messageBody: messageBody ?? '' });

    communication = await this.prisma.communication.update({
      where: { id: communication.id },
      data:
        result.status === 'sent'
          ? { status: 'sent', sentAt: new Date(), providerMessageId: result.providerMessageId }
          : { status: 'failed', failedAt: new Date(), failureReason: result.failureReason },
      include: COMMUNICATION_INCLUDE,
    });

    return toCommunication(communication);
  }

  private async resolveContent(dto: CreateCommunicationDto): Promise<{ subject: string | null; messageBody: string }> {
    if (dto.templateId) {
      const template = await this.prisma.communicationTemplate.findUnique({ where: { id: dto.templateId } });
      if (!template) {
        throw new NotFoundError('Communication template not found.');
      }
      if (template.channel !== dto.channel) {
        throw new BusinessRuleError(
          'INVALID_STATE_TRANSITION',
          `This template is for ${template.channel}, not ${dto.channel}.`,
        );
      }
      const variables = dto.variables ?? {};
      return {
        subject: template.subjectTemplate ? resolveTemplate(template.subjectTemplate, variables) : null,
        messageBody: resolveTemplate(template.bodyTemplate, variables),
      };
    }

    if (!dto.messageBody) {
      throw new ValidationError({ messageBody: ['Provide either a templateId or a messageBody.'] });
    }
    return { subject: dto.subject ?? null, messageBody: dto.messageBody };
  }

  private async assertEntityExists(type: RelatedEntityType, id: string): Promise<void> {
    const exists = await this.entityExists(type, id);
    if (!exists) {
      throw new NotFoundError(`${type.replace('_', ' ')} not found.`);
    }
  }

  private async entityExists(type: RelatedEntityType, id: string): Promise<boolean> {
    switch (type) {
      case 'lead':
        return Boolean(await this.prisma.lead.findUnique({ where: { id }, select: { id: true } }));
      case 'contact':
        return Boolean(await this.prisma.contact.findUnique({ where: { id }, select: { id: true } }));
      case 'company':
        return Boolean(await this.prisma.company.findUnique({ where: { id }, select: { id: true } }));
      case 'quotation':
        return Boolean(await this.prisma.quotation.findUnique({ where: { id }, select: { id: true } }));
      case 'sales_order':
        return Boolean(await this.prisma.salesOrder.findUnique({ where: { id }, select: { id: true } }));
      case 'purchase_order':
        return Boolean(await this.prisma.purchaseOrder.findUnique({ where: { id }, select: { id: true } }));
      case 'goods_receipt':
        return Boolean(await this.prisma.goodsReceipt.findUnique({ where: { id }, select: { id: true } }));
      case 'invoice':
        return Boolean(await this.prisma.invoice.findUnique({ where: { id }, select: { id: true } }));
      case 'payment':
        return Boolean(await this.prisma.payment.findUnique({ where: { id }, select: { id: true } }));
      case 'product':
        return Boolean(await this.prisma.product.findUnique({ where: { id }, select: { id: true } }));
    }
  }
}
