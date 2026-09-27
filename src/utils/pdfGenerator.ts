import { jsPDF } from 'jspdf';
import { BookSettings, PageDocument, OutputMode } from '../types';
import { getHeaderFooterContent } from './headerFooterHelper';
import { getPageFontSizePt } from './textDistributor';
import { expandTabs } from './textWhitespace';

export interface PDFExportOptions {
  fileName?: string;
  volumeNumber?: number;
  totalVolumes?: number;
}

export {
  parseMarkdownText,
  type ParsedLine,
  type MarkdownSpan,
  slugify,
  countMarkdownWords,
} from './markdownParser';
import { parseMarkdownText, type MarkdownSpan, type ParsedLine } from './markdownParser';
import { generateQrDataUrlSync, ensureQrDataUrl } from './qrCodeHelper';
import { resolvePageImages, ensureDataUrl } from './imageHelper';

export function sanitizeForJsPdf(text: string): string {
  if (!text) return '';
  return expandTabs(text)
    .replace(/□/g, '[ ]')
    .replace(/○/g, '( )')
    .replace(/▲/g, '*')
    .replace(/👁/g, '[Pesq]')
    .replace(/📑/g, '')
    .replace(/🗝️?/g, '')
    .replace(/🎯/g, '')
    .replace(/⚡/g, '')
    .replace(/💡/g, '')
    .replace(/🏁/g, '')
    .replace(/📝/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '');
}

/**
 * Generates the complete Minibook PDF according to the active OutputMode:
 * - 'front-only': 1 page A4 landscape.
 * - 'poster-back': 2 pages A4 landscape (Page 1: 8 panels front, Page 2: Poster A4).
 * - 'continuation-16p': 2 pages A4 landscape (Page 1: Front panels 1-8, Page 2: Back panels 9-16).
 * - 'booklet-bound-16p': 2 pages A4 landscape (Page 1: Front 4 folios, Page 2: Back 4 folios).
 */
export async function generateMinibookPDF(
  pages: PageDocument[],
  settings: BookSettings,
  options?: PDFExportOptions
): Promise<jsPDF> {
  // Pre-fetch/convert all page images to base64 Data URLs for clean jsPDF embedding
  for (const page of pages) {
    const pImages = resolvePageImages(page);
    if (pImages.hasImages) {
      for (let i = 0; i < pImages.images.length; i++) {
        const raw = pImages.images[i];
        if (raw && !raw.startsWith('data:')) {
          try {
            const dataUrl = await ensureDataUrl(raw);
            if (dataUrl) pImages.images[i] = dataUrl;
          } catch (_e) {
            // Keep original
          }
        }
      }
    }

    // Pre-cache all QR Codes found in page content
    if (page.content) {
      const parsedLines = parseMarkdownText(page.content);
      for (const line of parsedLines) {
        if (line.isQrCode && line.qrUrl) {
          try {
            await ensureQrDataUrl(line.qrUrl, 256);
          } catch (_e) {
            // Ignore
          }
        }
      }
    }
  }

  if (settings.posterSettings?.backgroundImage && !settings.posterSettings.backgroundImage.startsWith('data:')) {
    try {
      const dataUrl = await ensureDataUrl(settings.posterSettings.backgroundImage);
      if (dataUrl) settings.posterSettings.backgroundImage = dataUrl;
    } catch (_e) {
      // Keep original
    }
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const panelWidth = pageWidth / 4; // 74.25 mm
  const panelHeight = pageHeight / 2; // 105.0 mm

  let marginMm = 6.0;
  if (settings.margin === 'compact') marginMm = 4.5;
  if (settings.margin === 'generous') marginMm = 8.0;

  const mode = settings.outputMode || 'front-only';

  if (mode === 'booklet-bound-16p') {
    // Page 1: Front 4 folios
    renderBoundSheet(doc, pages, 'front', panelWidth, panelHeight, marginMm, settings);

    // Page 2: Back 4 folios
    doc.addPage('a4', 'landscape');
    renderBoundSheet(doc, pages, 'back', panelWidth, panelHeight, marginMm, settings);
  } else if (mode === 'continuation-16p') {
    // Page 1: Front Minizine (1-8)
    renderMinizineSheet(
      doc,
      pages,
      [
        { col: 0, row: 0, pageId: 5, rotated: true },
        { col: 1, row: 0, pageId: 4, rotated: true },
        { col: 2, row: 0, pageId: 3, rotated: true },
        { col: 3, row: 0, pageId: 2, rotated: true },
        { col: 0, row: 1, pageId: 6, rotated: false },
        { col: 1, row: 1, pageId: 7, rotated: false },
        { col: 2, row: 1, pageId: 8, rotated: false },
        { col: 3, row: 1, pageId: 1, rotated: false },
      ],
      panelWidth,
      panelHeight,
      marginMm,
      settings,
      true
    );

    // Page 2: Back Minizine (9-16) duplex aligned (short edge flip)
    doc.addPage('a4', 'landscape');
    renderMinizineSheet(
      doc,
      pages,
      [
        { col: 0, row: 0, pageId: 10, rotated: true },
        { col: 1, row: 0, pageId: 11, rotated: true },
        { col: 2, row: 0, pageId: 12, rotated: true },
        { col: 3, row: 0, pageId: 13, rotated: true },
        { col: 0, row: 1, pageId: 9, rotated: false },
        { col: 1, row: 1, pageId: 16, rotated: false },
        { col: 2, row: 1, pageId: 15, rotated: false },
        { col: 3, row: 1, pageId: 14, rotated: false },
      ],
      panelWidth,
      panelHeight,
      marginMm,
      settings,
      true
    );
  } else if (mode === 'poster-back') {
    // Page 1: Front Minizine (1-8)
    renderMinizineSheet(
      doc,
      pages,
      [
        { col: 0, row: 0, pageId: 5, rotated: true },
        { col: 1, row: 0, pageId: 4, rotated: true },
        { col: 2, row: 0, pageId: 3, rotated: true },
        { col: 3, row: 0, pageId: 2, rotated: true },
        { col: 0, row: 1, pageId: 6, rotated: false },
        { col: 1, row: 1, pageId: 7, rotated: false },
        { col: 2, row: 1, pageId: 8, rotated: false },
        { col: 3, row: 1, pageId: 1, rotated: false },
      ],
      panelWidth,
      panelHeight,
      marginMm,
      settings,
      true
    );

    // Page 2: Poster Back
    doc.addPage('a4', 'landscape');
    renderPosterPage(doc, pageWidth, pageHeight, settings);
  } else {
    // Default 'front-only': 1 page A4 landscape
    renderMinizineSheet(
      doc,
      pages,
      [
        { col: 0, row: 0, pageId: 5, rotated: true },
        { col: 1, row: 0, pageId: 4, rotated: true },
        { col: 2, row: 0, pageId: 3, rotated: true },
        { col: 3, row: 0, pageId: 2, rotated: true },
        { col: 0, row: 1, pageId: 6, rotated: false },
        { col: 1, row: 1, pageId: 7, rotated: false },
        { col: 2, row: 1, pageId: 8, rotated: false },
        { col: 3, row: 1, pageId: 1, rotated: false },
      ],
      panelWidth,
      panelHeight,
      marginMm,
      settings,
      true
    );
  }

  return doc;
}

function renderMinizineSheet(
  doc: jsPDF,
  pages: PageDocument[],
  layout: { col: number; row: number; pageId: number; rotated: boolean }[],
  panelWidth: number,
  panelHeight: number,
  marginMm: number,
  settings: BookSettings,
  drawSlit: boolean
) {
  for (const panel of layout) {
    const pageData = pages.find((p) => p.id === panel.pageId) || {
      id: panel.pageId,
      stableId: `p-${panel.pageId}`,
      editorialNumber: panel.pageId,
      role: 'content' as const,
      content: '',
      title: `Página ${panel.pageId}`,
    };

    const originX = panel.col * panelWidth;
    const originY = panel.row * panelHeight;

    renderPanel(
      doc,
      pageData,
      originX,
      originY,
      panelWidth,
      panelHeight,
      marginMm,
      panel.rotated,
      settings,
      pages.length,
      pages[0]?.title,
      pages[0]?.author
    );
  }

  drawGuides(doc, 297, 210, panelWidth, panelHeight, settings, drawSlit);
}

function renderBoundSheet(
  doc: jsPDF,
  pages: PageDocument[],
  face: 'front' | 'back',
  panelWidth: number,
  panelHeight: number,
  marginMm: number,
  settings: BookSettings
) {
  const layout =
    face === 'front'
      ? [
          { col: 0, row: 0, pageId: 16 },
          { col: 1, row: 0, pageId: 1 },
          { col: 2, row: 0, pageId: 14 },
          { col: 3, row: 0, pageId: 3 },
          { col: 0, row: 1, pageId: 12 },
          { col: 1, row: 1, pageId: 5 },
          { col: 2, row: 1, pageId: 10 },
          { col: 3, row: 1, pageId: 7 },
        ]
      : [
          { col: 0, row: 0, pageId: 4 },
          { col: 1, row: 0, pageId: 13 },
          { col: 2, row: 0, pageId: 2 },
          { col: 3, row: 0, pageId: 15 },
          { col: 0, row: 1, pageId: 8 },
          { col: 1, row: 1, pageId: 9 },
          { col: 2, row: 1, pageId: 6 },
          { col: 3, row: 1, pageId: 11 },
        ];

  for (const panel of layout) {
    const pageData = pages.find((p) => p.id === panel.pageId) || {
      id: panel.pageId,
      stableId: `p-${panel.pageId}`,
      editorialNumber: panel.pageId,
      role: 'content' as const,
      content: '',
      title: `Página ${panel.pageId}`,
    };

    const originX = panel.col * panelWidth;
    const originY = panel.row * panelHeight;

    renderPanel(
      doc,
      pageData,
      originX,
      originY,
      panelWidth,
      panelHeight,
      marginMm,
      false, // all upright for bound folios
      settings,
      pages.length,
      pages[0]?.title,
      pages[0]?.author
    );
  }

  // Draw full horizontal cut line across y = 105 mm
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.4);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(0, 105, 297, 105);

  // Vertical separation lines (center cut at x = 148.5)
  doc.setDrawColor(220, 38, 38);
  doc.line(148.5, 0, 148.5, 210);

  // Vertical fold lines for each folio
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.line(74.25, 0, 74.25, 210);
  doc.line(222.75, 0, 222.75, 210);

  doc.setLineDashPattern([], 0);
}

