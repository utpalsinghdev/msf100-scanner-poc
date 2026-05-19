import { cn } from '@/lib/utils';
import { fingerprintImageSrc } from '@/lib/fingerprintImage';
import { Fingerprint } from 'lucide-react';

/** MFS100 bitmap display size (316×354 intrinsic → 138×155 rendered). */
export const FINGERPRINT_DISPLAY = {
  width: 138,
  height: 155,
  aspectRatio: '138 / 155',
} as const;

type FingerprintImageProps = {
  src?: string | null;
  alt?: string;
  emptyLabel?: string;
  showEmptyIcon?: boolean;
  className?: string;
};

export function FingerprintImage({
  src,
  alt = 'fingerprint',
  emptyLabel = 'N/A',
  showEmptyIcon = false,
  className,
}: FingerprintImageProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200',
        className,
      )}
      style={{
        width: FINGERPRINT_DISPLAY.width,
        height: FINGERPRINT_DISPLAY.height,
        aspectRatio: FINGERPRINT_DISPLAY.aspectRatio,
      }}
    >
      {src ? (
        <img
          src={fingerprintImageSrc(src)}
          alt={alt}
          width={FINGERPRINT_DISPLAY.width}
          height={FINGERPRINT_DISPLAY.height}
          className="h-full w-full object-contain"
          draggable={false}
        />
      ) : showEmptyIcon ? (
        <Fingerprint className="h-10 w-10 text-slate-300" strokeWidth={1.5} />
      ) : (
        <span className="text-xs text-slate-400">{emptyLabel}</span>
      )}
    </div>
  );
}
