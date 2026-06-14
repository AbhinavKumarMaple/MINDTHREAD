import Link from 'next/link';
import { emotionColor } from '@/lib/constants';

export function EmotionTag({
  name,
  asLink = false,
}: {
  name: string;
  asLink?: boolean;
}) {
  const color = emotionColor(name);
  const content = (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-medium capitalize"
      style={{ borderColor: color, color }}
    >
      {name}
    </span>
  );
  if (asLink) {
    return (
      <Link href={`/analysis/emotion/${encodeURIComponent(name)}`}>
        {content}
      </Link>
    );
  }
  return content;
}
