import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePurchaseOrder } from '@/features/purchase-orders/usePurchaseOrders';
import { useWarehouses } from '@/features/warehouses/useWarehouses';
import { ApiError } from '@/lib/api/api-error';
import { GoodsReceiptCreatePage } from './GoodsReceiptCreatePage';
import { useCreateGoodsReceipt } from './useGoodsReceipts';

vi.mock('@/features/purchase-orders/usePurchaseOrders');
vi.mock('@/features/warehouses/useWarehouses');
vi.mock('./useGoodsReceipts');

const mockedUsePurchaseOrder = vi.mocked(usePurchaseOrder);
const mockedUseWarehouses = vi.mocked(useWarehouses);
const mockedUseCreateGoodsReceipt = vi.mocked(useCreateGoodsReceipt);

const WAREHOUSE = { id: 'warehouse-1', name: 'Main Warehouse' };
const ORDER = {
  id: 'po-1',
  poNumber: 'PO/2026-27/000001',
  supplier: { id: 'supplier-1', name: 'Havells Distribution' },
  items: [
    {
      id: 'item-1',
      productId: 'product-1',
      sku: 'FAN-QA-01',
      productName: 'QA Test Fan',
      unit: 'pcs',
      orderedQuantity: '50',
      receivedQuantity: '30',
    },
  ],
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/purchase-orders/po-1/receive']}>
      <Routes>
        <Route path="/purchase-orders/:purchaseOrderId/receive" element={<GoodsReceiptCreatePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GoodsReceiptCreatePage', () => {
  let mutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateAsync = vi.fn();
    mockedUsePurchaseOrder.mockReturnValue({
      data: ORDER,
      isLoading: false,
    } as unknown as ReturnType<typeof usePurchaseOrder>);
    mockedUseWarehouses.mockReturnValue({ data: { data: [WAREHOUSE] } } as ReturnType<typeof useWarehouses>);
    mockedUseCreateGoodsReceipt.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateGoodsReceipt>);
  });

  /**
   * Regression test: an over-receipt rejection carries its real message in
   * `fields.quantityReceived`, not the generic ValidationError default - a QA
   * pass caught the form showing only the unhelpful default. It must now
   * prefer the field-specific message.
   */
  it('shows the field-specific message from a validation error, not the generic fallback', async () => {
    mutateAsync.mockRejectedValueOnce(
      new ApiError({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data.',
        status: 422,
        fields: { quantityReceived: ['Cannot receive more than the pending quantity (20) for FAN-QA-01.'] },
      }),
    );
    renderPage();

    fireEvent.change(screen.getByRole('combobox', { name: 'Warehouse' }), { target: { value: WAREHOUSE.id } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Quantity received' }), { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: /save receipt/i }));

    expect(
      await screen.findByText('Cannot receive more than the pending quantity (20) for FAN-QA-01.'),
    ).toBeVisible();
    expect(screen.queryByText('The request contains invalid data.')).not.toBeInTheDocument();
  });

  it('pre-fills the quantity received with the pending quantity and submits it', async () => {
    mutateAsync.mockResolvedValue({ id: 'receipt-1' });
    renderPage();

    fireEvent.change(screen.getByRole('combobox', { name: 'Warehouse' }), { target: { value: WAREHOUSE.id } });
    expect(screen.getByRole('textbox', { name: 'Quantity received' })).toHaveValue('20');

    fireEvent.click(screen.getByRole('button', { name: /save receipt/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          purchaseOrderId: 'po-1',
          warehouseId: WAREHOUSE.id,
          items: [{ purchaseOrderItemId: 'item-1', quantityReceived: '20', rejectedQuantity: undefined }],
        }),
      ),
    );
  });
});
