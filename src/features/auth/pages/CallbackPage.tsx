import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { Button, Spinner } from '@design-system/index';

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
      <div className="min-h-dvh flex items-center justify-center bg-ds-bg">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-ds-text-muted text-sm">認証中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-ds-bg p-4">
        <div className="text-center">
          <p className="text-ds-danger-text mb-4 text-sm">{error}</p>
          <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
            ログインに戻る
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
