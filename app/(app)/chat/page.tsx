'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { ChatSkeleton } from '@/components/ui/skeletons';
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

const SUGGESTIONS = ['Tell me more', 'What should I do?', 'Show patterns'];

export default function ChatPage() {
  const router = useRouter();
  const [sessionOverride, setSessionOverride] = useState<string | null>(null);
  const [isNew, setIsNew] = useState(false);
  const { data, isLoading } = useChat(sessionOverride ?? undefined);
  const send = useSendChat();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sessionId = isNew ? undefined : (sessionOverride ?? data?.current?.session.id);
  const messages = isNew ? [] : (data?.current?.messages ?? []);
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
      const res = await send.mutateAsync({
        message: msg,
        sessionId,
        history: messages,
      });
      setIsNew(false);
      setSessionOverride(res.sessionId);
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === 'API_KEY_REQUIRED'
          ? 'Add your Gemini API key in Settings to chat with your AI.'
          : 'Message failed. Please try again.',
      );
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-bg-base pt-3">
      <div className="flex items-center px-5 pb-4 pt-2">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="text-ink-primary"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 text-center">
          <p className="font-display text-[19px] font-bold text-ink-primary">
            MindThread AI
          </p>
          <p className="text-[12px] text-primary-soft">
            your journaling coach
          </p>
        </div>
        <button
          onClick={() => {
            setIsNew(true);
            setSessionOverride(null);
          }}
          aria-label="New chat"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white active:scale-95"
        >
          <Sparkles className="h-4 w-4" fill="currentColor" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-3 no-scrollbar"
      >
        {isLoading && !isNew ? (
          <ChatSkeleton />
        ) : (
          <>
            {empty && (
              <div className="relative max-w-[85%] rounded-2xl rounded-tl-md bg-surface p-4 pt-5 text-[15px] leading-relaxed text-ink-primary">
                <span className="absolute left-4 top-2.5 h-1.5 w-1.5 rounded-full bg-primary-soft" />
                Hi! I've been reading your journal. Ask me about your patterns,
                moods, or recurring themes — I'll ground every answer in your
                entries.
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] text-[15px] leading-relaxed',
                  m.role === 'user'
                    ? 'ml-auto rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-white'
                    : 'relative rounded-2xl rounded-tl-md bg-surface p-4 pt-5 text-ink-primary',
                )}
              >
                {m.role === 'assistant' && (
                  <span className="absolute left-4 top-2.5 h-1.5 w-1.5 rounded-full bg-primary-soft" />
                )}
                {m.content}
              </div>
            ))}
            {send.isPending && (
              <>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-primary/70 px-4 py-3 text-[15px] text-white">
                  {send.variables?.message}
                </div>
                <div className="w-fit rounded-2xl rounded-tl-md bg-surface px-4 py-4">
                  <TypingDots />
                </div>
              </>
            )}
          </>
        )}
      </div>

      {error && <p className="px-4 pb-1 text-sm text-danger">{error}</p>}

      {!send.isPending && (
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-2.5 no-scrollbar">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-ink-secondary"
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
        className="px-4 pb-4 pt-1"
      >
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI coach…"
            className="w-full rounded-full border border-line bg-surface py-3.5 pl-5 pr-14 text-[15px] text-ink-primary outline-none placeholder:text-ink-muted focus:border-primary"
          />
          <button
            type="submit"
            disabled={send.isPending || !input.trim()}
            aria-label="Send"
            className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition active:scale-95 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
