import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const selectClass =
  'h-9 w-full rounded-ds-md border-[0.5px] border-ds-border bg-ds-surface px-3 text-sm text-ds-text transition-colors hover:border-ds-border-strong focus:border-ds-accent focus:outline-none focus:ring-2 focus:ring-ds-focus disabled:cursor-not-allowed disabled:opacity-50';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(selectClass, className)} {...props}>
        {children}
      </select>
    );
  },
);
