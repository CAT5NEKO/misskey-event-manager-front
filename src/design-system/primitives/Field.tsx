import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

interface FieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, required, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ds-text">
          {label}
          {required && <span className="text-ds-danger-text"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-ds-danger-text">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ds-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
