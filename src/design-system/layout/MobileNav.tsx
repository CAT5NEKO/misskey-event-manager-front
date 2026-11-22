import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { IconCalendarEvent, IconPlus, IconSettings, IconShield } from '@tabler/icons-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AccountSwitcher } from '@features/auth/components/AccountSwitcher';
import { cn } from '../lib/cn';

interface MobileNavLinkProps {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

function MobileNavLink({ to, label, icon, end }: MobileNavLinkProps) {
  return (
    <NavLink to={to} end={end} aria-label={label} className="group flex flex-col items-center py-3">
      {({ isActive }) => (
        <span
          className={cn(
            'flex h-[42px] w-full max-w-[42px] items-center justify-center rounded-ds-full transition-colors',
            isActive
              ? 'text-ds-accent'
              : 'text-ds-text-muted group-hover:bg-ds-surface-hover group-hover:text-ds-text',
          )}
        >
          {icon}
        </span>
      )}
    </NavLink>
  );
}

export function MobileNav() {
  const { user } = useAuth();
  const itemCount = 3 + (user?.is_admin ? 1 : 0) + 1;

  return (
    <nav
      aria-label="メインナビゲーション"
      className="fixed inset-x-0 bottom-0 z-40 grid border-t-[0.5px] border-ds-border bg-ds-surface pb-[env(safe-area-inset-bottom)] min-[501px]:hidden"
      style={{ gridTemplateColumns: `repeat(${itemCount}, minmax(0, 1fr))` }}
    >
      <MobileNavLink
        to="/"
        label="予定管理"
        icon={<IconCalendarEvent size={20} aria-hidden="true" />}
        end
      />
      <Link to="/events/new" aria-label="新規イベント" className="flex flex-col items-center py-3">
        <span className="flex h-[42px] w-full max-w-[42px] items-center justify-center rounded-ds-full bg-ds-accent text-ds-on-accent">
          <IconPlus size={20} aria-hidden="true" />
        </span>
      </Link>
      {user?.is_admin && (
        <MobileNavLink
          to="/admin"
          label="管理者設定"
          icon={<IconShield size={20} aria-hidden="true" />}
        />
      )}
      <MobileNavLink
        to="/settings"
        label="ユーザー設定"
        icon={<IconSettings size={20} aria-hidden="true" />}
      />
      <AccountSwitcher variant="mobile" />
    </nav>
  );
}
