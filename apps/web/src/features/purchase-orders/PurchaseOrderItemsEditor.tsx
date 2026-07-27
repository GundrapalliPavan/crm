import type { Product } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { previewLine } from './calculations';
import type { PurchaseOrderLineDraft } from './purchase-order-line-draft';
import { EMPTY_PO_LINE } from './purchase-order-line-draft';

export interface PurchaseOrderItemsEditorProps {
  lines: PurchaseOrderLineDraft[];
  onChange: (lines: PurchaseOrderLineDraft[]) => void;
  products: Product[];
}

/** PURCHASE.md section 40: Product / Quantity / Unit Price / Discount / Tax / Amount. Unlike Quotations, unitPrice is never auto-filled - it is always the supplier's quoted price. */
export function PurchaseOrderItemsEditor({ lines, onChange, products }: PurchaseOrderItemsEditorProps) {
  const productsById = new Map(products.map((product) => [product.id, product]));

  function updateLine(index: number, patch: Partial<PurchaseOrderLineDraft>) {
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function removeLine(index: number) {
    onChange(lines.filter((_, i) => i !== index));
  }

  function addLine() {
    onChange([...lines, EMPTY_PO_LINE]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border-default)]">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-app)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
              <th className="px-3 py-2">Product</th>
              <th className="w-24 px-3 py-2">Qty</th>
              <th className="w-32 px-3 py-2">Unit Price</th>
              <th className="w-28 px-3 py-2">Discount %</th>
              <th className="w-28 px-3 py-2">Tax</th>
              <th className="w-32 px-3 py-2">Amount</th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const product = productsById.get(line.productId);
              const preview = previewLine({
                orderedQuantity: line.orderedQuantity,
                unitPrice: line.unitPrice,
                discountPercentage: line.discountPercentage,
                taxRate: product?.taxRate ?? '0',
              });

              return (
                <tr key={index} className="border-b border-[var(--color-border-default)] last:border-0">
                  <td className="min-w-[220px] px-3 py-2">
                    <Select
                      label="Product"
                      hideLabel
                      placeholder="Select a product"
                      value={line.productId}
                      onChange={(event) => updateLine(index, { productId: event.target.value })}
                      options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <TextField
                      label="Ordered quantity"
                      hideLabel
                      value={line.orderedQuantity}
                      onChange={(event) => updateLine(index, { orderedQuantity: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <TextField
                      label="Unit price"
                      hideLabel
                      value={line.unitPrice}
                      onChange={(event) => updateLine(index, { unitPrice: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <TextField
                      label="Discount percentage"
                      hideLabel
                      value={line.discountPercentage}
                      onChange={(event) => updateLine(index, { discountPercentage: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                    {product ? `${product.taxRate}% / ${preview.taxAmount.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-3 py-2 font-medium text-[var(--color-text-primary)]">
                    {preview.lineTotal.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      aria-label="Remove line"
                      onClick={() => removeLine(index)}
                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-danger-text)]"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="secondary" size="sm" onClick={addLine}>
        + Add Line
      </Button>
    </div>
  );
}
