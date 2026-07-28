import { useState } from 'react';
import type { Address, AddressOwnerType } from '@crm/types';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/lib/auth/useAuth';
import { AddressFormModal } from './AddressFormModal';
import { ownerQuery } from './owner';
import { useAddresses, useDeleteAddress } from './useAddresses';

export interface AddressesSectionProps {
  ownerType: AddressOwnerType;
  ownerId: string;
}

function formatAddress(address: Address): string {
  const parts = [address.line1, address.line2, address.city, address.state, address.postalCode].filter(Boolean);
  return parts.join(', ');
}

/** DATABASE.md sections 36-37 - embedded the same way on every detail page an address can attach to. */
export function AddressesSection({ ownerType, ownerId }: AddressesSectionProps) {
  const { can } = useAuth();
  const query = ownerQuery(ownerType, ownerId);
  const { data, isLoading } = useAddresses(query);
  const deleteAddress = useDeleteAddress(query);
  const [editingAddress, setEditingAddress] = useState<Address | 'new' | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Address | null>(null);

  return (
    <section className="mb-6 rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Addresses</h2>
        {can('address.manage') && (
          <Button size="sm" variant="secondary" onClick={() => setEditingAddress('new')}>
            + Add Address
          </Button>
        )}
      </div>

      {isLoading && <p className="text-sm text-[var(--color-text-secondary)]">Loading…</p>}

      {!isLoading && data?.data.length === 0 && (
        <p className="text-sm text-[var(--color-text-secondary)]">No addresses on file yet.</p>
      )}

      {!isLoading && data && data.data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.data.map((address) => (
            <li
              key={address.id}
              className="flex items-start justify-between gap-3 border-b border-[var(--color-border-default)] pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="neutral">{address.addressType}</Badge>
                  {address.isDefault && <Badge tone="success">Default</Badge>}
                </div>
                <p className="text-sm text-[var(--color-text-primary)]">{formatAddress(address)}</p>
              </div>
              {can('address.manage') && (
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditingAddress(address)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setPendingDelete(address)}>
                    Remove
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {editingAddress && (
        <AddressFormModal
          ownerType={ownerType}
          ownerId={ownerId}
          address={editingAddress === 'new' ? undefined : editingAddress}
          onClose={() => setEditingAddress(null)}
          onSaved={() => setEditingAddress(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Remove address"
          description={`Remove this ${pendingDelete.addressType} address? This cannot be undone.`}
          confirmLabel="Remove"
          destructive
          isConfirming={deleteAddress.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void deleteAddress.mutateAsync(pendingDelete.id).then(() => setPendingDelete(null))}
        />
      )}
    </section>
  );
}
