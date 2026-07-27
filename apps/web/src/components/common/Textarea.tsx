import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, error, id, className, required, rows = 3, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const helperId = `${textareaId}-helper`;
  const hasHelper = Boolean(error || helperText);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium text-[var(--color-text-primary)]">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={hasHelper ? helperId : undefined}
        className={cn(
          'rounded-[var(--radius-input)] border bg-[var(--color-bg-surface)] px-3 py-2 text-sm',
          'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-placeholder)]',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]',
          'disabled:cursor-not-allowed disabled:bg-[var(--color-bg-app)] disabled:opacity-60',
          error ? 'border-[var(--color-danger-border)]' : 'border-[var(--color-border-default)]',
          className,
        )}
        {...props}
      />

      {hasHelper && (
        <p
          id={helperId}
          className={cn(
            'text-[13px]',
            error ? 'text-[var(--color-danger-text)]' : 'text-[var(--color-text-secondary)]',
          )}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  );
});
