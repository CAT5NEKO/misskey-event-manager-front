import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconCheck, IconChevronDown, IconPlus, IconUser, IconX } from '@tabler/icons-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { Avatar, Button, useConfirm } from '@design-system/index';
import { cn } from '@design-system/lib/cn';

interface AccountSwitcherProps {
  variant?: 'sidebar' | 'mobile';
}

export function AccountSwitcher({ variant = 'sidebar' }: AccountSwitcherProps) {
  const { sessions, activeIndex, switchAccount, removeAccount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const confirm = useConfirm();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeSession = sessions[activeIndex];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  const handleSwitch = async (index: number) => {
    if (index === activeIndex) {
      setOpen(false);
      return;
    }

    await switchAccount(index);
    setOpen(false);
    navigate('/');
  };

  const handleRemove = async (index: number) => {
    const session = sessions[index];

    if (!session) return;

    const confirmed = await confirm({
      title: 'アカウントをログアウト',
      message: `${session.name} をログアウトしますか？`,
      confirmLabel: 'ログアウト',
      danger: true,
    });

    if (!confirmed) return;

    removeAccount(index);
  };

  const handleAddAccount = () => {
    setOpen(false);
    navigate('/login?add=1');
  };

  return (
    <div
      ref={rootRef}
      className={cn('relative', variant === 'mobile' ? 'flex flex-col items-center' : 'w-full')}
    >
      <button
        type="button"
        aria-label={variant === 'mobile' ? 'アカウント' : undefined}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex items-center transition-colors',
          variant === 'mobile'
            ? 'flex-col py-3'
            : 'w-full gap-2 rounded-ds-lg p-2 text-left hover:bg-ds-surface-hover max-[1279px]:justify-center max-[1279px]:p-0',
        )}
      >
        {variant === 'mobile' ? (
          <span className="flex h-[42px] w-full max-w-[42px] items-center justify-center rounded-ds-full text-ds-text-muted transition-colors hover:bg-ds-surface-hover">
            {activeSession?.avatarUrl ? (
              <Avatar src={activeSession.avatarUrl} name={activeSession.name} size="sm" />
            ) : (
              <IconUser size={20} aria-hidden="true" />
            )}
          </span>
        ) : (
          <>
            <Avatar
              src={activeSession?.avatarUrl}
              name={activeSession?.name}
              size="md"
              className="shrink-0"
            />
            <span className="min-w-0 flex-1 max-[1279px]:hidden">
              <span className="block truncate text-sm font-medium text-ds-text">
                {activeSession?.name ?? 'アカウント'}
              </span>
              {activeSession && (
                <span className="block truncate text-xs text-ds-text-muted">
                  @{activeSession.username}@{activeSession.host}
                </span>
              )}
            </span>
            <IconChevronDown
              size={14}
              className="shrink-0 text-ds-text-muted max-[1279px]:hidden"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute bottom-full z-50 mb-2 max-h-80 w-64 overflow-y-auto rounded-ds-lg border-[0.5px] border-ds-border bg-ds-surface p-1 shadow-ds',
            variant === 'mobile' ? 'right-0' : 'left-0',
          )}
        >
          {sessions.map((session, index) => (
            <div
              key={session.userId}
              className={cn(
                'flex items-center gap-1 rounded-ds-md',
                index === activeIndex && 'bg-ds-accent-subtle',
              )}
            >
              <button
                type="button"
                onClick={() => handleSwitch(index)}
                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
              >
                <Avatar src={session.avatarUrl} name={session.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ds-text">{session.name}</span>
                  <span className="block truncate text-xs text-ds-text-muted">
                    @{session.username}@{session.host}
                  </span>
                </span>
                {index === activeIndex && (
                  <IconCheck size={16} className="shrink-0 text-ds-accent" aria-hidden="true" />
                )}
              </button>
              {sessions.length > 1 && (
                <Button
                  variant="danger-ghost"
                  size="sm"
                  aria-label={`${session.name} をログアウト`}
                  onClick={() => handleRemove(index)}
                  className="mr-1 h-7 w-7 min-w-0 shrink-0 px-0"
                >
                  <IconX size={14} aria-hidden="true" />
                </Button>
              )}
            </div>
          ))}
          <div className="my-1 border-t-[0.5px] border-ds-border" />
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            className="justify-start"
            onClick={handleAddAccount}
            leftIcon={<IconPlus size={16} aria-hidden="true" />}
          >
            アカウントを追加
          </Button>
        </div>
      )}
    </div>
  );
}
