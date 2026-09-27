import { BookSettings, OverflowReport, PageDocument, OutputMode, FontSizeOption } from '../types';
import { countMarkdownWords } from './markdownParser';

export const FONT_CAPACITIES: Record<string, { words: number; chars: number; maxSafeWords: number }> = {
  sm: { words: 175, chars: 1100, maxSafeWords: 195 },
  md: { words: 145, chars: 900, maxSafeWords: 165 },
  lg: { words: 115, chars: 700, maxSafeWords: 130 },
};

export interface DynamicPageCapacity {
  words: number;
  chars: number;
  maxSafeWords: number;
  isExpanded: boolean;
  headerInactive: boolean;
  footerInactive: boolean;
  gainPercent: number;
  additionalWords: number;
}

/**
 * Resolves the effective font size in typographic points (pt) for a specific page,
 * respecting individual page overrides or falling back to the book's global settings.
 */
export function getPageFontSizePt(
  page?: PageDocument | null,
  settings?: BookSettings | null
): number {
  if (page?.fontSize && page.fontSize !== 'inherit') {
    if (typeof page.fontSize === 'number') return page.fontSize;
    const str = String(page.fontSize).trim().toLowerCase();
    if (str === 'xs') return 7.5;
    if (str === 'sm') return 8.5;
    if (str === 'md') return 10.0;
    if (str === 'lg') return 11.5;
    const match = str.match(/^([\d.]+)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val >= 5 && val <= 24) return val;
    }
  }

  // Fallback to book's global setting
  if (settings?.fontSize === 'sm') return 8.5;
  if (settings?.fontSize === 'lg') return 11.5;
  return 10.0;
}

/**
 * Calculates page capacity dynamically taking into account:
 * - Font size (sm, md, lg, or individual page pt override)
 * - Line height (normal, relaxed)
 * - Margins (compact, standard, generous)
 * - Header/Footer active states: when the header or footer is inactive,
 *   the text area expands vertically to take advantage of the unused top/bottom margin.
 */
export function getPageCapacity(settings: BookSettings, page?: PageDocument): DynamicPageCapacity {
  const effectivePt = getPageFontSizePt(page, settings);
  const ptRatio = 10.0 / effectivePt;
  const scaledWords = Math.round(145 * Math.pow(ptRatio, 1.2));
  const scaledChars = Math.round(900 * Math.pow(ptRatio, 1.2));
  const scaledMaxSafe = Math.round(165 * Math.pow(ptRatio, 1.2));

  const base = { words: scaledWords, chars: scaledChars, maxSafeWords: scaledMaxSafe };
  let multiplier = 1.0;

  const hf = settings.headerFooter;
  const isHeaderActive = hf ? hf.showTopHeader : true;
  const isFooterActive = hf ? hf.showFooter : true;

  // Header inactive: text block expands into top margin (+10%)
  if (!isHeaderActive) {
    multiplier += 0.10;
  }

  // Footer inactive: text block expands into bottom margin (+9%)
  if (!isFooterActive) {
    multiplier += 0.09;
  }

  // Margin adjustment
  if (settings.margin === 'compact') {
    multiplier += 0.08;
  } else if (settings.margin === 'generous') {
    multiplier -= 0.10;
  }

  // Line height adjustment
  if (settings.lineHeight === 'relaxed') {
    multiplier -= 0.07;
  }

  const words = Math.round(base.words * multiplier);
  const chars = Math.round(base.chars * multiplier);
  const maxSafeWords = Math.round(base.maxSafeWords * multiplier);
  const isExpanded = (!isHeaderActive || !isFooterActive);
  const gainPercent = Math.round((multiplier - 1.0) * 100);
  const additionalWords = Math.max(0, words - base.words);

  return {
    words,
    chars,
    maxSafeWords,
    isExpanded,
    headerInactive: !isHeaderActive,
    footerInactive: !isFooterActive,
    gainPercent,
    additionalWords,
  };
}

/**
 * Ensures internal content pages leave the page title blank by default,
 * avoiding auto-generated 'Página X' headers unless user explicitly typed a custom title.
 */
export const cleanPageTitle = (existingTitle?: string): string => {
  if (!existingTitle) return '';
  if (/^P[áa]gina\s+\d+$/i.test(existingTitle.trim())) return '';
  return existingTitle.trim();
};

export interface TextSemanticUnit {
  text: string;
  wordCount: number;
  isHeading: boolean;
  isParagraphStart: boolean;
  isClause?: boolean;
}

/**
 * Splits text into logical semantic units (sentences, list items, headings)
 * while preserving paragraph structure. For long sentences (>28 words),
 * sub-splits on natural punctuation clauses (, ; : —) to ensure smooth,
 * dynamic text flow across adjacent pages.
 */
