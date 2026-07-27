import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateProductRequest, Product } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { useBrands } from '@/features/brands/useBrands';
import { useProductCategories } from '@/features/product-categories/useProductCategories';
import { useUnits } from '@/features/units/useUnits';
import { ApiError } from '@/lib/api/api-error';
import { createProductSchema, type CreateProductFormValues } from './schemas/create-product.schema';
import { useCreateProduct } from './useProducts';

export interface ProductCreateModalProps {
  onClose: () => void;
  onCreated: (product: Product) => void;
}

export function ProductCreateModal({ onClose, onCreated }: ProductCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateRequest, setDuplicateRequest] = useState<CreateProductRequest | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [unitId, setUnitId] = useState('');
  const { data: categories } = useProductCategories();
  const { data: brands } = useBrands();
  const { data: units } = useUnits();
  const createProduct = useCreateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues>({ resolver: zodResolver(createProductSchema) });

  async function submitProduct(request: CreateProductRequest) {
    setFormError(null);
    try {
      const product = await createProduct.mutateAsync(request);
      onCreated(product);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
      setDuplicateRequest(apiError?.code === 'DUPLICATE_RESOURCE' ? request : null);
    }
  }

  async function onSubmit(values: CreateProductFormValues) {
    if (!categoryId || !unitId) {
      setFormError('Select a category and a unit.');
      return;
    }
    await submitProduct({
      sku: values.sku,
      name: values.name,
      categoryId,
      brandId: brandId || undefined,
      unitId,
      hsnCode: values.hsnCode || undefined,
      taxRate: values.taxRate || undefined,
      sellingPriceReference: values.sellingPriceReference || undefined,
      purchasePriceReference: values.purchasePriceReference || undefined,
      minimumStockLevel: values.minimumStockLevel || undefined,
    });
  }

  return (
    <Modal title="Add Product" onClose={onClose} size="md">
      <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
            >
              <p>{formError}</p>
              {duplicateRequest && (
                <button
                  type="button"
                  className="mt-2 font-medium underline"
                  onClick={() => void submitProduct({ ...duplicateRequest, confirmDuplicate: true } as CreateProductRequest)}
                >
                  Create anyway
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <TextField label="SKU" required error={errors.sku?.message} {...register('sku')} />
            <TextField label="Name" required error={errors.name?.message} {...register('name')} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Category"
              required
              placeholder="Select a category"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              options={(categories?.data ?? []).map((category) => ({ value: category.id, label: category.name }))}
            />
            <Select
              label="Brand"
              placeholder="No brand"
              value={brandId}
              onChange={(event) => setBrandId(event.target.value)}
              options={(brands?.data ?? []).map((brand) => ({ value: brand.id, label: brand.name }))}
            />
            <Select
              label="Unit"
              required
              placeholder="Select a unit"
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
              options={(units ?? []).map((unit) => ({ value: unit.id, label: `${unit.name} (${unit.symbol})` }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField label="HSN code" {...register('hsnCode')} />
            <TextField label="Tax rate (%)" error={errors.taxRate?.message} {...register('taxRate')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Selling price"
              error={errors.sellingPriceReference?.message}
              {...register('sellingPriceReference')}
            />
            <TextField
              label="Purchase price"
              error={errors.purchasePriceReference?.message}
              {...register('purchasePriceReference')}
            />
          </div>

          <TextField
            label="Minimum stock level"
            error={errors.minimumStockLevel?.message}
            {...register('minimumStockLevel')}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
