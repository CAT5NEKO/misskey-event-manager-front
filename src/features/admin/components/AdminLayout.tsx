import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconCalendarEvent,
  IconFileText,
  IconLayoutDashboard,
  IconServer,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { PageContainer } from '@design-system/index';
import { cn } from '@design-system/lib/cn';

interface AdminLayoutProps {
  children: ReactNode;
}

const links = [
  { to: '/admin', label: 'ダッシュボード', icon: IconLayoutDashboard, end: true },
  { to: '/admin/instances', label: 'インスタンス', icon: IconServer },
  { to: '/admin/users', label: 'ユーザー', icon: IconUsers },
  { to: '/admin/events', label: 'イベント', icon: IconCalendarEvent },
  { to: '/admin/audit-logs', label: '監査ログ', icon: IconFileText },
  { to: '/admin/settings', label: '設定', icon: IconSettings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <PageContainer size="xl">
      <nav
        aria-label="管理者メニュー"
        className="mb-6 flex gap-1 overflow-x-auto border-b-[0.5px] border-ds-border"
      >
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'border-ds-accent text-ds-accent'
                  : 'border-transparent text-ds-text-muted hover:text-ds-text',
              )
            }
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div>{children}</div>
    </PageContainer>
  );
}
