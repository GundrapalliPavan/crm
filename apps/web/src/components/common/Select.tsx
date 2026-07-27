import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  /** Rendered as a disabled first option when the field has no default value. */
  placeholder?: string;
  helperText?: string;
  error?: string;
  /** Keeps the label as the field's accessible name but hides it visually - for dense table-cell layouts with a column header already labelling the field. */
  hideLabel?: boolean;
}

/** Mirrors TextField's label -> control -> helper/error structure (COMPONENTS.md section 31). */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, placeholder, helperText, error, hideLabel, id, className, required, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const helperId = `${selectId}-helper`;
  const hasHelper = Boolean(error || helperText);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className={hideLabel ? 'sr-only' : 'text-sm font-medium text-[var(--color-text-primary)]'}
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>

      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={hasHelper ? helperId : undefined}
        className={cn(
          'h-10 rounded-[var(--radius-input)] border bg-[var(--color-bg-surface)] px-3 text-sm',
          'text-[var(--color-text-primary)]',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]',
          'disabled:cursor-not-allowed disabled:bg-[var(--color-bg-app)] disabled:opacity-60',
          error ? 'border-[var(--color-danger-border)]' : 'border-[var(--color-border-default)]',
          className,
        )}
        {...props}
      >
        {placeholder && (
          // Not `hidden`: an async-populated option list (data arriving after this
          // renders) would otherwise leave the select's real value stuck at "" while
          // the browser visually falls back to displaying the first real option as if
          // selected - silently submitting the wrong value. Keeping the placeholder a
          // normal (merely disabled) option means what's shown always matches what's
          // actually selected.
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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
