const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Truncates a Date to midnight (local time) so day-diffs are whole numbers. */
function atMidnight(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = atMidnight(new Date(fromIso));
  const to = atMidnight(new Date(toIso));
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function daysFromToday(toIso: string): number {
  return daysBetween(new Date().toISOString(), toIso);
}

/** Returns a new ISO date string offset from `iso` by a (possibly fractional, rounded) number of days. */
export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString();
}

export function formatDateShort(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLong(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Groups an ISO timestamp into a human-readable section label for lists. */
export function relativeDayLabel(iso: string): string {
  const date = atMidnight(new Date(iso));
  const today = atMidnight(new Date());
  const diff = Math.round((today.getTime() - date.getTime()) / MS_PER_DAY);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff > 1 && diff < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
  return formatDateShort(iso);
}
