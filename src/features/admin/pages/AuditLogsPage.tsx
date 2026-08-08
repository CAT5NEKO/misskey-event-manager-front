import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import { useRemainingHeight } from '@shared/hooks/useRemainingHeight';
import type { AuditLog, AuditLogParams } from '@shared/types';
import { Pagination, PaginationFooter } from '../components/PaginationFooter';

const DESKTOP_LIMIT = 15;
const MOBILE_LIMIT = 20;

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const limit = isDesktop ? DESKTOP_LIMIT : MOBILE_LIMIT;
  const { ref: tableScrollRef, maxHeight } = useRemainingHeight({ enabled: isDesktop, offset: 80 });

  useEffect(() => {
    setPage(1);
  }, [isDesktop]);

  const fetch = async (p: number) => {
    setLoading(true);
    const params: AuditLogParams = { page: p, limit };
    if (action) params.action = action;
    const q = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
    ).toString();
    try {
      const r = await api<{ logs: AuditLog[]; total_count: number }>('/admin/audit-logs?' + q);
      setLogs(r.logs || []);
      setTotal(r.total_count || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(page);
  }, [page, action, limit]);

  const fmt = (d: string) => new Date(d).toLocaleString('ja-JP');
  return (
    <div className="pb-24 md:pb-0">
      <h1 className="text-2xl font-bold mb-4">監査ログ</h1>
      {!loading && total > 0 && (
        <p className="text-sm text-gray-500 mb-3">全 {total} 件</p>
      )}
      <div className="mb-4">
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="">すべての操作</option>
          <option value="user.login">ログイン</option>
          <option value="event.create">イベント作成</option>
          <option value="event.delete">イベント削除</option>
          <option value="instance.add">インスタンス追加</option>
          <option value="setting.update">設定更新</option>
        </select>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          ログがありません
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {logs.map((l) => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                    {l.action}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{l.ip_address || '-'}</span>
                </div>
                <p className="text-sm text-gray-700 break-all">{fmt(l.created_at)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  対象: {l.target_type}
                  {l.target_id ? ': ' + l.target_id.slice(0, 8) + '...' : ''}
                </p>
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
                    日時
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    操作
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    対象
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b last:border-0">
                    <td className="px-4 py-2 border-b border-gray-100 text-gray-500 whitespace-nowrap">
                      {fmt(l.created_at)}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100">
                      <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{l.action}</span>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100 text-gray-500">
                      {l.target_type}
                      {l.target_id ? ': ' + l.target_id.slice(0, 8) + '...' : ''}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100 text-gray-400">
                      {l.ip_address || '-'}
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
