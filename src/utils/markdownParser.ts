/**
 * Robust Markdown Parser for Minibook Generator.
 * Supports:
 * 1. Direct Links (Inline): [Text](https://url.com)
 * 2. Links with Title (Hover Text): [Text](https://url.com "Hover Title")
 * 3. Reference Links: [Text][ref] or [ref] with [ref]: https://url.com "Title"
 * 4. Internal Anchors: [Text](#anchor) paired with ## Heading (slugified ID)
 * 5. Autolinks: <https://url.com> and <email@domain.com>
 * 6. Inline Formatting: **bold**, *italic*, `code`
 */

import { expandTabs } from './textWhitespace';

export interface MarkdownSpan {
  type: 'text' | 'link' | 'code';
  text: string;
  href?: string;
  title?: string;
  isAnchor?: boolean;
  isExternal?: boolean;
  isFileLink?: boolean;
  fileExtension?: string;
  isAutolink?: boolean;
  isQrCode?: boolean;
  qrUrl?: string;
  qrCaption?: string;
  qrSize?: 'sm' | 'md' | 'lg';
  bold?: boolean;
  italic?: boolean;
  highlight?: boolean; // ==destacado==, <mark>, <span style="background-color: ...">
  strikethrough?: boolean; // ~~riscado~~
  underline?: boolean; // <u>sublinhado</u>
  fontSizeScale?: number; // <small> (0.82), <big> (1.25)
}

export interface TableCell {
  text: string;
  spans: MarkdownSpan[];
}

export interface ParsedLine {
  text: string; // Clean text stripped of markdown markup (safe for word count, measurements, jsPDF)
  raw: string; // Original markdown line
  isHeading1: boolean;
  isHeading2: boolean;
  isHeading3: boolean;
  isBullet: boolean;
  isBlockquote?: boolean; // > Citações em bloco
  isBold: boolean;
  isItalic: boolean;
  isReferenceDef?: boolean;
  isQrCode?: boolean; // Phygital QR Code line
  qrUrl?: string; // QR code target url (e.g. Google Drive folder)
  qrCaption?: string; // Label/caption for printed booklet
  qrSize?: 'sm' | 'md' | 'lg'; // 16mm, 20mm, 25mm
  anchorId?: string; // Slugified ID for internal anchors (#contact -> contact)
  spans: MarkdownSpan[];
  isTableRow?: boolean;
  isTableHeader?: boolean;
  isDivider?: boolean;
  tableCells?: TableCell[];
}

export interface MarkdownDocumentResult {
  lines: ParsedLine[];
  refMap: Map<string, { href: string; title?: string }>;
  headings: Array<{ text: string; level: number; anchorId: string }>;
}

export const KNOWN_FILE_EXTENSIONS = new Set([
  'pdf',
  'xlsx',
  'xls',
  'docx',
  'doc',
  'pptx',
  'ppt',
  'txt',
  'csv',
  'rtf',
  'odt',
  'ods',
  'odp',
  'md',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'bmp',
  'tif',
  'tiff',
  'mp3',
  'mp4',
  'wav',
  'ogg',
  'avi',
  'mov',
  'm4a',
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',
  'json',
  'xml',
  'html',
  'css',
  'js',
  'py',
]);

/**
 * Extracts file extension from a path: e.g. "planilha.xlsx" -> "xlsx"
 */
export function getFileExtension(path: string): string {
  const clean = path.split('?')[0].split('#')[0];
  const lastDot = clean.lastIndexOf('.');
  if (lastDot === -1) return '';
  return clean.slice(lastDot + 1).toLowerCase();
}

/**
 * Sanitizes a filename or relative path by replacing spaces with hyphens
 * and removing accents to prevent broken links in PDF readers:
 * e.g., "meu manual.pdf" -> "meu-manual.pdf"
 *       "anexos/gráfico técnico.png" -> "anexos/grafico-tecnico.png"
 */
export function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\s+/g, '-') // spaces to hyphen
    .replace(/[^a-zA-Z0-9.\-_/]/g, ''); // keep valid relative path characters
}

