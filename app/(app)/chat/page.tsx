'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { StatusBar } from '@/components/layout/StatusBar';
import { HomeIndicator } from '@/components/layout/HomeIndicator';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { LoadingState } from '@/components/ui/states';
import { useChat, useSendChat } from '@/lib/query/hooks';
import { ApiError } from '@/lib/api/client';
import { cn } from '@/lib/utils';

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  );
}

const suggestions = [
  'What patterns do you see?',
  'How has my mood changed?',
  'What should I focus on?',
];

export default function ChatPage() {
  const { data, isLoading } = useChat();
  const send = useSendChat();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sessionId = data?.current?.session.id;
  const messages = data?.current?.messages ?? [];
  const empty = messages.length === 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length, send.isPending]);

  async function submit(text: string) {
    const msg = text.trim();
    if (!msg || send.isPending) return;
    setInput('');
    setError(null);
    try {
      await send.mutateAsync({ message: msg, sessionId, history: messages });
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === 'API_KEY_REQUIRED'
          ? 'Add your Gemini API key in Settings to chat with your AI.'
          : 'Message failed. Please try again.',
      );
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-bg-base">
      <StatusBar />
      <ScreenHeader title="MindThread AI" />
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 no-scrollbar"
      >
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {empty && (
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface px-4 py-3 text-[15px] leading-relaxed text-ink-primary">
                Hi! I've been reading your journal. Ask me about your patterns,
                moods, or recurring themes — I'll ground every answer in your
                entries.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
                  m.role === 'user'
                    ? 'ml-auto rounded-tr-sm bg-primary text-white'
                    : 'rounded-tl-sm bg-surface text-ink-primary',
                )}
              >
                {m.content}
              </div>
            ))}
            {send.isPending && (
              <>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/70 px-4 py-3 text-[15px] text-white">
                  {send.variables?.message}
                </div>
                <div className="w-fit rounded-2xl rounded-tl-sm bg-surface px-4 py-4">
                  <TypingDots />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {error && <p className="px-4 pb-1 text-sm text-danger">{error}</p>}

      {empty && !send.isPending && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-ink-secondary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 px-4 pb-2 pt-1"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI coach…"
          className="flex-1 rounded-full border border-line bg-surface px-4 py-3 text-[15px] text-ink-primary outline-none placeholder:text-ink-muted focus:border-primary"
        />
        <button
          type="submit"
          disabled={send.isPending || !input.trim()}
          aria-label="Send"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white transition active:scale-95 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <HomeIndicator />
    </div>
  );
}