function renderPosterPage(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  settings: BookSettings
) {
  const poster = settings.posterSettings;
  const fontName = settings.fontFamily === 'serif' ? 'times' : 'helvetica';

  // Draw background image if user uploaded one
  if (poster.backgroundImage) {
    try {
      if (poster.orientation === 'portrait') {
        // Rotated 90 degrees to fit the A4 landscape sheet (297 x 210 mm)
        doc.addImage(poster.backgroundImage, 297, -87, 210, 297, undefined, undefined, 90);
      } else {
        doc.addImage(poster.backgroundImage, 0, 0, pageWidth, pageHeight);
      }
    } catch (_e) {
      // Ignore invalid image data gracefully
    }
  }

  // Decorative border only if no image and there is text
  const hasText = !!(poster.title?.trim() || poster.bodyText?.trim());
  if (!poster.backgroundImage && hasText) {
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.6);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    doc.setLineWidth(0.2);
    doc.rect(14, 14, pageWidth - 28, pageHeight - 28);
  }

  // Slit safe indication line if requested
  if (poster.showCutSlitZone) {
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([2, 2], 0);
    // Slit from x = 74.25 to 222.75 at y = 105
    doc.line(74.25, 105, 222.75, 105);
    doc.setLineDashPattern([], 0);
  }

  // Title (only if user provided one)
  if (poster.title?.trim()) {
    doc.setFont(fontName, 'bold');
    doc.setFontSize(26);
    doc.setTextColor(30, 30, 30);
    doc.text(poster.title.trim(), pageWidth / 2, 45, { align: 'center' });
  }

  // Subtitle (only if user provided one)
  if (poster.subtitle?.trim()) {
    doc.setFont(fontName, 'italic');
    doc.setFontSize(13);
    doc.setTextColor(80, 80, 80);
    doc.text(poster.subtitle.trim(), pageWidth / 2, 55, { align: 'center' });
  }

  // Lyrical text / quote (only if user provided one)
  if (poster.bodyText?.trim()) {
    doc.setFont(fontName, 'normal');
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);

    const splitLines = doc.splitTextToSize(poster.bodyText.trim(), 180);
    doc.text(splitLines, pageWidth / 2, 130, { align: 'center' });
  }

  // Author & Credits (only if user provided one)
  if (poster.author?.trim()) {
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(poster.author.trim(), pageWidth / 2, 185, {
      align: 'center',
    });
  }
}

