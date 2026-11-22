import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  IconArrowLeft,
  IconCheck,
  IconEdit,
  IconShare,
  IconTrash,
  IconBan,
} from '@tabler/icons-react';
import { api } from '@shared/api/client';
import { useAuth } from '@features/auth/hooks/useAuth';
import type { Event } from '@shared/types';
import {
  Avatar,
  Badge,
  type BadgeTone,
  Button,
  ButtonLink,
  Input,
  PageContainer,
  PageHeader,
  Panel,
  Spinner,
  useConfirm,
} from '@design-system/index';

function getEventStatus(event: Event): { label: string; tone: BadgeTone } {
  if (event.status === 'cancelled') return { label: '中止', tone: 'danger' };
  if (event.status === 'completed') return { label: '終了', tone: 'neutral' };
  if (event.deadline && new Date(event.deadline) < new Date()) {
    return { label: '期限切れ', tone: 'warning' };
  }
  return { label: '募集中', tone: 'neutral' };
}

function getParticipantStatus(status: string): { label: string; tone: BadgeTone } {
  if (status === 'attending') return { label: '参加', tone: 'success' };
  if (status === 'pending') return { label: '検討中', tone: 'warning' };
  if (status === 'declined') return { label: '不参加', tone: 'danger' };
  return { label: status, tone: 'neutral' };
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timingLabel(min: number) {
  if (min >= 1440) return `${min / 1440}日前`;
  if (min >= 60) return `${min / 60}時間前`;
  return `${min}分前`;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const mountedRef = useRef(true);

  const fetchEvent = async () => {
    try {
      const e = await api<Event>(`/events/${id}`);
      if (!mountedRef.current) return;
      setEvent(e);
      document.title = `${e.title} - miSchedule`;
      const my = e.participants?.find((p) => p.user_id === user?.id);
      setComment(my?.comment || '');
      setShowComment(false);
    } catch {
      if (mountedRef.current) navigate('/');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchEvent();
    return () => {
      mountedRef.current = false;
      document.title = 'miSchedule';
    };
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => {
        if (mountedRef.current) setCopied(false);
      }, 1500);
    } catch {}
  };

  const handleJoin = async (status: string) => {
    if (!id) return;
    setJoining(true);
    try {
      await api(`/events/${id}/join`, { method: 'POST', body: JSON.stringify({ status }) });
      await fetchEvent();
    } finally {
      if (mountedRef.current) setJoining(false);
    }
  };

  const handleSaveComment = async () => {
    if (!id || !event?.current_user_status) return;
    setSavingComment(true);
    try {
      await api(`/events/${id}/join`, {
        method: 'POST',
        body: JSON.stringify({ status: event.current_user_status, comment: comment || '' }),
      });
      setShowComment(false);
      await fetchEvent();
    } finally {
      if (mountedRef.current) setSavingComment(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!id || !event?.current_user_status) return;
    setSavingComment(true);
    try {
      await api(`/events/${id}/join`, {
        method: 'POST',
        body: JSON.stringify({ status: event.current_user_status, comment: '' }),
      });
      await fetchEvent();
    } finally {
      if (mountedRef.current) setSavingComment(false);
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    setJoining(true);
    try {
      await api(`/events/${id}/join`, { method: 'DELETE' });
      await fetchEvent();
    } finally {
      if (mountedRef.current) setJoining(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'イベント削除',
      message: 'このイベントを削除しますか？この操作は取り消せません。',
      danger: true,
      confirmLabel: '削除',
    });
    if (!ok) return;
    await api(`/events/${id}`, { method: 'DELETE' });
    navigate('/');
  };

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'イベント中止',
      message: 'このイベントを中止にしますか？',
      danger: true,
      confirmLabel: '中止にする',
    });
    if (!ok) return;
    await api(`/events/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
    fetchEvent();
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (!event) return null;

  const isCreator = user?.id === event.creator_id;
  const isAdmin = Boolean(user?.is_admin);
  const isExpired =
    event.status !== 'active' || Boolean(event.deadline && new Date(event.deadline) < new Date());
  const statusInfo = getEventStatus(event);

  const attendingCount = event.participants?.filter((p) => p.status === 'attending').length || 0;
  const pendingCount = event.participants?.filter((p) => p.status === 'pending').length || 0;
  const declinedCount = event.participants?.filter((p) => p.status === 'declined').length || 0;

  return (
    <PageContainer>
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-ds-text-muted hover:text-ds-text underline"
        >
          <IconArrowLeft size={16} />
          <span>予定一覧に戻る</span>
        </Link>
      </div>

      <Panel className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-ds-text">{event.title}</h1>
            <div className="mt-2">
              <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleShare}>
              {copied ? <IconCheck size={16} /> : <IconShare size={16} />}
              <span>{copied ? 'コピー完了' : '共有'}</span>
            </Button>

            {(isCreator || isAdmin) && !isExpired && (
              <ButtonLink to={`/events/${event.id}/edit`} variant="secondary" size="sm">
                <IconEdit size={16} />
                <span>編集</span>
              </ButtonLink>
            )}

            {(isCreator || isAdmin) && event.status === 'active' && (
              <Button variant="secondary" size="sm" onClick={handleCancel}>
                <IconBan size={16} />
                <span>中止</span>
              </Button>
            )}

            {(isCreator || isAdmin) && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <IconTrash size={16} />
                <span>削除</span>
              </Button>
            )}
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t-[0.5px] border-ds-border pt-4">
          {event.location && (
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">場所</dt>
              <dd className="mt-0.5 text-sm text-ds-text">{event.location}</dd>
            </div>
          )}
          {event.event_date && (
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">予定日</dt>
              <dd className="mt-0.5 text-sm text-ds-text">{formatDate(event.event_date)}</dd>
            </div>
          )}
          {event.deadline && (
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">回答期限</dt>
              <dd className="mt-0.5 text-sm text-ds-text">{formatDate(event.deadline)}</dd>
            </div>
          )}
          {event.description && (
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">説明</dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-sm text-ds-text">
                {event.description}
              </dd>
            </div>
          )}
          {event.notes && (
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">メモ</dt>
              <dd className="mt-0.5 whitespace-pre-wrap text-sm text-ds-text">{event.notes}</dd>
            </div>
          )}
          {event.notification_timing && event.notification_timing.length > 0 && (
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">通知タイミング</dt>
              <dd className="mt-0.5 text-sm text-ds-text">
                {event.notification_timing.map(timingLabel).join(', ')}
              </dd>
            </div>
          )}
          {event.creator && (
            <div>
              <dt className="text-xs font-medium text-ds-text-muted">作成者</dt>
              <dd className="mt-0.5 text-sm text-ds-text">{event.creator.name}</dd>
            </div>
          )}
        </dl>

        {event.status === 'active' && !isExpired && (
          <div className="mt-6 border-t-[0.5px] border-ds-border pt-5">
            {!isCreator && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="grid w-full grid-cols-3 gap-1 rounded-ds-md border-[0.5px] border-ds-border bg-ds-surface-hover p-1">
                  {(
                    [
                      { value: 'attending', label: '参加' },
                      { value: 'pending', label: '検討中' },
                      { value: 'declined', label: '不参加' },
                    ] as const
                  ).map((opt) => {
                    const active = event.current_user_status === opt.value;
                    return (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={active ? 'primary' : 'ghost'}
                        size="sm"
                        disabled={joining}
                        onClick={() => handleJoin(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    );
                  })}
                </div>
                {event.current_user_status && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={joining}
                    onClick={handleLeave}
                  >
                    回答を取り消す
                  </Button>
                )}
              </div>
            )}

            {!isCreator && event.current_user_status && (
              <div className="mt-4">
                {showComment ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="一言コメント"
                        maxLength={50}
                      />
                      <div className="mt-1 text-right text-xs text-ds-text-muted">
                        {comment.length}/50
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={savingComment}
                        onClick={handleSaveComment}
                      >
                        {savingComment ? '保存中' : '保存'}
                      </Button>
                      {comment && (
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={savingComment}
                          onClick={handleDeleteComment}
                        >
                          削除
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowComment(true)}
                    className="text-xs text-ds-text-muted hover:text-ds-text underline"
                  >
                    {comment ? 'コメントを編集' : '+ 一言コメントを追加'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Panel>

      <Panel className="mt-6 p-5 sm:p-6">
        <h2 className="text-base font-bold text-ds-text">参加者</h2>
        {event.participants && event.participants.length > 0 ? (
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-4 text-xs font-medium text-ds-text-muted">
              <span>参加: {attendingCount}</span>
              <span>検討中: {pendingCount}</span>
              <span>不参加: {declinedCount}</span>
            </div>
            <div className="divide-y-[0.5px] divide-ds-border">
              {event.participants.map((p) => {
                const pStatus = getParticipantStatus(p.status);
                return (
                  <div key={p.id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={p.user?.avatar_url} name={p.user?.name} size="sm" />
                        <span className="text-sm font-medium text-ds-text">
                          {p.user?.name || 'Unknown'}
                        </span>
                      </div>
                      <Badge tone={pStatus.tone}>{pStatus.label}</Badge>
                    </div>
                    {p.comment && (
                      <p className="mt-1 pl-8 text-xs text-ds-text-muted">{p.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-ds-text-muted">まだ参加者がいません</p>
        )}
      </Panel>
    </PageContainer>
  );
}
