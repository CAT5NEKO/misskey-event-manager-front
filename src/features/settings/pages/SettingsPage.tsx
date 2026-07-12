import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { api } from '@shared/api/client';
import { Header } from '@shared/components/Header';
export function SettingsPage() {
  const { user, sessions, activeIndex, switchAccount, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
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
    if (
      !confirm(
        '本当にアカウントを削除しますか？すべてのデータが完全に削除されます。この操作は取り消せません。',
      )
    )
      return;
    if (!confirm('確認のため、もう一度「OK」を押してください。')) return;
    setDeleting(true);
    try {
      await deleteAccount();
      if (sessions.length <= 1) navigate('/login');
    } catch {
      setDeleting(false);
      alert('削除に失敗しました');
    }
  };
  if (!user) return null;
  const canDelete = allowSelfDelete && !user.is_admin;
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
        {sessions.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-sm font-medium mb-3">アカウント一覧</h2>
            <div className="space-y-1">
              {sessions.map((s, i) => (
                <button
                  key={s.userId}
                  onClick={() => switchAccount(i).then(() => navigate('/'))}
                  className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 ${i === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${i === activeIndex ? 'bg-green-500' : 'bg-gray-300'}`}
                  />
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-400 text-xs">
                    @{s.username}@{s.host}
                  </span>
                  {i === activeIndex && (
                    <span className="text-xs text-green-600 ml-auto">現在</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-sm text-gray-500">ユーザー名</h2>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Misskeyサーバー</h2>
            <p className="font-medium">{user.misskey_host}</p>
          </div>
          <div>
            <h2 className="text-sm text-gray-500">Misskeyユーザー</h2>
            <p className="font-medium">@{user.misskey_username}</p>
          </div>
          {user.is_admin && (
            <div>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                管理者
              </span>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-3">
          <Link
            to="/login?add=1"
            className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            アカウントを追加
          </Link>
          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
          >
            ログアウト
          </button>
          {canDelete && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                この操作を行うと、あなたの作成した予定・参加情報を含むすべてのデータが完全に削除され、復元できません。
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? '削除中...' : 'アカウントを削除'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
