import { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { Textarea } from './Textarea';

export interface CancelWithReasonDialogProps {
  title: string;
  isCancelling?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** Shared by Quotation and Sales Order cancellation - both require a reason (SALES.md sections 58, 101). */
export function CancelWithReasonDialog({ title, isCancelling = false, onConfirm, onClose }: CancelWithReasonDialogProps) {
  const [reason, setReason] = useState('');

  return (
    <Modal title={title} onClose={onClose} size="sm">
      <Textarea
        label="Reason"
        required
        autoFocus
        helperText="Recorded against this record's history."
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={isCancelling}>
          Back
        </Button>
        <Button
          className="border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)] hover:bg-[var(--color-danger-border)]"
          variant="secondary"
          isLoading={isCancelling}
          disabled={!reason.trim()}
          onClick={() => onConfirm(reason.trim())}
        >
          Confirm Cancellation
        </Button>
      </div>
    </Modal>
  );
}