export function splitIntoSemanticUnits(rawText: string): TextSemanticUnit[] {
  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];

  const rawParagraphs = normalized.split(/\n{2,}/);
  const units: TextSemanticUnit[] = [];

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Is Heading?
    if (
      trimmed.startsWith('#') ||
      (trimmed.length < 50 && trimmed.startsWith('**') && trimmed.endsWith('**'))
    ) {
      units.push({
        text: trimmed,
        wordCount: countMarkdownWords(trimmed),
        isHeading: true,
        isParagraphStart: true,
      });
      continue;
    }

    // Is Reference link definition (e.g. [1]: https://google.com "Title")?
    if (/^\s*\[[^\]]+\]:\s*<?\S+/.test(trimmed)) {
      units.push({
        text: trimmed,
        wordCount: 0,
        isHeading: false,
        isParagraphStart: true,
      });
      continue;
    }

    // Is Markdown list?
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const listLines = trimmed.split('\n');
      for (let lIdx = 0; lIdx < listLines.length; lIdx++) {
        const lTrimmed = listLines[lIdx].trim();
        if (!lTrimmed) continue;
        units.push({
          text: lTrimmed,
          wordCount: countMarkdownWords(lTrimmed),
          isHeading: false,
          isParagraphStart: true,
        });
      }
      continue;
    }

    // Is Blockquote?
    if (trimmed.startsWith('>')) {
      units.push({
        text: trimmed,
        wordCount: countMarkdownWords(trimmed),
        isHeading: false,
        isParagraphStart: true,
      });
      continue;
    }

    // Regular paragraph: split into sentences while preserving sentence punctuation.
    // Mask markdown links, reference links, autolinks and raw URLs so their punctuation does not break sentences.
    const linkTokens: string[] = [];
    const masked = trimmed.replace(
      /\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)|\[([^\]]+)\]\[[^\]]*\]|<(?:https?:\/\/[^\s>]+|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>|https?:\/\/\S+/g,
      (match) => {
        const placeholder = `___MDTOKEN_${linkTokens.length}___`;
        linkTokens.push(match);
        return placeholder;
      }
    );

    const sentenceRegex = /([^.?!]+[.?!]+["'”»\s]*|[^.?!]+$)/g;
    const rawMatches = masked.match(sentenceRegex) || [masked];
    const matches = rawMatches.map((s) =>
      s.replace(/___MDTOKEN_(\d+)___/g, (_, idx) => linkTokens[Number(idx)] || '')
    );

    let isFirstInPara = true;
    for (const match of matches) {
      const sentence = match.trim();
      if (!sentence) continue;

      const words = countMarkdownWords(sentence);

      // If sentence is unusually long (> 28 words), split on natural punctuation clauses
      if (words > 28) {
        // Protect links during clause splitting too
        const clauseTokens: string[] = [];
        const maskedSentence = sentence.replace(
          /\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)|\[([^\]]+)\]\[[^\]]*\]|<(?:https?:\/\/[^\s>]+|[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)>|https?:\/\/\S+/g,
          (m) => {
            const pl = `___MDCLAUSE_${clauseTokens.length}___`;
            clauseTokens.push(m);
            return pl;
          }
        );

        const rawClauseParts = maskedSentence.split(/(?<=[,;:\u2014])\s+/);
        if (rawClauseParts.length > 1) {
          const clauseParts = rawClauseParts.map((cp) =>
            cp.replace(/___MDCLAUSE_(\d+)___/g, (_, i) => clauseTokens[Number(i)] || '')
          );

          for (let cIdx = 0; cIdx < clauseParts.length; cIdx++) {
            const cp = clauseParts[cIdx].trim();
            if (!cp) continue;
            units.push({
              text: cp,
              wordCount: countMarkdownWords(cp),
              isHeading: false,
              isParagraphStart: isFirstInPara && cIdx === 0,
              isClause: cIdx > 0,
            });
          }
          isFirstInPara = false;
          continue;
        }
      }

      units.push({
        text: sentence,
        wordCount: words,
        isHeading: false,
        isParagraphStart: isFirstInPara,
      });
      isFirstInPara = false;
    }
  }

  return units;
}

/**
 * Legacy block splitter kept for compatibility
 */
export function splitIntoBlocks(rawText: string): string[] {
  const units = splitIntoSemanticUnits(rawText);
  return units.map((u) => u.text);
}

/**
 * Balanced, proportional text distribution across all internal pages.
 * Uses dynamic programming globally balanced partitioning to ensure
 * all pages receive virtually identical word counts without gaps,
 * without orphan headings, and without premature page breaks.
 */