/**
 * Validates a relative file link according to the 3 Golden Rules:
 * 1. Extension is required (e.g. .pdf, .xlsx, .docx, .png)
 * 2. Avoid spaces and accents
 * 3. Do not use absolute OS drive paths (e.g. C:/ or /home/)
 */
export function validateRelativeFileLink(filepath: string): {
  isValid: boolean;
  error?: string;
  warning?: string;
  suggestion: string;
  extension: string;
  hasSpacesOrAccents: boolean;
  isAbsolutePath: boolean;
} {
  const trimmed = (filepath || '').trim();
  const ext = getFileExtension(trimmed);
  const isAbsolutePath =
    /^[a-zA-Z]:[\\/]/i.test(trimmed) ||
    /^\/(?:Users|home|root|var|etc|opt)\b/i.test(trimmed);

  const hasAccents = /[^\u0000-\u007F]/.test(trimmed);
  const hasSpaces = /\s/.test(trimmed);
  const hasSpacesOrAccents = hasAccents || hasSpaces;

  // Clean relative path without drive letters
  const cleanedFromAbs = trimmed
    .replace(/^[a-zA-Z]:[\\/][^\\/]*[\\/]/i, '')
    .replace(/^\/(?:home|Users)\/[^/]+\//, '');
  const suggestion = sanitizeFilename(cleanedFromAbs || 'anexo.pdf');

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Nome do arquivo não informado.',
      suggestion: 'anexo.pdf',
      extension: '',
      hasSpacesOrAccents: false,
      isAbsolutePath: false,
    };
  }

  if (isAbsolutePath) {
    return {
      isValid: false,
      error:
        'Caminhos absolutos do disco (como C:/ ou /home) não funcionam em outros computadores. Use apenas o caminho relativo (ex: planilha.xlsx ou anexos/relatorio.pdf).',
      suggestion,
      extension: ext,
      hasSpacesOrAccents,
      isAbsolutePath: true,
    };
  }

  if (!ext) {
    return {
      isValid: false,
      error:
        'A extensão é obrigatória (ex: .pdf, .xlsx, .docx, .png). Sem ela, o leitor não saberá com qual aplicativo abrir o arquivo.',
      suggestion: `${trimmed}.pdf`,
      extension: '',
      hasSpacesOrAccents,
      isAbsolutePath: false,
    };
  }

  if (hasSpacesOrAccents) {
    return {
      isValid: true,
      warning:
        'Espaços e acentos podem quebrar o link em alguns leitores de PDF. Recomendado usar hífens ou sublinhados.',
      suggestion,
      extension: ext,
      hasSpacesOrAccents: true,
      isAbsolutePath: false,
    };
  }

  return {
    isValid: true,
    suggestion,
    extension: ext,
    hasSpacesOrAccents: false,
    isAbsolutePath: false,
  };
}

export interface NormalizedUrlResult {
  href: string;
  isAnchor: boolean;
  isExternal: boolean;
  isFileLink: boolean;
  fileExtension?: string;
}

/**
 * Normalizes text to an anchor-friendly slug:
 * e.g., "Seção de Contato" -> "secao-de-contato"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Sanitizes and normalizes URLs and Relative File Links.
 * - Handles protocols (http, https, mailto, tel, #)
 * - Detects relative files (e.g., planilha.xlsx, grafico.png, anexos/relatorio.pdf)
 * - Automatically prepends https:// if user omits protocol for web domains (e.g. www.google.com)
 * - Disallows dangerous protocols (javascript:, data:, vbscript:)
 */
