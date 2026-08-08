import { useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getSessions } from '@shared/api/client';
import { useAppName } from '@shared/hooks/useAppName';

function CalendarLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="9" cy="15" r="1" />
      <circle cx="15" cy="15" r="1" />
    </svg>
  );
}

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
    <div className="flex flex-col items-center lg:items-center">
      <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
        <CalendarLogo className="w-8 h-8 text-white" />
      </div>
      <span className="mt-4 text-2xl font-bold text-white truncate max-w-full">{appName}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex lg:flex-col items-center justify-center bg-blue-800 px-8 py-12">
        {brand}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-800 flex items-center justify-center">
              <CalendarLogo className="w-7 h-7 text-white" />
            </div>
            <span className="mt-3 text-xl font-bold text-gray-900 truncate max-w-full">
              {appName}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-center mb-1.5">
              {isAddAccount ? 'アカウントを追加' : 'ログイン'}
            </h1>
            <p className="text-sm text-gray-500 text-center mb-6">
              {isAddAccount ? 'アカウントを追加' : 'Misskeyアカウントでログイン'}
            </p>
            {reason && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                {reason}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="host" className="block text-sm font-medium mb-1.5">
                  Misskeyサーバー
                </label>
                <input
                  id="host"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 active:scale-[.99] transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {loading ? '接続中...' : isAddAccount ? 'アカウントを追加' : 'Misskeyでログイン'}
              </button>
              {hasExistingSession && !isAddAccount && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  別のアカウントを追加する場合は
                  <a
                    href="/login?add=1"
                    className="text-blue-600 hover:underline focus:outline-none focus:underline"
                  >
                    こちら
                  </a>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}