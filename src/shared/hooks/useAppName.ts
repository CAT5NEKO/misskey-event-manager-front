import { useSyncExternalStore } from 'react';
import { api } from '@shared/api/client';

let appName = 'miSchedule';
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function load() {
  return api<{ name: string }>('/app/name')
    .then((res) => {
      if (res.name) {
        appName = res.name;
        document.title = res.name;
        notify();
      }
    })
    .catch(() => {});
}

const loadPromise = load();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return appName;
}

export function useAppName(): string {
  void loadPromise;
  return useSyncExternalStore(subscribe, getSnapshot, () => 'miSchedule');
}