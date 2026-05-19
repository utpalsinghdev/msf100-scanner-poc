import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Fingerprint } from 'lucide-react';

type FingerprintSlotProps = {
  label: string;
  value?: string;
  onCapture: () => void | Promise<void>;
};

export default function FingerprintSlot({
  label,
  value,
  onCapture,
}: FingerprintSlotProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border p-4 transition-colors',
        value
          ? 'border-indigo-200 bg-indigo-50/40'
          : 'border-slate-200 bg-slate-50/80 hover:border-slate-300',
      )}
    >
      <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80">
        {value ? (
          <img
            src={`data:image/png;base64,${value}`}
            alt={label}
            className="h-full max-h-28 w-auto object-contain"
            style={{
              filter: 'invert(55%) sepia(20%) saturate(500%) hue-rotate(200deg)',
            }}
            draggable={false}
          />
        ) : (
          <Fingerprint className="h-14 w-14 text-slate-300" strokeWidth={1.5} />
        )}
      </div>
      <Button
        type="button"
        variant={value ? 'secondary' : 'outline'}
        size="sm"
        className="w-full"
        onClick={onCapture}
      >
        {value ? `Recapture ${label}` : `Capture ${label}`}
      </Button>
    </div>
  );
}
