import JSZip from 'jszip';
import type { StudentPdfRecord } from '@/lib/exportStudentsPdf';

const FINGER_KEYS = ['finger1', 'finger2', 'finger3', 'finger4', 'finger5'] as const;

function sanitizePathSegment(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || 'unnamed';
}

function fingerprintExtension(base64: string): string {
  const clean = base64.replace(/^data:image\/[\w+]+;base64,/, '').trim();
  if (clean.startsWith('iVBORw0KGgo')) return 'png';
  if (clean.startsWith('/9j/')) return 'jpg';
  if (clean.startsWith('PD94bW') || clean.startsWith('PHN2Zy')) return 'svg';
  return 'bmp';
}

function base64ToUint8Array(base64: string): Uint8Array {
  const clean = base64.replace(/^data:image\/\w+;base64,/, '').trim();
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function uniqueFolderName(base: string, used: Set<string>): string {
  const sanitized = sanitizePathSegment(base);
  let candidate = sanitized;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${sanitized} (${n})`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function exportStudentsZip(students: StudentPdfRecord[]) {
  if (students.length === 0) {
    throw new Error('No students selected');
  }

  const zip = new JSZip();
  const batchNames = [
    ...new Set(students.map((s) => s.batch?.name?.trim()).filter(Boolean)),
  ] as string[];
  const singleBatch = batchNames.length === 1;
  const folderNamesByGroup = new Map<string, Set<string>>();

  for (const student of students) {
    const batchFolder = sanitizePathSegment(student.batch?.name ?? 'Unknown batch');
    const groupKey = singleBatch ? '__root__' : batchFolder;

    if (!folderNamesByGroup.has(groupKey)) {
      folderNamesByGroup.set(groupKey, new Set());
    }

    const usedNames = folderNamesByGroup.get(groupKey)!;
    const studentFolder = uniqueFolderName(student.name, usedNames);
    const prefix = singleBatch
      ? `${studentFolder}/`
      : `${batchFolder}/${studentFolder}/`;

    for (const key of FINGER_KEYS) {
      const enhancedKey = `${key}Enhanced` as keyof typeof student;
      const raw = student[enhancedKey] as string | undefined | null;
      const image = (raw?.trim() ? raw : student[key])?.trim();
      if (!image) continue;
      zip.file(
        `${prefix}${key}.${fingerprintExtension(image)}`,
        base64ToUint8Array(image),
      );
    }
  }

  const zipName =
    singleBatch && batchNames[0]
      ? `${sanitizePathSegment(batchNames[0])}.zip`
      : 'fingerprints-export.zip';

  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipName);
}
