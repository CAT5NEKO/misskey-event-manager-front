import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';

export function CallbackPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { handleCallback, handleAddAccountCallback } = useAuth();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const session = searchParams.get('session');
    const csrfToken = localStorage.getItem('miauth_csrf_token') || '';
    const isAdd = localStorage.getItem('miauth_is_add') === '1';

    if (!session) {
      setError('認証情報が見つかりません');
      setLoading(false);
      return;
    }

    const cb = isAdd ? handleAddAccountCallback : handleCallback;

    cb(session, csrfToken)
      .then(() => {
        localStorage.removeItem('miauth_session_id');
        localStorage.removeItem('miauth_csrf_token');
        localStorage.removeItem('miauth_is_add');
        navigate(isAdd ? '/settings' : '/');
      })
      .catch((err) => {
        setError(err.message || '認証に失敗しました');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">認証中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
            ログインに戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
}
