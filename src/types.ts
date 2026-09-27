export type OutputMode =
  | 'front-only' // Somente frente: 8 páginas (1 folha A4)
  | 'poster-back' // Verso pôster: páginas 1-8 na frente e pôster A4 no verso
  | 'continuation-16p' // Continuação 16 páginas: páginas 1-8 na frente, 9-16 no verso (minizine duplex)
  | 'booklet-bound-16p'; // Caderno encadernado 16 páginas: 4 fólios A7 cortados e grampeados

export type PosterOrientation = 'portrait' | 'landscape';
export type PosterTheme = 'minimal' | 'literary' | 'vintage' | 'bold' | 'blueprint';

export interface PosterSettings {
  orientation: PosterOrientation;
  title: string;
  subtitle: string;
  author: string;
  bodyText: string;
  showCutSlitZone: boolean;
  theme: PosterTheme;
  backgroundImage?: string;
}

export type PageRole =
  | 'cover'
  | 'content'
  | 'transition'
  | 'continuation-cover'
  | 'back-cover'
  | 'poster';

export type PageLayoutMode = 'text' | 'art-full' | 'split-quote';

export type PageImageLayout = 'none' | 'full' | 'half' | 'two' | 'four';

export type PageFontSize =
  | 'inherit'
  | '6.5pt'
  | '7pt'
  | '7.5pt'
  | '8pt'
  | '8.5pt'
  | '9pt'
  | '9.5pt'
  | '10pt'
  | '10.5pt'
  | '11pt'
  | '11.5pt'
  | '12pt'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | (string & {})
  | number;

export interface PageDocument {
  id: number; // 1 to 16
  stableId: string;
  editorialNumber: number; // Page number shown to the reader
  title?: string;
  subtitle?: string;
  author?: string;
  content: string; // Markdown or plain text
  dateOrPublisher?: string;
  role: PageRole;
  layoutMode?: PageLayoutMode;
  backgroundImage?: string;
  customHeader?: string;
  customFooter?: string;
  fontSize?: PageFontSize; // Custom individual page font size override

  // Image Layout Fields (A7 Panel 74.25 x 105 mm)
  imageLayout?: PageImageLayout; // 'none' | 'full' (sangria total) | 'half' (meia folha) | 'two' (2 poses) | 'four' (4 poses)
  images?: string[]; // Array of image URLs or base64 data URLs: 1 for 'full'/'half', 2 for 'two', 4 for 'four'
  imagePosition?: 'top' | 'bottom'; // for 'half' layout (default 'top')
  imageCaption?: string;
}

// Backward compatibility alias
export type PageContent = PageDocument;

export const FONT_SIZE_OPTIONS = [
  { value: '6.5pt', label: '6.5 pt · Mínima' },
  { value: '7pt', label: '7.0 pt · Muito Pequena' },
  { value: '7.5pt', label: '7.5 pt · BuJo / Legenda' },
  { value: '8pt', label: '8.0 pt · Compacta' },
  { value: '8.5pt', label: '8.5 pt · Padrão A7' },
  { value: '9pt', label: '9.0 pt · Leitura Fina' },
  { value: '9.5pt', label: '9.5 pt · Moderada' },
  { value: '10pt', label: '10.0 pt · Média' },
  { value: '10.5pt', label: '10.5 pt · Confortável' },
  { value: '11pt', label: '11.0 pt · Ampliada' },
  { value: '11.5pt', label: '11.5 pt · Grande' },
  { value: '12pt', label: '12.0 pt · Destaque' },
] as const;

export type FontSizeOption = (typeof FONT_SIZE_OPTIONS)[number]['value'] | 'sm' | 'md' | 'lg';
export type FontFamilyOption = 'serif' | 'sans';
export type MarginOption = 'compact' | 'standard' | 'generous';
export type FoldGuideStyle = 'dashed' | 'subtle' | 'none';
export type TextDistributionMode = 'fill-first' | 'balanced';

export type HeaderSource = 'page-title' | 'book-title' | 'custom' | 'none';
export type FooterSource = 'book-title' | 'author' | 'page-title' | 'custom' | 'none';
export type PageNumberFormat = 'simple' | 'prefix' | 'fraction' | 'roman' | 'none';
export type PageNumberPosition = 'left' | 'center' | 'right' | 'none';
export type HeaderAlign = 'left' | 'center' | 'right';

export interface HeaderFooterSettings {
  // Topo (Cabeçalho)
  showTopHeader: boolean;
  topHeaderText: string;
  topHeaderSource: HeaderSource;
  topHeaderAlign: HeaderAlign;
  showTopPageNumber: boolean;
  showTopDivider: boolean;

  // Rodapé (Footer)
  showFooter: boolean;
  footerText: string;
  footerSource: FooterSource;
  pageNumberPosition: PageNumberPosition;
  pageNumberFormat: PageNumberFormat;
  showFooterDivider: boolean;

  // Word-style rules
  differentFirstPage: boolean; // Primeira página (capa) diferente: não exibe cabeçalho/rodapé
  hideOnBackCover: boolean;    // Oculta cabeçalho/rodapé na contracapa
}

export const DEFAULT_HEADER_FOOTER: HeaderFooterSettings = {
  showTopHeader: true,
  topHeaderText: '',
  topHeaderSource: 'page-title',
  topHeaderAlign: 'left',
  showTopPageNumber: true,
  showTopDivider: true,

  showFooter: true,
  footerText: '',
  footerSource: 'book-title',
  pageNumberPosition: 'right',
  pageNumberFormat: 'simple',
  showFooterDivider: true,

  differentFirstPage: true,
  hideOnBackCover: true,
};

export interface BookSettings {
  outputMode: OutputMode;
  posterSettings: PosterSettings;
  headerFooter: HeaderFooterSettings;
  fontSize: FontSizeOption;
  fontFamily: FontFamilyOption;
  margin: MarginOption;
  textAlign: 'left' | 'justify';
  lineHeight: 'normal' | 'relaxed';
  showFoldGuides: boolean;
  foldGuideStyle: FoldGuideStyle;
  showCutGuide: boolean;
  showPageNumbers: boolean;
  showPanelHeadersInPrint: boolean;
  coverStyle: 'classic' | 'modern' | 'minimal' | 'vintage';
  textDistributionMode?: TextDistributionMode;
}

export interface Volume {
  id: string;
  volumeNumber: number;
  title: string;
  subtitle: string;
  author: string;
  backCoverText: string;
  pages: PageDocument[];
}

export interface OverflowReport {
  isOverflowing: boolean;
  totalWords: number;
  capacityWords: number;
  excessWords: number;
  estimatedPagesNeeded: number;
  suggestedVolumes: number;
  pageCapacities: {
    pageId: number;
    wordCount: number;
    charCount: number;
    percentFull: number;
    status: 'empty' | 'good' | 'full' | 'overflow';
  }[];
}
