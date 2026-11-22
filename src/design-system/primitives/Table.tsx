import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import { cn } from '../lib/cn';

interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  maxHeight?: number | null;
}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  function TableContainer({ className, maxHeight, style, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        style={maxHeight ? { ...style, maxHeight } : style}
        className={cn(
          'overflow-y-auto rounded-ds-lg border-[0.5px] border-ds-border bg-ds-surface',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn('w-full border-separate border-spacing-0 text-sm', className)}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-ds-surface-hover', className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-ds-surface-hover [&:last-child>td]:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'sticky top-0 z-10 border-b-[0.5px] border-ds-border bg-ds-surface-hover px-4 py-2.5 text-left text-xs font-medium text-ds-text-muted',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('border-b-[0.5px] border-ds-border px-4 py-2.5 text-ds-text', className)}
      {...props}
    />
  );
}
