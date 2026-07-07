import Api from '@/lib/api';
import {
  ENHANCED_SAVE_ADJUSTMENTS,
  renderAdjustedImageBase64,
} from '@/lib/applyImageAdjustments';
import { fingerprintImageSrc } from '@/lib/fingerprintImage';

export type FingerKey = 'finger1' | 'finger2' | 'finger3' | 'finger4' | 'finger5';

export function enhancedFingerKey(fingerKey: FingerKey): `${FingerKey}Enhanced` {
  return `${fingerKey}Enhanced`;
}

export function enhancedImageSrc(base64: string | undefined | null): string {
  return fingerprintImageSrc(base64);
}

/** Apply contrast 150% + mirror, then persist to finger*Enhanced. */
export async function enhanceFinger(
  studentId: string,
  fingerKey: FingerKey,
  imageBase64?: string,
): Promise<{ student: Record<string, unknown>; enhancedBase64: string }> {
  let raw = imageBase64?.trim();
  if (!raw) {
    const res = await Api.get(`api/student/${studentId}`);
    raw = res.data.data[fingerKey] as string | undefined;
  }
  if (!raw) {
    throw new Error(`No image found for ${fingerKey}`);
  }

  const enhancedBase64 = await renderAdjustedImageBase64(raw, ENHANCED_SAVE_ADJUSTMENTS);
  const enhancedKey = enhancedFingerKey(fingerKey);
  const res = await Api.put(`api/student/${studentId}`, { [enhancedKey]: enhancedBase64 });

  return { student: res.data.data as Record<string, unknown>, enhancedBase64 };
}
