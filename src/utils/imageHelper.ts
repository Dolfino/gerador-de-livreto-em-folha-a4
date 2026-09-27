/**
 * Image Layout & Management Helper for Minibook Generator.
 * Supports 4 distinct layout modes on the physical A7 panel (74.25 × 105 mm):
 * 1. Imagem na folha inteira (Sem bordas / Sangria total no A7)
 * 2. Meia folha (Uma única imagem ocupando metade do A7)
 * 3. Duas imagens na mesma folha (Dividida ao meio / Layout 2 por página)
 * 4. Quatro imagens na mesma folha (Dividida em quatro / Layout 4 por página / 4 poses)
 */

import { PageDocument, PageImageLayout } from '../types';

export interface ImageLayoutDefinition {
  id: PageImageLayout;
  name: string;
  alias: string;
  description: string;
  dimensionMm: string;
  slotsCount: number;
  iconType: 'full' | 'half' | 'two' | 'four';
}

export const IMAGE_LAYOUTS: ImageLayoutDefinition[] = [
  {
    id: 'full',
    name: 'Imagem na folha inteira (Sem bordas)',
    alias: 'Sangria total no A7 / Página inteira',
    description: 'A foto cobre todo o papel (74,25 × 105 mm) de ponta a ponta sem bordas brancas.',
    dimensionMm: '74,25 × 105,0 mm (100% da área)',
    slotsCount: 1,
    iconType: 'full',
  },
  {
    id: 'half',
    name: 'Meia folha (Meio formato A7)',
    alias: 'Imagem ocupando meia página do A7',
    description: 'A imagem preenche metade do papel (topo ou base), deixando a outra metade livre para textos e notas.',
    dimensionMm: '74,25 × 52,5 mm (50% da área)',
    slotsCount: 1,
    iconType: 'half',
  },
  {
    id: 'two',
    name: 'Duas imagens na mesma folha (Dividida ao meio)',
    alias: 'Layout 2 por página / Duas poses no mesmo A7',
    description: 'O papel A7 é dividido ao meio horizontalmente, posicionando uma imagem em cada metade.',
    dimensionMm: '2 poses de 74,25 × 52,5 mm',
    slotsCount: 2,
    iconType: 'two',
  },
  {
    id: 'four',
    name: 'Quatro imagens na mesma folha (Dividida em quatro)',
    alias: 'Layout 4 por página / Quatro poses no mesmo A7',
    description: 'O papel A7 é dividido em 4 partes iguais (grade 2×2), com uma imagem em cada quadrante.',
    dimensionMm: '4 quadrantes de 37,1 × 52,5 mm',
    slotsCount: 4,
    iconType: 'four',
  },
];

export interface SampleImagePreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

// Curated high quality sample images for instant 1-click preview
export const SAMPLE_IMAGES: SampleImagePreset[] = [
  {
    id: 'botanical-fern',
    name: 'Folhagem Botânica',
    category: 'Natureza',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'mountain-mist',
    name: 'Montanhas ao Amanhecer',
    category: 'Paisagem',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'architecture-stairs',
    name: 'Arquitetura Geométrica',
    category: 'Design',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'vintage-book',
    name: 'Papel & Tipografia Vintage',
    category: 'Editorial',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sea-waves',
    name: 'Ondas do Oceano',
    category: 'Marítimo',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'coffee-notebook',
    name: 'Caderno de Anotações',
    category: 'Oficina',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
  },
];

const imageCache = new Map<string, string>();

/**
 * Converts a browser File object to a base64 Data URL.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) resolve(res);
      else reject(new Error('Falha ao ler arquivo de imagem.'));
    };
    reader.onerror = () => reject(new Error('Erro ao converter arquivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Ensures an image URL is a Data URL for safe embedding into jsPDF without CORS issues.
 */
export async function ensureDataUrl(urlOrData: string): Promise<string> {
  if (!urlOrData) return '';
  if (urlOrData.startsWith('data:')) return urlOrData;

  const cached = imageCache.get(urlOrData);
  if (cached) return cached;

  if (typeof window === 'undefined') return urlOrData;

  try {
    const res = await fetch(urlOrData, { mode: 'cors' });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = (reader.result as string) || urlOrData;
        imageCache.set(urlOrData, result);
        resolve(result);
      };
      reader.onerror = () => resolve(urlOrData);
      reader.readAsDataURL(blob);
    });
  } catch {
    return urlOrData;
  }
}

