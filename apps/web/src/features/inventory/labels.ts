import type { StockAdjustmentReason, StockMovementType } from '@crm/types';
import type { BadgeTone } from '@/components/common/Badge';

export function adjustmentReasonLabel(reason: StockAdjustmentReason): string {
  return reason.replace(/_/g, ' ');
}

const MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  opening: 'Opening balance',
  purchase_receipt: 'Purchase receipt',
  sales_issue: 'Sales issue',
  sales_return: 'Sales return',
  purchase_return: 'Purchase return',
  adjustment_in: 'Adjustment (in)',
  adjustment_out: 'Adjustment (out)',
  transfer_in: 'Transfer (in)',
  transfer_out: 'Transfer (out)',
  reservation: 'Reservation',
  reservation_release: 'Reservation release',
};

export function movementTypeLabel(type: StockMovementType): string {
  return MOVEMENT_TYPE_LABELS[type];
}

export function movementTypeTone(type: StockMovementType): BadgeTone {
  if (type.endsWith('_in') || type === 'opening' || type === 'purchase_receipt' || type === 'sales_return') {
    return 'success';
  }
  if (type.endsWith('_out') || type === 'sales_issue' || type === 'purchase_return') {
    return 'warning';
  }
  return 'neutral';
}
