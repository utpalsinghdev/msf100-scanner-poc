import { Button } from '@/components/ui/button';
import { FingerprintImage } from '@/components/ui/FingerprintImage';
import { cn } from '@/lib/utils';

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
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border p-4 transition-colors',
        value
          ? 'border-indigo-200 bg-indigo-50/40'
          : 'border-slate-200 bg-slate-50/80 hover:border-slate-300',
      )}
    >
      <FingerprintImage src={value} alt={label} showEmptyIcon />
      <Button
        type="button"
        variant={value ? 'secondary' : 'outline'}
        size="sm"
        className="w-full"
        onClick={onCapture}
      >
        {value ? `Recapture ${label}` : `Capture ${label}`}
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
