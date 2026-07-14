import {
  fingerprintImageSrc,
  isRemoteFingerprintSrc,
  resolveFingerprintDisplaySrc,
} from '@/lib/fingerprintImage';

export type ImageAdjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  mirrored: boolean;
};

/** Baked into finger*Enhanced on background save (contrast + mirror). */
export const ENHANCED_SAVE_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 150,
  saturation: 100,
  mirrored: true,
};

/** Neutral preview — enhanced images already have ENHANCED_SAVE_ADJUSTMENTS baked in. */
export const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  mirrored: false,
};

/** Raw fingerprint editor starting point (matches what background enhance will apply). */
export const RAW_IMAGE_EDITOR_DEFAULTS: ImageAdjustments = {
  ...ENHANCED_SAVE_ADJUSTMENTS,
};

export function adjustmentsFilter({
  brightness,
  contrast,
  saturation,
}: ImageAdjustments): string {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
}

export async function renderAdjustedImageBase64(
  src: string,
  adjustments: ImageAdjustments,
): Promise<string> {
  const resolved = isRemoteFingerprintSrc(src)
    ? await resolveFingerprintDisplaySrc(src)
    : fingerprintImageSrc(src);
  if (!resolved) {
    throw new Error('Could not load image');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) {
          reject(new Error('Image has no dimensions'));
          return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.filter = adjustmentsFilter(adjustments);
        if (adjustments.mirrored) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl.replace(/^data:image\/png;base64,/, ''));
      } finally {
        if (resolved.startsWith('blob:')) URL.revokeObjectURL(resolved);
      }
    };
    img.onerror = () => {
      if (resolved.startsWith('blob:')) URL.revokeObjectURL(resolved);
      reject(new Error('Could not load image'));
    };
    img.src = resolved;
  });
}