function drawPanelImage(
  doc: jsPDF,
  imgData: string,
  colX: number,
  rowY: number,
  pWidth: number,
  pHeight: number,
  localX: number,
  localY: number,
  w: number,
  h: number,
  rotated: boolean
) {
  if (!imgData) return;
  try {
    if (!rotated) {
      doc.addImage(imgData, 'JPEG', colX + localX, rowY + localY, w, h);
    } else {
      const rx = colX + pWidth - localX;
      const ry = rowY + pHeight - localY;
      doc.addImage(imgData, 'JPEG', rx, ry, w, h, undefined, undefined, 180);
    }
  } catch (_e1) {
    try {
      if (!rotated) {
        doc.addImage(imgData, 'PNG', colX + localX, rowY + localY, w, h);
      } else {
        const rx = colX + pWidth - localX;
        const ry = rowY + pHeight - localY;
        doc.addImage(imgData, 'PNG', rx, ry, w, h, undefined, undefined, 180);
      }
    } catch (_e2) {
      // Ignore unsupported image format gracefully
    }
  }
}
function renderQrCodeBlock(
  doc: jsPDF,
  item: ParsedLine,
  colX: number,
  rowY: number,
  pWidth: number,
  pHeight: number,
  margin: number,
  contentWidth: number,
  currY: number,
  maxY: number,
  rotated: boolean,
  fontName: string,
  mapPoint: (localX: number, localY: number) => { x: number; y: number; angle: number }
): number {
  if (!item.isQrCode || !item.qrUrl) return currY;

  const qrSizeMm = item.qrSize === 'sm' ? 16 : item.qrSize === 'lg' ? 24 : 19;
  const qrDataUrl = generateQrDataUrlSync(item.qrUrl, 256);

  if (currY + qrSizeMm <= maxY) {
    currY += 1.0;
    const localX = (contentWidth - qrSizeMm) / 2;

    if (qrDataUrl) {
      if (!rotated) {
        const imgX = colX + margin + localX;
        const imgY = rowY + margin + currY;
        doc.addImage(qrDataUrl, 'PNG', imgX, imgY, qrSizeMm, qrSizeMm);
        doc.link(imgX, imgY, qrSizeMm, qrSizeMm, { url: item.qrUrl });
      } else {
        const imgX = colX + pWidth - margin - localX;
        const imgY = rowY + pHeight - margin - currY;
        doc.addImage(qrDataUrl, 'PNG', imgX, imgY, qrSizeMm, qrSizeMm, undefined, undefined, 180);
        doc.link(imgX - qrSizeMm, imgY - qrSizeMm, qrSizeMm, qrSizeMm, { url: item.qrUrl });
      }
    }

    currY += qrSizeMm + 2.0;

    // Render caption under QR Code if space allows
    if (item.qrCaption) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(50, 50, 50);
      const capLines = doc.splitTextToSize(item.qrCaption, contentWidth - 4);
      for (const cLine of capLines) {
        if (currY >= maxY) break;
        const capPt = mapPoint(contentWidth / 2, currY);
        doc.text(cLine, capPt.x, capPt.y, { angle: capPt.angle, align: 'center' });
        currY += 2.6;
      }
    }

    // Subtle Phygital indicator text if space allows
    if (currY + 2.5 <= maxY) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(5.0);
      doc.setTextColor(120, 120, 120);
      const badgePt = mapPoint(contentWidth / 2, currY);
      doc.text('PHYGITAL · ESCANEIE COM A CÂMERA', badgePt.x, badgePt.y, {
        angle: badgePt.angle,
        align: 'center',
      });
      currY += 2.8;
    }
  }

  return currY;
}

interface PdfTextRun {
  text: string;
  width: number;
  fontName: string;
  fontStyle: string;
  fontSize: number;
  span: MarkdownSpan;
}

interface PdfTextLine {
  runs: PdfTextRun[];
  width: number;
  maxFontSize: number;
}

function hasInlineFontSize(spans: MarkdownSpan[]): boolean {
  return spans.some((span) => span.fontSizeScale !== undefined && span.fontSizeScale !== 1);
}

// Measure each formatted fragment with its own font before deciding where to wrap.
function layoutPdfSpans(
  doc: jsPDF,
  spans: MarkdownSpan[],
  maxWidth: number,
  fontName: string,
  baseStyle: string,
  baseFontSize: number
): PdfTextLine[] {
  const lines: PdfTextLine[] = [];
  let line: PdfTextLine = { runs: [], width: 0, maxFontSize: baseFontSize };
  const finishLine = () => {
    lines.push(line);
    line = { runs: [], width: 0, maxFontSize: baseFontSize };
  };

  for (const span of spans) {
    const text = sanitizeForJsPdf(span.text);
    if (!text) continue;
    const spanFont = span.type === 'code' ? 'courier' : fontName;
    const bold = baseStyle.includes('bold') || !!span.bold;
    const italic = baseStyle.includes('italic') || !!span.italic;
    const fontStyle = bold && italic ? 'bolditalic' : bold ? 'bold' : italic ? 'italic' : 'normal';
    const fontSize = baseFontSize * (span.fontSizeScale ?? (span.type === 'code' ? 0.88 : 1));
    doc.setFont(spanFont, fontStyle);
    doc.setFontSize(fontSize);

    const append = (part: string) => {
      const width = doc.getTextWidth(part);
      line.runs.push({ text: part, width, fontName: spanFont, fontStyle, fontSize, span });
      line.width += width;
      line.maxFontSize = Math.max(line.maxFontSize, fontSize);
    };

    for (const token of text.match(/\S+|\s+/g) ?? []) {
      let rest = token;
      while (rest) {
        const width = doc.getTextWidth(rest);
        if (line.width + width <= maxWidth) {
          append(rest);
          break;
        }

        // A word goes to the next line as a unit when possible.
        if (line.runs.length > 0 && !/^\s+$/.test(rest)) {
          finishLine();
          continue;
        }

        // Split a long word or an unusually wide run of spaces at the panel edge.
        let fit = 0;
        while (fit < rest.length && line.width + doc.getTextWidth(rest.slice(0, fit + 1)) <= maxWidth) {
          fit++;
        }
        if (fit === 0) {
          if (line.runs.length) {
            finishLine();
          } else {
            append(rest[0]);
            rest = rest.slice(1);
            if (rest) finishLine();
          }
          continue;
        }
        append(rest.slice(0, fit));
        rest = rest.slice(fit);
        if (rest) finishLine();
      }
    }
  }

  if (line.runs.length || lines.length === 0) finishLine();
  return lines;
}

function pdfLineHeight(line: PdfTextLine, baseFontSize: number, lineHeightMm: number): number {
  return lineHeightMm * Math.max(1, line.maxFontSize / baseFontSize);
}

