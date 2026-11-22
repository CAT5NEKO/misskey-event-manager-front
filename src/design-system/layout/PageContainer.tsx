import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

type PageContainerSize = 'sm' | 'md' | 'lg' | 'xl';

interface PageContainerProps {
  children: ReactNode;
  size?: PageContainerSize;
  className?: string;
}

const sizeClasses: Record<PageContainerSize, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-ds-wide',
};

export function PageContainer({ children, size = 'md', className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-3 py-4 sm:px-4 sm:py-6', sizeClasses[size], className)}>
      {children}
    </div>
  );
}
