import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'indigo' | 'emerald' | 'amber' | 'violet';
  onClick?: () => void;
  className?: string;
};

const accents = {
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/30',
  emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/30',
  violet: 'from-violet-500 to-violet-600 shadow-violet-500/30',
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'indigo',
  onClick,
  className,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-soft transition-all duration-300 ease-out sm:p-6',
        onClick && 'cursor-pointer hover:-translate-y-1 hover:border-indigo-200/60 hover:shadow-lift active:translate-y-0 active:scale-[0.99]',
        !onClick && 'cursor-default',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-105',
            accents[accent],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.1]" />
    </button>
  );
}
