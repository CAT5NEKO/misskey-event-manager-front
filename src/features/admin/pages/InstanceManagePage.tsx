import { useEffect, useState, type FormEvent } from 'react';
import { api } from '@shared/api/client';
import type { InstanceAllow } from '@shared/types';
import { Badge, Button, Input, PageHeader, Panel, Spinner, useConfirm } from '@design-system/index';

export function InstanceManagePage() {
  const [instances, setInstances] = useState<InstanceAllow[]>([]);
  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState('');
  const [description, setDescription] = useState('');
  const confirm = useConfirm();

  const fetchInstances = async () => {
    try {
      const data = await api<InstanceAllow[]>('/admin/instances');
      setInstances(data);
    } catch {
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!host.trim()) return;

    await api('/admin/instances', {
      method: 'POST',
      body: JSON.stringify({ host: host.trim(), description: description.trim() || undefined }),
    });
    setHost('');
    setDescription('');
    fetchInstances();
  };

  const handleDelete = async (inst: InstanceAllow) => {
    const ok = await confirm({
      title: 'インスタンス削除',
      message: `${inst.host} を削除しますか？`,
      danger: true,
      confirmLabel: '削除',
    });
    if (!ok) return;

    await api(`/admin/instances/${inst.id}`, { method: 'DELETE' });
    fetchInstances();
  };

  return (
    <div>
      <PageHeader title="インスタンス管理" />

      <Panel className="mb-6 p-4">
        <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="インスタンスホスト名 (例: misskey.io)"
            required
            className="flex-1"
          />
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明（任意）"
            className="flex-1"
          />
          <Button type="submit" variant="primary" className="shrink-0">
            追加
          </Button>
        </form>
      </Panel>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : instances.length === 0 ? (
        <Panel className="p-8 text-center text-sm text-ds-text-muted">
          許可インスタンスの登録がありません
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          <div className="divide-y-[0.5px] divide-ds-border">
            {instances.map((inst) => (
              <div
                key={inst.id}
                className="flex items-center justify-between gap-3 p-4 transition-colors hover:bg-ds-surface-hover"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ds-text break-all">{inst.host}</p>
                    {inst.protected && <Badge tone="warning">保護</Badge>}
                  </div>
                  {inst.description && (
                    <p className="mt-0.5 text-xs text-ds-text-muted break-all">
                      {inst.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!inst.protected && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(inst)}>
                      削除
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