/**
 * Regex patterns for markdown image layouts:
 * ![full](url) or ![sangria](url)
 * ![half](url) or ![meia](url)
 * ![two](url1, url2) or ![duas](url1, url2)
 * ![four](url1, url2, url3, url4) or ![quatro](url1, url2, url3, url4)
 */
const FULL_REGEX = /!\[(?:full|sangria|inteira)(?::\s*([^\]]*))?\]\(([^)]+)\)/i;
const HALF_REGEX = /!\[(?:half|meia|meio)(?::\s*([^\]]*))?\]\(([^)]+)\)/i;
const TWO_REGEX = /!\[(?:two|duas|2poses)(?::\s*([^\]]*))?\]\(([^)]+)\)/i;
const FOUR_REGEX = /!\[(?:four|quatro|4poses)(?::\s*([^\]]*))?\]\(([^)]+)\)/i;
const STANDARD_IMG_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/;

export interface ResolvedPageImages {
  layout: PageImageLayout;
  images: string[];
  position: 'top' | 'bottom';
  caption?: string;
  hasImages: boolean;
}

/**
 * Extracts and unifies images for a page, checking both PageDocument properties and Markdown content tags.
 */
export function resolvePageImages(page: PageDocument): ResolvedPageImages {
  // 1. Explicit properties on PageDocument take top priority
  if (page.imageLayout && page.imageLayout !== 'none' && page.images && page.images.length > 0) {
    const validImages = page.images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    if (validImages.length > 0) {
      return {
        layout: page.imageLayout,
        images: validImages,
        position: page.imagePosition || 'top',
        caption: page.imageCaption,
        hasImages: true,
      };
    }
  }

  // 2. Check markdown tags in content
  const content = page.content || '';

  // Check 4 poses
  const fourMatch = content.match(FOUR_REGEX);
  if (fourMatch) {
    const urls = fourMatch[2].split(/[,|\s]+/).map((u) => u.trim()).filter(Boolean);
    if (urls.length > 0) {
      return {
        layout: 'four',
        images: urls,
        position: 'top',
        caption: fourMatch[1]?.trim(),
        hasImages: true,
      };
    }
  }

  // Check 2 poses
  const twoMatch = content.match(TWO_REGEX);
  if (twoMatch) {
    const urls = twoMatch[2].split(/[,|\s]+/).map((u) => u.trim()).filter(Boolean);
    if (urls.length > 0) {
      return {
        layout: 'two',
        images: urls,
        position: 'top',
        caption: twoMatch[1]?.trim(),
        hasImages: true,
      };
    }
  }

  // Check half page
  const halfMatch = content.match(HALF_REGEX);
  if (halfMatch) {
    const url = halfMatch[2].trim();
    if (url) {
      return {
        layout: 'half',
        images: [url],
        position: page.imagePosition || 'top',
        caption: halfMatch[1]?.trim(),
        hasImages: true,
      };
    }
  }

  // Check full bleed
  const fullMatch = content.match(FULL_REGEX);
  if (fullMatch) {
    const url = fullMatch[2].trim();
    if (url) {
      return {
        layout: 'full',
        images: [url],
        position: 'top',
        caption: fullMatch[1]?.trim(),
        hasImages: true,
      };
    }
  }

  // Check standard markdown image
  const stdMatch = content.match(STANDARD_IMG_REGEX);
  if (stdMatch && !stdMatch[1].startsWith('qr')) {
    const url = stdMatch[2].trim();
    if (url) {
      return {
        layout: 'half',
        images: [url],
        position: 'top',
        caption: stdMatch[1]?.trim(),
        hasImages: true,
      };
    }
  }

  return {
    layout: 'none',
    images: [],
    position: 'top',
    hasImages: false,
  };
}

/**
 * Generates a clean markdown string for embedding image layouts in text.
 */
export function formatImageMarkdown(options: {
  layout: PageImageLayout;
  images: string[];
  caption?: string;
}): string {
  const { layout, images, caption } = options;
  if (!images || images.length === 0 || layout === 'none') return '';

  const capStr = caption ? `: ${caption}` : '';

  switch (layout) {
    case 'full':
      return `![sangria${capStr}](${images[0] || ''})`;
    case 'half':
      return `![meia${capStr}](${images[0] || ''})`;
    case 'two':
      return `![duas${capStr}](${images.slice(0, 2).join(', ')})`;
    case 'four':
      return `![quatro${capStr}](${images.slice(0, 4).join(', ')})`;
    default:
      return `![imagem${capStr}](${images[0] || ''})`;
  }
}
