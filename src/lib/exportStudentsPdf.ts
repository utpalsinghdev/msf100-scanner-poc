import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  EXPORT_FINGER_KEYS,
  buildExportImageMap,
  exportDateSlug,
  type StudentExportRecord,
} from '@/lib/exportStudentsShared';

/** @deprecated Prefer StudentExportRecord — kept for existing imports. */
export type StudentPdfRecord = StudentExportRecord;

/** 138×155 aspect, compact prints; columns fill portrait A4 width */
const CELL_IMG_WIDTH_MM = 15;
const CELL_IMG_HEIGHT_MM = (CELL_IMG_WIDTH_MM * 155) / 138;
const ROW_HEIGHT_MM = CELL_IMG_HEIGHT_MM + 4;
const FINGER_COL_WIDTH_MM = 19;
const TABLE_FONT_SIZE = 9;
const TABLE_HEAD_FONT_SIZE = 10;

export async function exportStudentsPdf(students: StudentExportRecord[]) {
  if (students.length === 0) {
    throw new Error('No students to export');
  }

  const imageMap = await buildExportImageMap(students);
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

  const fingerHeaders = EXPORT_FINGER_KEYS.map((_, i) => `F${i + 1}`);

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
      ...EXPORT_FINGER_KEYS.map(() => ''),
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
      const fingerKey = EXPORT_FINGER_KEYS[fingerIndex];
      const img = imageMap.get(`${data.row.index}-${fingerKey}`);
      if (!img || !data.cell) return;

      const x = data.cell.x + (data.cell.width - CELL_IMG_WIDTH_MM) / 2;
      const y = data.cell.y + (data.cell.height - CELL_IMG_HEIGHT_MM) / 2;

      doc.addImage(img, 'JPEG', x, y, CELL_IMG_WIDTH_MM, CELL_IMG_HEIGHT_MM);
    },
  });

  doc.save(`students-${exportDateSlug()}.pdf`);
}
