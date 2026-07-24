import { resolveFingerprintDisplaySrc } from '@/lib/fingerprintImage';

export type StudentExportRecord = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  batch?: { name?: string } | null;
  finger1?: string | null;
  finger2?: string | null;
  finger3?: string | null;
  finger4?: string | null;
  finger5?: string | null;
  finger1Enhanced?: string | null;
  finger2Enhanced?: string | null;
  finger3Enhanced?: string | null;
  finger4Enhanced?: string | null;
  finger5Enhanced?: string | null;
};

export const EXPORT_FINGER_KEYS = [
  'finger1',
  'finger2',
  'finger3',
  'finger4',
  'finger5',
] as const;

export type ExportFingerKey = (typeof EXPORT_FINGER_KEYS)[number];

/** Prefer enhanced image when present. */
export function fingerSrcForExport(
  student: StudentExportRecord,
  key: ExportFingerKey,
): string | null | undefined {
  const enhancedKey = `${key}Enhanced` as keyof StudentExportRecord;
  const enhanced = student[enhancedKey] as string | null | undefined;
  return enhanced?.trim() ? enhanced : student[key];
}

export function toJpegDataUrl(src: string | undefined | null): Promise<string | null> {
  if (!src?.trim()) return Promise.resolve(null);

  return resolveFingerprintDisplaySrc(src).then(
    (resolved) =>
      new Promise((resolve) => {
        if (!resolved) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
          } catch {
            resolve(null);
          } finally {
            if (resolved.startsWith('blob:')) URL.revokeObjectURL(resolved);
          }
        };
        img.onerror = () => {
          if (resolved.startsWith('blob:')) URL.revokeObjectURL(resolved);
          resolve(null);
        };
        img.src = resolved;
      }),
  );
}

export async function buildExportImageMap(
  students: StudentExportRecord[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  await Promise.all(
    students.flatMap((student, rowIndex) =>
      EXPORT_FINGER_KEYS.map(async (key) => {
        const dataUrl = await toJpegDataUrl(fingerSrcForExport(student, key));
        if (dataUrl) map.set(`${rowIndex}-${key}`, dataUrl);
      }),
    ),
  );
  return map;
}

export function jpegDataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDateSlug() {
  return new Date().toISOString().slice(0, 10);
}
