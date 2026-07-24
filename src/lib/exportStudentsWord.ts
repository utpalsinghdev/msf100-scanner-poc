import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  BorderStyle,
  VerticalAlign,
  AlignmentType,
  Header,
} from 'docx';
import {
  EXPORT_FINGER_KEYS,
  buildExportImageMap,
  downloadBlob,
  exportDateSlug,
  jpegDataUrlToUint8Array,
  type StudentExportRecord,
} from '@/lib/exportStudentsShared';

const IMG_W = 55;
const IMG_H = Math.round((IMG_W * 155) / 138);
const BORDER = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: 'E2E8F0',
};
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const HEADER_FILL = '4F46E5';

function textCell(text: string, opts?: { bold?: boolean; fill?: string; width?: number }) {
  return new TableCell({
    borders: BORDERS,
    width: { size: opts?.width ?? 1200, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: opts?.fill ? { fill: opts.fill } : undefined,
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: opts?.bold,
            color: opts?.fill ? 'FFFFFF' : '1E293B',
            size: 18,
          }),
        ],
      }),
    ],
  });
}

function imageCell(dataUrl: string | undefined) {
  const children = dataUrl
    ? [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              type: 'jpg',
              data: jpegDataUrlToUint8Array(dataUrl),
              transformation: { width: IMG_W, height: IMG_H },
            }),
          ],
        }),
      ]
    : [new Paragraph({ children: [new TextRun({ text: '—', size: 16, color: '94A3B8' })] })];

  return new TableCell({
    borders: BORDERS,
    width: { size: 1100, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    children,
  });
}

export async function exportStudentsWord(students: StudentExportRecord[]) {
  if (students.length === 0) throw new Error('No students to export');

  const imageMap = await buildExportImageMap(students);
  const generatedAt = new Date().toLocaleString();

  const headerRow = new TableRow({
    children: [
      textCell('#', { bold: true, fill: HEADER_FILL, width: 500 }),
      textCell('Name', { bold: true, fill: HEADER_FILL, width: 2200 }),
      textCell('Batch', { bold: true, fill: HEADER_FILL, width: 1400 }),
      textCell('Registration ID', { bold: true, fill: HEADER_FILL, width: 1600 }),
      ...EXPORT_FINGER_KEYS.map((_, i) =>
        textCell(`F${i + 1}`, { bold: true, fill: HEADER_FILL, width: 1100 }),
      ),
    ],
  });

  const bodyRows = students.map((s, i) =>
    new TableRow({
      children: [
        textCell(String(i + 1), { width: 500 }),
        textCell(s.name, { width: 2200 }),
        textCell(s.batch?.name ?? '—', { width: 1400 }),
        textCell(s.mobile, { width: 1600 }),
        ...EXPORT_FINGER_KEYS.map((key) => imageCell(imageMap.get(`${i}-${key}`))),
      ],
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Students', bold: true, size: 28, color: '1E293B' }),
                ],
              }),
              new Paragraph({
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: `Generated: ${generatedAt}  •  ${students.length} student(s)`,
                    size: 18,
                    color: '64748B',
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Table({
            width: { size: 10080, type: WidthType.DXA },
            rows: [headerRow, ...bodyRows],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `students-${exportDateSlug()}.docx`);
}
