import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';

export function DashboardPage() {
  const [stats, setStats] = useState<{ users: number; events: number; instances: number } | null>(
    null,
  );
  useEffect(() => {
    Promise.all([
      api<{ total_count: number }>('/admin/users?limit=1'),
      api<{ total_count: number }>('/admin/events?limit=1'),
      api<unknown[]>('/admin/instances'),
    ])
      .then(([users, events, instances]) => {
        setStats({
          users: (users as { total_count: number }).total_count || 0,
          events: (events as { total_count: number }).total_count || 0,
          instances: (instances as unknown[]).length || 0,
        });
      })
      .catch(() => {
        setStats({ users: 0, events: 0, instances: 0 });
      });
  }, []);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理者ダッシュボード</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {stats === null ? (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center">
              <LoadingSpinner />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center">
              <LoadingSpinner />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500">ユーザー数</p>
              <p className="text-3xl font-bold">{stats.users}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500">イベント数</p>
              <p className="text-3xl font-bold">{stats.events}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-sm text-gray-500">許可インスタンス</p>
              <p className="text-3xl font-bold">{stats.instances}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
