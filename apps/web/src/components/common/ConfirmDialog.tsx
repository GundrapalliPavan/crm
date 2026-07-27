import { Button } from './Button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Destructive actions use the danger-toned confirm button (COMPONENTS.md section 109). */
  destructive?: boolean;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  isConfirming = false,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
        <Button
          variant={destructive ? 'secondary' : 'primary'}
          className={
            destructive
              ? 'border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] hover:bg-[var(--color-danger-border)]'
              : undefined
          }
          isLoading={isConfirming}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