export function balanceTextAcrossPages(
  rawText: string,
  internalPageCount: number,
  maxWordsPerPage: number,
  targetWordsPerPage: number
): {
  pageTexts: string[];
  overflowText: string;
} {
  const units = splitIntoSemanticUnits(rawText);
  if (units.length === 0) {
    return {
      pageTexts: Array(internalPageCount).fill(''),
      overflowText: '',
    };
  }

  const totalWords = units.reduce((acc, u) => acc + u.wordCount, 0);
  const totalBookCapacity = maxWordsPerPage * internalPageCount;

  // If text genuinely exceeds total capacity of all pages combined,
  // cut the excess to overflowText so that the placed pages are 100% full and balanced.
  let unitsToPlaceCount = units.length;
  if (totalWords > totalBookCapacity) {
    let accumulated = 0;
    unitsToPlaceCount = 0;
    for (let i = 0; i < units.length; i++) {
      if (accumulated + units[i].wordCount > totalBookCapacity) {
        break;
      }
      accumulated += units[i].wordCount;
      unitsToPlaceCount++;
    }
    unitsToPlaceCount = Math.max(internalPageCount, unitsToPlaceCount);
  }

  const placedUnits = units.slice(0, unitsToPlaceCount);
  const unplacedUnits = units.slice(unitsToPlaceCount);

  const placedWords = placedUnits.reduce((acc, u) => acc + u.wordCount, 0);
  const targetPerBlock = Math.max(10, placedWords / internalPageCount);

  // Dynamic programming: dp[k][i] = min penalty to place first i units into k pages
  const K = internalPageCount;
  const N = placedUnits.length;

  // Prefix sums of words
  const prefixWords = new Array(N + 1).fill(0);
  for (let i = 0; i < N; i++) {
    prefixWords[i + 1] = prefixWords[i] + placedUnits[i].wordCount;
  }

  const dp: number[][] = Array.from({ length: K + 1 }, () => new Array(N + 1).fill(Infinity));
  const parent: number[][] = Array.from({ length: K + 1 }, () => new Array(N + 1).fill(0));

  dp[0][0] = 0;

  for (let k = 1; k <= K; k++) {
    for (let i = 1; i <= N; i++) {
      // Must leave enough units for remaining pages and previous pages
      const minPrev = k === 1 ? 0 : k - 1;
      const maxPrev = i - 1;

      for (let prev = minPrev; prev <= maxPrev; prev++) {
        if (dp[k - 1][prev] === Infinity) continue;

        const w = prefixWords[i] - prefixWords[prev];
        if (w === 0) continue;

        // Base penalty: difference squared from ideal target
        let cost = Math.pow(w - targetPerBlock, 2);

        // Penalty for exceeding max safe capacity
        if (w > maxWordsPerPage) {
          cost += Math.pow(w - maxWordsPerPage, 2) * 60;
        }

        // Severe penalty for orphan heading at bottom of page
        const lastUnit = placedUnits[i - 1];
        if (lastUnit.isHeading && i < N) {
          cost += 30000;
        }

        // Bonus for starting page with heading
        const firstUnit = placedUnits[prev];
        if (firstUnit.isHeading) {
          cost -= 80;
        }

        // Bonus for ending on a paragraph break (next unit is paragraph start)
        if (i < N && placedUnits[i].isParagraphStart) {
          cost -= 120;
        }

        // Slight penalty for ending mid-sentence at a clause
        if (lastUnit.isClause) {
          cost += 35;
        }

        const totalCost = dp[k - 1][prev] + cost;
        if (totalCost < dp[k][i]) {
          dp[k][i] = totalCost;
          parent[k][i] = prev;
        }
      }
    }
  }

  // Reconstruct partition points
  const cuts: number[] = new Array(K + 1).fill(0);
  cuts[K] = N;
  for (let k = K; k >= 1; k--) {
    cuts[k - 1] = parent[k][cuts[k]];
  }

  // Format page texts
  const pageTexts: string[] = [];
  for (let k = 0; k < K; k++) {
    const start = cuts[k];
    const end = cuts[k + 1];
    const pUnits = placedUnits.slice(start, end);

    let text = '';
    for (let u = 0; u < pUnits.length; u++) {
      const unit = pUnits[u];
      if (u === 0) {
        text = unit.text;
      } else if (unit.isParagraphStart || unit.isHeading) {
        text += '\n\n' + unit.text;
      } else {
        text += ' ' + unit.text;
      }
    }
    pageTexts.push(text.trim());
  }

  // Format overflow text
  let overflowText = '';
  for (let u = 0; u < unplacedUnits.length; u++) {
    const unit = unplacedUnits[u];
    if (u === 0) {
      overflowText = unit.text;
    } else if (unit.isParagraphStart || unit.isHeading) {
      overflowText += '\n\n' + unit.text;
    } else {
      overflowText += ' ' + unit.text;
    }
  }

  return {
    pageTexts,
    overflowText: overflowText.trim(),
  };
}

/**
 * Calculates the effective vertical space weight of a unit in words-equivalent.
 * Headings (H1, H2, H3) and paragraph breaks consume additional vertical height
 * on physical paper (A7 format: 74.25 x 105mm).
 */
