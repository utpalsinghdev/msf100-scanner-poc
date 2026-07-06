import Api from '@/lib/api';
import { fingerprintImageSrc } from '@/lib/fingerprintImage';

export type FingerKey = 'finger1' | 'finger2' | 'finger3' | 'finger4' | 'finger5';

export function enhancedFingerKey(fingerKey: FingerKey): `${FingerKey}Enhanced` {
  return `${fingerKey}Enhanced`;
}

export function enhancedImageSrc(base64: string | undefined | null): string {
  return fingerprintImageSrc(base64);
}

export async function enhanceFinger(
  studentId: string,
  fingerKey: FingerKey,
): Promise<{ student: Record<string, unknown>; svgBase64: string }> {
  const res = await Api.post(`api/student/${studentId}/enhance/${fingerKey}`);
  return res.data.data as { student: Record<string, unknown>; svgBase64: string };
}
