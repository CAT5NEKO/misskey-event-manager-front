import { Link, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  const links = [
    { to: '/admin', label: 'ダッシュボード' },
    { to: '/admin/instances', label: 'インスタンス' },
    { to: '/admin/users', label: 'ユーザー' },
    { to: '/admin/events', label: 'イベント' },
    { to: '/admin/audit-logs', label: '監査ログ' },
    { to: '/admin/settings', label: '設定' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
      <aside className="sm:w-48 shrink-0">
        <nav className="flex sm:block gap-1 sm:space-y-1 overflow-x-auto pb-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 rounded text-xs sm:text-sm whitespace-nowrap ${
                location.pathname === link.to
                  ? 'bg-orange-100 text-orange-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
