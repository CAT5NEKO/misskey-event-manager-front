import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import { useRemainingHeight } from '@shared/hooks/useRemainingHeight';
import type { Event } from '@shared/types';
import { Pagination, PaginationFooter } from '../components/PaginationFooter';

const DESKTOP_LIMIT = 15;
const MOBILE_LIMIT = 20;

export function EventManagePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const limit = isDesktop ? DESKTOP_LIMIT : MOBILE_LIMIT;
  const { ref: tableScrollRef, maxHeight } = useRemainingHeight({ enabled: isDesktop, offset: 80 });

  useEffect(() => {
    setPage(1);
  }, [isDesktop]);

  const fetch = async (p: number) => {
    setLoading(true);
    try {
      const r = await api<{ events: Event[]; total_count: number }>(
        `/admin/events?page=${p}&limit=${limit}`,
      );
      setEvents(r.events || []);
      setTotal(r.total_count || 0);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch(page);
  }, [page, limit]);

  const del = async (e: Event) => {
    if (!confirm(e.title + ' を削除しますか？')) return;
    await api('/admin/events/' + e.id, { method: 'DELETE' });
    fetch(page);
  };
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString('ja-JP') : '-');
  return (
    <div className="pb-24 md:pb-0">
      <h1 className="text-2xl font-bold mb-4">イベント管理</h1>
      {!loading && total > 0 && (
        <p className="text-sm text-gray-500 mb-3">全 {total} 件</p>
      )}
      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          イベントがありません
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {events.map((e) => (
              <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-medium">{e.title}</span>
                  <span
                    className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${e.status === 'active' ? 'bg-blue-100 text-blue-700' : e.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {e.status === 'active'
                      ? '募集中'
                      : e.status === 'cancelled'
                        ? '中止'
                        : '終了'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">作成者: {e.creator?.name || '-'}</p>
                <p className="text-sm text-gray-500">期限: {fmt(e.deadline)}</p>
                <div className="mt-3">
                  <button
                    onClick={() => del(e)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </div>
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
                    タイトル
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    作成者
                  </th>
                  <th className="sticky top-0 z-10 bg-gray-50 text-left px-4 py-2 border-b border-gray-200">
                    期限
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
                {events.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="px-4 py-2 border-b border-gray-100 font-medium">{e.title}</td>
                    <td className="px-4 py-2 border-b border-gray-100 text-gray-500">
                      {e.creator?.name || '-'}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100 text-gray-500">
                      {fmt(e.deadline)}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${e.status === 'active' ? 'bg-blue-100 text-blue-700' : e.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
                      >
                        {e.status === 'active'
                          ? '募集中'
                          : e.status === 'cancelled'
                            ? '中止'
                            : '終了'}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100">
                      <button onClick={() => del(e)} className="text-xs text-red-600 hover:underline">
                        削除
                      </button>
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
