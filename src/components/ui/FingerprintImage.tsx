import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  fetchFingerprintBlobUrl,
  fingerprintImageSrc,
  isCachedFingerprintBlobUrl,
  isRemoteFingerprintSrc,
} from '@/lib/fingerprintImage';
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
  const [displaySrc, setDisplaySrc] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    setDisplaySrc('');

    async function load() {
      if (!src?.trim()) return;

      if (!isRemoteFingerprintSrc(src)) {
        if (!cancelled) setDisplaySrc(fingerprintImageSrc(src));
        return;
      }

      try {
        const url = await fetchFingerprintBlobUrl(src);
        if (cancelled) return;
        objectUrl = url;
        setDisplaySrc(url);
      } catch {
        if (!cancelled) setDisplaySrc('');
      }
    }

    load();

    return () => {
      cancelled = true;
      setDisplaySrc('');
      // Cached blob URLs are shared across the table — never revoke those.
      if (objectUrl && !isCachedFingerprintBlobUrl(objectUrl)) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200 transition-shadow duration-200',
        className,
      )}
      style={{
        width: FINGERPRINT_DISPLAY.width,
        height: FINGERPRINT_DISPLAY.height,
        aspectRatio: FINGERPRINT_DISPLAY.aspectRatio,
      }}
    >
      {displaySrc ? (
        <img
          key={displaySrc}
          src={displaySrc}
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
