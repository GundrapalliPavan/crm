import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Address, AddressOwnerType, AddressType } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { ownerQuery } from './owner';
import { ADDRESS_TYPE_OPTIONS, addressSchema, type AddressFormValues } from './schemas/address.schema';
import { useCreateAddress, useUpdateAddress } from './useAddresses';

export interface AddressFormModalProps {
  ownerType: AddressOwnerType;
  ownerId: string;
  /** Present when editing an existing address; absent when creating one. */
  address?: Address;
  onClose: () => void;
  onSaved: () => void;
}

export function AddressFormModal({ ownerType, ownerId, address, onClose, onSaved }: AddressFormModalProps) {
  const query = ownerQuery(ownerType, ownerId);
  const [formError, setFormError] = useState<string | null>(null);
  const [addressType, setAddressType] = useState<AddressType>(address?.addressType ?? 'billing');
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);
  const createAddress = useCreateAddress(query);
  const updateAddress = useUpdateAddress(query);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          line1: address.line1,
          line2: address.line2 ?? undefined,
          city: address.city,
          state: address.state,
          stateCode: address.stateCode ?? undefined,
          postalCode: address.postalCode ?? undefined,
          countryCode: address.countryCode,
        }
      : undefined,
  });

  async function onSubmit(values: AddressFormValues) {
    setFormError(null);
    try {
      if (address) {
        await updateAddress.mutateAsync({ id: address.id, payload: { ...values, addressType, isDefault } });
      } else {
        await createAddress.mutateAsync({ ...values, addressType, isDefault, ...ownerQuery(ownerType, ownerId) });
      }
      onSaved();
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <Modal title={address ? 'Edit Address' : 'Add Address'} onClose={onClose} size="md">
      <form noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className="flex flex-col gap-4">
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-input)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-sm text-[var(--color-danger-text)]"
            >
              {formError}
            </div>
          )}

          <Select
            label="Address type"
            required
            value={addressType}
            onChange={(event) => setAddressType(event.target.value as AddressType)}
            options={ADDRESS_TYPE_OPTIONS}
          />

          <TextField label="Address line 1" autoFocus required error={errors.line1?.message} {...register('line1')} />
          <TextField label="Address line 2" error={errors.line2?.message} {...register('line2')} />

          <div className="grid grid-cols-2 gap-4">
            <TextField label="City" required error={errors.city?.message} {...register('city')} />
            <TextField label="State" required error={errors.state?.message} {...register('state')} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <TextField label="State code" helperText="2-digit GST code" error={errors.stateCode?.message} {...register('stateCode')} />
            <TextField label="Postal code" error={errors.postalCode?.message} {...register('postalCode')} />
            <TextField
              label="Country code"
              placeholder="IN"
              error={errors.countryCode?.message}
              {...register('countryCode')}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
            <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
            Set as default {addressType} address
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {address ? 'Save Changes' : 'Add Address'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
