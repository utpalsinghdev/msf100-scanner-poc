import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'indigo' | 'emerald' | 'amber' | 'violet';
  onClick?: () => void;
};

const accents = {
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/25',
  emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25',
  amber: 'from-amber-500 to-amber-600 shadow-amber-500/25',
  violet: 'from-violet-500 to-violet-600 shadow-violet-500/25',
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'indigo',
  onClick,
}: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-all sm:p-6',
        onClick && 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer',
        !onClick && 'cursor-default',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
        </div>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
            accents[accent],
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 opacity-[0.07] transition-opacity group-hover:opacity-10" />
    </button>
  );
}
