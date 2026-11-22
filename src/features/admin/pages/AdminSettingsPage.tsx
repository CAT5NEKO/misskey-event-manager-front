import { useEffect, useState } from 'react';
import { api } from '@shared/api/client';
import {
  Button,
  Field,
  Input,
  PageHeader,
  Panel,
  Spinner,
  Switch,
  useAlert,
} from '@design-system/index';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const alert = useAlert();

  useEffect(() => {
    let active = true;

    api<Record<string, string>>('/admin/settings')
      .then((data) => {
        if (!active) return;
        const parsed: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(data)) {
          try {
            parsed[key] = typeof val === 'string' ? JSON.parse(val) : val;
          } catch {
            parsed[key] = val;
          }
        }
        setSettings(parsed);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(settings)) {
        if (key === 'notification.default_timing') {
          payload[key] =
            typeof val === 'string'
              ? val
                  .split(',')
                  .map((s) => parseInt(s.trim(), 10))
                  .filter((n) => !isNaN(n))
              : val;
        } else if (key === 'events.max_per_user') {
          payload[key] = typeof val === 'string' ? parseInt(val, 10) : Number(val);
        } else {
          payload[key] = val;
        }
      }
      await api('/admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
      await alert({
        title: '成功',
        message: '設定を保存しました',
        tone: 'success',
      });
    } catch {
      await alert({
        title: 'エラー',
        message: '設定の保存に失敗しました',
        tone: 'danger',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const defaultTimingValue = Array.isArray(settings['notification.default_timing'])
    ? (settings['notification.default_timing'] as number[]).join(',')
    : String(settings['notification.default_timing'] || '');

  return (
    <div>
      <PageHeader title="システム設定" />

      <Panel className="p-5 sm:p-6">
        <div className="space-y-4">
          <Field label="アプリ名">
            <Input
              type="text"
              value={String(settings['app.name'] || '')}
              onChange={(e) => updateSetting('app.name', e.target.value)}
            />
          </Field>

          <Field
            label="デフォルト通知タイミング"
            hint="期限前の分数をカンマ区切りで入力 (例: 60,1440)"
          >
            <Input
              type="text"
              value={defaultTimingValue}
              onChange={(e) => updateSetting('notification.default_timing', e.target.value)}
            />
          </Field>

          <Field label="最大イベント数" hint="0 = 無制限">
            <Input
              type="number"
              value={Number(settings['events.max_per_user'] || 0)}
              onChange={(e) => updateSetting('events.max_per_user', e.target.value)}
            />
          </Field>

          <div className="border-t-[0.5px] border-ds-border pt-2">
            <Switch
              checked={Boolean(settings['users.allow_self_delete'])}
              onChange={(checked) => updateSetting('users.allow_self_delete', checked)}
              label="ユーザー自身のアカウント削除を許可"
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" disabled={saving} onClick={handleSave}>
              {saving ? '保存中...' : '設定を保存'}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
