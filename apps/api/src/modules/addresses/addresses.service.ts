import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { Address } from '@crm/types';
import { AuditService } from '../../common/audit/audit.service';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';
import { PrismaService } from '../../database/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { ListAddressesQuery } from './dto/list-addresses.query';
import { UpdateAddressDto } from './dto/update-address.dto';
import { toAddress } from './address.mapper';

type OwnerIds = { companyId?: string; contactId?: string; warehouseId?: string };

/** A cleared optional text field submits as "", not an absent key - normalized here so it doesn't override a database default (e.g. countryCode) or get stored as a meaningless empty string. */
function blankToUndefined(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function blankToNull(value?: string): string | null {
  return blankToUndefined(value) ?? null;
}

@Injectable()
export class AddressesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: ListAddressesQuery): Promise<{ data: Address[] }> {
    const owner = this.ownerFromIds(query);
    const addresses = await this.prisma.address.findMany({
      where: this.ownerWhere(owner),
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    return { data: addresses.map(toAddress) };
  }

  async create(dto: CreateAddressDto, actorUserId: string): Promise<Address> {
    const owner = this.ownerFromIds(dto);
    await this.assertOwnerExists(owner);

    const address = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { ...this.ownerWhere(owner), addressType: dto.addressType },
          data: { isDefault: false },
        });
      }
      return tx.address.create({
        data: {
          companyId: owner.companyId,
          contactId: owner.contactId,
          warehouseId: owner.warehouseId,
          addressType: dto.addressType,
          line1: dto.line1,
          line2: blankToUndefined(dto.line2),
          city: dto.city,
          state: dto.state,
          stateCode: blankToUndefined(dto.stateCode),
          postalCode: blankToUndefined(dto.postalCode),
          countryCode: blankToUndefined(dto.countryCode),
          isDefault: dto.isDefault ?? false,
        },
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'address.created',
      entityType: 'address',
      entityId: address.id,
      afterData: { ...owner, addressType: address.addressType, line1: address.line1, city: address.city },
    });

    return toAddress(address);
  }

  async update(id: string, dto: UpdateAddressDto, actorUserId: string): Promise<Address> {
    const existing = await this.prisma.address.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Address not found.');
    }
    const owner: OwnerIds = {
      companyId: existing.companyId ?? undefined,
      contactId: existing.contactId ?? undefined,
      warehouseId: existing.warehouseId ?? undefined,
    };
    const addressType = dto.addressType ?? existing.addressType;

    const address = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { ...this.ownerWhere(owner), addressType, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.address.update({
        where: { id },
        data: {
          addressType: dto.addressType,
          line1: dto.line1,
          line2: dto.line2 !== undefined ? blankToNull(dto.line2) : undefined,
          city: dto.city,
          state: dto.state,
          stateCode: dto.stateCode !== undefined ? blankToNull(dto.stateCode) : undefined,
          postalCode: dto.postalCode !== undefined ? blankToNull(dto.postalCode) : undefined,
          // countryCode has no NULL state in the schema (DB default "IN") - an explicit blank resets to that default rather than clearing it.
          countryCode: dto.countryCode !== undefined ? (blankToUndefined(dto.countryCode) ?? 'IN') : undefined,
          isDefault: dto.isDefault,
        },
      });
    });

    await this.auditService.record({
      actorUserId,
      action: 'address.updated',
      entityType: 'address',
      entityId: id,
      beforeData: { line1: existing.line1, city: existing.city, postalCode: existing.postalCode },
      afterData: { line1: address.line1, city: address.city, postalCode: address.postalCode },
    });

    return toAddress(address);
  }

  async delete(id: string, actorUserId: string): Promise<void> {
    const existing = await this.prisma.address.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Address not found.');
    }
    await this.prisma.address.delete({ where: { id } });

    await this.auditService.record({
      actorUserId,
      action: 'address.deleted',
      entityType: 'address',
      entityId: id,
      beforeData: {
        companyId: existing.companyId,
        contactId: existing.contactId,
        warehouseId: existing.warehouseId,
        addressType: existing.addressType,
        line1: existing.line1,
        city: existing.city,
      },
    });
  }

  /** DATABASE.md section 36: an address belongs to exactly one owner - mirrors the database CHECK constraint at the application layer, with a friendly error instead of a raw constraint violation. */
  private ownerFromIds(ids: OwnerIds): OwnerIds {
    const ownerCount = [ids.companyId, ids.contactId, ids.warehouseId].filter(Boolean).length;
    if (ownerCount !== 1) {
      throw new ValidationError({
        companyId: ['Provide exactly one of companyId, contactId or warehouseId.'],
      });
    }
    return ids;
  }

  private ownerWhere(owner: OwnerIds): Prisma.AddressWhereInput {
    if (owner.companyId) return { companyId: owner.companyId };
    if (owner.contactId) return { contactId: owner.contactId };
    return { warehouseId: owner.warehouseId };
  }

  private async assertOwnerExists(owner: OwnerIds): Promise<void> {
    if (owner.companyId) {
      const company = await this.prisma.company.findUnique({ where: { id: owner.companyId }, select: { id: true } });
      if (!company) throw new NotFoundError('Company not found.');
      return;
    }
    if (owner.contactId) {
      const contact = await this.prisma.contact.findUnique({ where: { id: owner.contactId }, select: { id: true } });
      if (!contact) throw new NotFoundError('Contact not found.');
      return;
    }
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: owner.warehouseId }, select: { id: true } });
    if (!warehouse) throw new NotFoundError('Warehouse not found.');
  }
}