export function getUnitVerticalWeight(unit: TextSemanticUnit): number {
  let weight = unit.wordCount;
  if (unit.isHeading) {
    if (unit.text.startsWith('# ')) {
      weight += 22; // H1 takes ~3 lines equivalent + margins
    } else if (unit.text.startsWith('## ')) {
      weight += 15; // H2 takes ~2 lines equivalent
    } else if (unit.text.startsWith('### ')) {
      weight += 10;
    } else {
      weight += 12;
    }
  } else if (unit.isParagraphStart) {
    weight += 5; // Vertical spacing between paragraphs (\n\n)
  }
  return weight;
}

/**
 * Fills internal pages sequentially to their complete safe capacity.
 * The first pages are filled to the brim (~85-95 words for md, ~110-125 for sm),
 * and remaining pages at the end are left completely blank/empty if text ends early.
 * Directly fulfills the user requirement:
 * "preencher as primeiras páginas por completo, sem problema para as páginas finais ficarem vazias"
 */
export function fillPagesSequentially(
  rawText: string,
  internalPageCount: number,
  maxWordsPerPage: number,
  targetWordsPerPage: number
): {
  pageTexts: string[];
  overflowText: string;
} {
  const units = splitIntoSemanticUnits(rawText);
  if (units.length === 0) {
    return {
      pageTexts: Array(internalPageCount).fill(''),
      overflowText: '',
    };
  }

  const pageUnits: TextSemanticUnit[][] = Array.from({ length: internalPageCount }, () => []);
  let currentPage = 0;
  let currentWords = 0;
  let currentEffectiveWords = 0;
  const unplacedUnits: TextSemanticUnit[] = [];

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];

    // If all internal pages are full, remaining text overflows
    if (currentPage >= internalPageCount) {
      unplacedUnits.push(unit);
      continue;
    }

    const unitWeight = getUnitVerticalWeight(unit);
    const wouldExceedMax = currentEffectiveWords + unitWeight > maxWordsPerPage;
    // Page is comfortably filled if it reached targetWordsPerPage
    const isComfortablyFull = currentEffectiveWords >= targetWordsPerPage;

    // Break to next page if exceeding max capacity, or comfortably full at a paragraph boundary
    if (currentWords > 0 && (wouldExceedMax || (isComfortablyFull && unit.isParagraphStart))) {
      // Check if the last placed unit was an orphan heading: if so, move it to the new page
      const currentList = pageUnits[currentPage];
      const lastPlaced = currentList[currentList.length - 1];
      if (lastPlaced && lastPlaced.isHeading) {
        currentList.pop();
        currentWords -= lastPlaced.wordCount;
        currentEffectiveWords -= getUnitVerticalWeight(lastPlaced);
        currentPage++;
        if (currentPage < internalPageCount) {
          pageUnits[currentPage] = [lastPlaced, unit];
          currentWords = lastPlaced.wordCount + unit.wordCount;
          currentEffectiveWords = getUnitVerticalWeight(lastPlaced) + unitWeight;
        } else {
          unplacedUnits.push(lastPlaced, unit);
        }
      } else {
        currentPage++;
        if (currentPage < internalPageCount) {
          pageUnits[currentPage].push(unit);
          currentWords = unit.wordCount;
          currentEffectiveWords = unitWeight;
        } else {
          unplacedUnits.push(unit);
        }
      }
    } else {
      pageUnits[currentPage].push(unit);
      currentWords += unit.wordCount;
      currentEffectiveWords += unitWeight;
    }
  }

  // Format page texts: join paragraphs with \n\n, sentences with space
  const pageTexts = pageUnits.map((pUnits) => {
    let text = '';
    for (let u = 0; u < pUnits.length; u++) {
      const unit = pUnits[u];
      if (u === 0) {
        text = unit.text;
      } else if (unit.isParagraphStart || unit.isHeading) {
        text += '\n\n' + unit.text;
      } else {
        text += ' ' + unit.text;
      }
    }
    return text.trim();
  });

  // Format overflow text
  let overflowText = '';
  for (let u = 0; u < unplacedUnits.length; u++) {
    const unit = unplacedUnits[u];
    if (u === 0) {
      overflowText = unit.text;
    } else if (unit.isParagraphStart || unit.isHeading) {
      overflowText += '\n\n' + unit.text;
    } else {
      overflowText += ' ' + unit.text;
    }
  }

  return {
    pageTexts,
    overflowText: overflowText.trim(),
  };
}

/**
 * Distributes text into internal pages depending on the outputMode:
 * - 'front-only' or 'poster-back': 6 internal pages (pages 2 to 7)
 * - 'continuation-16p': 12 content pages (pages 2 to 7, and 10 to 15; page 8 is transition notice, page 9 is part 2 header)
 * - 'booklet-bound-16p': 14 internal pages (pages 2 to 15; page 1 is cover, page 16 is back cover)
 *
 * Uses 'fill-first' by default: fills first pages completely, leaves final pages empty if text ends early.
 */
