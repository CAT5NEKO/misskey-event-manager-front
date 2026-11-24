import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { useMediaQuery } from '@shared/hooks/useMediaQuery';
import { useRemainingHeight } from '@shared/hooks/useRemainingHeight';
import type { User } from '@shared/types';
import {
  Badge,
  Button,
  Input,
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

export function UserManagePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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

  const fetchUsers = async (targetPage: number) => {
    setLoading(true);
    try {
      const res = await api<{ users: User[]; total_count: number }>(
        `/admin/users?page=${targetPage}&limit=${limit}&search=${encodeURIComponent(search)}`,
      );
      setUsers(res.users || []);
      setTotal(res.total_count || 0);
    } catch {
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page, search, limit]);

  const handleDelete = async (u: User) => {
    const ok = await confirm({
      title: 'ユーザー削除',
      message: `${u.name} を削除しますか？この操作は取り消せません。`,
      danger: true,
      confirmLabel: '削除',
    });
    if (!ok) return;

    await api(`/admin/users/${u.id}`, { method: 'DELETE' });
    fetchUsers(page);
  };

  const handleDeactivate = async (u: User) => {
    const ok = await confirm({
      title: 'ユーザー無効化',
      message: `${u.name} を無効化しますか？`,
      danger: true,
      confirmLabel: '無効化',
    });
    if (!ok) return;

    await api(`/admin/users/${u.id}/deactivate`, { method: 'PUT' });
    fetchUsers(page);
  };

  const handleActivate = async (u: User) => {
    const ok = await confirm({
      title: 'ユーザー有効化',
      message: `${u.name} を有効化しますか？有効化後、ユーザーは再度ログインが必要です。`,
      confirmLabel: '有効化',
    });
    if (!ok) return;

    await api(`/admin/users/${u.id}/activate`, { method: 'PUT' });
    fetchUsers(page);
  };

  return (
    <div className="pb-24 md:pb-0">
      <PageHeader title="ユーザー管理" />

      <div className="mb-4">
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ユーザー検索..."
          className="max-w-md"
        />
      </div>

      {!loading && total > 0 && <p className="mb-3 text-xs text-ds-text-muted">全 {total} 件</p>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <Panel className="p-8 text-center text-sm text-ds-text-muted">ユーザーがいません</Panel>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <Panel key={u.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-medium text-ds-text">
                    <span>{u.name}</span>
                    {u.is_admin && <Badge tone="warning">管理</Badge>}
                  </div>
                  <Badge tone={u.is_active ? 'success' : 'danger'}>
                    {u.is_active ? '有効' : '無効'}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ds-text-muted break-all">
                  @{u.misskey_username}@{u.misskey_host}
                </p>
                {(!u.is_admin || !u.is_active) && (
                  <div className="mt-3 flex gap-2 border-t-[0.5px] border-ds-border pt-3">
                    {u.is_active ? (
                      !u.is_admin && (
                        <Button variant="secondary" size="sm" onClick={() => handleDeactivate(u)}>
                          無効化
                        </Button>
                      )
                    ) : (
                      <Button variant="secondary" size="sm" onClick={() => handleActivate(u)}>
                        有効化
                      </Button>
                    )}
                    {!u.is_admin && (
                      <Button variant="danger" size="sm" onClick={() => handleDelete(u)}>
                        削除
                      </Button>
                    )}
                  </div>
                )}
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
                    <TableHeaderCell>名前</TableHeaderCell>
                    <TableHeaderCell>Misskey</TableHeaderCell>
                    <TableHeaderCell>ステータス</TableHeaderCell>
                    <TableHeaderCell>操作</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium text-ds-text">
                          <span>{u.name}</span>
                          {u.is_admin && <Badge tone="warning">管理</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-ds-text-muted break-all">
                        @{u.misskey_username}@{u.misskey_host}
                      </TableCell>
                      <TableCell>
                        <Badge tone={u.is_active ? 'success' : 'danger'}>
                          {u.is_active ? '有効' : '無効'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(!u.is_admin || !u.is_active) && (
                          <div className="flex gap-2">
                            {u.is_active ? (
                              !u.is_admin && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleDeactivate(u)}
                                >
                                  無効化
                                </Button>
                              )
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleActivate(u)}
                              >
                                有効化
                              </Button>
                            )}
                            {!u.is_admin && (
                              <Button variant="danger" size="sm" onClick={() => handleDelete(u)}>
                                削除
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
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
