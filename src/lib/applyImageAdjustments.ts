import { fingerprintImageSrc } from '@/lib/fingerprintImage';

export type ImageAdjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
};

export const DEFAULT_IMAGE_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

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
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.filter = adjustmentsFilter(adjustments);
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl.replace(/^data:image\/png;base64,/, ''));
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = fingerprintImageSrc(src);
  });
}
