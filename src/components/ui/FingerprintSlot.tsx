import { Button } from '@/components/ui/button';
import { FingerprintImage } from '@/components/ui/FingerprintImage';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

type FingerprintSlotProps = {
  label: string;
  value?: string;
  onCapture: () => void | Promise<void>;
  onBrowse?: () => void;
};

export default function FingerprintSlot({
  label,
  value,
  onCapture,
  onBrowse,
}: FingerprintSlotProps) {
  const captured = Boolean(value);

  return (
    <div
      className={cn(
        'group flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all duration-300',
        captured
          ? 'border-indigo-200/80 bg-gradient-to-b from-indigo-50/80 to-white shadow-soft ring-1 ring-indigo-100/80'
          : 'border-slate-200/80 bg-white shadow-sm hover:border-slate-300 hover:shadow-soft',
      )}
    >
      <div className="relative">
        <FingerprintImage src={value} alt={label} showEmptyIcon />
        {captured && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white">
            <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
          </span>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <Button
        type="button"
        variant={captured ? 'secondary' : 'outline'}
        size="sm"
        className="w-full"
        onClick={onCapture}
      >
        {captured ? `Recapture` : `Capture`}
      </Button>
      {onBrowse && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onBrowse}
        >
          Browse
        </Button>
      )}
    </div>
  );
}
