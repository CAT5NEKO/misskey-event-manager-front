import { useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getSessions } from '@shared/api/client';
import { useAppName } from '@shared/hooks/useAppName';
import { AppLogo, Button, Field, Input, Panel } from '@design-system/index';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAddAccount = searchParams.get('add') === '1';
  const reason =
    searchParams.get('reason') === 'session_expired'
      ? 'セッションの有効期限が切れました'
      : (location.state as { reason?: string } | null)?.reason;
  const hasExistingSession = getSessions().length > 0;

  const [host, setHost] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const appName = useAppName();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(host);
      localStorage.setItem('miauth_session_id', res.session_id);
      localStorage.setItem('miauth_csrf_token', res.csrf_token);
      localStorage.setItem('miauth_is_add', isAddAccount ? '1' : '0');
      window.location.href = res.miauth_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const brand = (
    <div className="flex flex-col items-center">
      <AppLogo className="h-16 w-16 text-ds-text" iconClassName="h-9 w-9" />
      <span className="mt-4 text-2xl font-bold text-ds-text truncate max-w-full">{appName}</span>
    </div>
  );

  return (
    <div className="min-h-dvh bg-ds-bg flex flex-col lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex lg:flex-col items-center justify-center bg-ds-surface border-r-[0.5px] border-ds-border px-8 py-12">
        {brand}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex flex-col items-center">
            <AppLogo className="h-14 w-14 text-ds-text" iconClassName="h-8 w-8" />
            <span className="mt-3 text-xl font-bold text-ds-text truncate max-w-full">
              {appName}
            </span>
          </div>

          <Panel className="p-6 sm:p-8">
            <h1 className="text-xl font-bold text-center mb-1.5 text-ds-text">
              {isAddAccount ? 'アカウントを追加' : 'ログイン'}
            </h1>
            <p className="text-sm text-ds-text-muted text-center mb-6">
              {isAddAccount ? 'アカウントを追加' : 'Misskeyアカウントでログイン'}
            </p>
            {reason && (
              <p className="text-sm text-ds-warning-text bg-ds-warning-subtle border-[0.5px] border-ds-border rounded-ds-md p-3 mb-4">
                {reason}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Misskeyサーバー" htmlFor="host">
                <Input
                  id="host"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="example.com"
                  required
                />
              </Field>
              {error && <p className="text-sm text-ds-danger-text">{error}</p>}
              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? '接続中...' : isAddAccount ? 'アカウントを追加' : 'Misskeyでログイン'}
              </Button>
              {hasExistingSession && !isAddAccount && (
                <p className="text-xs text-ds-text-muted text-center mt-2">
                  別のアカウントを追加する場合は
                  <Link to="/login?add=1" className="text-ds-text underline hover:text-ds-accent">
                    こちら
                  </Link>
                </p>
              )}
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
