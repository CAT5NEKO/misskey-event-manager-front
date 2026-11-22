import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { api } from '@shared/api/client';
import {
  Badge,
  Button,
  ButtonLink,
  PageContainer,
  PageHeader,
  Panel,
  useAlert,
  useConfirm,
} from '@design-system/index';

export function SettingsPage() {
  const { user, sessions, activeIndex, switchAccount, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const alert = useAlert();

  const [deleting, setDeleting] = useState(false);
  const [allowSelfDelete, setAllowSelfDelete] = useState(true);

  useEffect(() => {
    api<{ allow_self_delete: boolean }>('/app/config')
      .then((r) => setAllowSelfDelete(r.allow_self_delete))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    if (sessions.length <= 1) navigate('/login');
  };

  const handleDelete = async () => {
    const firstConfirm = await confirm({
      title: 'アカウント削除',
      message:
        '本当にアカウントを削除しますか？すべてのデータが完全に削除されます。この操作は取り消せません。',
      danger: true,
      confirmLabel: '削除する',
    });
    if (!firstConfirm) return;

    const secondConfirm = await confirm({
      title: '最終確認',
      message: '確認のため、もう一度「削除する」を押してください。',
      danger: true,
      confirmLabel: '完全に削除する',
    });
    if (!secondConfirm) return;

    setDeleting(true);
    try {
      await deleteAccount();
      if (sessions.length <= 1) navigate('/login');
    } catch {
      setDeleting(false);
      await alert({
        title: 'エラー',
        message: '削除に失敗しました',
        tone: 'danger',
      });
    }
  };

  if (!user) return null;
  const canDelete = allowSelfDelete && !user.is_admin;

  return (
    <PageContainer>
      <PageHeader title="アカウント設定" />

      <div className="space-y-4">
        {sessions.length > 1 && (
          <Panel className="p-5 sm:p-6">
            <h2 className="text-sm font-bold text-ds-text">アカウント一覧</h2>
            <div className="mt-3 space-y-1">
              {sessions.map((s, i) => (
                <button
                  key={s.userId}
                  type="button"
                  onClick={() => switchAccount(i).then(() => navigate('/'))}
                  className={`flex w-full items-center gap-2.5 rounded-ds-md px-3 py-2 text-left text-sm transition-colors ${
                    i === activeIndex
                      ? 'bg-ds-surface-hover font-medium text-ds-text-strong'
                      : 'text-ds-text hover:bg-ds-surface-hover'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-ds-full ${
                      i === activeIndex ? 'bg-ds-accent' : 'bg-ds-border-strong'
                    }`}
                  />
                  <span className="truncate">{s.name}</span>
                  <span className="truncate text-xs text-ds-text-muted">
                    @{s.username}@{s.host}
                  </span>
                  {i === activeIndex && (
                    <Badge tone="success" className="ml-auto">
                      現在
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </Panel>
        )}

        <Panel className="p-5 sm:p-6">
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">ユーザー名</dt>
              <dd className="mt-0.5 text-sm font-medium text-ds-text">{user.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">Misskeyサーバー</dt>
              <dd className="mt-0.5 text-sm font-medium text-ds-text">{user.misskey_host}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">Misskeyユーザー</dt>
              <dd className="mt-0.5 text-sm font-medium text-ds-text">@{user.misskey_username}</dd>
            </div>
            {user.is_admin && (
              <div>
                <dt className="text-xs font-medium text-ds-text-muted">ロール</dt>
                <dd className="mt-1">
                  <Badge tone="warning">管理者</Badge>
                </dd>
              </div>
            )}
          </dl>
        </Panel>

        <div className="space-y-3">
          <ButtonLink to="/login?add=1" variant="secondary" fullWidth>
            アカウントを追加
          </ButtonLink>
          <Button variant="secondary" fullWidth onClick={handleLogout}>
            ログアウト
          </Button>
          {canDelete && (
            <div className="pt-2">
              <Button variant="danger" fullWidth disabled={deleting} onClick={handleDelete}>
                {deleting ? '削除中...' : 'アカウントを削除'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
