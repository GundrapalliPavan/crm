import { useEffect, useRef, type PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps extends PropsWithChildren {
  title: string;
  onClose: () => void;
  size?: ModalSize;
}

// COMPONENTS.md section 104.
const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
};

/**
 * Focused-task overlay (COMPONENTS.md sections 103-105) - confirmations and
 * small forms, not long workflows. Closes on Escape or backdrop click.
 */
export function Modal({ title, onClose, size = 'md', children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          'max-h-[90vh] w-full overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-bg-surface)] p-6 shadow-lg',
          'focus:outline-none',
          SIZE_CLASSES[size],
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-[var(--radius-button)] p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-app)]"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}
