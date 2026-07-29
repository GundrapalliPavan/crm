import { Injectable } from '@nestjs/common';
import type { Brand as BrandModel } from '@prisma/client';
import type { Brand } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(): Promise<{ data: Brand[] }> {
    const brands = await this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return { data: brands.map((brand) => this.toBrand(brand)) };
  }

  async getById(id: string): Promise<Brand> {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      throw new NotFoundError('Brand not found.');
    }
    return this.toBrand(brand);
  }

  async create(dto: CreateBrandDto, actorUserId: string): Promise<Brand> {
    await this.assertNoDuplicateName(dto.name);

    const brand = await this.prisma.brand.create({
      data: { name: dto.name, description: dto.description },
    });

    await this.auditService.record({
      actorUserId,
      action: 'brand.created',
      entityType: 'brand',
      entityId: brand.id,
      afterData: { name: brand.name },
    });

    return this.toBrand(brand);
  }

  async update(id: string, dto: UpdateBrandDto, actorUserId: string): Promise<Brand> {
    const existing = await this.prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Brand not found.');
    }
    if (dto.name !== undefined) {
      await this.assertNoDuplicateName(dto.name, id);
    }

    const brand = await this.prisma.brand.update({ where: { id }, data: dto });

    await this.auditService.record({
      actorUserId,
      action: 'brand.updated',
      entityType: 'brand',
      entityId: id,
      beforeData: { name: existing.name, isActive: existing.isActive },
      afterData: { name: brand.name, isActive: brand.isActive },
    });

    return this.toBrand(brand);
  }

  private async assertNoDuplicateName(name: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.brand.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (existing) {
      throw new ConflictError(`A brand named "${name}" already exists.`);
    }
  }

  private toBrand(brand: BrandModel): Brand {
    return {
      id: brand.id,
      name: brand.name,
      description: brand.description,
      isActive: brand.isActive,
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    };
  }
}