export function distributeTextAcrossPages(
  rawText: string,
  settings: BookSettings,
  existingPages: PageDocument[] = []
): {
  pages: PageDocument[];
  overflowText: string;
  report: OverflowReport;
} {
  const mode: OutputMode = settings.outputMode || 'front-only';
  const is16P = mode === 'continuation-16p' || mode === 'booklet-bound-16p';
  const capacity = getPageCapacity(settings);
  const targetWordsPerPage = capacity.words;
  const maxSafeWords = capacity.maxSafeWords;

  // Determine target internal content page count
  let internalPageCount = 6;
  if (mode === 'booklet-bound-16p') {
    internalPageCount = 14; // Pages 2 to 15
  } else if (mode === 'continuation-16p') {
    internalPageCount = 12; // Pages 2-7 and 10-15
  }

  // Preenche as primeiras páginas por completo por padrão (fill-first)
  const isBalanced = settings.textDistributionMode === 'balanced';
  const { pageTexts, overflowText } = isBalanced
    ? balanceTextAcrossPages(rawText, internalPageCount, maxSafeWords, targetWordsPerPage)
    : fillPagesSequentially(rawText, internalPageCount, maxSafeWords, targetWordsPerPage);

  const totalRawWords = rawText.split(/\s+/).filter(Boolean).length;
  const capacityTotalWords = targetWordsPerPage * internalPageCount;
  const excessWords = Math.max(0, totalRawWords - capacityTotalWords);

  const newPages: PageDocument[] = [];

  if (!is16P) {
    // 8-page mode
    // Page 1: Cover
    newPages.push({
      id: 1,
      stableId: 'p-1',
      editorialNumber: 1,
      role: 'cover',
      title: existingPages[0]?.title || 'Minilivro',
      subtitle: existingPages[0]?.subtitle || '',
      author: existingPages[0]?.author || '',
      content: existingPages[0]?.content || '',
      dateOrPublisher: existingPages[0]?.dateOrPublisher || '',
      customHeader: existingPages[0]?.customHeader,
      customFooter: existingPages[0]?.customFooter,
    });

    // Pages 2 to 7
    for (let p = 0; p < 6; p++) {
      const pageId = p + 2;
      const existing = existingPages[p + 1];
      newPages.push({
        id: pageId,
        stableId: `p-${pageId}`,
        editorialNumber: pageId,
        role: 'content',
        title: cleanPageTitle(existing?.title),
        subtitle: existing?.subtitle || '',
        content: pageTexts[p]?.trim() || '',
        customHeader: existing?.customHeader,
        customFooter: existing?.customFooter,
      });
    }

    // Page 8: Back cover
    newPages.push({
      id: 8,
      stableId: 'p-8',
      editorialNumber: 8,
      role: 'back-cover',
      title: existingPages[7]?.title ?? '',
      subtitle: existingPages[7]?.subtitle || '',
      content: existingPages[7]?.content || '',
      dateOrPublisher: existingPages[7]?.dateOrPublisher || '',
      customHeader: existingPages[7]?.customHeader,
      customFooter: existingPages[7]?.customFooter,
    });
  } else if (mode === 'continuation-16p') {
    // Page 1: Cover
    newPages.push({
      id: 1,
      stableId: 'p-1',
      editorialNumber: 1,
      role: 'cover',
      title: existingPages[0]?.title || 'Minilivro 16P',
      subtitle: existingPages[0]?.subtitle || 'Parte 1',
      author: existingPages[0]?.author || '',
      content: existingPages[0]?.content || '',
      customHeader: existingPages[0]?.customHeader,
      customFooter: existingPages[0]?.customFooter,
    });

    // Pages 2 to 7 (Content Part 1)
    for (let p = 0; p < 6; p++) {
      const pageId = p + 2;
      const existing = existingPages[p + 1];
      newPages.push({
        id: pageId,
        stableId: `p-${pageId}`,
        editorialNumber: pageId,
        role: 'content',
        title: cleanPageTitle(existing?.title),
        subtitle: existing?.subtitle || '',
        content: pageTexts[p]?.trim() || '',
        customHeader: existing?.customHeader,
        customFooter: existing?.customFooter,
      });
    }

    // Page 8: Transition page
    newPages.push({
      id: 8,
      stableId: 'p-8',
      editorialNumber: 8,
      role: 'transition',
      title: existingPages[7]?.title || 'Fim da Frente',
      content:
        existingPages[7]?.content ||
        `### Fim da Primeira Metade\n\n*A leitura continua no verso da folha!*\n\nDesdobre o livreto, vire a folha e refaça a dobra para acompanhar os capítulos 9 a 16.`,
      customHeader: existingPages[7]?.customHeader,
      customFooter: existingPages[7]?.customFooter,
    });

    // Page 9: Continuation Cover/Header
    newPages.push({
      id: 9,
      stableId: 'p-9',
      editorialNumber: 9,
      role: 'continuation-cover',
      title: existingPages[8]?.title || 'Segunda Metade',
      subtitle: 'Continuação da Leitura',
      content:
        existingPages[8]?.content ||
        `### Parte II\n\nContinuação do miolo impresso no verso da folha A4.`,
      customHeader: existingPages[8]?.customHeader,
      customFooter: existingPages[8]?.customFooter,
    });

    // Pages 10 to 15 (Content Part 2)
    for (let p = 0; p < 6; p++) {
      const pageId = p + 10;
      const existing = existingPages[p + 9];
      newPages.push({
        id: pageId,
        stableId: `p-${pageId}`,
        editorialNumber: pageId,
        role: 'content',
        title: cleanPageTitle(existing?.title),
        subtitle: existing?.subtitle || '',
        content: pageTexts[p + 6]?.trim() || '',
        customHeader: existing?.customHeader,
        customFooter: existing?.customFooter,
      });
    }

    // Page 16: Final back cover
    newPages.push({
      id: 16,
      stableId: 'p-16',
      editorialNumber: 16,
      role: 'back-cover',
      title: existingPages[15]?.title ?? '',
      subtitle: existingPages[15]?.subtitle || '',
      content: existingPages[15]?.content || '',
      dateOrPublisher: existingPages[15]?.dateOrPublisher || '',
      customHeader: existingPages[15]?.customHeader,
      customFooter: existingPages[15]?.customFooter,
    });
  } else {
    // booklet-bound-16p (Caderno encadernado)
    // Page 1: Cover
    newPages.push({
      id: 1,
      stableId: 'p-1',
      editorialNumber: 1,
      role: 'cover',
      title: existingPages[0]?.title || 'Caderno 16P',
      subtitle: existingPages[0]?.subtitle || '',
      author: existingPages[0]?.author || '',
      content: existingPages[0]?.content || '',
      customHeader: existingPages[0]?.customHeader,
      customFooter: existingPages[0]?.customFooter,
    });

    // Pages 2 to 15 (all 14 content pages)
    for (let p = 0; p < 14; p++) {
      const pageId = p + 2;
      const existing = existingPages[p + 1];
      newPages.push({
        id: pageId,
        stableId: `p-${pageId}`,
        editorialNumber: pageId,
        role: pageId === 8 || pageId === 9 ? 'transition' : 'content',
        title: cleanPageTitle(existing?.title),
        subtitle: existing?.subtitle || '',
        content: pageTexts[p]?.trim() || '',
        customHeader: existing?.customHeader,
        customFooter: existing?.customFooter,
      });
    }

    // Page 16: Back cover
    newPages.push({
      id: 16,
      stableId: 'p-16',
      editorialNumber: 16,
      role: 'back-cover',
      title: existingPages[15]?.title ?? '',
      subtitle: existingPages[15]?.subtitle || '',
      content: existingPages[15]?.content || '',
      dateOrPublisher: existingPages[15]?.dateOrPublisher || '',
      customHeader: existingPages[15]?.customHeader,
      customFooter: existingPages[15]?.customFooter,
    });
  }

  // Calculate capacities for report
  const contentPages = newPages.filter((p) => p.role === 'content');
  const pageCapacities = contentPages.map((p) => {
    const wc = p.content.split(/\s+/).filter(Boolean).length;
    const cc = p.content.length;
    const pct = Math.round((wc / targetWordsPerPage) * 100);
    let status: 'empty' | 'good' | 'full' | 'overflow' = 'good';
    if (wc === 0) status = 'empty';
    else if (wc > maxSafeWords) status = 'overflow';
    else if (wc >= targetWordsPerPage) status = 'full';

    return {
      pageId: p.editorialNumber,
      wordCount: wc,
      charCount: cc,
      percentFull: pct,
      status,
    };
  });

  const report: OverflowReport = {
    isOverflowing: overflowText.length > 0 || excessWords > 0,
    totalWords: totalRawWords,
    capacityWords: capacityTotalWords,
    excessWords,
    estimatedPagesNeeded: Math.ceil(totalRawWords / targetWordsPerPage),
    suggestedVolumes: Math.max(1, Math.ceil(totalRawWords / capacityTotalWords)),
    pageCapacities,
  };

  return {
    pages: newPages,
    overflowText,
    report,
  };
}

