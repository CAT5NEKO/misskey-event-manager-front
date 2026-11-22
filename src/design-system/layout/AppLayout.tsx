import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-ds-bg text-ds-text">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto pb-[var(--ds-min-bottom-spacing-mobile)] min-[501px]:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