export function sanitizeAndNormalizeUrl(url: string): NormalizedUrlResult {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return { href: '#', isAnchor: true, isExternal: false, isFileLink: false };
  }

  // Internal anchor (#section)
  if (trimmed.startsWith('#')) {
    return { href: trimmed, isAnchor: true, isExternal: false, isFileLink: false };
  }

  // Security: block script execution
  if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
    return { href: '#', isAnchor: true, isExternal: false, isFileLink: false };
  }

  // Email or Phone
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return { href: trimmed, isAnchor: false, isExternal: true, isFileLink: false };
  }

  // Standard web protocol
  if (/^https?:\/\//i.test(trimmed)) {
    const ext = getFileExtension(trimmed);
    return {
      href: trimmed,
      isAnchor: false,
      isExternal: true,
      isFileLink: KNOWN_FILE_EXTENSIONS.has(ext),
      fileExtension: ext || undefined,
    };
  }

  // Check if it is a relative file link (e.g., planilha.xlsx, grafico.png, anexos/relatorio.pdf)
  const ext = getFileExtension(trimmed);
  const isKnownFile = KNOWN_FILE_EXTENSIONS.has(ext);
  const isRelativePath =
    trimmed.startsWith('./') ||
    trimmed.startsWith('../') ||
    (trimmed.includes('/') && !trimmed.includes('://'));

  if (isKnownFile || isRelativePath) {
    // If user mistakenly included absolute drive/home path, clean it to relative
    const cleanRelPath = trimmed
      .replace(/^[a-zA-Z]:[\\/][^\\/]*[\\/]/i, '')
      .replace(/^\/(?:home|Users)\/[^/]+\//, '');

    return {
      href: cleanRelPath,
      isAnchor: false,
      isExternal: false,
      isFileLink: true,
      fileExtension: ext || undefined,
    };
  }

  // Missing protocol on web domain (e.g., www.example.com or example.com/page)
  if (/^(?:www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i.test(trimmed)) {
    return { href: `https://${trimmed}`, isAnchor: false, isExternal: true, isFileLink: false };
  }

  // Relative link or fallback
  return { href: trimmed, isAnchor: false, isExternal: false, isFileLink: false };
}

// Regex for reference definitions like: [1]: https://google.com "Buscador Google"
const REF_DEF_REGEX = /^\s*\[([^\]]+)\]:\s*<?([^\s>]+)>?(?:\s+["'(]([^"'()]*)["')])?\s*$/;

/**
 * Extracts all reference link definitions in text.
 */
export function extractReferenceDefinitions(raw: string): Map<string, { href: string; title?: string }> {
  const map = new Map<string, { href: string; title?: string }>();
  if (!raw) return map;

  const lines = raw.split('\n');
  for (const line of lines) {
    const match = line.match(REF_DEF_REGEX);
    if (match) {
      const key = match[1].toLowerCase().trim();
      const norm = sanitizeAndNormalizeUrl(match[2]);
      map.set(key, { href: norm.href, title: match[3]?.trim() });
    }
  }
  return map;
}

/**
 * Helper to apply inline formatting to text, recursively handling nested formatting.
 */