function drawPdfSpans(
  doc: jsPDF,
  line: PdfTextLine,
  x: number,
  y: number,
  mapPoint: (x: number, y: number) => { x: number; y: number; angle: number },
  rotated: boolean,
  color: [number, number, number],
  lineHeightMm: number,
  justifyWidth?: number
) {
  let offset = x;
  const stretchableSpaces = line.runs.reduce((count, run, index) =>
    count + Number(run.text === ' ' && index > 0 && index < line.runs.length - 1 &&
      !/^\s+$/.test(line.runs[index - 1].text) && !/^\s+$/.test(line.runs[index + 1].text)), 0);
  const addedSpace = justifyWidth && stretchableSpaces > 0
    ? Math.max(0, justifyWidth - line.width) / stretchableSpaces : 0;
  for (const [index, run] of line.runs.entries()) {
    const point = mapPoint(offset, y);
    const left = rotated ? point.x - run.width : point.x;
    doc.setFont(run.fontName, run.fontStyle);
    doc.setFontSize(run.fontSize);
    doc.setTextColor(...color);

    if (run.span.highlight || run.span.type === 'code') {
      if (run.span.highlight) doc.setFillColor(254, 240, 138);
      else doc.setFillColor(243, 244, 246);
      const top = rotated ? point.y - lineHeightMm * 0.28 : point.y - lineHeightMm * 0.72;
      doc.rect(left, top, run.width, lineHeightMm * 0.85, 'F');
    }

    doc.text(run.text, point.x, point.y, { angle: point.angle, align: 'left' });

    if (run.span.type === 'link' && run.span.href && !run.span.isAnchor) {
      doc.link(left, point.y - lineHeightMm * (rotated ? 0.25 : 0.75), run.width, lineHeightMm, {
        url: run.span.href,
      });
    }

    if (run.span.type === 'link' || run.span.underline || run.span.strikethrough) {
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(0.12);
      if (run.span.type === 'link' || run.span.underline) {
        const underlineY = point.y + (rotated ? -0.35 : 0.35);
        doc.line(left, underlineY, left + run.width, underlineY);
      }
      if (run.span.strikethrough) {
        const strikeY = point.y + (rotated ? 1 : -1) * lineHeightMm * 0.28;
        doc.line(left, strikeY, left + run.width, strikeY);
      }
    }

    offset += run.width;
    if (addedSpace && run.text === ' ' && index > 0 && index < line.runs.length - 1 &&
        !/^\s+$/.test(line.runs[index - 1].text) && !/^\s+$/.test(line.runs[index + 1].text)) {
      offset += addedSpace;
    }
  }
}

