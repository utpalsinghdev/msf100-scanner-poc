/**
 * MFS100 stores scans as BMP base64. Some exports may be PNG or JPEG.
 * Using the wrong MIME type can invert or corrupt colors in the browser.
 */
export function fingerprintImageSrc(base64: string | undefined | null): string {
  if (!base64?.trim()) return '';

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
  // BMP magic "BM" → base64 usually starts with Qk0
  if (head.startsWith('Qk0') || head.startsWith('Qk1') || head.startsWith('Qk2')) {
    return `data:image/bmp;base64,${clean}`;
  }

  return `data:image/bmp;base64,${clean}`;
}
