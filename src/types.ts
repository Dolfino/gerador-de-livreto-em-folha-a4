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

  // Image Layout Fields (A7 Panel 74.25 x 105 mm)
  imageLayout?: PageImageLayout; // 'none' | 'full' (sangria total) | 'half' (meia folha) | 'two' (2 poses) | 'four' (4 poses)
  images?: string[]; // Array of image URLs or base64 data URLs: 1 for 'full'/'half', 2 for 'two', 4 for 'four'
  imagePosition?: 'top' | 'bottom'; // for 'half' layout (default 'top')
  imageCaption?: string;
}

// Backward compatibility alias
export type PageContent = PageDocument;

export type FontSizeOption = 'sm' | 'md' | 'lg';
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
