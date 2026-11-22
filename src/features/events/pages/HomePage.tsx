import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@shared/api/client';
import type { Event, EventLimitInfo } from '@shared/types';
import {
  Badge,
  type BadgeTone,
  Button,
  ButtonLink,
  PageContainer,
  PageHeader,
  Pagination,
  Panel,
  Spinner,
  Tabs,
} from '@design-system/index';

const filterTabs = [
  { value: 'active', label: '募集中' },
  { value: 'past', label: '過去の予定' },
  { value: 'participating', label: '参加中' },
];

function getEventStatus(event: Event): { label: string; tone: BadgeTone } {
  if (event.status === 'cancelled') return { label: '中止', tone: 'danger' };
  if (event.status === 'completed') return { label: '終了', tone: 'neutral' };
  if (event.deadline && new Date(event.deadline) < new Date()) {
    return { label: '期限切れ', tone: 'warning' };
  }
  return { label: '募集中', tone: 'neutral' };
}

function getUserStatus(status: string): { label: string; tone: BadgeTone } {
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

export function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('active');
  const [limitInfo, setLimitInfo] = useState<EventLimitInfo | null>(null);

  const filter = selectedTab === 'past' ? 'past' : 'active';
  const participating = selectedTab === 'participating';

  useEffect(() => {
    let active = true;
    setLoading(true);

    api<{ events: Event[]; total_count: number; event_limit?: EventLimitInfo }>(
      `/events?page=${page}&limit=5&filter=${filter}&participating=${participating}`,
    )
      .then((res) => {
        if (!active) return;
        setEvents(res.events || []);
        setTotal(res.total_count || 0);
        setLimitInfo(res.event_limit || null);
      })
      .catch(() => {
        if (!active) return;
        setEvents([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, filter, participating]);

  const isLimitReached = Boolean(
    limitInfo && limitInfo.max > 0 && limitInfo.current >= limitInfo.max,
  );

  return (
    <PageContainer>
      <PageHeader
        title="イベント一覧"
        actions={
          isLimitReached ? (
            <div
              className="relative inline-block"
              title={`イベント数の上限（${limitInfo?.max}件）に達しています`}
            >
              <Button variant="primary" disabled>
                新規イベント
              </Button>
            </div>
          ) : (
            <ButtonLink to="/events/new">新規イベント</ButtonLink>
          )
        }
      />

      <div className="mb-4">
        <Tabs
          items={filterTabs}
          value={selectedTab}
          onChange={(val) => {
            setSelectedTab(val);
            setPage(1);
          }}
          variant="segmented"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : events.length === 0 ? (
        <Panel className="p-8 text-center text-sm text-ds-text-muted">イベントがありません</Panel>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const statusInfo = getEventStatus(event);
            return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group block transition-opacity hover:opacity-90"
              >
                <Panel className="p-4 transition-colors hover:border-ds-border-strong">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-ds-text group-hover:text-ds-text-strong">
                        {event.title}
                      </h2>
                      {event.location && (
                        <p className="mt-1 text-sm text-ds-text-muted">場所: {event.location}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ds-text-muted">
                        {event.deadline && <span>期限: {formatDate(event.deadline)}</span>}
                        {event.event_date && <span>予定日: {formatDate(event.event_date)}</span>}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {event.current_user_status && (
                        <Badge tone={getUserStatus(event.current_user_status).tone}>
                          {getUserStatus(event.current_user_status).label}
                        </Badge>
                      )}
                      <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                    </div>
                  </div>
                  {event.creator && (
                    <p className="mt-2 text-xs text-ds-text-muted">作成者: {event.creator.name}</p>
                  )}
                </Panel>
              </Link>
            );
          })}
        </div>
      )}

      {total > 5 && (
        <div className="mt-6">
          <Pagination
            total={total}
            page={page}
            pageSize={5}
            onPageChange={setPage}
            showPageNumbers
          />
        </div>
      )}
    </PageContainer>
  );
}