/**
 * Balances text between two adjacent pages (e.g. Page A and Page B) 50/50.
 * Eliminates the need for manual paragraph shuffling back and forth.
 */
export function balanceAdjacentPages(
  pageA: PageDocument,
  pageB: PageDocument,
  settings: BookSettings
): { pageA: PageDocument; pageB: PageDocument } {
  const combined = [pageA.content.trim(), pageB.content.trim()].filter(Boolean).join('\n\n');
  const capacity = getPageCapacity(settings);
  const { pageTexts } = balanceTextAcrossPages(combined, 2, capacity.maxSafeWords, capacity.words);

  return {
    pageA: { ...pageA, content: pageTexts[0] || '' },
    pageB: { ...pageB, content: pageTexts[1] || '' },
  };
}

/**
 * Analyzes raw text length vs book capacity and suggests the optimal font size
 * so the entire text fits comfortably across all pages with zero overflow.
 */
export function suggestOptimalTypography(
  rawText: string,
  mode: OutputMode,
  currentFontSize: FontSizeOption,
  settings?: BookSettings
): {
  isNeeded: boolean;
  suggestedFontSize: FontSizeOption;
  reason: string;
} {
  const totalWords = rawText.split(/\s+/).filter(Boolean).length;
  if (totalWords === 0) {
    return { isNeeded: false, suggestedFontSize: currentFontSize, reason: '' };
  }

  const is16P = mode === 'continuation-16p' || mode === 'booklet-bound-16p';
  const pageCount = is16P ? (mode === 'continuation-16p' ? 12 : 14) : 6;

  const currentCap = settings
    ? getPageCapacity({ ...settings, fontSize: currentFontSize })
    : FONT_CAPACITIES[currentFontSize] || FONT_CAPACITIES.md;
  const currentTotalCap = currentCap.words * pageCount;

  // If text overflows current font size
  if (totalWords > currentTotalCap) {
    // Check if 'sm' fits
    const smCap = settings
      ? getPageCapacity({ ...settings, fontSize: 'sm' }).words * pageCount
      : FONT_CAPACITIES.sm.words * pageCount;
    if (currentFontSize !== 'sm' && totalWords <= smCap * 1.1) {
      return {
        isNeeded: true,
        suggestedFontSize: 'sm',
        reason: `Texto longo (${totalWords} palavras): A fonte Pequena (sm) acomodará perfeitamente o texto pelas ${pageCount} páginas sem cortar palavras.`,
      };
    }
  } else {
    const lgCap = settings
      ? getPageCapacity({ ...settings, fontSize: 'lg' }).words * pageCount
      : FONT_CAPACITIES.lg.words * pageCount;
    if (totalWords < lgCap * 0.9 && currentFontSize !== 'lg') {
      // If text is short, 'lg' or 'md' fills the pages better
      if (totalWords <= lgCap) {
        return {
          isNeeded: true,
          suggestedFontSize: 'lg',
          reason: `Texto curto (${totalWords} palavras): A fonte Grande (lg) preencherá melhor as ${pageCount} páginas com conforto visual.`,
        };
      }
    }
  }

  return { isNeeded: false, suggestedFontSize: currentFontSize, reason: '' };
}

