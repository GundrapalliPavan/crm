import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DOMAIN_EVENTS,
  type LeadAssignedEvent,
  type LowStockEvent,
  type PaymentReceivedEvent,
  type PurchaseOrderApprovalRequiredEvent,
  type QuotationApprovalRequiredEvent,
  type QuotationDecidedEvent,
  type SalesOrderStatusChangedEvent,
} from '../../common/events/domain-events';
import { findUserIdsWithPermission } from '../../common/users/permission-holders';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from './notifications.service';

/**
 * ARCHITECTURE.md section 77: "Domain Event -> Notification Service ->
 * In-App Notification." One listener per event, each translating a business
 * fact into a notification for whoever should act on or care about it.
 */
@Injectable()
export class NotificationTriggersListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(DOMAIN_EVENTS.leadAssigned)
  async onLeadAssigned(event: LeadAssignedEvent): Promise<void> {
    await this.notificationsService.create({
      userId: event.assigneeUserId,
      type: 'lead_assigned',
      title: `Lead assigned: ${event.leadName}`,
      relatedEntityType: 'lead',
      relatedEntityId: event.leadId,
    });
  }

  @OnEvent(DOMAIN_EVENTS.quotationApprovalRequired)
  async onQuotationApprovalRequired(event: QuotationApprovalRequiredEvent): Promise<void> {
    const approverIds = await findUserIdsWithPermission(this.prisma, 'quotation.approve');
    await Promise.all(
      approverIds.map((userId) =>
        this.notificationsService.create({
          userId,
          type: 'quotation_approval_required',
          title: `Quotation ${event.quotationNumber} needs approval`,
          relatedEntityType: 'quotation',
          relatedEntityId: event.quotationId,
        }),
      ),
    );
  }

  @OnEvent(DOMAIN_EVENTS.purchaseOrderApprovalRequired)
  async onPurchaseOrderApprovalRequired(event: PurchaseOrderApprovalRequiredEvent): Promise<void> {
    const approverIds = await findUserIdsWithPermission(this.prisma, 'purchase_order.approve');
    await Promise.all(
      approverIds.map((userId) =>
        this.notificationsService.create({
          userId,
          type: 'purchase_order_approval_required',
          title: `Purchase order ${event.purchaseOrderNumber} needs approval`,
          relatedEntityType: 'purchase_order',
          relatedEntityId: event.purchaseOrderId,
        }),
      ),
    );
  }

  @OnEvent(DOMAIN_EVENTS.paymentReceived)
  async onPaymentReceived(event: PaymentReceivedEvent): Promise<void> {
    await this.notificationsService.create({
      userId: event.companyOwnerUserId,
      type: 'payment_received',
      title: `Payment received: ${event.paymentNumber}`,
      relatedEntityType: 'payment',
      relatedEntityId: event.paymentId,
    });
  }

  @OnEvent(DOMAIN_EVENTS.lowStock)
  async onLowStock(event: LowStockEvent): Promise<void> {
    const managerIds = await findUserIdsWithPermission(this.prisma, 'inventory.adjust');
    await Promise.all(
      managerIds.map((userId) =>
        this.notificationsService.create({
          userId,
          type: 'low_stock',
          title: `Low stock: ${event.productName} at ${event.warehouseName}`,
          relatedEntityType: 'product',
          relatedEntityId: event.productId,
        }),
      ),
    );
  }

  /** No recipient when the quotation has no owner - unlike Payment Received's companyOwnerUserId, Quotation.ownerId is genuinely optional. */
  @OnEvent(DOMAIN_EVENTS.quotationDecided)
  async onQuotationDecided(event: QuotationDecidedEvent): Promise<void> {
    if (!event.ownerId) return;
    await this.notificationsService.create({
      userId: event.ownerId,
      type: 'quotation_decided',
      title: `Quotation ${event.quotationNumber} was ${event.decision}`,
      relatedEntityType: 'quotation',
      relatedEntityId: event.quotationId,
    });
  }

  @OnEvent(DOMAIN_EVENTS.salesOrderStatusChanged)
  async onSalesOrderStatusChanged(event: SalesOrderStatusChangedEvent): Promise<void> {
    if (!event.ownerId) return;
    await this.notificationsService.create({
      userId: event.ownerId,
      type: 'sales_order_status_changed',
      title: `Order ${event.salesOrderNumber} is now ${event.status}`,
      relatedEntityType: 'sales_order',
      relatedEntityId: event.salesOrderId,
    });
  }
}
