import { fingerprintImageSrc } from '@/lib/fingerprintImage';

/** Clipart-style settings (similar to vectorizer.io "Few Colors" mode). */
export type ClipartSettings = {
  /** 40–100 — higher keeps more ridge detail. */
  detail: number;
  /** 0–100 — higher connects gaps and smooths edges (never removes thin ridges). */
  smoothness: number;
};

export const DEFAULT_CLIPART_SETTINGS: ClipartSettings = {
  detail: 90,
  smoothness: 30,
};

type GrayImage = {
  width: number;
  height: number;
  data: Float32Array;
};

type BinaryImage = {
  width: number;
  height: number;
  /** 255 = ridge (black in output), 0 = background */
  data: Uint8Array;
};

function loadGrayImage(src: string): Promise<GrayImage> {
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
      ctx.drawImage(img, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const gray = new Float32Array(width * height);
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        gray[p] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      }
      resolve({ width, height, data: gray });
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = fingerprintImageSrc(src);
  });
}

function gaussianBlur(gray: GrayImage, radius: number): GrayImage {
  if (radius <= 0.3) return gray;
  const { width, height, data } = gray;
  const out = new Float32Array(data.length);
  const kernelSize = 5;
  const half = 2;
  const sigma = Math.max(0.4, radius / 2);
  const kernel = new Float32Array(kernelSize);
  let sum = 0;
  for (let i = 0; i < kernelSize; i++) {
    const x = i - half;
    const v = Math.exp(-(x * x) / (2 * sigma * sigma));
    kernel[i] = v;
    sum += v;
  }
  for (let i = 0; i < kernelSize; i++) kernel[i] /= sum;

  const temp = new Float32Array(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let v = 0;
      for (let k = -half; k <= half; k++) {
        const sx = Math.min(width - 1, Math.max(0, x + k));
        v += data[y * width + sx] * kernel[k + half];
      }
      temp[y * width + x] = v;
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let v = 0;
      for (let k = -half; k <= half; k++) {
        const sy = Math.min(height - 1, Math.max(0, y + k));
        v += temp[sy * width + x] * kernel[k + half];
      }
      out[y * width + x] = v;
    }
  }
  return { width, height, data: out };
}

function percentileStretch(gray: GrayImage, lowPct: number, highPct: number): GrayImage {
  const { width, height, data } = gray;
  const sorted = Float32Array.from(data).sort();
  const lo = sorted[Math.floor((sorted.length * lowPct) / 100)] ?? 0;
  const hi = sorted[Math.floor((sorted.length * highPct) / 100)] ?? 255;
  const span = Math.max(hi - lo, 1);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = Math.min(255, Math.max(0, ((data[i] - lo) / span) * 255));
  }
  return { width, height, data: out };
}

function otsuThreshold(data: Float32Array): number {
  const hist = new Uint32Array(256);
  for (let i = 0; i < data.length; i++) {
    hist[Math.min(255, Math.max(0, Math.round(data[i])))]++;
  }
  const total = data.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0;
  let wB = 0;
  let maxVar = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > maxVar) {
      maxVar = varBetween;
      threshold = t;
    }
  }
  return threshold;
}

function ridgesAreDark(gray: GrayImage): boolean {
  const { data } = gray;
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i];
  const mean = sum / data.length;
  const borderSamples: number[] = [];
  const { width, height } = gray;
  for (let x = 0; x < width; x++) {
    borderSamples.push(data[x], data[(height - 1) * width + x]);
  }
  for (let y = 1; y < height - 1; y++) {
    borderSamples.push(data[y * width], data[y * width + width - 1]);
  }
  const borderMean =
    borderSamples.reduce((a, b) => a + b, 0) / Math.max(borderSamples.length, 1);
  if (borderMean > mean + 8) return true;
  if (borderMean < mean - 8) return false;
  return mean > 128;
}

function hysteresisBinarize(
  gray: GrayImage,
  ridgesDark: boolean,
  highT: number,
  lowT: number,
): BinaryImage {
  const { width, height, data } = gray;
  const out = new Uint8Array(data.length);
  const strong = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (ridgesDark) {
      if (v < highT) strong[i] = 1;
    } else if (v > highT) {
      strong[i] = 1;
    }
  }

  const stack: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (strong[i]) {
      out[i] = 255;
      stack.push(i);
    }
  }

  while (stack.length) {
    const idx = stack.pop()!;
    const x = idx % width;
    const y = (idx / width) | 0;
    const neighbors = [
      idx - 1,
      idx + 1,
      idx - width,
      idx + width,
      idx - width - 1,
      idx - width + 1,
      idx + width - 1,
      idx + width + 1,
    ];
    for (const ni of neighbors) {
      if (ni < 0 || ni >= data.length || out[ni]) continue;
      const nx = ni % width;
      const ny = (ni / width) | 0;
      if (Math.abs(nx - x) > 1 || Math.abs(ny - y) > 1) continue;
      const v = data[ni];
      const weak =
        ridgesDark ? v < lowT : v > lowT;
      if (weak) {
        out[ni] = 255;
        stack.push(ni);
      }
    }
  }

  return { width, height, data: out };
}

