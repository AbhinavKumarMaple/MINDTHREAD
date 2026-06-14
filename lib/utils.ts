import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// Day group header, matching the design: "Thursday · June 5"
export function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString(undefined, { weekday: 'long' });
  const monthDay = d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });
  return `${weekday} · ${monthDay}`;
}

// Card meta date, matching the design: "June 5 · 11:42 PM"
export function formatMetaDate(iso: string): string {
  const d = new Date(iso);
  const monthDay = d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });
  return `${monthDay} · ${formatTime(iso)}`;
}

export function dayKey(iso: string): string {
  // Local date components (NOT toISOString, which is UTC and shifts the day
  // for times near midnight in timezones offset from UTC).
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// A task's effective date: its due date when set, otherwise when it was created.
// Used for date grouping/filtering so moving a due date moves the task's bucket.
export function taskDate(t: {
  dueDate: string | null;
  createdAt: string;
}): string {
  return t.dueDate ?? t.createdAt;
}

// Group items by their day, preserving order (newest first if input is sorted desc).
export function groupByDay<T>(
  items: T[],
  getDate: (item: T) => string,
): { day: string; label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = dayKey(getDate(item));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return Array.from(groups.entries()).map(([day, groupItems]) => ({
    day,
    label: formatDayLabel(getDate(groupItems[0])),
    items: groupItems,
  }));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function clampMood(n: number): number {
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}
