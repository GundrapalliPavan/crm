import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'critical' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

/**
 * Subtle status pill (COMPONENTS.md sections 53, 60-61).
 *
 * Classified by meaning, not by individual status value (COLORS.md section
 * 21: "statuses should not automatically receive unique colors") - callers
 * map their specific status/priority value onto one of these five tones.
 */
const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral-text)]',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
  critical: 'bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info-text)]',
};

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
