import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export type BadgeTone = 'neutral' | 'danger' | 'warning' | 'success' | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-ds-surface-active text-ds-text',
  danger: 'bg-ds-danger-subtle text-ds-danger-text',
  warning: 'bg-ds-warning-subtle text-ds-warning-text',
  success: 'bg-ds-success-subtle text-ds-success-text',
  info: 'bg-ds-info-subtle text-ds-info-text',
};

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-ds-full px-2 py-0.5 text-[0.75em] font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
