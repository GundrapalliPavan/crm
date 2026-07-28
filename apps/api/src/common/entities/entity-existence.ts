import type { RelatedEntityType } from '@crm/types';
import { NotFoundError } from '../errors/app-error';
import { PrismaService } from '../../database/prisma.service';

/**
 * Shared across every module that polymorphically attaches to one of the ten
 * `RelatedEntityType`s (originally written for Communications, promoted here
 * once Files needed the identical check).
 */
export async function entityExists(prisma: PrismaService, type: RelatedEntityType, id: string): Promise<boolean> {
  switch (type) {
    case 'lead':
      return Boolean(await prisma.lead.findUnique({ where: { id }, select: { id: true } }));
    case 'contact':
      return Boolean(await prisma.contact.findUnique({ where: { id }, select: { id: true } }));
    case 'company':
      return Boolean(await prisma.company.findUnique({ where: { id }, select: { id: true } }));
    case 'quotation':
      return Boolean(await prisma.quotation.findUnique({ where: { id }, select: { id: true } }));
    case 'sales_order':
      return Boolean(await prisma.salesOrder.findUnique({ where: { id }, select: { id: true } }));
    case 'purchase_order':
      return Boolean(await prisma.purchaseOrder.findUnique({ where: { id }, select: { id: true } }));
    case 'goods_receipt':
      return Boolean(await prisma.goodsReceipt.findUnique({ where: { id }, select: { id: true } }));
    case 'invoice':
      return Boolean(await prisma.invoice.findUnique({ where: { id }, select: { id: true } }));
    case 'payment':
      return Boolean(await prisma.payment.findUnique({ where: { id }, select: { id: true } }));
    case 'product':
      return Boolean(await prisma.product.findUnique({ where: { id }, select: { id: true } }));
  }
}

export async function assertEntityExists(prisma: PrismaService, type: RelatedEntityType, id: string): Promise<void> {
  if (!(await entityExists(prisma, type, id))) {
    throw new NotFoundError(`${type.replace('_', ' ')} not found.`);
  }
}
