import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import { useRemainingHeight } from '@shared/hooks/useRemainingHeight';
import type { AuditLog, AuditLogParams } from '@shared/types';
import {
  Badge,
  PageHeader,
  Pagination,
  Panel,
  Select,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@design-system/index';
import { PaginationFooter } from '../components/PaginationFooter';

const DESKTOP_LIMIT = 15;
const MOBILE_LIMIT = 20;

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('ja-JP');
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const limit = isDesktop ? DESKTOP_LIMIT : MOBILE_LIMIT;
  const { ref: tableScrollRef, maxHeight } = useRemainingHeight({
    enabled: isDesktop,
    offset: 80,
  });

  useEffect(() => {
    setPage(1);
  }, [isDesktop]);

  const fetchLogs = async (targetPage: number) => {
    setLoading(true);
    const params: AuditLogParams = { page: targetPage, limit };
    if (action) params.action = action;
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][],
    ).toString();

    try {
      const res = await api<{ logs: AuditLog[]; total_count: number }>(
        `/admin/audit-logs?${query}`,
      );
      setLogs(res.logs || []);
      setTotal(res.total_count || 0);
    } catch {
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page, action, limit]);

  return (
    <div className="pb-24 md:pb-0">
      <PageHeader title="監査ログ" />

      {!loading && total > 0 && <p className="mb-3 text-xs text-ds-text-muted">全 {total} 件</p>}

      <div className="mb-4 w-full sm:w-60">
        <Select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        >
          <option value="">すべての操作</option>
          <option value="user.login">ログイン</option>
          <option value="event.create">イベント作成</option>
          <option value="event.delete">イベント削除</option>
          <option value="instance.add">インスタンス追加</option>
          <option value="setting.update">設定更新</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <Panel className="p-8 text-center text-sm text-ds-text-muted">ログがありません</Panel>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {logs.map((l) => (
              <Panel key={l.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone="neutral">{l.action}</Badge>
                  <span className="text-xs text-ds-text-muted">{l.ip_address || '-'}</span>
                </div>
                <p className="mt-2 text-sm text-ds-text break-all">
                  {formatDateTime(l.created_at)}
                </p>
                <p className="mt-1 text-xs text-ds-text-muted">
                  対象: {l.target_type}
                  {l.target_id ? `: ${l.target_id.slice(0, 8)}...` : ''}
                </p>
              </Panel>
            ))}
          </div>

          <div
            ref={tableScrollRef}
            className="hidden md:block overflow-hidden rounded-ds-lg border-[0.5px] border-ds-border bg-ds-surface"
            style={maxHeight ? { maxHeight } : undefined}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>日時</TableHeaderCell>
                    <TableHeaderCell>操作</TableHeaderCell>
                    <TableHeaderCell>対象</TableHeaderCell>
                    <TableHeaderCell>IP</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-ds-text-muted whitespace-nowrap">
                        {formatDateTime(l.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge tone="neutral">{l.action}</Badge>
                      </TableCell>
                      <TableCell className="text-ds-text-muted">
                        {l.target_type}
                        {l.target_id ? `: ${l.target_id.slice(0, 8)}...` : ''}
                      </TableCell>
                      <TableCell className="text-ds-text-muted">{l.ip_address || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {isDesktop && total > DESKTOP_LIMIT && (
            <div className="hidden md:flex justify-center pt-4">
              <Pagination
                total={total}
                page={page}
                pageSize={DESKTOP_LIMIT}
                onPageChange={setPage}
                showPageNumbers
              />
            </div>
          )}

          {!isDesktop && total > MOBILE_LIMIT && (
            <PaginationFooter
              total={total}
              page={page}
              pageSize={MOBILE_LIMIT}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
