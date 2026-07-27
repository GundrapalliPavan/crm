import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ApiCollectionResponse, CommunicationTemplate } from '@crm/types';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CreateCommunicationTemplateDto } from './dto/create-communication-template.dto';
import { ListCommunicationTemplatesQuery } from './dto/list-communication-templates.query';
import { UpdateCommunicationTemplateDto } from './dto/update-communication-template.dto';
import { toCommunicationTemplate } from './communication-template.mapper';

@Injectable()
export class CommunicationTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListCommunicationTemplatesQuery): Promise<ApiCollectionResponse<CommunicationTemplate>> {
    const where: Prisma.CommunicationTemplateWhereInput = {};
    if (query.channel) where.channel = query.channel;
    if (query.status) where.status = query.status;

    const [rows, totalItems] = await Promise.all([
      this.prisma.communicationTemplate.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.communicationTemplate.count({ where }),
    ]);

    return {
      data: rows.map(toCommunicationTemplate),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.pageSize)),
      },
    };
  }

  async getById(id: string): Promise<CommunicationTemplate> {
    return toCommunicationTemplate(await this.getOrThrow(id));
  }

  async create(dto: CreateCommunicationTemplateDto, actorUserId: string): Promise<CommunicationTemplate> {
    await this.assertNoDuplicate(dto.name, dto.channel);

    const template = await this.prisma.communicationTemplate.create({
      data: {
        name: dto.name,
        channel: dto.channel,
        purpose: dto.purpose,
        subjectTemplate: dto.subjectTemplate,
        bodyTemplate: dto.bodyTemplate,
        providerTemplateId: dto.providerTemplateId,
        languageCode: dto.languageCode,
        status: dto.status,
        createdBy: actorUserId,
      },
    });
    return toCommunicationTemplate(template);
  }

  async update(id: string, dto: UpdateCommunicationTemplateDto): Promise<CommunicationTemplate> {
    const existing = await this.getOrThrow(id);
    if (dto.name || dto.channel) {
      await this.assertNoDuplicate(dto.name ?? existing.name, dto.channel ?? existing.channel, id);
    }

    const template = await this.prisma.communicationTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        channel: dto.channel,
        purpose: dto.purpose,
        subjectTemplate: dto.subjectTemplate,
        bodyTemplate: dto.bodyTemplate,
        providerTemplateId: dto.providerTemplateId,
        languageCode: dto.languageCode,
        status: dto.status,
      },
    });
    return toCommunicationTemplate(template);
  }

  async getOrThrow(id: string) {
    const template = await this.prisma.communicationTemplate.findUnique({ where: { id } });
    if (!template) {
      throw new NotFoundError('Communication template not found.');
    }
    return template;
  }

  private async assertNoDuplicate(name: string, channel: string, excludingId?: string): Promise<void> {
    const existing = await this.prisma.communicationTemplate.findUnique({
      where: { name_channel: { name, channel: channel as never } },
    });
    if (existing && existing.id !== excludingId) {
      throw new ConflictError(`A ${channel} template named "${name}" already exists.`);
    }
  }
}
