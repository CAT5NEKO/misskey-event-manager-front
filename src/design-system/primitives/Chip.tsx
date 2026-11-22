import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export function Chip({ active, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-ds-full border-[0.5px] px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus',
        active
          ? 'border-ds-accent bg-ds-accent-subtle text-ds-accent'
          : 'border-ds-border bg-ds-surface text-ds-text hover:bg-ds-surface-hover',
        className,
      )}
    >
      {children}
    </button>
  );
}
