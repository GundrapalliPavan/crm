import type { Warehouse as PrismaWarehouse, User } from '@prisma/client';
import type { Warehouse } from '@crm/types';

export type WarehouseWithRelations = PrismaWarehouse & {
  manager: Pick<User, 'id' | 'firstName' | 'lastName'> | null;
};

export const WAREHOUSE_INCLUDE = {
  manager: { select: { id: true, firstName: true, lastName: true } },
} as const;

export function toWarehouse(warehouse: WarehouseWithRelations): Warehouse {
  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    manager: warehouse.manager,
    isActive: warehouse.isActive,
    createdAt: warehouse.createdAt.toISOString(),
    updatedAt: warehouse.updatedAt.toISOString(),
  };
}
