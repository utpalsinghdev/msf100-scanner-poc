import Api from '@/lib/api';

/** Enhance fingerprint base64 via backend (contrast, sharpen, denoise). */
export async function enhanceFingerprint(
  base64: string,
  passes = 2,
): Promise<string> {
  const res = await Api.post('api/image/enhance', { image: base64, passes });
  if (!res.data?.success || !res.data?.data?.image) {
    throw new Error(res.data?.message ?? 'Enhancement failed');
  }
  return res.data.data.image as string;
}
