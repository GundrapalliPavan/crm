import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

/**
 * COMPONENTS.md sections 114-115: distinguishes "no data exists" from "no
 * results match filters" - callers choose the copy accordingly, this
 * component just renders whatever they pass.
 */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">{description}</p>
      {action}
    </div>
  );
}
