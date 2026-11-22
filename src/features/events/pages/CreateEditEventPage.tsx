import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@shared/api/client';
import type { CreateEventInput, UpdateEventInput, Event, EventLimitInfo } from '@shared/types';
import {
  Button,
  Chip,
  Field,
  Info,
  Input,
  PageContainer,
  PageHeader,
  Panel,
  Select,
  Spinner,
  Switch,
  Tabs,
  Textarea,
} from '@design-system/index';

const statusTabs = [
  { value: 'active', label: '募集中' },
  { value: 'cancelled', label: '中止' },
  { value: 'completed', label: '終了' },
];

const timingPresets = [
  { label: '1時間前', value: 60 },
  { label: '1日前', value: 1440 },
  { label: '3日前', value: 4320 },
];

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
    if (isEdit) return;
    api<EventLimitInfo>('/events/remaining')
      .then(setLimitInfo)
      .catch(() => {});
  }, [isEdit]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    if (!title.trim()) errors.push('タイトルを入力してください');
    const now = new Date();
    const evDate = eventDate ? new Date(eventDate) : null;
    const dlDate = deadline ? new Date(deadline) : null;
    if (evDate && evDate < now) errors.push('予定日は現在より未来の日時を指定してください');
    if (dlDate && dlDate < now) errors.push('回答期限は現在より未来の日時を指定してください');
    if (evDate && dlDate && dlDate > evDate) {
      errors.push('回答期限は予定日より前に設定してください');
    }
    return { errors, valid: errors.length === 0 };
  }, [title, eventDate, deadline]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError('');
    if (!validation.valid) return;

    setLoading(true);
    const timing = [...notifTiming];
    if (customTiming) {
      const parsed = parseInt(customTiming, 10);
      if (!isNaN(parsed) && parsed > 0 && !timing.includes(parsed)) {
        timing.push(parsed);
      }
    }

    try {
      if (isEdit && id) {
        const payload: UpdateEventInput = {
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
        await api(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        const payload: CreateEventInput = {
          title,
          description: description || undefined,
          location: location || undefined,
          notes: notes || undefined,
          event_date: eventDate ? new Date(eventDate).toISOString() : undefined,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
          notification_timing: timing,
          link_only: linkOnly,
        };
        await api('/events', { method: 'POST', body: JSON.stringify(payload) });
      }
      navigate(isEdit ? `/events/${id}` : '/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const fieldError = (field: string) => {
    if (!touched) return undefined;
    return validation.errors.find((e) => e.includes(field));
  };

  const limitReached =
    !isEdit && Boolean(limitInfo && limitInfo.max > 0 && limitInfo.current >= limitInfo.max);

  const handleAddCustomTiming = () => {
    const num = parseInt(customTiming, 10);
    const unit = parseInt(timingUnit, 10);
    if (isNaN(num) || num <= 0) return;
    const value = num * unit;
    if (!notifTiming.includes(value)) {
      setNotifTiming([...notifTiming, value]);
      setCustomTiming('');
    }
  };

  if (fetchingEvent) {
    return (
      <PageContainer>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title={isEdit ? 'イベント編集' : '新規イベント'} />

      <Panel className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4" onChange={() => setTouched(true)}>
          {limitReached && (
            <Info tone="danger">
              イベント数の上限（{limitInfo?.max}
              件）に達しています。新しいイベントを作成するには、既存のイベントを削除するか、完了/中止にしてください。
            </Info>
          )}

          <Field label="タイトル" required error={fieldError('タイトル')}>
            <Input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTouched(true);
              }}
              maxLength={200}
            />
          </Field>

          <Field label="説明">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={5000}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="場所">
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={255}
              />
            </Field>
            <Field label="メモ">
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={255}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="予定日" error={fieldError('予定日')}>
              <Input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  setTouched(true);
                }}
              />
            </Field>
            <Field label="回答期限" error={fieldError('回答期限')}>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  setTouched(true);
                }}
              />
            </Field>
          </div>

          <Field label="通知タイミング（期限前）">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {timingPresets.map((preset) => {
                  const active = notifTiming.includes(preset.value);
                  return (
                    <Button
                      key={preset.value}
                      type="button"
                      variant={active ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => {
                        if (active) {
                          setNotifTiming(notifTiming.filter((v) => v !== preset.value));
                        } else {
                          setNotifTiming([...notifTiming, preset.value]);
                        }
                      }}
                    >
                      {preset.label}
                    </Button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="w-24">
                  <Input
                    type="number"
                    value={customTiming}
                    onChange={(e) => setCustomTiming(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTiming();
                      }
                    }}
                    min="1"
                    placeholder="カスタム"
                  />
                </div>
                <div className="w-24">
                  <Select value={timingUnit} onChange={(e) => setTimingUnit(e.target.value)}>
                    <option value="1">分</option>
                    <option value="60">時間</option>
                    <option value="1440">日</option>
                    <option value="10080">週間</option>
                  </Select>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={handleAddCustomTiming}>
                  追加
                </Button>
              </div>

              {notifTiming.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
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
                      <Chip
                        key={v}
                        onClick={() => setNotifTiming(notifTiming.filter((x) => x !== v))}
                      >
                        <span>{label}</span>
                        <span aria-hidden="true">&times;</span>
                      </Chip>
                    );
                  })}
                </div>
              )}
            </div>
          </Field>

          <div className="border-t-[0.5px] border-ds-border pt-3">
            <Switch
              checked={linkOnly}
              onChange={setLinkOnly}
              label="リンクでのみ公開する"
              description="オンにすると募集中一覧に表示されず、リンクを知っている人のみ参加できます"
            />
          </div>

          {isEdit && (
            <Field label="ステータス">
              <Tabs items={statusTabs} value={status} onChange={setStatus} variant="segmented" />
            </Field>
          )}

          {error && <Info tone="danger">{error}</Info>}

          <div className="flex gap-2 pt-3">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || limitReached || (touched && !validation.valid)}
            >
              {loading ? '保存中...' : '保存'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              キャンセル
            </Button>
          </div>
        </form>
      </Panel>
    </PageContainer>
  );
}
