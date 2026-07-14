import Api from '@/lib/api';

/**
 * MFS100 stores scans as BMP base64. Some exports may be PNG or JPEG.
 * After file-storage migration, API returns `/api/student/:id/finger/:key` URLs.
 */
export function isRemoteFingerprintSrc(src: string | undefined | null): boolean {
  if (!src?.trim()) return false;
  const s = src.trim();
  return (
    s.startsWith('/api/') ||
    s.startsWith('http://') ||
    s.startsWith('https://')
  );
}

export function fingerprintImageSrc(base64: string | undefined | null): string {
  if (!base64?.trim()) return '';
  if (isRemoteFingerprintSrc(base64)) return base64.trim();

  const clean = base64.replace(/^data:image\/[\w+]+;base64,/, '').trim();
  const head = clean.slice(0, 12);

  if (head.startsWith('iVBORw0KGgo')) {
    return `data:image/png;base64,${clean}`;
  }
  if (head.startsWith('PHN2Zy') || head.startsWith('PD94bW')) {
    return `data:image/svg+xml;base64,${clean}`;
  }
  if (head.startsWith('/9j/')) {
    return `data:image/jpeg;base64,${clean}`;
  }
  if (head.startsWith('Qk0') || head.startsWith('Qk1') || head.startsWith('Qk2')) {
    return `data:image/bmp;base64,${clean}`;
  }

  return `data:image/bmp;base64,${clean}`;
}

/** Fetch image with JWT (img tags cannot send Authorization). */
export async function fetchFingerprintBlobUrl(
  src: string,
): Promise<string> {
  if (!isRemoteFingerprintSrc(src)) {
    return fingerprintImageSrc(src);
  }
  // Axios baseURL + "api/..." (strip leading slash from "/api/...")
  const path = src.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
  const res = await Api.get(path, {
    responseType: 'blob',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  });
  const blob = res.data as Blob;
  // Nest error JSON can arrive as Blob when responseType is blob.
  if (!blob?.size || blob.type?.includes('json')) {
    throw new Error('Not an image');
  }
  // Legacy enhanced files were saved as .bin (SVG) → octet-stream; <img> needs a real image MIME.
  if (blob.type.startsWith('image/')) {
    return URL.createObjectURL(blob);
  }
  const buf = new Uint8Array(await blob.arrayBuffer());
  const head = new TextDecoder().decode(buf.subarray(0, Math.min(buf.length, 256))).trimStart();
  let type = 'application/octet-stream';
  if (buf[0] === 0x89 && buf[1] === 0x50) type = 'image/png';
  else if (buf[0] === 0xff && buf[1] === 0xd8) type = 'image/jpeg';
  else if (buf[0] === 0x42 && buf[1] === 0x4d) type = 'image/bmp';
  else if (head.startsWith('<svg') || head.startsWith('<?xml')) type = 'image/svg+xml';
  else throw new Error('Not an image');
  return URL.createObjectURL(new Blob([buf], { type }));
}

/** Load remote or base64 finger into a data URL / usable src for canvas/PDF. */
export async function resolveFingerprintDisplaySrc(
  src: string | undefined | null,
): Promise<string | null> {
  if (!src?.trim()) return null;
  if (!isRemoteFingerprintSrc(src)) {
    return fingerprintImageSrc(src);
  }
  try {
    return await fetchFingerprintBlobUrl(src);
  } catch {
    return null;
  }
}

/** Resolve display src (URL or base64) to pure base64 for student create / enhance. */
export async function resolveToBase64(
  src: string | undefined | null,
): Promise<string> {
  if (!src?.trim()) {
    throw new Error('No image data');
  }
  if (!isRemoteFingerprintSrc(src)) {
    return src.replace(/^data:image\/[\w+]+;base64,/, '').trim();
  }
  const path = src.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '');
  const res = await Api.get(path, { responseType: 'arraybuffer' });
  const bytes = new Uint8Array(res.data as ArrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
