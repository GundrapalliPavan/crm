import { Injectable } from '@nestjs/common';
import type { Warehouse } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { ConflictError, NotFoundError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WAREHOUSE_INCLUDE, toWarehouse } from './warehouse.mapper';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(): Promise<{ data: Warehouse[] }> {
    const warehouses = await this.prisma.warehouse.findMany({
      include: WAREHOUSE_INCLUDE,
      orderBy: { name: 'asc' },
    });
    return { data: warehouses.map(toWarehouse) };
  }

  async getById(id: string): Promise<Warehouse> {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: WAREHOUSE_INCLUDE,
    });
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found.');
    }
    return toWarehouse(warehouse);
  }

  async create(dto: CreateWarehouseDto, actorUserId: string): Promise<Warehouse> {
    await this.assertNoDuplicateCode(dto.code);
    if (dto.managerId) {
      await this.assertManagerExists(dto.managerId);
    }

    const warehouse = await this.prisma.warehouse.create({
      data: { code: dto.code, name: dto.name, managerId: dto.managerId },
      include: WAREHOUSE_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'warehouse.created',
      entityType: 'warehouse',
      entityId: warehouse.id,
      afterData: { code: warehouse.code, name: warehouse.name },
    });

    return toWarehouse(warehouse);
  }

  async update(id: string, dto: UpdateWarehouseDto, actorUserId: string): Promise<Warehouse> {
    const existing = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Warehouse not found.');
    }
    if (dto.managerId) {
      await this.assertManagerExists(dto.managerId);
    }

    const warehouse = await this.prisma.warehouse.update({
      where: { id },
      data: dto,
      include: WAREHOUSE_INCLUDE,
    });

    await this.auditService.record({
      actorUserId,
      action: 'warehouse.updated',
      entityType: 'warehouse',
      entityId: id,
      beforeData: { name: existing.name, managerId: existing.managerId, isActive: existing.isActive },
      afterData: { name: warehouse.name, managerId: warehouse.managerId, isActive: warehouse.isActive },
    });

    return toWarehouse(warehouse);
  }

  private async assertNoDuplicateCode(code: string): Promise<void> {
    const existing = await this.prisma.warehouse.findFirst({
      where: { code: { equals: code, mode: 'insensitive' } },
    });
    if (existing) {
      throw new ConflictError(`A warehouse with code "${code}" already exists.`);
    }
  }

  private async assertManagerExists(managerId: string): Promise<void> {
    const manager = await this.prisma.user.findUnique({ where: { id: managerId } });
    if (!manager) {
      throw new NotFoundError('Manager not found.');
    }
  }
}
