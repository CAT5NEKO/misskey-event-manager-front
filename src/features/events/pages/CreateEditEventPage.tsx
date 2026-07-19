import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@shared/api/client';
import type { CreateEventInput, UpdateEventInput, Event, EventLimitInfo } from '@shared/types';
import { Header } from '@shared/components/Header';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';

export function CreateEditEventPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notifTiming, setNotifTiming] = useState<number[]>([]);
  const [customTiming, setCustomTiming] = useState('');
  const [timingUnit, setTimingUnit] = useState('60');
  const [status, setStatus] = useState('active');
  const [linkOnly, setLinkOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(isEdit);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const [limitInfo, setLimitInfo] = useState<EventLimitInfo | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (isEdit && id) {
      setFetchingEvent(true);
      api<Event>(`/events/${id}`)
        .then((e) => {
          if (!mountedRef.current) return;
          setTitle(e.title);
          setDescription(e.description || '');
          setLocation(e.location || '');
          setNotes(e.notes || '');
          setEventDate(e.event_date ? e.event_date.slice(0, 16) : '');
          setDeadline(e.deadline ? e.deadline.slice(0, 16) : '');
          setNotifTiming(e.notification_timing);
          setStatus(e.status);
          setLinkOnly(e.link_only ?? false);
        })
        .catch(() => {
          if (mountedRef.current) navigate('/');
        })
        .finally(() => {
          if (mountedRef.current) setFetchingEvent(false);
        });
    }
    return () => {
      mountedRef.current = false;
    };
  }, [isEdit, id, navigate]);

  useEffect(() => {
    if (!isEdit) {
      api<EventLimitInfo>('/events/remaining')
        .then(setLimitInfo)
        .catch(() => {});
    }
  }, [isEdit]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('タイトルを入力してください');
    const now = new Date();
    const evDate = eventDate ? new Date(eventDate) : null;
    const dlDate = deadline ? new Date(deadline) : null;
    if (evDate && evDate < now) errors.push('予定日は現在より未来の日時を指定してください');
    if (dlDate && dlDate < now) errors.push('回答期限は現在より未来の日時を指定してください');
    if (evDate && dlDate && dlDate > evDate)
      errors.push('回答期限は予定日より前に設定してください');
    return { errors, valid: errors.length === 0 };
  }, [title, eventDate, deadline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (!validation.valid) return;
    setLoading(true);
    const timing = [...notifTiming];
    if (customTiming) {
      const c = parseInt(customTiming, 10);
      if (!isNaN(c) && c > 0 && !timing.includes(c)) timing.push(c);
    }
    try {
      if (isEdit && id) {
        const inp: UpdateEventInput = {
          title,
          description: description || undefined,
          location: location || undefined,
          notes: notes || undefined,
          event_date: eventDate ? new Date(eventDate).toISOString() : undefined,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
          notification_timing: timing,
          status,
          link_only: linkOnly,
        };
        await api(`/events/${id}`, { method: 'PUT', body: JSON.stringify(inp) });
      } else {
        const inp: CreateEventInput = {
          title,
          description: description || undefined,
          location: location || undefined,
          notes: notes || undefined,
          event_date: eventDate ? new Date(eventDate).toISOString() : undefined,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
          notification_timing: timing,
          link_only: linkOnly,
        };
        await api('/events', { method: 'POST', body: JSON.stringify(inp) });
      }
      navigate(isEdit ? `/events/${id}` : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field: string) => {
    if (!touched) return null;
    const v = validation.errors.find((e) => e.includes(field));
    return v ? <p className="text-xs text-red-500 mt-1">{v}</p> : null;
  };

  const limitReached =
    !isEdit && limitInfo && limitInfo.max > 0 && limitInfo.current >= limitInfo.max;

  const limitMessage = limitReached
    ? `イベント数の上限（${limitInfo!.max}件）に達しています。新しいイベントを作成するには、既存のイベントを削除するか、完了/中止にしてください。`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h1 className="text-2xl font-bold mb-6">{isEdit ? 'イベント編集' : '新規イベント'}</h1>
        {fetchingEvent ? (
          <LoadingSpinner />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
            onChange={() => setTouched(true)}
          >
            {limitReached && (
              <div className="text-sm text-red-600 bg-red-50 rounded p-3">{limitMessage}</div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">タイトル *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTouched(true);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
              {fieldError('タイトル')}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                maxLength={5000}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">場所</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">メモ</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={255}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">予定日</label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => {
                    setEventDate(e.target.value);
                    setTouched(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {fieldError('予定日')}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">回答期限</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    setTouched(true);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {fieldError('回答期限')}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">通知タイミング（期限前）</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { label: '1時間前', value: 60 },
                  { label: '1日前', value: 1440 },
                  { label: '3日前', value: 4320 },
                ].map((preset) => {
                  const active = notifTiming.includes(preset.value);
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => {
                        if (active) setNotifTiming(notifTiming.filter((v) => v !== preset.value));
                        else setNotifTiming([...notifTiming, preset.value]);
                      }}
                      className={`px-3 py-1.5 rounded text-sm border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={customTiming}
                  onChange={(e) => setCustomTiming(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="1"
                />
                <select
                  value={timingUnit}
                  onChange={(e) => setTimingUnit(e.target.value)}
                  className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="1">分</option>
                  <option value="60">時間</option>
                  <option value="1440">日</option>
                  <option value="10080">週間</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const num = parseInt(customTiming, 10);
                    const unit = parseInt(timingUnit, 10);
                    if (!isNaN(num) && num > 0) {
                      const v = num * unit;
                      if (!notifTiming.includes(v)) {
                        setNotifTiming([...notifTiming, v]);
                        setCustomTiming('');
                      }
                    }
                  }}
                  className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 text-sm shrink-0"
                >
                  追加
                </button>
              </div>
              {notifTiming.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {notifTiming.map((v) => {
                    const label =
                      v >= 10080
                        ? `${v / 10080}週間前`
                        : v >= 1440
                          ? `${v / 1440}日前`
                          : v >= 60
                            ? `${v / 60}時間前`
                            : `${v}分前`;
                    return (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded"
                      >
                        {label}
                        <button
                          type="button"
                          onClick={() => setNotifTiming(notifTiming.filter((x) => x !== v))}
                          className="hover:text-red-500"
                        >
                          &times;
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 py-1">
              <label className="text-sm font-medium select-none cursor-pointer">
                リンクでのみ公開する
              </label>
              <button
                type="button"
                onClick={() => setLinkOnly(!linkOnly)}
                className={`relative w-10 h-6 rounded-full transition-colors ${linkOnly ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${linkOnly ? 'translate-x-4' : ''}`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-400 -mt-2 mb-1">
              オンにすると募集中一覧に表示されず、リンクを知っている人のみ参加できます
            </p>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium mb-1">ステータス</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">募集中</option>
                  <option value="cancelled">中止</option>
                  <option value="completed">終了</option>
                </select>
              </div>
            )}
            {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
            <div className="flex gap-2 pt-2">
              {limitReached ? (
                <div className="group relative inline-block">
                  <button
                    type="submit"
                    disabled
                    className="bg-blue-600 text-white px-6 py-2 rounded-md opacity-50 cursor-not-allowed"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    イベント数の上限（{limitInfo!.max}件）に達しています
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading || (touched && !validation.valid)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
