import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { PageHeader, Panel, Spinner } from '@design-system/index';

interface DashboardStats {
  users: number;
  events: number;
  instances: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let active = true;

    Promise.all([
      api<{ total_count: number }>('/admin/users?limit=1'),
      api<{ total_count: number }>('/admin/events?limit=1'),
      api<unknown[]>('/admin/instances'),
    ])
      .then(([users, events, instances]) => {
        if (!active) return;
        setStats({
          users: (users as { total_count: number }).total_count || 0,
          events: (events as { total_count: number }).total_count || 0,
          instances: (instances as unknown[]).length || 0,
        });
      })
      .catch(() => {
        if (!active) return;
        setStats({ users: 0, events: 0, instances: 0 });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="管理者ダッシュボード" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {stats === null ? (
          <>
            <Panel className="flex items-center justify-center p-8">
              <Spinner />
            </Panel>
            <Panel className="flex items-center justify-center p-8">
              <Spinner />
            </Panel>
            <Panel className="flex items-center justify-center p-8">
              <Spinner />
            </Panel>
          </>
        ) : (
          <>
            <Panel className="p-6">
              <p className="text-xs font-medium text-ds-text-muted">ユーザー数</p>
              <p className="mt-1 text-3xl font-bold text-ds-text">{stats.users}</p>
            </Panel>
            <Panel className="p-6">
              <p className="text-xs font-medium text-ds-text-muted">イベント数</p>
              <p className="mt-1 text-3xl font-bold text-ds-text">{stats.events}</p>
            </Panel>
            <Panel className="p-6">
              <p className="text-xs font-medium text-ds-text-muted">許可インスタンス</p>
              <p className="mt-1 text-3xl font-bold text-ds-text">{stats.instances}</p>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
