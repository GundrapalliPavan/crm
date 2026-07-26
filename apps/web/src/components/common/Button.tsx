import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button without changing its width (COMPONENTS.md section 30). */
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-action-primary)] text-[var(--color-text-on-primary)] ' +
    'hover:bg-[var(--color-action-primary-hover)] active:bg-[var(--color-action-primary-pressed)]',
  secondary:
    'bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] ' +
    'border border-[var(--color-border-default)] hover:bg-[var(--color-bg-app)]',
};

// Heights and horizontal padding from COMPONENTS.md section 27.
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-4 text-sm',
};

function Spinner() {
  return (
    <svg
      className="size-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/**
 * Primary interactive control (COMPONENTS.md sections 22-30).
 *
 * Button text is never uppercased (section 23) and the label stays in place
 * during loading rather than being replaced solely by a spinner, so the
 * button's width does not visibly jump.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', isLoading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-semibold',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
});