/**
 * Intelligent client-side extractive summarizer (fallback or instant preview).
 */
export function extractIntelligentSummary(rawText: string, targetWords = 480): string {
  const blocks = splitIntoBlocks(rawText);
  if (blocks.length === 0) return '';

  const totalWords = rawText.split(/\s+/).filter(Boolean).length;
  if (totalWords <= targetWords) {
    return rawText;
  }

  const scoredBlocks = blocks.map((block, idx) => {
    let score = 0;
    const words = block.split(/\s+/).filter(Boolean).length;
    if (idx === 0) score += 10;
    if (idx === 1) score += 6;
    if (idx === blocks.length - 1) score += 8;
    if (block.startsWith('#')) score += 12;
    if (words >= 15 && words <= 60) score += 4;
    return { block, score, originalIndex: idx, wordCount: words };
  });

  const selected = [...scoredBlocks].sort((a, b) => b.score - a.score);
  let currentWords = 0;
  const picked: typeof scoredBlocks = [];

  for (const item of selected) {
    if (currentWords + item.wordCount <= targetWords || picked.length < 4) {
      picked.push(item);
      currentWords += item.wordCount;
      if (currentWords >= targetWords) break;
    }
  }

  picked.sort((a, b) => a.originalIndex - b.originalIndex);
  return picked.map((p) => p.block).join('\n\n');
}

/**
 * Splits a very long text into multiple Volumes.
 */
