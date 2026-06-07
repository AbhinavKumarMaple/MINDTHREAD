export const qk = {
  me: ['me'] as const,
  settings: ['settings'] as const,
  entries: (params?: Record<string, string>) =>
    ['entries', params ?? {}] as const,
  entry: (id: string) => ['entry', id] as const,
  tasks: (params?: Record<string, string>) => ['tasks', params ?? {}] as const,
  chat: (sessionId?: string) => ['chat', sessionId ?? 'latest'] as const,
  analytics: ['analytics'] as const,
  habits: ['habits'] as const,
  emotion: (name: string) => ['emotion', name] as const,
  theme: (name: string) => ['theme', name] as const,
  concerns: ['concerns'] as const,
  insights: ['insights'] as const,
};