function applyFormatSpans(
  rawInner: string,
  flags: Partial<MarkdownSpan>,
  refMap?: Map<string, { href: string; title?: string }>
): MarkdownSpan[] {
  // If rawInner has further markdown markers, tokenize recursively
  if (/[\[<`*_~=]/.test(rawInner)) {
    const subSpans = tokenizeMarkdownLine(rawInner, refMap);
    return subSpans.map((s) => ({
      ...s,
      bold: s.bold || flags.bold,
      italic: s.italic || flags.italic,
      highlight: s.highlight || flags.highlight,
      strikethrough: s.strikethrough || flags.strikethrough,
      underline: s.underline || flags.underline,
      fontSizeScale: flags.fontSizeScale || s.fontSizeScale,
    }));
  }
  return [
    {
      type: 'text',
      text: rawInner,
      ...flags,
    },
  ];
}

/**
 * Tokenizes a single line of text into MarkdownSpan items.
 * Strictly respects user requirement: no space between `]` and `(` for inline links.
 * Supports:
 * - Direct links, ref links, shortcut refs, autolinks (<url>, <email>)
 * - Native bold (**text**, __text__), italic (*text*, _text_), bold+italic (***text***, ___text___)
 * - Highlights: ==text==, <mark>text</mark>, <span style="background-color: ...">text</span>
 * - Inline code: `text`
 * - Strikethrough: ~~text~~
 * - Underline: <u>text</u>
 */
export function tokenizeMarkdownLine(
  text: string,
  refMap?: Map<string, { href: string; title?: string }>
): MarkdownSpan[] {
  const spans: MarkdownSpan[] = [];
  let remaining = expandTabs(text);

  // Patterns
  // 0. QR Code: [qr: Legenda](url) or ![qr: Legenda](url) or [qr: Legenda|lg](url) or [qr: Legenda|url]
  const qrInlineRegex = /^!?\[qr(?::\s*([^|\]]*?))?(?:\|(sm|md|lg))?\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/i;
  const qrPipeInlineRegex = /^!?\[qr(?::\s*([^|\]]*?))?\|(https?:\/\/[^\]\s]+)\]/i;
  const qrDirectUrlInlineRegex = /^!?\[qr:\s*(https?:\/\/[^\]\s]+)\]/i;
  // 1. Direct inline link: [text](url) or [text](url "title")
  const inlineLinkRegex = /^\[([^\]]+)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/;
  // 2. Reference link: [text][id]
  const refLinkRegex = /^\[([^\]]+)\]\[([^\]]*)\]/;
  // 3. Shortcut reference: [id]
  const shortcutRefRegex = /^\[([^\]]+)\](?![\[\(])/;
  // 4. Autolink URL: <https://...>
  const autolinkUrlRegex = /^<(https?:\/\/[^\s>]+)>/;
  // 5. Autolink Email: <email@domain.com>
  const autolinkEmailRegex = /^<([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>/;
  // 6. HTML <mark>: <mark>fundo amarelo</mark>
  const htmlMarkRegex = /^<mark(?:\s+[^>]*)?>([\s\S]*?)<\/mark>/i;
  // 7. HTML <u>: <u>texto sublinhado</u>
  const htmlUnderlineRegex = /^<u(?:\s+[^>]*)?>([\s\S]*?)<\/u>/i;
  // 7b. HTML <small>: <small>texto menor</small>
  const htmlSmallRegex = /^<small(?:\s+[^>]*)?>([\s\S]*?)<\/small>/i;
  // 7c. HTML <big>: <big>texto maior</big>
  const htmlBigRegex = /^<big(?:\s+[^>]*)?>([\s\S]*?)<\/big>/i;
  // 8. HTML <span style="...">: font-size, background-color, etc.
  const htmlSpanRegex = /^<span\s+style="([^"]*)"[^>]*>([\s\S]*?)<\/span>/i;
  // 9. Code: `code`
  const codeRegex = /^`([^`]+)`/;
  // 10. Bold & Italic: ***bold italic*** or ___bold italic___
  const boldAndItalicRegex = /^(?:\*\*\*([^*]+)\*\*\*|___([^_]+)___)/;
  // 11. Bold: **bold** or __bold__
  const boldRegex = /^(?:\*\*([^*]+)\*\*|__([^_]+)__)/;
  // 12. Highlight: ==texto destacado==
  const highlightRegex = /^==([^=]+)==/;
  // 13. Strikethrough: ~~texto riscado~~
  const strikethroughRegex = /^~~([^~]+)~~/;
  // 14. Italic: *italic* or _italic_
  const italicRegex = /^(?:\*([^*]+)\*|_([^_]+)_)/;

  while (remaining.length > 0) {
    let match: RegExpMatchArray | null;

    if ((match = remaining.match(qrInlineRegex))) {
      const caption = match[1]?.trim() || 'QR Code';
      const size = (match[2] as 'sm' | 'md' | 'lg') || 'md';
      const norm = sanitizeAndNormalizeUrl(match[3]);
      spans.push({
        type: 'link',
        text: caption,
        href: norm.href,
        title: match[4] || `Escanear com a câmera: ${caption}`,
        isExternal: true,
        isQrCode: true,
        qrUrl: norm.href,
        qrCaption: caption,
        qrSize: size,
      });
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(qrPipeInlineRegex))) {
      const caption = match[1]?.trim() || 'QR Code';
      const norm = sanitizeAndNormalizeUrl(match[2]);
      spans.push({
        type: 'link',
        text: caption,
        href: norm.href,
        title: `Escanear com a câmera: ${caption}`,
        isExternal: true,
        isQrCode: true,
        qrUrl: norm.href,
        qrCaption: caption,
        qrSize: 'md',
      });
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(qrDirectUrlInlineRegex))) {
      const norm = sanitizeAndNormalizeUrl(match[1]);
      spans.push({
        type: 'link',
        text: 'QR Code',
        href: norm.href,
        title: `Escanear com a câmera: ${norm.href}`,
        isExternal: true,
        isQrCode: true,
        qrUrl: norm.href,
        qrCaption: 'Acesse o Conteúdo Online',
        qrSize: 'md',
      });
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(inlineLinkRegex))) {
      const rawText = match[1];
      const norm = sanitizeAndNormalizeUrl(match[2]);
      let bold = false;
      let clean = rawText;
      if (rawText.startsWith('**') && rawText.endsWith('**')) {
        bold = true;
        clean = rawText.slice(2, -2);
      }
      spans.push({
        type: 'link',
        text: clean,
        href: norm.href,
        title: match[3] || undefined,
        isAnchor: norm.isAnchor,
        isExternal: norm.isExternal,
        isFileLink: norm.isFileLink,
        fileExtension: norm.fileExtension,
        bold,
      });
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(refLinkRegex))) {
      const rawText = match[1];
      const key = (match[2] || match[1]).toLowerCase().trim();
      const ref = refMap?.get(key);
      if (ref) {
        const norm = sanitizeAndNormalizeUrl(ref.href);
        spans.push({
          type: 'link',
          text: rawText,
          href: norm.href,
          title: ref.title,
          isAnchor: norm.isAnchor,
          isExternal: norm.isExternal,
          isFileLink: norm.isFileLink,
          fileExtension: norm.fileExtension,
        });
      } else {
        spans.push({ type: 'text', text: match[0] });
      }
      remaining = remaining.slice(match[0].length);
    } else if (
      (match = remaining.match(shortcutRefRegex)) &&
      refMap &&
      refMap.has(match[1].toLowerCase().trim())
    ) {
      const rawText = match[1];
      const key = rawText.toLowerCase().trim();
      const ref = refMap.get(key)!;
      const norm = sanitizeAndNormalizeUrl(ref.href);
      spans.push({
        type: 'link',
        text: rawText,
        href: norm.href,
        title: ref.title,
        isAnchor: norm.isAnchor,
        isExternal: norm.isExternal,
        isFileLink: norm.isFileLink,
        fileExtension: norm.fileExtension,
      });
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(autolinkUrlRegex))) {
      spans.push({
        type: 'link',
        text: match[1],
        href: match[1],
        isAnchor: false,
        isExternal: true,
        isFileLink: false,
        isAutolink: true,
      });
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(autolinkEmailRegex))) {
      spans.push({
        type: 'link',
        text: match[1],
        href: 'mailto:' + match[1],
        isAnchor: false,
        isExternal: true,
        isFileLink: false,
        isAutolink: true,
      });
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(htmlMarkRegex))) {
      spans.push(...applyFormatSpans(match[1], { highlight: true }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(htmlUnderlineRegex))) {
      spans.push(...applyFormatSpans(match[1], { underline: true }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(htmlSmallRegex))) {
      spans.push(...applyFormatSpans(match[1], { fontSizeScale: 0.82 }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(htmlBigRegex))) {
      spans.push(...applyFormatSpans(match[1], { fontSizeScale: 1.25 }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(htmlSpanRegex))) {
      const styleStr = match[1].toLowerCase();
      const inner = match[2];
      const highlight = /background(?:-color)?:\s*[^;"]+/.test(styleStr);
      let fontSizeScale: number | undefined = undefined;
      const fsMatch = styleStr.match(/font-size:\s*([^;"]+)/);
      if (fsMatch) {
        const val = fsMatch[1].trim();
        if (val.endsWith('%')) {
          const num = parseFloat(val);
          if (!isNaN(num)) fontSizeScale = num / 100;
        } else if (val.endsWith('em') || val.endsWith('rem')) {
          const num = parseFloat(val);
          if (!isNaN(num)) fontSizeScale = num;
        } else if (val.endsWith('pt') || val.endsWith('px')) {
          const num = parseFloat(val);
          if (!isNaN(num)) fontSizeScale = num / 10;
        }
      }
      spans.push(...applyFormatSpans(inner, { highlight, fontSizeScale }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(codeRegex))) {
      spans.push({ type: 'code', text: match[1] });
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(boldAndItalicRegex))) {
      const inner = match[1] || match[2];
      spans.push(...applyFormatSpans(inner, { bold: true, italic: true }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(boldRegex))) {
      const inner = match[1] || match[2];
      spans.push(...applyFormatSpans(inner, { bold: true }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(highlightRegex))) {
      spans.push(...applyFormatSpans(match[1], { highlight: true }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(strikethroughRegex))) {
      spans.push(...applyFormatSpans(match[1], { strikethrough: true }, refMap));
      remaining = remaining.slice(match[0].length);
    } else if ((match = remaining.match(italicRegex))) {
      const inner = match[1] || match[2];
      spans.push(...applyFormatSpans(inner, { italic: true }, refMap));
      remaining = remaining.slice(match[0].length);
    } else {
      // Find the index of the next potential markdown syntax character
      const nextSpecial = remaining.search(/[\[<`*_~=]/);
      if (nextSpecial === -1) {
        spans.push({ type: 'text', text: remaining });
        break;
      } else if (nextSpecial === 0) {
        spans.push({ type: 'text', text: remaining[0] });
        remaining = remaining.slice(1);
      } else {
        spans.push({ type: 'text', text: remaining.slice(0, nextSpecial) });
        remaining = remaining.slice(nextSpecial);
      }
    }
  }

  return spans;
}

/**
 * Main parser: transforms raw markdown into structured ParsedLine array.
 * Backward-compatible drop-in replacement for the original parseMarkdownText.
 */
export function parseMarkdownText(
  raw: string,
  externalRefMap?: Map<string, { href: string; title?: string }>
): ParsedLine[] {
  const result: ParsedLine[] = [];
  if (!raw) return result;

  const lines = raw.split('\n');

  // Build reference map (merging document-level and any external definitions)
  const docRefMap = extractReferenceDefinitions(raw);
  const combinedRefMap = new Map<string, { href: string; title?: string }>();
  if (externalRefMap) {
    externalRefMap.forEach((val, key) => combinedRefMap.set(key, val));
  }
  docRefMap.forEach((val, key) => combinedRefMap.set(key, val));

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this line is a reference link definition: e.g. [1]: https://google.com
    if (REF_DEF_REGEX.test(trimmed)) {
      result.push({
        text: '',
        raw: line,
        isHeading1: false,
        isHeading2: false,
        isHeading3: false,
        isBullet: false,
        isBold: false,
        isItalic: false,
        isReferenceDef: true,
        spans: [],
      });
      continue;
    }

    if (!trimmed) {
      result.push({
        text: '',
        raw: line,
        isHeading1: false,
        isHeading2: false,
        isHeading3: false,
        isBullet: false,
        isBold: false,
        isItalic: false,
        spans: [],
      });
      continue;
    }

    // Check if line is a QR Code block: [qr: Legenda](url) or ![qr: Legenda](url) or [qr: Legenda|size](url) or [qr: Legenda|url]
    const qrLineRegex = /^\s*!?\[qr(?::\s*([^|\]]*?))?(?:\|(sm|md|lg))?\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)\s*$/i;
    const qrPipeLineRegex = /^\s*!?\[qr(?::\s*([^|\]]*?))?\|(https?:\/\/[^\]\s]+)\]\s*$/i;
    const qrDirectUrlLineRegex = /^\s*!?\[qr:\s*(https?:\/\/[^\]\s]+)\]\s*$/i;

    const qrMatch = trimmed.match(qrLineRegex);
    const qrPipeMatch = !qrMatch ? trimmed.match(qrPipeLineRegex) : null;
    const qrDirectMatch = !qrMatch && !qrPipeMatch ? trimmed.match(qrDirectUrlLineRegex) : null;

    if (qrMatch || qrPipeMatch || qrDirectMatch) {
      let caption = 'Escaneie o QR Code com a Câmera';
      let size: 'sm' | 'md' | 'lg' = 'md';
      let norm = { href: '#' };
      let title = 'QR Code Phygital';

      if (qrMatch) {
        caption = qrMatch[1]?.trim() || 'Escaneie o QR Code com a Câmera';
        size = (qrMatch[2] as 'sm' | 'md' | 'lg') || 'md';
        norm = sanitizeAndNormalizeUrl(qrMatch[3]);
        title = qrMatch[4] || `QR Code Phygital: ${caption}`;
      } else if (qrPipeMatch) {
        caption = qrPipeMatch[1]?.trim() || 'Escaneie o QR Code com a Câmera';
        size = 'md';
        norm = sanitizeAndNormalizeUrl(qrPipeMatch[2]);
        title = `QR Code: ${caption}`;
      } else if (qrDirectMatch) {
        caption = 'Acesse o Conteúdo Online';
        size = 'md';
        norm = sanitizeAndNormalizeUrl(qrDirectMatch[1]);
        title = 'QR Code';
      }

      result.push({
        text: caption,
        raw: line,
        isHeading1: false,
        isHeading2: false,
        isHeading3: false,
        isBullet: false,
        isBold: false,
        isItalic: false,
        isQrCode: true,
        qrUrl: norm.href,
        qrCaption: caption,
        qrSize: size,
        spans: [
          {
            type: 'link',
            text: caption,
            href: norm.href,
            title,
            isExternal: true,
            isQrCode: true,
            qrUrl: norm.href,
            qrCaption: caption,
            qrSize: size,
          },
        ],
      });
      continue;
    }

    // Check horizontal rule / divider: ---, ***, ___
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed)) {
      result.push({
        text: '',
        raw: line,
        isHeading1: false,
        isHeading2: false,
        isHeading3: false,
        isBullet: false,
        isBold: false,
        isItalic: false,
        isDivider: true,
        spans: [],
      });
      continue;
    }

    // Check table separator line: |---|---| or |:---|:---|
    if (/^\s*\|?\s*:?-{2,}:?\s*\|(?:\s*:?-{2,}:?\s*\|?)*\s*$/.test(trimmed)) {
      // Mark previous table row as header
      for (let i = result.length - 1; i >= 0; i--) {
        if (result[i].isTableRow) {
          result[i].isTableHeader = true;
          break;
        }
        if (result[i].text || result[i].raw) break;
      }
      continue;
    }

    // Check table content row: | cell1 | cell2 | ...
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      const rawSegments = trimmed.slice(1, -1).split('|');
      if (rawSegments.length >= 2) {
        const tableCells = rawSegments.map((segment) => {
          const cellText = segment.trim();
          const cellSpans = tokenizeMarkdownLine(cellText, combinedRefMap);
          const cleanText = cellSpans.map((s) => s.text).join('');
          return { text: cleanText, spans: cellSpans };
        });

        result.push({
          text: tableCells.map((c) => c.text).join(' | '),
          raw: line,
          isHeading1: false,
          isHeading2: false,
          isHeading3: false,
          isBullet: false,
          isBold: false,
          isItalic: false,
          isTableRow: true,
          tableCells,
          spans: [],
        });
        continue;
      }
    }

    let isHeading1 = false;
    let isHeading2 = false;
    let isHeading3 = false;
    let isBullet = false;
    let isBlockquote = false;
    let contentToTokenize = line;
    let anchorId: string | undefined = undefined;

    if (trimmed.startsWith('# ')) {
      isHeading1 = true;
      contentToTokenize = line.replace(/^([ \t]*)# /, '$1');
      anchorId = slugify(contentToTokenize);
    } else if (trimmed.startsWith('## ')) {
      isHeading2 = true;
      contentToTokenize = line.replace(/^([ \t]*)## /, '$1');
      anchorId = slugify(contentToTokenize);
    } else if (trimmed.startsWith('### ')) {
      isHeading3 = true;
      contentToTokenize = line.replace(/^([ \t]*)### /, '$1');
      anchorId = slugify(contentToTokenize);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      isBullet = true;
      contentToTokenize = line.replace(/^([ \t]*)[-*] /, '$1');
    } else if (trimmed.startsWith('> ') || trimmed.startsWith('>')) {
      isBlockquote = true;
      contentToTokenize = line.replace(/^([ \t]*)>\s?/, '$1');
    }

    const spans = tokenizeMarkdownLine(contentToTokenize, combinedRefMap);
    const cleanText = spans.map((s) => s.text).join('');

    const isBold =
      isHeading1 ||
      isHeading2 ||
      isHeading3 ||
      (trimmed.startsWith('**') && trimmed.endsWith('**'));

    result.push({
      text: cleanText,
      raw: line,
      isHeading1,
      isHeading2,
      isHeading3,
      isBullet,
      isBlockquote,
      isBold,
      isItalic: false,
      anchorId,
      spans,
    });
  }

  return result;
}

/**
 * Returns plain clean text without markdown delimiters or reference definitions.
 */
export function getCleanMarkdownText(raw: string): string {
  const parsed = parseMarkdownText(raw);
  return parsed
    .filter((l) => !l.isReferenceDef)
    .map((l) => l.text)
    .join('\n');
}

/**
 * Counts actual readable words, excluding markdown markup and raw link URLs.
 */
export function countMarkdownWords(raw: string): number {
  const clean = getCleanMarkdownText(raw);
  return clean.split(/\s+/).filter(Boolean).length;
}

/**
 * Formatter helper for UI insert modals/toolbars.
 */
export function formatMarkdownLink(options: {
  type: 'inline' | 'title' | 'ref' | 'anchor' | 'autolink' | 'file' | 'qr';
  text: string;
  url: string;
  title?: string;
  refId?: string;
  autoSanitizeFile?: boolean;
  qrSize?: 'sm' | 'md' | 'lg';
}): { insertText: string; refDef?: string } {
  const { type, text, url, title, refId, autoSanitizeFile, qrSize } = options;

  switch (type) {
    case 'inline':
      return { insertText: `[${text || 'Link'}](${url})` };
    case 'title':
      return {
        insertText: `[${text || 'Link'}](${url}${title ? ` "${title}"` : ''})`,
      };
    case 'ref': {
      const id = refId || '1';
      return {
        insertText: `[${text || 'Link'}][${id}]`,
        refDef: `[${id}]: ${url}${title ? ` "${title}"` : ''}`,
      };
    }
    case 'anchor': {
      const targetAnchor = url.startsWith('#') ? url : `#${slugify(url)}`;
      return { insertText: `[${text || 'Ir para seção'}](${targetAnchor})` };
    }
    case 'autolink':
      return { insertText: `<${url}>` };
    case 'file': {
      const targetPath = autoSanitizeFile ? sanitizeFilename(url) : url;
      return { insertText: `[${text || 'Abrir Arquivo'}](${targetPath})` };
    }
    case 'qr': {
      const sizeSuffix = qrSize && qrSize !== 'md' ? `|${qrSize}` : '';
      return {
        insertText: `[qr: ${text || 'Pasta no Drive com Planilhas'}${sizeSuffix}](${url})`,
      };
    }
    default:
      return { insertText: `[${text || 'Link'}](${url})` };
  }
}
