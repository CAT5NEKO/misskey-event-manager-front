import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const textareaClass =
  'min-h-[84px] w-full rounded-ds-md border-[0.5px] border-ds-border bg-ds-surface px-3 py-2 text-sm text-ds-text transition-colors placeholder:text-ds-text-muted hover:border-ds-border-strong focus:border-ds-accent focus:outline-none focus:ring-2 focus:ring-ds-focus disabled:cursor-not-allowed disabled:opacity-50';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(textareaClass, className)} {...props} />;
});
