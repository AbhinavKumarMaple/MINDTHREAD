'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { api } from '../api/client';
import { qk } from './keys';
import type {
  PublicUser,
  Entry,
  Task,
  ChatSession,
  ChatMessage,
  Insight,
  AnalyticsSummary,
  Tone,
  ConcernStatus,
  Priority,
  TaskStatus,
} from '../types';
import type {
  HabitStats,
  EmotionDetail,
  ThemeDetail,
} from '../analytics';
import type { TaskCounts } from '../repositories/interfaces';

function queryString(params?: Record<string, string | undefined>): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

// ---------- Auth / session ----------
export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: () => api.get<{ user: PublicUser | null }>('/api/auth/me'),
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api.post<{ user: PublicUser }>('/api/auth/login', input),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      email: string;
      password: string;
      displayName?: string;
    }) => api.post<{ user: PublicUser }>('/api/auth/signup', input),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/auth/logout'),
    onSuccess: () => qc.clear(),
  });
}

// ---------- Settings / onboarding ----------
export function useSettings() {
  return useQuery({
    queryKey: qk.settings,
    queryFn: () => api.get<{ user: PublicUser | null }>('/api/settings'),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      tone?: Tone;
      displayName?: string;
      geminiApiKey?: string;
    }) => api.patch<{ user: PublicUser }>('/api/settings', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.settings });
      qc.invalidateQueries({ queryKey: qk.me });
    },
  });
}

export function useOnboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { tone: Tone }) =>
      api.post<{ user: PublicUser }>('/api/onboarding', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.me });
      qc.invalidateQueries({ queryKey: qk.settings });
    },
  });
}

// ---------- Entries ----------
export function useEntries(params?: Record<string, string | undefined>) {
  const clean = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v),
  ) as Record<string, string>;
  return useQuery({
    queryKey: qk.entries(clean),
    queryFn: () =>
      api.get<{ entries: Entry[] }>(`/api/entries${queryString(params)}`),
  });
}

export function useEntry(id: string | undefined) {
  return useQuery({
    queryKey: qk.entry(id ?? ''),
    queryFn: () => api.get<{ entry: Entry }>(`/api/entries/${id}`),
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { rawDump: string }) =>
      api.post<{ entry: Entry }>('/api/entries', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
}

export function useUpdateEntry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      rawDump?: string;
      concernStatus?: ConcernStatus;
    }) => api.patch<{ entry: Entry }>(`/api/entries/${id}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.entry(id) });
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: qk.concerns });
    },
  });
}

export function useProcessEntry(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ entry: Entry }>(`/api/entries/${id}/process`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.entry(id) });
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: qk.analytics });
    },
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/entries/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// ---------- Tasks ----------
export function useTasks(params?: Record<string, string | undefined>) {
  const clean = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v),
  ) as Record<string, string>;
  return useQuery({
    queryKey: qk.tasks(clean),
    queryFn: () =>
      api.get<{ tasks: Task[]; counts: TaskCounts }>(
        `/api/tasks${queryString(params)}`,
      ),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; priority?: Priority }) =>
      api.post<{ task: Task }>('/api/tasks', input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: {
      id: string;
      title?: string;
      status?: TaskStatus;
      priority?: Priority;
    }) => api.patch<{ task: Task }>(`/api/tasks/${id}`, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// ---------- Chat ----------
export function useChat(sessionId?: string) {
  return useQuery({
    queryKey: qk.chat(sessionId),
    queryFn: () =>
      api.get<{
        sessions: ChatSession[];
        current: { session: ChatSession; messages: ChatMessage[] } | null;
      }>(`/api/chat${queryString({ sessionId })}`),
  });
}

export function useSendChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { message: string; sessionId?: string }) =>
      api.post<{ sessionId: string; message: ChatMessage }>(
        '/api/chat',
        input,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat'] }),
  });
}

// ---------- Analytics ----------
export function useAnalytics() {
  return useQuery({
    queryKey: qk.analytics,
    queryFn: () => api.get<{ summary: AnalyticsSummary }>('/api/analytics'),
  });
}

export function useHabits() {
  return useQuery({
    queryKey: qk.habits,
    queryFn: () => api.get<{ habits: HabitStats }>('/api/analytics/habits'),
  });
}

export function useEmotionDetail(name: string) {
  return useQuery({
    queryKey: qk.emotion(name),
    queryFn: () =>
      api.get<{ detail: EmotionDetail }>(
        `/api/analytics/emotions/${encodeURIComponent(name)}`,
      ),
    enabled: !!name,
  });
}

export function useThemeDetail(name: string) {
  return useQuery({
    queryKey: qk.theme(name),
    queryFn: () =>
      api.get<{ detail: ThemeDetail }>(
        `/api/analytics/themes/${encodeURIComponent(name)}`,
      ),
    enabled: !!name,
  });
}

export function useConcerns() {
  return useQuery({
    queryKey: qk.concerns,
    queryFn: () =>
      api.get<{
        entries: Entry[];
        counts: {
          total: number;
          unresolved: number;
          improving: number;
          resolved: number;
        };
        flaggedPct: number;
        totalEntries: number;
      }>('/api/analytics/concerns'),
  });
}

// ---------- Insights ----------
export function useInsights() {
  return useQuery({
    queryKey: qk.insights,
    queryFn: () => api.get<{ insights: Insight[] }>('/api/insights'),
  });
}

export function useRefreshInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<{ insights: Insight[] }>('/api/insights'),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.insights }),
  });
}
