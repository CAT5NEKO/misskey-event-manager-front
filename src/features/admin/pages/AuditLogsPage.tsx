import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import type { AuditLog, AuditLogParams } from '@shared/types';
export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const fetch = async () => {
    setLoading(true);
    const p: AuditLogParams = { page, limit: 5 };
    if (action) p.action = action;
    const q = new URLSearchParams(
      Object.entries(p).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
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
    fetch();
  }, [page, action]);
  const fmt = (d: string) => new Date(d).toLocaleString('ja-JP');
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">監査ログ</h1>
      <div className="mb-4">
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-2">日時</th>
                <th className="text-left px-4 py-2">操作</th>
                <th className="text-left px-4 py-2">対象</th>
                <th className="text-left px-4 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{fmt(l.created_at)}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{l.action}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {l.target_type}
                    {l.target_id ? ': ' + l.target_id.slice(0, 8) + '...' : ''}
                  </td>
                  <td className="px-4 py-2 text-gray-400">{l.ip_address || '-'}</td>
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
