/**
 * Phygital QR Code Helper for Minibook Generator.
 * Unites the physical printed A4 booklet sheet (offline, scanned by phone camera)
 * with digital cloud files, Google Drive, spreadsheets, and online content.
 */

import QRCode from 'qrcode';

// In-memory cache for generated QR code data URLs and SVGs
const qrDataUrlCache = new Map<string, string>();
const qrSvgCache = new Map<string, string>();

export type QrCodeSize = 'sm' | 'md' | 'lg';

export const QR_SIZES_MM: Record<QrCodeSize, number> = {
  sm: 16, // 16mm x 16mm - compact note
  md: 20, // 20mm x 20mm - standard recommended for reliable phone camera scanning
  lg: 25, // 25mm x 25mm - prominent display
};

export interface QrPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultCaption: string;
  exampleUrl: string;
  placeholder: string;
}

export const PHYGITAL_PRESETS: QrPreset[] = [
  {
    id: 'google-drive',
    name: 'Pasta do Google Drive',
    description: 'Acesse planilhas, arquivos complementares, modelos 3D ou PDFs na nuvem',
    icon: 'folder-cloud',
    defaultCaption: 'Pasta no Google Drive com Arquivos e Planilhas',
    exampleUrl: 'https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9?usp=sharing',
    placeholder: 'https://drive.google.com/drive/folders/...',
  },
  {
    id: 'cloud-file',
    name: 'Arquivo na Nuvem (OneDrive / Dropbox)',
    description: 'Download direto de planilha Excel, documento auxiliar ou anexo',
    icon: 'file-spreadsheet',
    defaultCaption: 'Baixar Planilha Auxiliar de Cálculos',
    exampleUrl: 'https://www.dropbox.com/s/exemplo/planilha.xlsx?dl=1',
    placeholder: 'https://onedrive.live.com/... ou https://dropbox.com/...',
  },
  {
    id: 'video',
    name: 'Vídeo / Aula Explicativa',
    description: 'Demonstração em vídeo no YouTube ou Vimeo que complementa o livreto',
    icon: 'play-circle',
    defaultCaption: 'Assistir ao Vídeo Tutorial Complementar',
    exampleUrl: 'https://youtube.com/watch?v=exemplo',
    placeholder: 'https://youtube.com/watch?v=... ou https://youtu.be/...',
  },
  {
    id: 'website',
    name: 'Site ou Repositório Online',
    description: 'Página oficial do autor, documentação no GitHub ou portal do projeto',
    icon: 'globe',
    defaultCaption: 'Visitar Repositório e Documentação Online',
    exampleUrl: 'https://github.com/autor/projeto',
    placeholder: 'https://seusite.com.br/artigo',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp / Contato Direto',
    description: 'Inicie conversa imediata ou acesse grupo da comunidade',
    icon: 'message-circle',
    defaultCaption: 'Fale Conosco via WhatsApp',
    exampleUrl: 'https://wa.me/5511999999999?text=Ol%C3%A1%2C%20li%20o%20minilivro!',
    placeholder: 'https://wa.me/5511999999999 ou link do grupo',
  },
];

/**
 * Generates an SVG string synchronously from any text or URL.
 * Vector-crisp at any magnification level.
 */
export function generateQrCodeSvg(
  text: string,
  options?: { margin?: number; darkColor?: string; lightColor?: string }
): string {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  const cacheKey = `${trimmed}_${options?.margin ?? 2}_${options?.darkColor ?? '#000'}_${options?.lightColor ?? '#fff'}`;
  const cached = qrSvgCache.get(cacheKey);
  if (cached) return cached;

  try {
    const qr = QRCode.create(trimmed, { errorCorrectionLevel: 'M' });
    const modSize = qr.modules.size;
    const margin = options?.margin ?? 2;
    const total = modSize + margin * 2;
    const darkColor = options?.darkColor ?? '#000000';
    const lightColor = options?.lightColor ?? '#ffffff';

    let path = '';
    for (let r = 0; r < modSize; r++) {
      for (let c = 0; c < modSize; c++) {
        if (qr.modules.get(r, c)) {
          path += `M${c + margin} ${r + margin}h1v1h-1z `;
        }
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" fill="none" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="${lightColor}"/>
  <path d="${path.trim()}" fill="${darkColor}"/>
</svg>`;

    qrSvgCache.set(cacheKey, svg);
    return svg;
  } catch (err) {
    console.error('Erro ao gerar SVG do QR Code:', err);
    return '';
  }
}

export async function ensureQrDataUrl(text: string, size = 256): Promise<string> {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  const cacheKey = `${trimmed}_${size}`;
  const cached = qrDataUrlCache.get(cacheKey);
  if (cached) return cached;

  try {
    const dataUrl = await QRCode.toDataURL(trimmed, {
      margin: 2,
      errorCorrectionLevel: 'M',
      width: size,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    qrDataUrlCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error('Erro ao gerar QR Code Data URL com QRCode.toDataURL:', err);
    return generateQrDataUrlSync(trimmed, size);
  }
}

/**
 * Generates a PNG Data URL synchronously using an offscreen canvas in browser.
 * Fallback to 1x1 transparent png if canvas is unavailable.
 */
export function generateQrDataUrlSync(text: string, size = 256): string {
  const trimmed = (text || '').trim();
  if (!trimmed) return '';

  const cacheKey = `${trimmed}_${size}`;
  const cached = qrDataUrlCache.get(cacheKey);
  if (cached) return cached;

  if (typeof document === 'undefined') {
    return '';
  }

  try {
    const qr = QRCode.create(trimmed, { errorCorrectionLevel: 'M' });
    const modSize = qr.modules.size;
    const margin = 2; // quiet zone modules
    const totalCols = modSize + margin * 2;
    const cellSize = Math.max(2, Math.floor(size / totalCols));
    const canvasSize = cellSize * totalCols;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw black QR modules
    ctx.fillStyle = '#000000';
    for (let r = 0; r < modSize; r++) {
      for (let c = 0; c < modSize; c++) {
        if (qr.modules.get(r, c)) {
          ctx.fillRect((c + margin) * cellSize, (r + margin) * cellSize, cellSize, cellSize);
        }
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    qrDataUrlCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch (err) {
    console.error('Erro ao gerar Data URL síncrono do QR Code:', err);
    return '';
  }
}

/**
 * Formats a QR code markdown tag.
 * Syntax: [qr: Legenda|tamanho](url)
 * e.g. [qr: Pasta no Drive com Planilhas|md](https://drive.google.com/...)
 */
export function formatQrCodeMarkdown(options: {
  caption: string;
  url: string;
  size?: QrCodeSize;
}): string {
  const { caption, url, size = 'md' } = options;
  const cleanCaption = caption.trim() || 'Escaneie o QR Code com o Celular';
  const cleanUrl = url.trim();
  const sizeSuffix = size !== 'md' ? `|${size}` : '';

  return `[qr: ${cleanCaption}${sizeSuffix}](${cleanUrl})`;
}