function morphDilate(bin: BinaryImage, iterations: number): BinaryImage {
  const { width, height, data } = bin;
  let cur = data;
  for (let iter = 0; iter < iterations; iter++) {
    const next = new Uint8Array(cur.length);
    next.set(cur);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (cur[y * width + x] === 0) continue;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < width && ny < height) {
              next[ny * width + nx] = 255;
            }
          }
        }
      }
    }
    cur = next;
  }
  return { width, height, data: cur };
}

function morphErode(bin: BinaryImage, iterations: number): BinaryImage {
  const { width, height, data } = bin;
  let cur = data;
  for (let iter = 0; iter < iterations; iter++) {
    const next = new Uint8Array(cur.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (cur[idx] === 0) continue;
        let keep = true;
        for (let dy = -1; dy <= 1 && keep; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= width || ny >= height || cur[ny * width + nx] === 0) {
              keep = false;
              break;
            }
          }
        }
        next[idx] = keep ? 255 : 0;
      }
    }
    cur = next;
  }
  return { width, height, data: cur };
}

function morphClose(bin: BinaryImage, r: number): BinaryImage {
  if (r <= 0) return bin;
  return morphErode(morphDilate(bin, r), r);
}

/** Remove only tiny 1–2 px noise dots, never whole ridge fragments. */
function removeTinyNoise(bin: BinaryImage, minArea: number): BinaryImage {
  if (minArea <= 1) return bin;
  const { width, height, data } = bin;
  const labels = new Int32Array(data.length);
  let nextLabel = 1;
  const areas = new Map<number, number>();

  const flood = (start: number, label: number) => {
    const stack = [start];
    let area = 0;
    while (stack.length) {
      const idx = stack.pop()!;
      if (labels[idx] !== 0 || data[idx] === 0) continue;
      labels[idx] = label;
      area++;
      const x = idx % width;
      const y = (idx / width) | 0;
      if (x > 0) stack.push(idx - 1);
      if (x < width - 1) stack.push(idx + 1);
      if (y > 0) stack.push(idx - width);
      if (y < height - 1) stack.push(idx + width);
    }
    areas.set(label, area);
  };

  for (let i = 0; i < data.length; i++) {
    if (data[i] === 255 && labels[i] === 0) flood(i, nextLabel++);
  }

  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const label = labels[i];
    if (label === 0) continue;
    if ((areas.get(label) ?? 0) >= minArea) out[i] = 255;
  }
  return { width, height, data: out };
}

function binaryToCanvas(bin: BinaryImage): string {
  const { width, height, data } = bin;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(width, height);
  for (let i = 0, p = 0; i < data.length; i++, p += 4) {
    const ridge = data[i] > 0;
    const v = ridge ? 0 : 255;
    img.data[p] = v;
    img.data[p + 1] = v;
    img.data[p + 2] = v;
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
}

function convert(gray: GrayImage, settings: ClipartSettings): string {
  const detailNorm = (settings.detail - 40) / 60;
  const smoothNorm = settings.smoothness / 100;

  let work = percentileStretch(gray, 1, 99);
  const blurRadius = smoothNorm * 1.2;
  work = gaussianBlur(work, blurRadius);

  const otsu = otsuThreshold(work.data);
  const ridgesDark = ridgesAreDark(work);

  // Higher detail → wider threshold band → keep more faint ridges.
  const band = 8 + detailNorm * 28;
  const centerShift = (detailNorm - 0.5) * 20;

  let highT: number;
  let lowT: number;
  if (ridgesDark) {
    highT = otsu + centerShift - band * 0.35;
    lowT = otsu + centerShift + band * 0.65;
  } else {
    highT = otsu - centerShift + band * 0.35;
    lowT = otsu - centerShift - band * 0.65;
  }

  let bin = hysteresisBinarize(work, ridgesDark, highT, lowT);

  if (smoothNorm > 0.5) {
    bin = morphClose(bin, 1);
  }

  const minArea = smoothNorm > 0.7 ? 3 : 2;
  bin = removeTinyNoise(bin, minArea);

  return binaryToCanvas(bin);
}

export async function renderClipartBase64(
  src: string,
  settings: ClipartSettings = DEFAULT_CLIPART_SETTINGS,
): Promise<string> {
  const gray = await loadGrayImage(src);
  return convert(gray, settings);
}
