import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import type { User } from '@shared/types';

export function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api<{ users: User[]; total_count: number }>(
        `/admin/users?page=${page}&limit=5&search=${encodeURIComponent(search)}`,
      );
      setUsers(res.users || []);
      setTotal(res.total_count || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleDelete = async (u: User) => {
    if (!confirm(`${u.name} を削除しますか？`)) return;
    await api(`/admin/users/${u.id}`, { method: 'DELETE' });
    fetchUsers();
  };

  const handleDeactivate = async (u: User) => {
    await api(`/admin/users/${u.id}/deactivate`, { method: 'PUT' });
    fetchUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ユーザー管理</h1>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ユーザー検索..."
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-2">名前</th>
                <th className="text-left px-4 py-2">Misskey</th>
                <th className="text-left px-4 py-2">ステータス</th>
                <th className="text-left px-4 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    <span className="font-medium">{u.name}</span>
                    {u.is_admin && (
                      <span className="ml-1 text-xs bg-orange-100 text-orange-700 px-1 rounded">
                        管理
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    @{u.misskey_username}@{u.misskey_host}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {u.is_active ? '有効' : '無効'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {!u.is_admin && (
                      <div className="flex gap-2">
                        {u.is_active && (
                          <button
                            onClick={() => handleDeactivate(u)}
                            className="text-xs text-orange-600 hover:underline"
                          >
                            無効化
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {total > 5 && (
            <div className="flex justify-center gap-2 p-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
              >
                前へ
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                {page} / {Math.ceil(total / 5)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 5 >= total}
                className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
              >
                次へ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
