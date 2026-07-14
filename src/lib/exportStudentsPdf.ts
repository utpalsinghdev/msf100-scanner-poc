import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { resolveFingerprintDisplaySrc } from '@/lib/fingerprintImage';

export type StudentPdfRecord = {
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

const FINGER_KEYS = ['finger1', 'finger2', 'finger3', 'finger4', 'finger5'] as const;

/** 138×155 aspect, compact prints; columns fill portrait A4 width */
const CELL_IMG_WIDTH_MM = 15;
const CELL_IMG_HEIGHT_MM = (CELL_IMG_WIDTH_MM * 155) / 138;
const ROW_HEIGHT_MM = CELL_IMG_HEIGHT_MM + 4;
const FINGER_COL_WIDTH_MM = 19;
const TABLE_FONT_SIZE = 9;
const TABLE_HEAD_FONT_SIZE = 10;

function toJpegDataUrl(src: string | undefined | null): Promise<string | null> {
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

async function buildImageMap(
  students: StudentPdfRecord[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  await Promise.all(
    students.flatMap((student, rowIndex) =>
      FINGER_KEYS.map(async (key) => {
        const enhancedKey = `${key}Enhanced` as keyof StudentPdfRecord;
        const src = (student[enhancedKey] as string | null | undefined)?.trim()
          ? (student[enhancedKey] as string)
          : student[key];
        const dataUrl = await toJpegDataUrl(src);
        if (dataUrl) {
          map.set(`${rowIndex}-${key}`, dataUrl);
        }
      }),
    ),
  );
  return map;
}

export async function exportStudentsPdf(students: StudentPdfRecord[]) {
  if (students.length === 0) {
    throw new Error('No students to export');
  }

  const imageMap = await buildImageMap(students);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 10;
  const tableWidth = doc.internal.pageSize.getWidth() - margin * 2;
  const generatedAt = new Date().toLocaleString();

  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Students', margin, 14);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${generatedAt}  •  ${students.length} student(s)`, margin, 21);

  const fingerHeaders = FINGER_KEYS.map((_, i) => `F${i + 1}`);

  autoTable(doc, {
    startY: 26,
    tableWidth,
    margin: { left: margin, right: margin },
    head: [['#', 'Name', 'Batch', 'Registration ID', ...fingerHeaders]],
    body: students.map((s, i) => [
      String(i + 1),
      s.name,
      s.batch?.name ?? '—',
      s.mobile,
      ...FINGER_KEYS.map(() => ''),
    ]),
    styles: {
      fontSize: TABLE_FONT_SIZE,
      cellPadding: 2,
      minCellHeight: ROW_HEIGHT_MM,
      valign: 'middle',
      overflow: 'linebreak',
      fillColor: [255, 255, 255],
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: 255,
      fontSize: TABLE_HEAD_FONT_SIZE,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 38 },
      2: { cellWidth: 24 },
      3: { cellWidth: 24 },
      4: { cellWidth: FINGER_COL_WIDTH_MM },
      5: { cellWidth: FINGER_COL_WIDTH_MM },
      6: { cellWidth: FINGER_COL_WIDTH_MM },
      7: { cellWidth: FINGER_COL_WIDTH_MM },
      8: { cellWidth: FINGER_COL_WIDTH_MM },
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index < 4) return;

      const fingerIndex = data.column.index - 4;
      const fingerKey = FINGER_KEYS[fingerIndex];
      const img = imageMap.get(`${data.row.index}-${fingerKey}`);
      if (!img || !data.cell) return;

      const x = data.cell.x + (data.cell.width - CELL_IMG_WIDTH_MM) / 2;
      const y = data.cell.y + (data.cell.height - CELL_IMG_HEIGHT_MM) / 2;

      doc.addImage(img, 'JPEG', x, y, CELL_IMG_WIDTH_MM, CELL_IMG_HEIGHT_MM);
    },
  });

  const dateSlug = new Date().toISOString().slice(0, 10);
  doc.save(`students-${dateSlug}.pdf`);
}
