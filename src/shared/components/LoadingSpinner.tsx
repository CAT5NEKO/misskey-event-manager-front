import { Spinner } from '@design-system/primitives/Spinner';
import { cn } from '@design-system/lib/cn';

interface LoadingSpinnerProps {
  fullPage?: boolean;
}

export function LoadingSpinner({ fullPage = false }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex justify-center py-12', fullPage && 'min-h-dvh items-center py-0')}>
      <Spinner size="lg" />
    </div>
  );
}
