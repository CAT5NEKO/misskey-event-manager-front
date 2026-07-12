import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { getSessions } from '@shared/api/client';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const isAddAccount = searchParams.get('add') === '1';
  const hasExistingSession = getSessions().length > 0;

  const [host, setHost] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">miSchedule</h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          {isAddAccount ? 'アカウントを追加' : 'Misskeyアカウントでログイン'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Misskeyサーバー</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '接続中...' : isAddAccount ? 'アカウントを追加' : 'Misskeyでログイン'}
          </button>
          {hasExistingSession && !isAddAccount && (
            <p className="text-xs text-gray-400 text-center mt-2">
              別のアカウントを追加する場合は
              <a href="/login?add=1" className="text-blue-600 hover:underline">
                こちら
              </a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
