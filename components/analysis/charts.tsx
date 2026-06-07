'use client';

import {
  LineChart,
  Line,
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { MoodPoint } from '@/lib/types';

export function StatCard({
  value,
  label,
  className,
}: {
  value: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex-1 rounded-2xl border border-line bg-surface px-3 py-3 text-center',
        className,
      )}
    >
      <p className="font-display text-2xl font-bold text-ink-primary">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-ink-muted">{label}</p>
    </div>
  );
}

export function MoodChart({ data }: { data: MoodPoint[] }) {
  const chartData = data.map((p, i) => ({
    i,
    mood: p.moodScore,
    date: new Date(p.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
  }));
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <Tooltip
            contentStyle={{
              background: '#141424',
              border: '1px solid #262447',
              borderRadius: 12,
              color: '#fff',
              fontSize: 12,
            }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#8B5CF6"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarMeter({
  label,
  value,
  max = 100,
  color = '#8B5CF6',
  suffix = '%',
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
  suffix?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <span className="capitalize text-ink-secondary">{label}</span>
        <span className="text-ink-muted">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-high">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function MiniBars({
  data,
  color = '#8B5CF6',
  height = 84,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{
            height: `${Math.max(4, (v / max) * 100)}%`,
            backgroundColor: v > 0 ? color : '#1F1F2E',
          }}
        />
      ))}
    </div>
  );
}
