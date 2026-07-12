import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import { LoadingSpinner } from '@shared/components/LoadingSpinner';
import type { InstanceAllow } from '@shared/types';
export function InstanceManagePage() {
  const [instances, setInstances] = useState<InstanceAllow[]>([]);
  const [loading, setLoading] = useState(true);
  const [host, setHost] = useState('');
  const [description, setDescription] = useState('');
  const fetch = async () => {
    try {
      const d = await api<InstanceAllow[]>('/admin/instances');
      setInstances(d);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    await api('/admin/instances', { method: 'POST', body: JSON.stringify({ host, description }) });
    setHost('');
    setDescription('');
    fetch();
  };
  const del = async (inst: InstanceAllow) => {
    if (!confirm(inst.host + ' を削除しますか？')) return;
    await api('/admin/instances/' + inst.id, { method: 'DELETE' });
    fetch();
  };
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">インスタンス管理</h1>
      <form
        onSubmit={add}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 flex gap-2"
      >
        <input
          type="text"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="インスタンスホスト名"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明（任意）"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
        >
          追加
        </button>
      </form>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {instances.map((inst) => (
            <div
              key={inst.id}
              className="flex items-center justify-between p-4 border-b last:border-0"
            >
              <div>
                <p className="font-medium">
                  {inst.host}
                  {inst.protected && (
                    <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1 rounded">
                      保護
                    </span>
                  )}
                </p>
                {inst.description && <p className="text-xs text-gray-400">{inst.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                {!inst.protected && (
                  <button
                    onClick={() => del(inst)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
