import { PageDocument, BookSettings, HeaderFooterSettings } from '../types';

export interface ComputedHeaderFooter {
  showHeader: boolean;
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  showTopDivider: boolean;

  showFooter: boolean;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  showFooterDivider: boolean;
}

function toRoman(num: number): string {
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i]) {
      roman += i;
      num -= lookup[i];
    }
  }
  return roman || String(num);
}

export function formatPageNumber(
  pageNumber: number,
  totalPages: number,
  format: HeaderFooterSettings['pageNumberFormat']
): string {
  if (format === 'none') return '';
  if (format === 'prefix') return `Pág. ${pageNumber}`;
  if (format === 'fraction') return `${pageNumber} / ${totalPages}`;
  if (format === 'roman') return toRoman(pageNumber);
  return `${pageNumber}`;
}

export function getHeaderFooterContent(
  page: PageDocument,
  totalPages: number,
  settings: BookSettings,
  bookTitle?: string,
  bookAuthor?: string
): ComputedHeaderFooter {
  const hf = settings.headerFooter || {
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

  const isCover = page.role === 'cover' || page.id === 1 || page.editorialNumber === 1;
  const isBackCover =
    page.role === 'back-cover' || page.id === totalPages || page.editorialNumber === totalPages;

  // Word option: Primeira Página Diferente
  if (isCover && hf.differentFirstPage) {
    return {
      showHeader: false,
      headerLeft: '',
      headerCenter: '',
      headerRight: '',
      showTopDivider: false,

      showFooter: false,
      footerLeft: '',
      footerCenter: '',
      footerRight: '',
      showFooterDivider: false,
    };
  }

  // Word option: Ocultar na Contracapa
  if (isBackCover && hf.hideOnBackCover) {
    return {
      showHeader: false,
      headerLeft: '',
      headerCenter: '',
      headerRight: '',
      showTopDivider: false,

      showFooter: false,
      footerLeft: '',
      footerCenter: '',
      footerRight: '',
      showFooterDivider: false,
    };
  }

  // Compute Header
  let showHeader = hf.showTopHeader;
  let headerLeft = '';
  let headerCenter = '';
  let headerRight = '';

  if (showHeader) {
    let resolvedText = '';
    if (page.customHeader !== undefined && page.customHeader.trim() !== '') {
      resolvedText = page.customHeader.trim();
    } else if (hf.topHeaderSource === 'page-title') {
      resolvedText = page.title?.trim() || '';
    } else if (hf.topHeaderSource === 'book-title') {
      resolvedText = bookTitle?.trim() || '';
    } else if (hf.topHeaderSource === 'custom') {
      resolvedText = hf.topHeaderText?.trim() || '';
    }

    const pageNumStr = hf.showTopPageNumber
      ? formatPageNumber(page.editorialNumber, totalPages, 'simple')
      : '';

    if (hf.topHeaderAlign === 'center') {
      headerCenter = resolvedText;
      headerRight = pageNumStr;
    } else if (hf.topHeaderAlign === 'right') {
      headerRight = resolvedText;
      headerLeft = pageNumStr;
    } else {
      // left
      headerLeft = resolvedText;
      headerRight = pageNumStr;
    }

    // If completely blank and no page number, hide header
    if (!headerLeft && !headerCenter && !headerRight) {
      showHeader = false;
    }
  }

  // Compute Footer
  let showFooter = hf.showFooter;
  let footerLeft = '';
  let footerCenter = '';
  let footerRight = '';

  if (showFooter) {
    let resolvedFooterText = '';
    if (page.customFooter !== undefined && page.customFooter.trim() !== '') {
      resolvedFooterText = page.customFooter.trim();
    } else if (hf.footerSource === 'book-title') {
      resolvedFooterText = bookTitle?.trim() || '';
    } else if (hf.footerSource === 'author') {
      resolvedFooterText = bookAuthor?.trim() || '';
    } else if (hf.footerSource === 'page-title') {
      resolvedFooterText = page.title?.trim() || '';
    } else if (hf.footerSource === 'custom') {
      resolvedFooterText = hf.footerText?.trim() || '';
    }

    const pageNumStr = formatPageNumber(page.editorialNumber, totalPages, hf.pageNumberFormat);

    if (hf.pageNumberPosition === 'center') {
      footerLeft = resolvedFooterText;
      footerCenter = pageNumStr;
    } else if (hf.pageNumberPosition === 'left') {
      footerLeft = pageNumStr;
      footerRight = resolvedFooterText;
    } else if (hf.pageNumberPosition === 'right') {
      footerLeft = resolvedFooterText;
      footerRight = pageNumStr;
    } else {
      // none
      footerCenter = resolvedFooterText;
    }

    // If completely blank, hide footer
    if (!footerLeft && !footerCenter && !footerRight) {
      showFooter = false;
    }
  }

  const showTopDivider =
    showHeader && hf.showTopDivider && !!(headerLeft || headerCenter || headerRight);
  const showFooterDivider =
    showFooter && hf.showFooterDivider && !!(footerLeft || footerCenter || footerRight);

  return {
    showHeader,
    headerLeft,
    headerCenter,
    headerRight,
    showTopDivider,

    showFooter,
    footerLeft,
    footerCenter,
    footerRight,
    showFooterDivider,
  };
}
