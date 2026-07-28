import type { Warehouse } from '@crm/types';
import { Modal } from '@/components/common/Modal';
import { AddressesSection } from '@/features/addresses/AddressesSection';

export interface WarehouseAddressesModalProps {
  warehouse: Warehouse;
  onClose: () => void;
}

/** Warehouses have no dedicated detail page, so addresses are managed from a modal off the list row instead. */
export function WarehouseAddressesModal({ warehouse, onClose }: WarehouseAddressesModalProps) {
  return (
    <Modal title={`Addresses - ${warehouse.name}`} onClose={onClose} size="lg">
      <AddressesSection ownerType="warehouse" ownerId={warehouse.id} />
    </Modal>
  );
}
