import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import { useRemainingHeight } from '@shared/hooks/useRemainingHeight';
import type { Event } from '@shared/types';
import {
  Badge,
  type BadgeTone,
  Button,
  PageHeader,
  Pagination,
  Panel,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
  useConfirm,
} from '@design-system/index';
import { PaginationFooter } from '../components/PaginationFooter';

const DESKTOP_LIMIT = 15;
const MOBILE_LIMIT = 20;

function getEventStatus(event: Event): { label: string; tone: BadgeTone } {
  if (event.status === 'cancelled') return { label: '中止', tone: 'danger' };
  if (event.status === 'completed') return { label: '終了', tone: 'neutral' };
  return { label: '募集中', tone: 'neutral' };
}

function formatDate(date: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ja-JP');
}

export function EventManagePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();

  const isDesktop = useMediaQuery('(min-width: 768px)');
  const limit = isDesktop ? DESKTOP_LIMIT : MOBILE_LIMIT;
  const { ref: tableScrollRef, maxHeight } = useRemainingHeight({
    enabled: isDesktop,
    offset: 80,
  });

  useEffect(() => {
    setPage(1);
  }, [isDesktop]);

  const fetchEvents = async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await api<{ events: Event[]; total_count: number }>(
        `/admin/events?page=${targetPage}&limit=${limit}`,
      );
      setEvents(res.events || []);
      setTotal(res.total_count || 0);
    } catch {
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page, limit]);

  const handleDelete = async (e: Event) => {
    const ok = await confirm({
      title: 'イベント削除',
      message: `${e.title} を削除しますか？この操作は取り消せません。`,
      danger: true,
      confirmLabel: '削除',
    });
    if (!ok) return;

    await api(`/admin/events/${e.id}`, { method: 'DELETE' });
    fetchEvents(page);
  };

  return (
    <div className="pb-24 md:pb-0">
      <PageHeader title="イベント管理" />

      {!loading && total > 0 && <p className="mb-3 text-xs text-ds-text-muted">全 {total} 件</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <Panel className="p-8 text-center text-sm text-ds-text-muted">イベントがありません</Panel>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {events.map((e) => {
              const statusInfo = getEventStatus(e);
              return (
                <Panel key={e.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ds-text">{e.title}</span>
                    <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ds-text-muted">
                    作成者: {e.creator?.name || '-'}
                  </p>
                  <p className="mt-0.5 text-xs text-ds-text-muted">
                    期限: {formatDate(e.deadline)}
                  </p>
                  <div className="mt-3 border-t-[0.5px] border-ds-border pt-3">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(e)}>
                      削除
                    </Button>
                  </div>
                </Panel>
              );
            })}
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
                    <TableHeaderCell>タイトル</TableHeaderCell>
                    <TableHeaderCell>作成者</TableHeaderCell>
                    <TableHeaderCell>期限</TableHeaderCell>
                    <TableHeaderCell>ステータス</TableHeaderCell>
                    <TableHeaderCell>操作</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((e) => {
                    const statusInfo = getEventStatus(e);
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium text-ds-text">{e.title}</TableCell>
                        <TableCell className="text-ds-text-muted">
                          {e.creator?.name || '-'}
                        </TableCell>
                        <TableCell className="text-ds-text-muted">
                          {formatDate(e.deadline)}
                        </TableCell>
                        <TableCell>
                          <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(e)}>
                            削除
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
