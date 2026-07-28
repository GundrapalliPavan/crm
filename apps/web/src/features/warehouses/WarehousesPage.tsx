import { useState } from 'react';
import type { Warehouse } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { useUpdateWarehouse, useWarehouses } from './useWarehouses';
import { WarehouseAddressesModal } from './WarehouseAddressesModal';
import { WarehouseCreateModal } from './WarehouseCreateModal';

function WarehouseRow({ warehouse }: { warehouse: Warehouse }) {
  const updateWarehouse = useUpdateWarehouse(warehouse.id);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);

  return (
    <tr className="border-b border-[var(--color-border-default)] last:border-0">
      <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">{warehouse.code}</td>
      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{warehouse.name}</td>
      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
        {warehouse.manager ? `${warehouse.manager.firstName} ${warehouse.manager.lastName}` : '—'}
      </td>
      <td className="px-4 py-3">
        {warehouse.isActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">Inactive</Badge>}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setIsAddressesOpen(true)}>
            Addresses
          </Button>
          <Button
            size="sm"
            variant="secondary"
            isLoading={updateWarehouse.isPending}
            onClick={() => void updateWarehouse.mutateAsync({ isActive: !warehouse.isActive })}
          >
            {warehouse.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </td>

      {isAddressesOpen && (
        <WarehouseAddressesModal warehouse={warehouse} onClose={() => setIsAddressesOpen(false)} />
      )}
    </tr>
  );
}

/** No delete - warehouses are referenced by balances/movements once stock exists, deactivate instead. */
export function WarehousesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError } = useWarehouses();

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">Warehouses</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Stock locations tracked across the business.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>+ Add Warehouse</Button>
      </div>

      {isError && (
        <div role="alert" className="mb-4 rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]">
          Unable to load warehouses. Check your connection and try again.
        </div>
      )}

      {!isLoading && !isError && data?.data.length === 0 && (
        <EmptyState
          title="No warehouses yet"
          description="Add your first warehouse to start tracking stock."
          action={<Button onClick={() => setIsCreateOpen(true)}>+ Add Warehouse</Button>}
        />
      )}

      {!isError && (isLoading || (data && data.data.length > 0)) && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-left text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {!isLoading && data?.data.map((warehouse) => <WarehouseRow key={warehouse.id} warehouse={warehouse} />)}
            </tbody>
          </table>
        </div>
      )}

      {isCreateOpen && (
        <WarehouseCreateModal onClose={() => setIsCreateOpen(false)} onCreated={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
