import { NavLink, Link } from 'react-router-dom';
import { IconCalendarEvent, IconPlus, IconSettings, IconShield } from '@tabler/icons-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AccountSwitcher } from '@features/auth/components/AccountSwitcher';
import { useAppName } from '@shared/hooks/useAppName';
import { ButtonLink } from '../primitives/Button';
import { AppLogo } from './AppLogo';
import { cn } from '../lib/cn';

interface SidebarLinkProps {
  to: string;
  label: string;
  icon: typeof IconCalendarEvent;
  end?: boolean;
}

function SidebarLink({ to, label, icon: Icon, end }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className="group relative flex h-10 items-center pl-[30px] pr-3 text-ds-text-muted transition-colors hover:text-ds-text max-[1279px]:justify-center max-[1279px]:px-0"
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute inset-y-0 left-[17px] right-[17px] rounded-ds-full transition-colors max-[1279px]:left-1/2 max-[1279px]:right-auto max-[1279px]:h-10 max-[1279px]:w-10 max-[1279px]:-translate-x-1/2',
              isActive ? 'bg-ds-accent-subtle' : 'group-hover:bg-ds-surface-hover',
            )}
          />
          <Icon
            size={18}
            className={cn(
              'relative w-8 shrink-0 max-[1279px]:w-auto',
              isActive && 'text-ds-accent',
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              'relative truncate text-[0.9em] max-[1279px]:hidden',
              isActive && 'font-medium text-ds-accent',
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const appName = useAppName();

  return (
    <aside className="hidden w-[var(--ds-sidebar-icon-width)] shrink-0 flex-col border-r-[0.5px] border-ds-border bg-ds-surface min-[501px]:flex min-[1280px]:w-[var(--ds-sidebar-width)]">
      <div className="flex h-20 shrink-0 items-center gap-2 px-3 max-[1279px]:justify-center max-[1279px]:px-0">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <AppLogo className="h-[38px] w-[38px] shrink-0 max-[1279px]:h-[30px] max-[1279px]:w-[30px]" />
          <span className="truncate text-sm font-bold text-ds-text max-[1279px]:hidden">
            {appName}
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-1" aria-label="メインナビゲーション">
        <SidebarLink to="/" label="予定管理" icon={IconCalendarEvent} end />
        <div className="mx-4 my-2 border-t-[0.5px] border-ds-border" />
        <SidebarLink to="/settings" label="ユーザー設定" icon={IconSettings} />
        {user?.is_admin && <SidebarLink to="/admin" label="管理者設定" icon={IconShield} />}
      </nav>

      <div className="shrink-0 border-t-[0.5px] border-ds-border p-2">
        <ButtonLink
          to="/events/new"
          variant="primary"
          fullWidth
          className="mb-2 rounded-ds-full max-[1279px]:mx-auto max-[1279px]:h-11 max-[1279px]:w-11 max-[1279px]:min-w-0 max-[1279px]:px-0"
          leftIcon={<IconPlus size={18} aria-hidden="true" />}
        >
          <span className="max-[1279px]:hidden">新規イベント</span>
        </ButtonLink>
        <AccountSwitcher variant="sidebar" />
      </div>
    </aside>
  );
}
