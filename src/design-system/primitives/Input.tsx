import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const inputClass =
  'h-9 w-full rounded-ds-md border-[0.5px] border-ds-border bg-ds-surface px-3 text-sm text-ds-text transition-colors placeholder:text-ds-text-muted hover:border-ds-border-strong focus:border-ds-accent focus:outline-none focus:ring-2 focus:ring-ds-focus disabled:cursor-not-allowed disabled:opacity-50';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(inputClass, className)} {...props} />;
  },
);
