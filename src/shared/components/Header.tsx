import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { api } from '@shared/api/client';
import { AccountSwitcher } from '@features/auth/components/AccountSwitcher';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appName, setAppName] = useState('miSchedule');

  useEffect(() => {
    api<{ name: string }>('/app/name')
      .then((res) => setAppName(res.name))
      .catch(() => {});
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <Link to="/" className="text-lg sm:text-xl font-bold text-blue-600 shrink-0">
          {appName}
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          {user && (
            <>
              <Link to="/" className="text-gray-600 hover:text-gray-800 hidden sm:inline">
                予定管理
              </Link>
              {user.is_admin && (
                <Link to="/admin" className="text-gray-600 hover:text-gray-800 hidden sm:inline">
                  管理者設定
                </Link>
              )}
              <Link to="/settings" className="text-gray-600 hover:text-gray-800 hidden sm:inline">
                ユーザー設定
              </Link>
              <AccountSwitcher />
              <button
                onClick={async () => { await logout(); navigate('/login'); }}
                className="text-red-600 hover:text-red-800 whitespace-nowrap"
              >
                ログアウト
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
