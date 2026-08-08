import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import { useRemainingHeight } from '@shared/hooks/useRemainingHeight';
import type { User } from '@shared/types';
import { Pagination, PaginationFooter } from '../components/PaginationFooter';

const DESKTOP_LIMIT = 15;
const MOBILE_LIMIT = 20;

export function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const limit = isDesktop ? DESKTOP_LIMIT : MOBILE_LIMIT;
  const { ref: tableScrollRef, maxHeight } = useRemainingHeight({ enabled: isDesktop, offset: 80 });

  useEffect(() => {
    setPage(1);
  }, [isDesktop]);

  const fetchUsers = async (p: number) => {
    setLoading(true);
    try {
      const res = await api<{ users: User[]; total_count: number }>(
        `/admin/users?page=${p}&limit=${limit}&search=${encodeURIComponent(search)}`,
      );
      setUsers(res.users || []);
      setTotal(res.total_count || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page, search, limit]);

  const handleDelete = async (u: User) => {
    if (!confirm(`${u.name} を削除しますか？`)) return;
    await api(`/admin/users/${u.id}`, { method: 'DELETE' });
    fetchUsers(page);
  };

  const handleDeactivate = async (u: User) => {
    await api(`/admin/users/${u.id}/deactivate`, { method: 'PUT' });
    fetchUsers(page);
  };

  return (
    <div className="pb-24 md:pb-0">
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
          className="w-full max-w-md px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>
      {!loading && total > 0 && (
        <p className="text-sm text-gray-500 mb-3">全 {total} 件</p>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          ユーザーがいません
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {users.map((u) => (
              <div key={u.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium">
                    {u.name}
                    {u.is_admin && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">
                        管理
                      </span>
                    )}
                  </span>
                  <span
                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {u.is_active ? '有効' : '無効'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 break-all">
                  @{u.misskey_username}@{u.misskey_host}
                </p>
                {!u.is_admin && (
                  <div className="flex gap-3 mt-3">
                    {u.is_active && (
                      <button
                        onClick={() => handleDeactivate(u)}
                        className="text-sm text-orange-600 hover:underline"
                      >
                        無効化
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div
            ref={tableScrollRef}
            className="hidden md:block overflow-y-auto rounded-xl border border-gray-200 bg-white"
            style={maxHeight ? { maxHeight } : undefined}
          >
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    名前
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    Misskey
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    ステータス
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="px-4 py-2 border-b border-gray-100">
                      <span className="font-medium">{u.name}</span>
                      {u.is_admin && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">
                          管理
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100 text-gray-500 break-all">
                      @{u.misskey_username}@{u.misskey_host}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {u.is_active ? '有効' : '無効'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100">
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
          </div>
          {isDesktop && total > DESKTOP_LIMIT && (
            <div className="hidden md:flex justify-center pt-4">
              <Pagination
                total={total}
                page={page}
                pageSize={DESKTOP_LIMIT}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
          {!isDesktop && total > MOBILE_LIMIT && (
            <PaginationFooter
              total={total}
              page={page}
              pageSize={MOBILE_LIMIT}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </>
      )}
    </div>
  );
}
