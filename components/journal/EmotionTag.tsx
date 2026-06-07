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
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize"
      style={{ backgroundColor: `${color}22`, color }}
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
