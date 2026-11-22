import type { ReactNode } from 'react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';
import { cn } from '../lib/cn';

export type InfoTone = 'info' | 'warning' | 'danger' | 'success';

interface InfoProps {
  tone?: InfoTone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<InfoTone, string> = {
  info: 'bg-ds-info-subtle text-ds-info-text',
  warning: 'bg-ds-warning-subtle text-ds-warning-text',
  danger: 'bg-ds-danger-subtle text-ds-danger-text',
  success: 'bg-ds-success-subtle text-ds-success-text',
};

const toneIcons = {
  info: IconInfoCircle,
  warning: IconAlertTriangle,
  danger: IconAlertCircle,
  success: IconCircleCheck,
};

export function Info({ tone = 'info', children, className }: InfoProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-2 rounded-ds-lg px-3.5 py-3 text-[0.9em]',
        toneClasses[tone],
        className,
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
