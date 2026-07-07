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

/** Call enhancer microservice, apply contrast 150% + mirror, persist to finger*Enhanced. */
export async function enhanceFinger(
  studentId: string,
  fingerKey: FingerKey,
): Promise<{ student: Record<string, unknown>; enhancedBase64: string }> {
  const res = await Api.post(`api/student/${studentId}/enhance/${fingerKey}`);
  const serviceBase64 = res.data.data?.enhancedBase64 as string | undefined;
  if (!serviceBase64?.trim()) {
    throw new Error('Enhancer returned no image data');
  }

  const enhancedBase64 = await renderAdjustedImageBase64(
    serviceBase64,
    ENHANCED_SAVE_ADJUSTMENTS,
  );
  const enhancedKey = enhancedFingerKey(fingerKey);
  const putRes = await Api.put(`api/student/${studentId}`, { [enhancedKey]: enhancedBase64 });

  return {
    student: putRes.data.data as Record<string, unknown>,
    enhancedBase64,
  };
}
