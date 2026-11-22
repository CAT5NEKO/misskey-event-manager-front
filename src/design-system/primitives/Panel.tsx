import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
  interactive?: boolean;
}

export function Panel({
  bordered = true,
  interactive = false,
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-ds-lg bg-ds-surface',
        bordered && 'border-[0.5px] border-ds-border',
        interactive && 'transition-colors hover:bg-ds-surface-hover',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
