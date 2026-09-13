import type { AppState } from './types';
import { STORAGE_KEY } from './types';

export const DEFAULT_STATE: AppState = {
  onboarded: false,
  goal: null,
  transactions: [],
  currency: 'EUR',
  themeMode: 'system',
  notifEnabled: true,
  celebrationSeen: false,
  profileName: 'You',
};

export function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently, in-memory state still works.
  }
}
