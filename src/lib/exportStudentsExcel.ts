import ExcelJS from 'exceljs';
import {
  EXPORT_FINGER_KEYS,
  buildExportImageMap,
  downloadBlob,
  exportDateSlug,
  jpegDataUrlToUint8Array,
  type StudentExportRecord,
} from '@/lib/exportStudentsShared';

const IMG_W = 72;
const IMG_H = Math.round((IMG_W * 155) / 138);

export async function exportStudentsExcel(students: StudentExportRecord[]) {
  if (students.length === 0) throw new Error('No students to export');

  const imageMap = await buildExportImageMap(students);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'BioScan';
  const sheet = workbook.addWorksheet('Students', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  sheet.columns = [
    { header: '#', key: 'n', width: 6 },
    { header: 'Name', key: 'name', width: 28 },
    { header: 'Batch', key: 'batch', width: 18 },
    { header: 'Registration ID', key: 'mobile', width: 18 },
    ...EXPORT_FINGER_KEYS.map((_, i) => ({
      header: `F${i + 1}`,
      key: `f${i + 1}`,
      width: 14,
    })),
  ];

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' },
  };
  header.alignment = { vertical: 'middle', horizontal: 'center' };
  header.height = 22;

  students.forEach((s, i) => {
    const rowIndex = i + 2;
    const row = sheet.getRow(rowIndex);
    row.values = [
      i + 1,
      s.name,
      s.batch?.name ?? '—',
      s.mobile,
      '',
      '',
      '',
      '',
      '',
    ];
    row.height = IMG_H + 8;
    row.alignment = { vertical: 'middle' };

    EXPORT_FINGER_KEYS.forEach((key, fingerIndex) => {
      const dataUrl = imageMap.get(`${i}-${key}`);
      if (!dataUrl) return;
      const imageId = workbook.addImage({
        buffer: jpegDataUrlToUint8Array(dataUrl) as unknown as ExcelJS.Buffer,
        extension: 'jpeg',
      });
      // Columns: 0=#,1=name,2=batch,3=reg,4..=fingers (1-based exceljs col)
      const col = 5 + fingerIndex;
      sheet.addImage(imageId, {
        tl: { col: col - 1 + 0.15, row: rowIndex - 1 + 0.15 },
        ext: { width: IMG_W, height: IMG_H },
        editAs: 'oneCell',
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `students-${exportDateSlug()}.xlsx`,
  );
}
