import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft } from '@tabler/icons-react';
import { cn } from '../lib/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backTo,
  backLabel = '戻る',
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {backTo && (
        <Link
          to={backTo}
          className="mb-3 inline-flex items-center gap-1 text-sm text-ds-text-muted underline-offset-4 hover:text-ds-text hover:underline"
        >
          <IconChevronLeft size={16} aria-hidden="true" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-ds-text sm:text-2xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-ds-text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