function renderPanel(
  doc: jsPDF,
  page: PageDocument,
  colX: number,
  rowY: number,
  pWidth: number,
  pHeight: number,
  margin: number,
  rotated: boolean,
  settings: BookSettings,
  totalPages: number = 8,
  bookTitle?: string,
  bookAuthor?: string
) {
  const contentWidth = pWidth - margin * 2;
  const contentHeight = pHeight - margin * 2;

  const fontName = settings.fontFamily === 'serif' ? 'times' : 'helvetica';
  doc.setFont(fontName, 'normal');

  let bodyPt = 9.5;
  let titlePt = 12;
  let lineHeightMm = 4.2;

  if ((page.fontSize && page.fontSize !== 'inherit') || settings.fontSize.endsWith('pt')) {
    const customPt = getPageFontSizePt(page, settings);
    bodyPt = customPt;
    titlePt = Math.max(9, customPt + 2);
    lineHeightMm = customPt * 0.42;
  } else {
    if (settings.fontSize === 'sm') {
      bodyPt = 8.5;
      titlePt = 11;
      lineHeightMm = 3.8;
    } else if (settings.fontSize === 'lg') {
      bodyPt = 11;
      titlePt = 13.5;
      lineHeightMm = 4.8;
    }

    // Dynamic typography scale: only scale down if page is unusually dense (> 165 words)
    const pageWords = (page.content || '').split(/\s+/).filter(Boolean).length;
    if (pageWords > 185) {
      bodyPt = Math.min(bodyPt, 7.8);
      titlePt = Math.min(titlePt, 9.5);
      lineHeightMm = 3.3;
    } else if (pageWords > 165) {
      bodyPt = Math.min(bodyPt, 8.4);
      titlePt = Math.min(titlePt, 10);
      lineHeightMm = 3.6;
    } else if (pageWords > 145 && settings.fontSize !== 'sm') {
      bodyPt = Math.min(bodyPt, 9.0);
      lineHeightMm = 3.9;
    }
  }

  const mapPoint = (localX: number, localY: number): { x: number; y: number; angle: number } => {
    if (!rotated) {
      return {
        x: colX + margin + localX,
        y: rowY + margin + localY,
        angle: 0,
      };
    } else {
      return {
        x: colX + pWidth - margin - localX,
        y: rowY + pHeight - margin - localY,
        angle: 180,
      };
    }
  };

  const isCover = page.role === 'cover' || page.id === 1;
  const isBackCover = page.role === 'back-cover';

  const hf = getHeaderFooterContent(page, totalPages, settings, bookTitle, bookAuthor);
  const pageImages = resolvePageImages(page);

  // 1. Imagem na folha inteira (Sem bordas / Sangria total no A7: 74,25 × 105 mm)
  if (pageImages.hasImages && pageImages.layout === 'full') {
    if (pageImages.images[0]) {
      drawPanelImage(doc, pageImages.images[0], colX, rowY, pWidth, pHeight, 0, 0, pWidth, pHeight, rotated);
    }
    if (pageImages.caption) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      const capPt = mapPoint(contentWidth / 2, contentHeight - 4);
      doc.text(pageImages.caption, capPt.x, capPt.y, { angle: capPt.angle, align: 'center' });
    }
    return;
  }

  // 3. Duas imagens na mesma folha (Dividida ao meio / Layout 2 por página / 2 poses: 74,25 × 52,5 mm)
  if (pageImages.hasImages && pageImages.layout === 'two') {
    const halfH = pHeight / 2;
    if (pageImages.images[0]) {
      drawPanelImage(doc, pageImages.images[0], colX, rowY, pWidth, pHeight, 0, 0, pWidth, halfH, rotated);
    }
    if (pageImages.images[1]) {
      drawPanelImage(doc, pageImages.images[1], colX, rowY, pWidth, pHeight, 0, halfH, pWidth, halfH, rotated);
    }
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.line(colX, rowY + halfH, colX + pWidth, rowY + halfH);
    return;
  }

  // 4. Quatro imagens na mesma folha (Dividida em quatro / Layout 4 por página / 4 poses: 37,125 × 52,5 mm)
  if (pageImages.hasImages && pageImages.layout === 'four') {
    const qW = pWidth / 2;
    const qH = pHeight / 2;
    if (pageImages.images[0]) {
      drawPanelImage(doc, pageImages.images[0], colX, rowY, pWidth, pHeight, 0, 0, qW, qH, rotated);
    }
    if (pageImages.images[1]) {
      drawPanelImage(doc, pageImages.images[1], colX, rowY, pWidth, pHeight, qW, 0, qW, qH, rotated);
    }
    if (pageImages.images[2]) {
      drawPanelImage(doc, pageImages.images[2], colX, rowY, pWidth, pHeight, 0, qH, qW, qH, rotated);
    }
    if (pageImages.images[3]) {
      drawPanelImage(doc, pageImages.images[3], colX, rowY, pWidth, pHeight, qW, qH, qW, qH, rotated);
    }
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.line(colX, rowY + qH, colX + pWidth, rowY + qH);
    doc.line(colX + qW, rowY, colX + qW, rowY + pHeight);
    return;
  }

  // 2. Meia folha (Uma única imagem cortada ao meio / Meio formato A7: 74,25 × 52,5 mm)
  const isHalfTop = pageImages.hasImages && pageImages.layout === 'half' && pageImages.position !== 'bottom';
  const isHalfBottom = pageImages.hasImages && pageImages.layout === 'half' && pageImages.position === 'bottom';

  if (isHalfTop && pageImages.images[0]) {
    drawPanelImage(doc, pageImages.images[0], colX, rowY, pWidth, pHeight, 0, 0, pWidth, pHeight / 2, rotated);
    if (pageImages.caption) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(6.2);
      doc.setTextColor(240, 240, 240);
      const capPt = mapPoint(contentWidth / 2, pHeight / 2 - margin - 2);
      doc.text(pageImages.caption, capPt.x, capPt.y, { angle: capPt.angle, align: 'center' });
    }
  } else if (isHalfBottom && pageImages.images[0]) {
    drawPanelImage(doc, pageImages.images[0], colX, rowY, pWidth, pHeight, 0, pHeight / 2, pWidth, pHeight / 2, rotated);
    if (pageImages.caption) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(6.2);
      doc.setTextColor(240, 240, 240);
      const capPt = mapPoint(contentWidth / 2, pHeight - margin - 2);
      doc.text(pageImages.caption, capPt.x, capPt.y, { angle: capPt.angle, align: 'center' });
    }
  }

  // Render Panel Header (Topo) - Word Style
  if (hf.showHeader && !isHalfTop) {
    doc.setFont(fontName, 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(130, 130, 130);

    if (hf.headerLeft) {
      const p1 = mapPoint(0, 3);
      doc.text(hf.headerLeft, p1.x, p1.y, { angle: p1.angle, align: 'left' });
    }

    if (hf.headerCenter) {
      const pC = mapPoint(contentWidth / 2, 3);
      doc.text(hf.headerCenter, pC.x, pC.y, { angle: pC.angle, align: 'center' });
    }

    if (hf.headerRight) {
      const pNum = mapPoint(contentWidth, 3);
      doc.text(hf.headerRight, pNum.x, pNum.y, { angle: pNum.angle, align: 'right' });
    }

    // Subtle header separator line
    if (hf.showTopDivider) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.15);
      const lineStart = mapPoint(0, 4.5);
      const lineEnd = mapPoint(contentWidth, 4.5);
      doc.line(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y);
    }
  }

  // Cover Page
  if (isCover) {
    const hasCoverText = !!page.content?.trim();
    const titleY = isHalfTop ? 56 : isHalfBottom ? 12 : hasCoverText ? 13 : 32;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(titlePt + 2);
    doc.setTextColor(20, 20, 20);

    let currY = titleY;
    if (page.title?.trim()) {
      const splitTitle = doc.splitTextToSize(page.title.trim(), contentWidth);
      for (const tLine of splitTitle) {
        const pt = mapPoint(contentWidth / 2, currY);
        doc.text(tLine, pt.x, pt.y, { angle: pt.angle, align: 'center' });
        currY += lineHeightMm * 1.3;
      }
    }

    if (page.subtitle?.trim()) {
      currY += 2;
      doc.setFont(fontName, 'italic');
      doc.setFontSize(bodyPt);
      doc.setTextColor(90, 90, 90);
      const splitSub = doc.splitTextToSize(page.subtitle.trim(), contentWidth);
      for (const sLine of splitSub) {
        const pt = mapPoint(contentWidth / 2, currY);
        doc.text(sLine, pt.x, pt.y, { angle: pt.angle, align: 'center' });
        currY += lineHeightMm * 1.1;
      }
    }

    if (hasCoverText) {
      currY += 2;
      const maxY = isHalfBottom
        ? pHeight / 2 - margin - 2
        : page.author?.trim() ? contentHeight - 15 : contentHeight - 2;
      for (const item of parseMarkdownText(page.content || '')) {
        if (currY >= maxY) break;

        if (item.isQrCode && item.qrUrl) {
          currY = renderQrCodeBlock(
            doc, item, colX, rowY, pWidth, pHeight, margin,
            contentWidth, currY, maxY, rotated, fontName, mapPoint
          );
          continue;
        }

        if (item.isDivider) {
          doc.setDrawColor(210, 210, 210);
          doc.setLineWidth(0.2);
          const left = mapPoint(contentWidth * 0.15, currY);
          const right = mapPoint(contentWidth * 0.85, currY);
          doc.line(left.x, left.y, right.x, right.y);
          currY += lineHeightMm * 0.7;
          continue;
        }

        if (!item.text) {
          currY += lineHeightMm * 0.45;
          continue;
        }

        const heading = item.isHeading1 || item.isHeading2 || item.isHeading3;
        const fontSize = heading ? bodyPt + 0.5 : bodyPt - 0.5;
        const lines = layoutPdfSpans(
          doc, item.spans, contentWidth, fontName, heading ? 'bold' : 'normal', fontSize
        );
        const color: [number, number, number] = heading ? [30, 30, 30] : [60, 60, 60];
        for (const line of lines) {
          const height = pdfLineHeight(line, fontSize, lineHeightMm);
          if (currY + height > maxY) break;
          drawPdfSpans(
            doc, line, (contentWidth - line.width) / 2, currY,
            mapPoint, rotated, color, height
          );
          currY += height * 1.1;
        }
      }
    }

    if (page.author?.trim()) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(bodyPt - 0.5);
      doc.setTextColor(50, 50, 50);
      const authorY = isHalfBottom ? 42 : hasCoverText ? contentHeight - 7 : 75;
      const pt = mapPoint(contentWidth / 2, authorY);
      doc.text(page.author.trim().toUpperCase(), pt.x, pt.y, { angle: pt.angle, align: 'center' });
    }
  } else if (isBackCover) {
    // Back Cover Page (Contracapa)
    const parsedLines = parseMarkdownText(page.content || '');

    let maxY = isHalfBottom
      ? pHeight / 2 - margin - 2.0
      : page.dateOrPublisher?.trim()
      ? contentHeight - 7.0
      : contentHeight - 1.5;

    let minY = isHalfTop ? pHeight / 2 - margin + 3.0 : 8.0;
    let headingY = isHalfTop ? minY : 5.0;
    if (page.title?.trim()) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(Math.max(6.5, bodyPt - 1));
      doc.setTextColor(100, 100, 100);
      for (const line of doc.splitTextToSize(page.title.trim().toUpperCase(), contentWidth)) {
        const point = mapPoint(contentWidth / 2, headingY);
        doc.text(line, point.x, point.y, { angle: point.angle, align: 'center' });
        headingY += lineHeightMm;
      }
    }
    if (page.subtitle?.trim()) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(Math.max(6.5, bodyPt - 1));
      doc.setTextColor(100, 100, 100);
      headingY += 1;
      for (const line of doc.splitTextToSize(page.subtitle.trim(), contentWidth)) {
        const point = mapPoint(contentWidth / 2, headingY);
        doc.text(line, point.x, point.y, { angle: point.angle, align: 'center' });
        headingY += lineHeightMm;
      }
    }
    minY = Math.max(minY, headingY + 1.5);

    // Estimate total content height to vertically balance the back cover nicely
    let totalNeededH = 0;
    for (const item of parsedLines) {
      if (item.isQrCode && item.qrUrl) {
        const qrSizeMm = item.qrSize === 'sm' ? 16 : item.qrSize === 'lg' ? 24 : 19;
        totalNeededH += qrSizeMm + (item.qrCaption ? 5.5 : 2.5) + 3.8;
      } else if (!item.text) {
        totalNeededH += lineHeightMm * 0.5;
      } else if (hasInlineFontSize(item.spans)) {
        const heading = item.isHeading1 || item.isHeading2 || item.isHeading3;
        const fontSize = heading ? bodyPt + 0.5 : bodyPt - 0.5;
        const lines = layoutPdfSpans(doc, item.spans, contentWidth, fontName,
          heading ? 'bold' : 'italic', fontSize);
        totalNeededH += lines.reduce((height, line) =>
          height + pdfLineHeight(line, fontSize, lineHeightMm) * 1.15, 0);
      } else {
        const heading = item.isHeading1 || item.isHeading2 || item.isHeading3;
        doc.setFont(fontName, heading ? 'bold' : 'italic');
        doc.setFontSize(heading ? bodyPt + 0.5 : bodyPt - 0.5);
        const splitSub = doc.splitTextToSize(item.text, contentWidth);
        totalNeededH += splitSub.length * lineHeightMm * 1.15;
      }
    }

    const availableH = maxY - minY;
    let currY = minY + Math.max(0, (availableH - totalNeededH) / 2);

    for (const item of parsedLines) {
      if (currY >= maxY) break;

      // Phygital QR Code on Back Cover
      if (item.isQrCode && item.qrUrl) {
        currY = renderQrCodeBlock(
          doc,
          item,
          colX,
          rowY,
          pWidth,
          pHeight,
          margin,
          contentWidth,
          currY,
          maxY,
          rotated,
          fontName,
          mapPoint
        );
        continue;
      }

      if (!item.text) {
        currY += lineHeightMm * 0.5;
        continue;
      }

      if (item.isHeading1 || item.isHeading2 || item.isHeading3) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(bodyPt + 0.5);
        doc.setTextColor(30, 30, 30);
      } else {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(bodyPt - 0.5);
        doc.setTextColor(60, 60, 60);
      }

      if (item.isDivider) {
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.2);
        const pt1 = mapPoint(contentWidth * 0.15, currY);
        const pt2 = mapPoint(contentWidth * 0.85, currY);
        doc.line(pt1.x, pt1.y, pt2.x, pt2.y);
        currY += lineHeightMm * 0.7;
        continue;
      }

      if (hasInlineFontSize(item.spans)) {
        const heading = item.isHeading1 || item.isHeading2 || item.isHeading3;
        const fontSize = heading ? bodyPt + 0.5 : bodyPt - 0.5;
        const lines = layoutPdfSpans(doc, item.spans, contentWidth, fontName,
          heading ? 'bold' : 'italic', fontSize);
        const color: [number, number, number] = heading ? [30, 30, 30] : [60, 60, 60];
        for (const line of lines) {
          if (currY >= maxY) break;
          drawPdfSpans(doc, line, (contentWidth - line.width) / 2, currY,
            mapPoint, rotated, color, pdfLineHeight(line, fontSize, lineHeightMm));
          currY += pdfLineHeight(line, fontSize, lineHeightMm) * 1.15;
        }
        continue;
      }

      const cleanText = sanitizeForJsPdf(item.text);
      const splitContent = doc.splitTextToSize(cleanText, contentWidth);
      for (const line of splitContent) {
        if (currY >= maxY) break;
        const pt = mapPoint(contentWidth / 2, currY);
        doc.text(line, pt.x, pt.y, { angle: pt.angle, align: 'center' });
        currY += lineHeightMm * 1.15;
      }
    }

    if (page.dateOrPublisher?.trim()) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      const pt = mapPoint(contentWidth / 2, contentHeight - 3.5);
      doc.text(page.dateOrPublisher.trim(), pt.x, pt.y, { angle: pt.angle, align: 'center' });
    }
  } else {
    // Content Page - when Header is inactive, expand text directly into top margin (currY 2.8mm instead of 9mm)
    let currY = hf.showHeader
      ? 9.0
      : (settings.margin === 'compact' ? 2.2 : settings.margin === 'generous' ? 3.4 : 2.8);
    if (isHalfTop) {
      currY = Math.max(currY, pHeight / 2 - margin + 3.0);
    }

    if (page.title && page.title !== `Página ${page.editorialNumber}`) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(bodyPt + 1);
      doc.setTextColor(30, 30, 30);
      const splitTitle = doc.splitTextToSize(page.title, contentWidth);
      for (const tLine of splitTitle) {
        const pt = mapPoint(0, currY);
        doc.text(tLine, pt.x, pt.y, { angle: pt.angle, align: 'left' });
        currY += lineHeightMm * 1.2;
      }
      currY += 1.5;
    }

    const parsedLines = parseMarkdownText(page.content || '');
    // When Footer is inactive, expand text all the way to bottom margin (contentHeight - 0.6mm instead of -5mm)
    let maxY = hf.showFooter
      ? contentHeight - 5.0
      : contentHeight - (settings.margin === 'compact' ? 0.3 : settings.margin === 'generous' ? 1.0 : 0.6);
    if (isHalfBottom) {
      maxY = Math.min(maxY, pHeight / 2 - margin - 2.0);
    }

    for (const item of parsedLines) {
      if (currY >= maxY) break;

      // Render Phygital QR Code Block
      if (item.isQrCode && item.qrUrl) {
        currY = renderQrCodeBlock(
          doc,
          item,
          colX,
          rowY,
          pWidth,
          pHeight,
          margin,
          contentWidth,
          currY,
          maxY,
          rotated,
          fontName,
          mapPoint
        );
        continue;
      }

      if (item.isDivider) {
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.2);
        const pt1 = mapPoint(0, currY);
        const pt2 = mapPoint(contentWidth, currY);
        doc.line(pt1.x, pt1.y, pt2.x, pt2.y);
        currY += lineHeightMm * 0.7;
        continue;
      }

      // Table row (2 columns or multi-columns)
      if (item.isTableRow && item.tableCells && item.tableCells.length > 0) {
        if (currY >= maxY) break;
        const isHeader = !!item.isTableHeader;
        doc.setFont(fontName, isHeader ? 'bold' : 'normal');

        if (item.tableCells.some((cell) => hasInlineFontSize(cell.spans))) {
          const numCols = item.tableCells.length;
          const twoColumns = numCols === 2;
          const cellW = twoColumns ? (contentWidth - 2) / 2 : contentWidth / numCols;
          const fontSize = twoColumns ? (isHeader ? bodyPt : bodyPt - 0.3) : bodyPt - 0.7;
          const color: [number, number, number] = isHeader ? [20, 20, 20] : [45, 45, 45];
          let rowHeight = 0;

          item.tableCells.forEach((cell, column) => {
            const lines = layoutPdfSpans(doc, cell.spans, cellW, fontName,
              isHeader ? 'bold' : 'normal', fontSize);
            const columnX = twoColumns ? column * (cellW + 2) : column * cellW;
            const leftAligned = twoColumns || (column === 0 && numCols > 4);
            let cellY = currY;
            for (const line of lines) {
              if (cellY >= maxY) break;
              const lineX = columnX + (leftAligned ? 0 : (cellW - line.width) / 2);
              const height = pdfLineHeight(line, fontSize, lineHeightMm);
              drawPdfSpans(doc, line, lineX, cellY, mapPoint, rotated, color, height);
              cellY += height;
            }
            rowHeight = Math.max(rowHeight, cellY - currY);
          });

          currY += Math.max(rowHeight, lineHeightMm * (isHeader ? 1.05 : 0.95));
          continue;
        }

        if (item.tableCells.length === 2) {
          doc.setFontSize(isHeader ? bodyPt : bodyPt - 0.3);
          doc.setTextColor(isHeader ? 20 : 45, isHeader ? 20 : 45, isHeader ? 20 : 45);

          const colW = (contentWidth - 2) / 2;
          const clean0 = sanitizeForJsPdf(item.tableCells[0].text);
          const clean1 = sanitizeForJsPdf(item.tableCells[1].text);

          const pt0 = mapPoint(0, currY);
          const pt1 = mapPoint(colW + 2, currY);

          doc.text(clean0, pt0.x, pt0.y, { angle: pt0.angle, align: 'left', maxWidth: colW });
          doc.text(clean1, pt1.x, pt1.y, { angle: pt1.angle, align: 'left', maxWidth: colW });

          currY += lineHeightMm * (isHeader ? 1.05 : 0.95);
          continue;
        }

        // Multi-column table (e.g. Habit tracker)
        const numCols = item.tableCells.length;
        doc.setFontSize(bodyPt - 0.7);
        doc.setTextColor(isHeader ? 20 : 45, isHeader ? 20 : 45, isHeader ? 20 : 45);
        const cellW = contentWidth / numCols;

        for (let cIdx = 0; cIdx < numCols; cIdx++) {
          const clean = sanitizeForJsPdf(item.tableCells[cIdx].text);
          const isFirstCol = cIdx === 0 && numCols > 4;
          const xOffset = isFirstCol ? 0 : cIdx * cellW + cellW / 2;
          const cellPt = mapPoint(xOffset, currY);
          doc.text(clean, cellPt.x, cellPt.y, {
            angle: cellPt.angle,
            align: isFirstCol ? 'left' : 'center',
            maxWidth: cellW,
          });
        }

        currY += lineHeightMm * (isHeader ? 1.0 : 0.85);
        continue;
      }

      if (!item.text) {
        currY += lineHeightMm * 0.5;
        continue;
      }

      if (item.isHeading1 || item.isHeading2 || item.isHeading3) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(bodyPt + 0.5);
        doc.setTextColor(30, 30, 30);
      } else if (item.isBlockquote) {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(bodyPt - 0.2);
        doc.setTextColor(60, 60, 60);
      } else {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(bodyPt);
        doc.setTextColor(40, 40, 40);
      }

      const indent = item.isBullet ? 4 : item.isBlockquote ? 4 : 0;
      const availableWidth = contentWidth - indent;

      if (hasInlineFontSize(item.spans)) {
        const baseStyle = item.isHeading1 || item.isHeading2 || item.isHeading3
          ? 'bold' : item.isBlockquote ? 'italic' : 'normal';
        const baseFontSize = item.isHeading1 || item.isHeading2 || item.isHeading3
          ? bodyPt + 0.5 : item.isBlockquote ? bodyPt - 0.2 : bodyPt;
        const color: [number, number, number] = item.isHeading1 || item.isHeading2 || item.isHeading3
          ? [30, 30, 30] : item.isBlockquote ? [60, 60, 60] : [40, 40, 40];
        const richLines = layoutPdfSpans(doc, item.spans, availableWidth, fontName, baseStyle, baseFontSize);

        if (item.isBlockquote) {
          const quoteH = richLines.reduce((height, line) => height + pdfLineHeight(line, baseFontSize, lineHeightMm), 0);
          doc.setDrawColor(217, 119, 6);
          doc.setLineWidth(0.35);
          const from = mapPoint(1.2, currY - lineHeightMm * 0.7);
          const to = mapPoint(1.2, currY + quoteH - lineHeightMm * 0.7);
          doc.line(from.x, from.y, to.x, to.y);
        }

        for (let index = 0; index < richLines.length && currY < maxY; index++) {
          const line = richLines[index];
          if (item.isBullet && index === 0) {
            const point = mapPoint(0, currY);
            doc.setFont(fontName, 'normal');
            doc.setFontSize(bodyPt);
            doc.text('•', point.x, point.y, { angle: point.angle, align: 'left' });
          }
          drawPdfSpans(doc, line, indent, currY, mapPoint, rotated, color,
            pdfLineHeight(line, baseFontSize, lineHeightMm),
            settings.textAlign === 'justify' && !item.isHeading1 && !item.isHeading2 &&
            !item.isHeading3 && !item.isBullet && !item.isBlockquote && index < richLines.length - 1
              ? availableWidth : undefined);
          currY += pdfLineHeight(line, baseFontSize, lineHeightMm);
        }
        continue;
      }

      const cleanLineText = sanitizeForJsPdf(item.text);
      const splitSubLines = doc.splitTextToSize(cleanLineText, availableWidth);

      // Draw blockquote left border if blockquote item
      if (item.isBlockquote && splitSubLines.length > 0) {
        const quoteH = splitSubLines.length * lineHeightMm;
        doc.setDrawColor(217, 119, 6);
        doc.setLineWidth(0.35);
        if (!rotated) {
          doc.line(
            colX + margin + 1.2,
            rowY + margin + currY - lineHeightMm * 0.7,
            colX + margin + 1.2,
            rowY + margin + currY + quoteH - lineHeightMm * 0.7
          );
        } else {
          doc.line(
            colX + pWidth - margin - 1.2,
            rowY + pHeight - margin - currY + lineHeightMm * 0.7,
            colX + pWidth - margin - 1.2,
            rowY + pHeight - margin - (currY + quoteH) + lineHeightMm * 0.7
          );
        }
      }

      for (let sIdx = 0; sIdx < splitSubLines.length; sIdx++) {
        if (currY >= maxY) break;
        const sub = splitSubLines[sIdx];

        // 1. Draw highlight / code backgrounds BEFORE printing text
        for (const span of item.spans) {
          if (!span.text || (!span.highlight && span.type !== 'code')) continue;
          const idx = sub.indexOf(span.text);
          if (idx !== -1) {
            const before = sub.slice(0, idx);
            const beforeWidth = doc.getTextWidth(before);
            const spanWidth = doc.getTextWidth(span.text);
            const startX = indent + beforeWidth;

            if (span.highlight) {
              doc.setFillColor(254, 240, 138); // Soft yellow
            } else {
              doc.setFillColor(243, 244, 246); // Soft gray
            }

            if (!rotated) {
              const bgX = colX + margin + startX;
              const bgY = rowY + margin + currY - lineHeightMm * 0.72;
              doc.rect(bgX, bgY, spanWidth, lineHeightMm * 0.85, 'F');
            } else {
              const bgX = colX + pWidth - margin - startX - spanWidth;
              const bgY = rowY + pHeight - margin - currY - lineHeightMm * 0.28;
              doc.rect(bgX, bgY, spanWidth, lineHeightMm * 0.85, 'F');
            }
          }
        }

        // 2. Draw bullet if bullet item
        if (item.isBullet && sIdx === 0) {
          const bulletPt = mapPoint(0, currY);
          doc.text('•', bulletPt.x, bulletPt.y, { angle: bulletPt.angle, align: 'left' });
        }

        // 3. Render text subline
        const textPt = mapPoint(indent, currY);
        const shouldJustify =
          settings.textAlign === 'justify' &&
          !item.isHeading1 &&
          !item.isHeading2 &&
          !item.isHeading3 &&
          !item.isBullet &&
          !item.isBlockquote &&
          sIdx < splitSubLines.length - 1;

        if (shouldJustify) {
          doc.text(sub, textPt.x, textPt.y, {
            angle: textPt.angle,
            align: 'justify',
            maxWidth: availableWidth,
          });
        } else {
          doc.text(sub, textPt.x, textPt.y, { angle: textPt.angle, align: 'left' });
        }

        // 4. Draw links, underlines, and strikethroughs
        for (const span of item.spans) {
          if (!span.text) continue;
          const idx = sub.indexOf(span.text);
          if (idx === -1) continue;

          const before = sub.slice(0, idx);
          const beforeWidth = doc.getTextWidth(before);
          const spanWidth = doc.getTextWidth(span.text);
          const startX = indent + beforeWidth;

          if (!rotated) {
            const lineX = colX + margin + startX;
            const lineY = rowY + margin + currY;

            // Link
            if (span.type === 'link' && span.href && !span.isAnchor) {
              doc.link(lineX, lineY - lineHeightMm * 0.75, spanWidth, lineHeightMm, { url: span.href });
              const isFile = !!span.isFileLink;
              doc.setDrawColor(isFile ? 5 : 37, isFile ? 150 : 99, isFile ? 105 : 235);
              doc.setLineWidth(0.12);
              doc.line(lineX, lineY + 0.35, lineX + spanWidth, lineY + 0.35);
            }

            // Underline
            if (span.underline) {
              doc.setDrawColor(80, 80, 80);
              doc.setLineWidth(0.12);
              doc.line(lineX, lineY + 0.35, lineX + spanWidth, lineY + 0.35);
            }

            // Strikethrough
            if (span.strikethrough) {
              doc.setDrawColor(100, 100, 100);
              doc.setLineWidth(0.15);
              doc.line(lineX, lineY - lineHeightMm * 0.28, lineX + spanWidth, lineY - lineHeightMm * 0.28);
            }
          } else {
            const lineX = colX + pWidth - margin - startX - spanWidth;
            const lineY = rowY + pHeight - margin - currY;

            // Link
            if (span.type === 'link' && span.href && !span.isAnchor) {
              doc.link(lineX, lineY - lineHeightMm * 0.25, spanWidth, lineHeightMm, { url: span.href });
              const isFile = !!span.isFileLink;
              doc.setDrawColor(isFile ? 5 : 37, isFile ? 150 : 99, isFile ? 105 : 235);
              doc.setLineWidth(0.12);
              doc.line(lineX, lineY - 0.35, lineX + spanWidth, lineY - 0.35);
            }

            // Underline
            if (span.underline) {
              doc.setDrawColor(80, 80, 80);
              doc.setLineWidth(0.12);
              doc.line(lineX, lineY - 0.35, lineX + spanWidth, lineY - 0.35);
            }

            // Strikethrough
            if (span.strikethrough) {
              doc.setDrawColor(100, 100, 100);
              doc.setLineWidth(0.15);
              doc.line(lineX, lineY + lineHeightMm * 0.28, lineX + spanWidth, lineY + lineHeightMm * 0.28);
            }
          }
        }

        currY += lineHeightMm;
      }
    }
  }

  // Render Panel Footer (Rodapé) - Word Style
  if (hf.showFooter && !isHalfBottom) {
    doc.setFont(fontName, 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(130, 130, 130);

    const footerY = contentHeight - 1;

    if (hf.footerLeft) {
      const pF1 = mapPoint(0, footerY);
      doc.text(hf.footerLeft, pF1.x, pF1.y, { angle: pF1.angle, align: 'left' });
    }

    if (hf.footerCenter) {
      const pFC = mapPoint(contentWidth / 2, footerY);
      doc.text(hf.footerCenter, pFC.x, pFC.y, { angle: pFC.angle, align: 'center' });
    }

    if (hf.footerRight) {
      const pFNum = mapPoint(contentWidth, footerY);
      doc.text(hf.footerRight, pFNum.x, pFNum.y, { angle: pFNum.angle, align: 'right' });
    }

    // Subtle footer separator line
    if (hf.showFooterDivider) {
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.15);
      const fLineStart = mapPoint(0, contentHeight - 2.8);
      const fLineEnd = mapPoint(contentWidth, contentHeight - 2.8);
      doc.line(fLineStart.x, fLineStart.y, fLineEnd.x, fLineEnd.y);
    }
  }
}

