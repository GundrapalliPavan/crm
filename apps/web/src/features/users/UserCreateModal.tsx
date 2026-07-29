import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateUserResponse } from '@crm/types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TextField } from '@/components/common/TextField';
import { ApiError } from '@/lib/api/api-error';
import { createUserSchema, type CreateUserFormValues } from './schemas/create-user.schema';
import { useCreateUser } from './useUsers';

export interface UserCreateModalProps {
  onClose: () => void;
}

/** The account starts inactive - the invite email's link is what actually verifies the address and lets the recipient choose their own password. */
function InvitationSentStep({ result, onDone }: { result: CreateUserResponse; onDone: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--color-text-secondary)]">
        An invitation was sent to <span className="font-medium text-[var(--color-text-primary)]">{result.user.email}</span>.
        {' '}
        {result.user.firstName} {result.user.lastName}'s account stays inactive until they open the link and set their
        own password.
      </p>

      <div className="flex justify-end">
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function UserCreateModal({ onClose }: UserCreateModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateUserResponse | null>(null);
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema) });

  async function onSubmit(values: CreateUserFormValues) {
    setFormError(null);
    try {
      const response = await createUser.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        username: values.username,
        email: values.email,
        phone: values.phone || undefined,
      });
      setResult(response);
    } catch (error) {
      const apiError = error instanceof ApiError ? error : null;
      setFormError(apiError?.message ?? 'Something went wrong. Please try again.');
    }
  }

  if (result) {
    return (
      <Modal title="Invitation Sent" onClose={onClose} size="sm">
        <InvitationSentStep result={result} onDone={onClose} />
      </Modal>
    );
  }

  return (
    <Modal title="Add User" onClose={onClose} size="sm">
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

          <TextField label="First name" autoFocus required error={errors.firstName?.message} {...register('firstName')} />
          <TextField label="Last name" required error={errors.lastName?.message} {...register('lastName')} />
          <TextField label="Username" required error={errors.username?.message} {...register('username')} />
          <TextField label="Email" type="email" required error={errors.email?.message} {...register('email')} />
          <TextField label="Phone" error={errors.phone?.message} {...register('phone')} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Sending invite…' : 'Send Invite'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
