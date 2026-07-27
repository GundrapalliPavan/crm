import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useProductsList } from '@/features/products/useProducts';
import { useWarehouses } from '@/features/warehouses/useWarehouses';
import { ApiError } from '@/lib/api/api-error';
import { AdjustmentModal } from './AdjustmentModal';
import { useCreateInventoryAdjustment } from './useInventory';

vi.mock('@/features/products/useProducts');
vi.mock('@/features/warehouses/useWarehouses');
vi.mock('./useInventory');

const mockedUseProductsList = vi.mocked(useProductsList);
const mockedUseWarehouses = vi.mocked(useWarehouses);
const mockedUseCreateInventoryAdjustment = vi.mocked(useCreateInventoryAdjustment);

const PRODUCT = { id: 'product-1', name: 'Copper Wire', sku: 'WIRE-1' };
const WAREHOUSE = { id: 'warehouse-1', name: 'Main Warehouse' };

function renderModal() {
  return render(<AdjustmentModal onClose={vi.fn()} onSuccess={vi.fn()} />);
}

describe('AdjustmentModal', () => {
  let mutateAsync: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mutateAsync = vi.fn();
    mockedUseProductsList.mockReturnValue({ data: { data: [PRODUCT] } } as ReturnType<typeof useProductsList>);
    mockedUseWarehouses.mockReturnValue({ data: { data: [WAREHOUSE] } } as ReturnType<typeof useWarehouses>);
    mockedUseCreateInventoryAdjustment.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateInventoryAdjustment>);
  });

  /**
   * Regression test: the backend's negative-stock rejection carries its real
   * message in `fields.quantityDelta`, not the generic ValidationError
   * default ("The request contains invalid data.") - a QA pass caught the
   * modal showing only the unhelpful default. It must now prefer the
   * field-specific message.
   */
  it('shows the field-specific message from a validation error, not the generic fallback', async () => {
    mutateAsync.mockRejectedValueOnce(
      new ApiError({
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid data.',
        status: 422,
        fields: { quantityDelta: ['This adjustment would make available stock negative.'] },
      }),
    );
    renderModal();

    fireEvent.change(screen.getByRole('combobox', { name: 'Product' }), { target: { value: PRODUCT.id } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Warehouse' }), { target: { value: WAREHOUSE.id } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Adjustment quantity' }), {
      target: { value: '-1000' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Reason' }), { target: { value: 'damage' } });
    fireEvent.click(screen.getByRole('button', { name: /save adjustment/i }));

    expect(await screen.findByText('This adjustment would make available stock negative.')).toBeVisible();
    expect(screen.queryByText('The request contains invalid data.')).not.toBeInTheDocument();
  });

  it('submits the chosen product, warehouse, quantity and reason', async () => {
    mutateAsync.mockResolvedValue({ productId: PRODUCT.id });
    renderModal();

    fireEvent.change(screen.getByRole('combobox', { name: 'Product' }), { target: { value: PRODUCT.id } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Warehouse' }), { target: { value: WAREHOUSE.id } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Adjustment quantity' }), { target: { value: '10' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Reason' }), { target: { value: 'damage' } });
    fireEvent.click(screen.getByRole('button', { name: /save adjustment/i }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        productId: PRODUCT.id,
        warehouseId: WAREHOUSE.id,
        quantityDelta: '10',
        reason: 'damage',
        notes: undefined,
      }),
    );
  });
});
