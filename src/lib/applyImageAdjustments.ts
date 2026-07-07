import { fingerprintImageSrc } from '@/lib/fingerprintImage';
import { enhancedImageSrc } from '@/lib/enhanceFingerprint';

export type ImageAdjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  mirrored: boolean;
};

export const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 150,
  saturation: 100,
  mirrored: false,
};

function isSvgBase64(base64: string): boolean {
  const clean = base64.replace(/^data:image\/[\w+]+;base64,/, '').trim();
  return clean.startsWith('PHN2Zy') || clean.startsWith('PD94bW');
}

function resolveImageSrc(base64: string): string {
  return isSvgBase64(base64) ? enhancedImageSrc(base64) : fingerprintImageSrc(base64);
}

export function adjustmentsFilter({
  brightness,
  contrast,
  saturation,
}: ImageAdjustments): string {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
}

export function renderAdjustedImageBase64(
  src: string,
  adjustments: ImageAdjustments,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
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
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = resolveImageSrc(src);
  });
}
