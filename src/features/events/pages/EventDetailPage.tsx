import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@shared/api/client';
import { useAuth } from '@features/auth/hooks/useAuth';
import type { Event } from '@shared/types';
import { Header } from '@shared/components/Header';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const shareLabelRef = useRef<HTMLSpanElement>(null);

  const fetchEvent = async () => {
    try {
      const e = await api<Event>(`/events/${id}`);
      setEvent(e);
      document.title = `${e.title} - miSchedule`;
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const el = shareLabelRef.current;
      if (el) {
        el.textContent = 'コピーしました';
        setTimeout(() => {
          el.textContent = '共有';
        }, 1500);
      }
    } catch {}
  };

  const handleJoin = async (status: string) => {
    if (!id) return;
    setJoining(true);
    try {
      await api(`/events/${id}/join`, { method: 'POST', body: JSON.stringify({ status }) });
      await fetchEvent();
    } catch {
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    setJoining(true);
    try {
      await api(`/events/${id}/join`, { method: 'DELETE' });
      await fetchEvent();
    } catch {
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('このイベントを削除しますか？')) return;
    await api(`/events/${id}`, { method: 'DELETE' });
    navigate('/');
  };

  const handleCancel = async () => {
    if (!confirm('このイベントを中止にしますか？')) return;
    await api(`/events/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
    fetchEvent();
  };

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

  const timingLabel = (min: number) => {
    if (min >= 1440) return `${min / 1440}日前`;
    if (min >= 60) return `${min / 60}時間前`;
    return `${min}分前`;
  };

  if (loading)
    return (
      <div className="min-h-screen">
        <Header />
        <LoadingSpinner />
      </div>
    );
  if (!event) return null;

  const isCreator = user?.id === event.creator_id;
  const isAdmin = user?.is_admin;
  const isExpired =
    event.status !== 'active' || (event.deadline && new Date(event.deadline) < new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          &larr; 予定一覧に戻る
        </Link>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold">{event.title}</h1>
            <div className="flex gap-2 items-center">
              <div className="group relative">
                <button
                  onClick={handleShare}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  <span ref={shareLabelRef}>共有</span>
                </button>
              </div>
              {(isCreator || isAdmin) && !isExpired && (
                <Link
                  to={`/events/${event.id}/edit`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  編集
                </Link>
              )}
              {(isCreator || isAdmin) && event.status === 'active' && (
                <button onClick={handleCancel} className="text-sm text-yellow-600 hover:underline">
                  中止
                </button>
              )}
              {(isCreator || isAdmin) && (
                <button onClick={handleDelete} className="text-sm text-red-600 hover:underline">
                  削除
                </button>
              )}
            </div>
          </div>

          <span
            className={`inline-block px-2 py-0.5 rounded text-xs mb-4 ${event.status === 'active' ? 'bg-blue-100 text-blue-700' : event.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
          >
            {event.status === 'active' ? '募集中' : event.status === 'cancelled' ? '中止' : '終了'}
          </span>

          <dl className="space-y-3">
            {event.location && (
              <div>
                <dt className="text-sm text-gray-500 font-medium">場所</dt>
                <dd className="mt-0.5">{event.location}</dd>
              </div>
            )}
            {event.event_date && (
              <div>
                <dt className="text-sm text-gray-500 font-medium">予定日</dt>
                <dd className="mt-0.5">{formatDate(event.event_date)}</dd>
              </div>
            )}
            {event.deadline && (
              <div>
                <dt className="text-sm text-gray-500 font-medium">回答期限</dt>
                <dd className="mt-0.5">{formatDate(event.deadline)}</dd>
              </div>
            )}
            {event.description && (
              <div>
                <dt className="text-sm text-gray-500 font-medium">説明</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">{event.description}</dd>
              </div>
            )}
            {event.notes && (
              <div>
                <dt className="text-sm text-gray-500 font-medium">メモ</dt>
                <dd className="mt-0.5 whitespace-pre-wrap">{event.notes}</dd>
              </div>
            )}
            {event.notification_timing && event.notification_timing.length > 0 && (
              <div>
                <dt className="text-sm text-gray-500 font-medium">通知タイミング</dt>
                <dd className="mt-0.5">{event.notification_timing.map(timingLabel).join(', ')}</dd>
              </div>
            )}
            {event.creator && (
              <div>
                <dt className="text-sm text-gray-500 font-medium">作成者</dt>
                <dd className="mt-0.5">{event.creator.name}</dd>
              </div>
            )}
          </dl>

          {event.status === 'active' && !isExpired && (
            <div className="mt-6 pt-4 border-t flex gap-2">
              {event.current_user_status ? (
                <>
                  {event.current_user_status === 'attending' && (
                    <button
                      onClick={() => handleJoin('declined')}
                      disabled={joining}
                      className="text-sm text-red-600 hover:underline"
                    >
                      不参加にする
                    </button>
                  )}
                  {event.current_user_status === 'declined' && (
                    <button
                      onClick={() => handleJoin('attending')}
                      disabled={joining}
                      className="text-sm text-green-600 hover:underline"
                    >
                      参加にする
                    </button>
                  )}
                  <button
                    onClick={handleLeave}
                    disabled={joining}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    回答を取り消す
                  </button>
                </>
              ) : !isCreator ? (
                <>
                  <button
                    onClick={() => handleJoin('attending')}
                    disabled={joining}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    参加する
                  </button>
                  <button
                    onClick={() => handleJoin('declined')}
                    disabled={joining}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                  >
                    不参加
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-3">参加者</h2>
          {event.participants && event.participants.length > 0 ? (
            <div className="space-y-2">
              <div className="flex gap-4 text-sm text-gray-500 mb-2">
                <span className="text-green-600 font-medium">
                  参加: {event.participants.filter((p) => p.status === 'attending').length}
                </span>
                <span className="text-red-600 font-medium">
                  不参加: {event.participants.filter((p) => p.status === 'declined').length}
                </span>
              </div>
              {event.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {p.user?.avatar_url ? (
                      <img
                        src={p.user.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full bg-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs font-bold">
                        {(p.user?.name || '?')[0]}
                      </div>
                    )}
                    <span className="font-medium text-sm">{p.user?.name || 'Unknown'}</span>
                    {p.comment && <span className="text-xs text-gray-400">{p.comment}</span>}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${p.status === 'attending' ? 'bg-green-100 text-green-700' : p.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {p.status === 'attending'
                      ? '参加'
                      : p.status === 'declined'
                        ? '不参加'
                        : p.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">まだ参加者がいません</p>
          )}
        </div>
      </div>
    </div>
  );
}