export function splitIntoMultipleVolumes(
  rawText: string,
  settings: BookSettings,
  baseTitle: string,
  baseAuthor: string,
  backCoverText: string
): PageDocument[][] {
  const blocks = splitIntoBlocks(rawText);
  const capacity = getPageCapacity(settings);
  const targetWordsPerPage = capacity.words;
  const wordsPerVolume = targetWordsPerPage * 6;

  const totalWords = rawText.split(/\s+/).filter(Boolean).length;
  const numVolumes = Math.max(1, Math.ceil(totalWords / wordsPerVolume));

  const volumes: PageDocument[][] = [];
  let blockIndex = 0;

  for (let v = 0; v < numVolumes; v++) {
    const volNum = v + 1;
    const volTitle = numVolumes > 1 ? `${baseTitle} — Vol. ${volNum}` : baseTitle;

    const pageTexts: string[] = ['', '', '', '', '', ''];
    let currentPageIndex = 0;
    let currentWords = 0;

    while (blockIndex < blocks.length && currentPageIndex < 6) {
      const block = blocks[blockIndex];
      const blockWordCount = block.split(/\s+/).filter(Boolean).length;

      if (currentWords + blockWordCount > targetWordsPerPage && currentWords > 0) {
        if (currentPageIndex === 5) {
          break;
        }
        currentPageIndex++;
        currentWords = 0;
      }

      const sep = pageTexts[currentPageIndex] ? '\n\n' : '';
      pageTexts[currentPageIndex] += sep + block;
      currentWords += blockWordCount;
      blockIndex++;
    }

    const volPages: PageDocument[] = [
      {
        id: 1,
        stableId: `v${volNum}-p1`,
        editorialNumber: 1,
        role: 'cover',
        title: volTitle,
        subtitle: numVolumes > 1 ? `Volume ${volNum} de ${numVolumes}` : '',
        author: baseAuthor,
        content: '',
      },
      ...pageTexts.map((text, idx) => ({
        id: idx + 2,
        stableId: `v${volNum}-p${idx + 2}`,
        editorialNumber: idx + 2,
        role: 'content' as const,
        title: '',
        content: text.trim(),
      })),
      {
        id: 8,
        stableId: `v${volNum}-p8`,
        editorialNumber: 8,
        role: 'back-cover',
        title: '',
        content: backCoverText || (numVolumes > 1 ? `Fim do Volume ${volNum}.` : ''),
      },
    ];

    volumes.push(volPages);
  }

  return volumes;
}

/**
 * Auto-balances existing book pages:
 * Collects all content from internal content pages and redistributes
 * it perfectly balanced without altering covers or contracapas.
 */
export function autoBalanceBookPages(
  pages: PageDocument[],
  settings: BookSettings
): PageDocument[] {
  const contentPages = pages.filter((p) => p.role === 'content');
  if (contentPages.length === 0) return pages;

  const combinedText = contentPages
    .map((p) => p.content.trim())
    .filter(Boolean)
    .join('\n\n');

  const { pages: rebalanced } = distributeTextAcrossPages(
    combinedText,
    { ...settings, textDistributionMode: 'balanced' },
    pages
  );
  return rebalanced;
}

/**
 * Fills pages sequentially starting from page 2 to full capacity (~85-95w),
 * leaving later pages empty if text ends early.
 */
export function cascadeFillBookPages(
  pages: PageDocument[],
  settings: BookSettings
): PageDocument[] {
  const mode = settings.outputMode || 'front-only';
  // Gather all internal text pages
  const contentPages = pages.filter((p) => {
    if (p.role === 'cover' || p.role === 'back-cover' || p.role === 'continuation-cover') {
      return false;
    }
    // In continuation-16p, page 8 is the instructional transition banner
    if (mode === 'continuation-16p' && (p.role === 'transition' || p.editorialNumber === 8)) {
      return false;
    }
    return true;
  });

  if (contentPages.length === 0) return pages;

  const combinedText = contentPages
    .map((p) => p.content?.trim() || '')
    .filter(Boolean)
    .join('\n\n');

  const { pages: filled } = distributeTextAcrossPages(
    combinedText,
    { ...settings, textDistributionMode: 'fill-first' },
    pages
  );
  return filled;
}

/**
 * Packs the source page to full capacity by pulling text from the next page.
 * Targets maximum safe capacity (maxSafeWords) so the page fills right down to the bottom.
 * Returns the updated pages and the number of words moved.
 */
export function packPageCompletely(
  sourcePage: PageDocument,
  nextPage: PageDocument,
  settings: BookSettings
): { sourcePage: PageDocument; nextPage: PageDocument; wordsMoved: number } {
  const oldSourceWords = countMarkdownWords(sourcePage.content || '');
  const sourceText = sourcePage.content?.trim() || '';
  const nextText = nextPage.content?.trim() || '';

  if (!nextText) {
    return { sourcePage, nextPage, wordsMoved: 0 };
  }

  const combined = [sourceText, nextText].join('\n\n');
  const capacity = getPageCapacity(settings);
  // To pack completely down to the bottom, targetWordsPerPage is capacity.maxSafeWords
  const { pageTexts } = fillPagesSequentially(
    combined,
    2,
    capacity.maxSafeWords,
    capacity.maxSafeWords
  );

  const newSource = pageTexts[0] || '';
  const newNext = pageTexts[1] || '';
  const newSourceWords = countMarkdownWords(newSource);
  const wordsMoved = Math.max(0, newSourceWords - oldSourceWords);

  return {
    sourcePage: { ...sourcePage, content: newSource },
    nextPage: { ...nextPage, content: newNext },
    wordsMoved,
  };
}
