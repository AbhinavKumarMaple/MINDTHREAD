import { Signal, Wifi, BatteryFull } from 'lucide-react';

export function StatusBar() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-ink-primary">
      <span className="text-[15px] font-semibold tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal className="h-[15px] w-[15px]" strokeWidth={2.5} />
        <Wifi className="h-[15px] w-[15px]" strokeWidth={2.5} />
        <BatteryFull className="h-5 w-5" strokeWidth={2} />
      </div>
    </div>
  );
}
