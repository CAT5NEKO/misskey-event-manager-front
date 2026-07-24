import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@shared/api/client';
import type { Event, EventLimitInfo } from '@shared/types';
import { Header } from '@shared/components/Header';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [participating, setParticipating] = useState(false);
  const [limitInfo, setLimitInfo] = useState<EventLimitInfo | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api<{ events: Event[]; total_count: number; event_limit?: EventLimitInfo }>(
        `/events?page=${page}&limit=5&filter=${filter}&participating=${participating}`,
      );
      setEvents(res.events || []);
      setTotal(res.total_count || 0);
      setLimitInfo(res.event_limit || null);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, filter, participating]);

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case 'attending':
        return '参加';
      case 'pending':
        return '検討中';
      case 'declined':
        return '不参加';
      default:
        return s;
    }
  };

  const eventStatusLabel = (event: Event) => {
    if (event.status === 'cancelled') return '中止';
    if (event.status === 'completed') return '終了';
    if (event.deadline && new Date(event.deadline) < new Date()) return '期限切れ';
    return '募集中';
  };

  const eventStatusColor = (event: Event) => {
    if (event.status === 'cancelled') return 'bg-red-100 text-red-700';
    if (event.status === 'completed') return 'bg-gray-100 text-gray-600';
    if (event.deadline && new Date(event.deadline) < new Date())
      return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">イベント一覧</h1>
          {limitInfo && limitInfo.max > 0 && limitInfo.current >= limitInfo.max ? (
            <div className="group relative inline-block">
              <Link
                to="/events/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm opacity-50 pointer-events-none"
                aria-disabled="true"
              >
                新規イベント
              </Link>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                イベント数の上限（{limitInfo.max}件）に達しています
              </div>
            </div>
          ) : (
            <Link
              to="/events/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              新規イベント
            </Link>
          )}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => {
              setFilter('active');
              setParticipating(false);
              setPage(1);
            }}
            className={`px-3 py-1 rounded text-sm ${filter === 'active' && !participating ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            募集中
          </button>
          <button
            onClick={() => {
              setFilter('past');
              setParticipating(false);
              setPage(1);
            }}
            className={`px-3 py-1 rounded text-sm ${filter === 'past' && !participating ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            過去の予定
          </button>
          <button
            onClick={() => {
              setFilter('active');
              setParticipating(true);
              setPage(1);
            }}
            className={`px-3 py-1 rounded text-sm ${participating ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            参加中
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500">イベントがありません</div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">{event.title}</h2>
                    {event.location && (
                      <p className="text-sm text-gray-500 mt-1">場所: {event.location}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      {event.deadline && <span>期限: {formatDate(event.deadline)}</span>}
                      {event.event_date && <span>予定日: {formatDate(event.event_date)}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {event.current_user_status && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                          event.current_user_status === 'attending'
                            ? 'bg-green-100 text-green-700'
                            : event.current_user_status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : event.current_user_status === 'declined'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {statusLabel(event.current_user_status)}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${eventStatusColor(event)}`}
                    >
                      {eventStatusLabel(event)}
                    </span>
                  </div>
                </div>
                {event.creator && (
                  <p className="text-xs text-gray-400 mt-2">作成者: {event.creator.name}</p>
                )}
              </Link>
            ))}
          </div>
        )}

        {total > 5 && (
          <div className="flex justify-center items-center gap-1 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2 py-1 bg-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-300"
            >
              前
            </button>
            {Array.from({ length: Math.min(7, Math.ceil(total / 5)) }, (_, i) => {
              const start = Math.max(1, page - 3);
              const end = Math.min(Math.ceil(total / 5), start + 6);
              const p = start + i;
              if (p > end) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded text-sm ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 5 >= total}
              className="px-2 py-1 bg-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-300"
            >
              次
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
