import type { Notification, RelatedEntityType } from '@crm/types';

const ROUTE_BY_ENTITY_TYPE: Record<RelatedEntityType, string> = {
  lead: '/leads',
  contact: '/contacts',
  company: '/companies',
  quotation: '/quotations',
  sales_order: '/sales-orders',
  purchase_order: '/purchase-orders',
  goods_receipt: '/goods-receipts',
  invoice: '/invoices',
  payment: '/payments',
  product: '/products',
};

export function notificationLink(notification: Notification): string | null {
  if (!notification.relatedEntityType || !notification.relatedEntityId) {
    return null;
  }
  return `${ROUTE_BY_ENTITY_TYPE[notification.relatedEntityType]}/${notification.relatedEntityId}`;
}
