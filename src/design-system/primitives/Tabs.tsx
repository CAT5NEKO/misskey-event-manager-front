import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'underline' | 'segmented';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
  disabled,
  className,
  ariaLabel,
}: TabsProps<T>) {
  if (variant === 'segmented') {
    return (
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn('inline-flex flex-wrap rounded-ds-full bg-ds-surface-active p-1', className)}
      >
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={value === item.value}
            disabled={disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-ds-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus disabled:cursor-not-allowed disabled:opacity-50',
              value === item.value
                ? 'bg-ds-surface text-ds-accent'
                : 'text-ds-text-muted hover:text-ds-text',
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex gap-4 overflow-x-auto border-b-[0.5px] border-ds-border', className)}
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          disabled={disabled}
          onClick={() => onChange(item.value)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-1 pb-2 pt-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-focus disabled:cursor-not-allowed disabled:opacity-50',
            value === item.value
              ? 'border-ds-accent text-ds-accent'
              : 'border-transparent text-ds-text-muted hover:text-ds-text',
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
