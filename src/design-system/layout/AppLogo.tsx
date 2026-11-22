import { IconCalendarEvent } from '@tabler/icons-react';
import { cn } from '../lib/cn';

interface AppLogoProps {
  className?: string;
  iconClassName?: string;
}

export function AppLogo({ className, iconClassName }: AppLogoProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-ds-lg bg-ds-surface-active text-ds-text',
        className,
      )}
    >
      <IconCalendarEvent size={22} stroke={1.8} className={iconClassName} aria-hidden="true" />
    </div>
  );
}