function drawGuides(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  panelWidth: number,
  panelHeight: number,
  settings: BookSettings,
  drawSlit: boolean
) {
  if (settings.showFoldGuides && settings.foldGuideStyle !== 'none') {
    doc.setDrawColor(190, 190, 190);
    doc.setLineWidth(settings.foldGuideStyle === 'subtle' ? 0.1 : 0.2);

    if (settings.foldGuideStyle === 'dashed') {
      doc.setLineDashPattern([2, 2], 0);
    } else {
      doc.setLineDashPattern([], 0);
    }

    // Horizontal fold line across full width
    doc.line(0, panelHeight, pageWidth, panelHeight);

    // Vertical fold lines
    doc.line(panelWidth, 0, panelWidth, pageHeight);
    doc.line(panelWidth * 2, 0, panelWidth * 2, pageHeight);
    doc.line(panelWidth * 3, 0, panelWidth * 3, pageHeight);

    doc.setLineDashPattern([], 0);
  }

  // Minizine Cut Slit between col 1 and 3 along the horizontal center line
  if (drawSlit && settings.showCutGuide) {
    const slitStartX = panelWidth; // 74.25 mm
    const slitEndX = panelWidth * 3; // 222.75 mm
    const slitY = panelHeight; // 105.0 mm

    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.5);
    doc.line(slitStartX, slitY, slitEndX, slitY);

    // End cut ticks
    doc.line(slitStartX, slitY - 1.5, slitStartX, slitY + 1.5);
    doc.line(slitEndX, slitY - 1.5, slitEndX, slitY + 1.5);
  }
}
