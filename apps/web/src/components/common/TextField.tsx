import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Rendered below the input, replaced by `error` when present. */
  helperText?: string;
  error?: string;
  /** Keeps the label as the field's accessible name but hides it visually - for dense table-cell layouts with a column header already labelling the field. */
  hideLabel?: boolean;
}

/**
 * Label -> input -> helper/error (COMPONENTS.md section 31).
 *
 * The label is a real `<label htmlFor>`, not placeholder text (Step 4
 * section 118 - placeholder text is never an acceptable substitute for a
 * label). The error message is linked with `aria-describedby` so screen
 * readers announce it alongside the field, and `aria-invalid` reflects error
 * state for assistive technology that surfaces it independently.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, helperText, error, hideLabel, id, className, required, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const hasHelper = Boolean(error || helperText);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className={hideLabel ? 'sr-only' : 'text-sm font-medium text-[var(--color-text-primary)]'}
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={hasHelper ? helperId : undefined}
        className={cn(
          'h-10 rounded-[var(--radius-input)] border bg-[var(--color-bg-surface)] px-3 text-sm',
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
