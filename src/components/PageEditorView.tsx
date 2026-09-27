import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PageDocument, BookSettings } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sliders,
  Check,
  Info,
  Image as ImageIcon,
  Sparkles,
  FileText,
  Settings2,
  Eye,
  EyeOff,
  Scissors,
  Link as LinkIcon,
  Bold,
  Italic,
  Code,
  Highlighter,
  Strikethrough,
  Underline,
  Quote,
  QrCode,
  Trash2,
  Type,
} from 'lucide-react';
import { parseMarkdownText } from '../utils/pdfGenerator';
import { FONT_CAPACITIES, getPageCapacity, getPageFontSizePt } from '../utils/textDistributor';
import { PosterEditor } from './PosterEditor';
import { getHeaderFooterContent } from '../utils/headerFooterHelper';
import { HeaderFooterModal } from './HeaderFooterModal';
import { MarkdownContent } from './MarkdownContent';
import { handleTextareaTab } from '../utils/textareaKeyboard';
import { TAB_SIZE } from '../utils/textWhitespace';
import { LinkInsertModal } from './LinkInsertModal';
import { QrCodeInsertModal } from './QrCodeInsertModal';
import { PageImageRenderer } from './PageImageRenderer';
import { ImageInsertModal } from './ImageInsertModal';
import { resolvePageImages } from '../utils/imageHelper';
import { countMarkdownWords, slugify } from '../utils/markdownParser';
import { PageImageLayout } from '../types';
import { CoverPageContent } from './CoverPageContent';

interface PageEditorViewProps {
  pages: PageDocument[];
  onUpdatePage: (id: number, updated: Partial<PageDocument>) => void;
  settings: BookSettings;
  onUpdateSettings: (s: BookSettings) => void;
  onMoveParagraphToNext: (fromPageId: number) => void;
  onPullParagraphFromNext: (toPageId: number) => void;
  onPullParagraphFromPrev: (toPageId: number) => void;
  onRebalanceAllPages?: () => void;
  onCascadeFillPages?: () => boolean | void;
  onBalanceAdjacentPages?: (pageIdA: number, pageIdB: number) => void;
  onPackPageCompletely?: (sourcePageId: number, nextPageId: number) => number | void;
  onSendSelectionToNextPage?: (sourcePageId: number, selectedText: string, targetPageId: number) => void;
  onSendSelectionToPrevPage?: (sourcePageId: number, selectedText: string, targetPageId: number) => void;
  onGoToReadingPreview: () => void;
}

const SELECTION_FONT_STEPS = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.35, 1.5, 1.75, 2.0, 2.5];

const parseScaleValue = (val: string): number => {
  const clean = val.trim().toLowerCase();
  if (clean.endsWith('%')) {
    const num = parseFloat(clean);
    return !isNaN(num) && num > 0 ? num / 100 : 1.0;
  }
  if (clean.endsWith('em') || clean.endsWith('rem')) {
    const num = parseFloat(clean);
    return !isNaN(num) && num > 0 ? num : 1.0;
  }
  if (clean.endsWith('pt') || clean.endsWith('px')) {
    const num = parseFloat(clean);
    return !isNaN(num) && num > 0 ? num / 10 : 1.0;
  }
  const num = parseFloat(clean);
  return !isNaN(num) && num > 0 ? num : 1.0;
};

const detectSelectionScale = (
  fullText: string,
  start: number,
  end: number
): {
  currentScale: number;
  outerStart: number;
  outerEnd: number;
  innerText: string;
  hasTag: boolean;
} => {
  const sel = fullText.slice(start, end);
  if (!sel) {
    return { currentScale: 1.0, outerStart: start, outerEnd: end, innerText: '', hasTag: false };
  }

  // 1. Check if selection itself is a font-size tag
  const innerSpan = sel.match(/^<span\s+style="font-size:\s*([^;"]+)"[^>]*>([\s\S]*?)<\/span>$/i);
  if (innerSpan) {
    return {
      currentScale: parseScaleValue(innerSpan[1]),
      outerStart: start,
      outerEnd: end,
      innerText: innerSpan[2],
      hasTag: true,
    };
  }

  const innerSmall = sel.match(/^<small>([\s\S]*?)<\/small>$/i);
  if (innerSmall) {
    return {
      currentScale: 0.8,
      outerStart: start,
      outerEnd: end,
      innerText: innerSmall[1],
      hasTag: true,
    };
  }

  const innerBig = sel.match(/^<big>([\s\S]*?)<\/big>$/i);
  if (innerBig) {
    return {
      currentScale: 1.2,
      outerStart: start,
      outerEnd: end,
      innerText: innerBig[1],
      hasTag: true,
    };
  }

  // 2. Check if surrounding characters in fullText are a font-size tag
  const beforeText = fullText.slice(0, start);
  const afterText = fullText.slice(end);

  const spanOpen = beforeText.match(/<span\s+style="font-size:\s*([^;"]+)"[^>]*>$/i);
  const spanClose = afterText.match(/^<\/span>/i);
  if (spanOpen && spanClose) {
    return {
      currentScale: parseScaleValue(spanOpen[1]),
      outerStart: start - spanOpen[0].length,
      outerEnd: end + spanClose[0].length,
      innerText: sel,
      hasTag: true,
    };
  }

  const smallOpen = beforeText.match(/<small>$/i);
  const smallClose = afterText.match(/^<\/small>/i);
  if (smallOpen && smallClose) {
    return {
      currentScale: 0.8,
      outerStart: start - 7,
      outerEnd: end + 8,
      innerText: sel,
      hasTag: true,
    };
  }

  const bigOpen = beforeText.match(/<big>$/i);
  const bigClose = afterText.match(/^<\/big>/i);
  if (bigOpen && bigClose) {
    return {
      currentScale: 1.2,
      outerStart: start - 5,
      outerEnd: end + 6,
      innerText: sel,
      hasTag: true,
    };
  }

  return {
    currentScale: 1.0,
    outerStart: start,
    outerEnd: end,
    innerText: sel,
    hasTag: false,
  };
};

export const PageEditorView: React.FC<PageEditorViewProps> = ({
  pages,
  onUpdatePage,
  settings,
  onUpdateSettings,
  onMoveParagraphToNext,
  onPullParagraphFromNext,
  onPullParagraphFromPrev,
  onRebalanceAllPages,
  onCascadeFillPages,
  onBalanceAdjacentPages,
  onPackPageCompletely,
  onSendSelectionToNextPage,
  onSendSelectionToPrevPage,
  onGoToReadingPreview,
}) => {
  const [selectedPageId, setSelectedPageId] = useState<number>(2);
  const [activeTabSubMode, setActiveTabSubMode] = useState<'pages' | 'poster'>('pages');
  const [isHFModalOpen, setIsHFModalOpen] = useState<boolean>(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Text Selection & Overflow states
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewBodyRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionIndices, setSelectionIndices] = useState<{ start: number; end: number } | null>(null);
  const [selectionToast, setSelectionToast] = useState<string | null>(null);
  const [isPhysicalOverflow, setIsPhysicalOverflow] = useState<boolean>(false);

  const isPosterMode = settings.outputMode === 'poster-back';
  const currentPage = pages.find((p) => p.id === selectedPageId) || pages[0] || {
    id: 1,
    stableId: 'p-1',
    editorialNumber: 1,
    role: 'cover',
    content: '',
  };

  const pageCapacity = getPageCapacity(settings, currentPage);
  const targetWords = pageCapacity.words;
  const maxSafeWords = pageCapacity.maxSafeWords;

  const currentWords = countMarkdownWords(currentPage.content || '');
  const currentChars = (currentPage.content || '').length;

  const effectiveFontSizePt = getPageFontSizePt(currentPage, settings);
  const globalFontSizePt = getPageFontSizePt(null, settings);

  const handleStepFontSize = (delta: number) => {
    const currentPt = getPageFontSizePt(currentPage, settings);
    const newPt = Math.max(6.5, Math.min(12.0, Math.round((currentPt + delta) * 2) / 2));
    onUpdatePage(currentPage.id, { fontSize: `${newPt}pt` });
  };

  const handleAnchorNavigation = (anchorSlug: string) => {
    // Check if target heading exists on another page
    for (const page of pages) {
      if (page.content) {
        const lines = page.content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#')) {
            const heading = trimmed.replace(/^#+\s*/, '');
            if (slugify(heading) === anchorSlug) {
              setSelectedPageId(page.id);
              setTimeout(() => {
                const el =
                  document.getElementById(`heading-${anchorSlug}`) ||
                  document.getElementById(anchorSlug);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el.classList.add('ring-2', 'ring-amber-400', 'bg-amber-50');
                  setTimeout(
                    () => el.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-50'),
                    1800
                  );
                }
              }, 100);
              return;
            }
          }
        }
      }
    }

    const el =
      document.getElementById(`heading-${anchorSlug}`) ||
      document.getElementById(anchorSlug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-400', 'bg-amber-50');
      setTimeout(
        () => el.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-50'),
        1800
      );
    }
  };

  const handleInsertLink = (linkMarkdown: string, refDef?: string) => {
    const currentContent = currentPage.content || '';
    let updatedContent = currentContent;

    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart ?? currentContent.length;
      const end = textareaRef.current.selectionEnd ?? currentContent.length;
      const before = currentContent.substring(0, start);
      const after = currentContent.substring(end);
      updatedContent = `${before}${linkMarkdown}${after}`;
    } else {
      updatedContent = currentContent ? `${currentContent}\n\n${linkMarkdown}` : linkMarkdown;
    }

    if (refDef) {
      updatedContent = `${updatedContent.trim()}\n\n${refDef}`;
    }

    onUpdatePage(currentPage.id, { content: updatedContent });
  };

  const handleInsertQrCode = (qrMarkdown: string) => {
    const currentContent = currentPage.content || '';
    let updatedContent = currentContent;

    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart ?? currentContent.length;
      const end = textareaRef.current.selectionEnd ?? currentContent.length;
      const before = currentContent.substring(0, start);
      const after = currentContent.substring(end);
      const prefix = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
      const suffix = after.length > 0 && !after.startsWith('\n') ? '\n\n' : '';
      updatedContent = `${before}${prefix}${qrMarkdown}${suffix}${after}`;
    } else {
      updatedContent = currentContent ? `${currentContent}\n\n${qrMarkdown}` : qrMarkdown;
    }

    onUpdatePage(currentPage.id, { content: updatedContent });
  };

  const activeImages = resolvePageImages(currentPage);

  const handleApplyImages = (params: {
    layout: PageImageLayout;
    images: string[];
    position?: 'top' | 'bottom';
    caption?: string;
  }) => {
    onUpdatePage(currentPage.id, {
      imageLayout: params.layout,
      images: params.images,
      imagePosition: params.position,
      imageCaption: params.caption,
    });
  };

  const handleRemoveImages = () => {
    onUpdatePage(currentPage.id, {
      imageLayout: 'none',
      images: [],
      imagePosition: undefined,
      imageCaption: undefined,
    });
  };

  let statusBadge = {
    label: 'Espaço Confortável',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  };
  if (currentWords === 0) {
    statusBadge = { label: 'Vazia (Livre)', color: 'text-stone-500 bg-stone-50 border-stone-200' };
  } else if (currentWords > maxSafeWords || isPhysicalOverflow) {
    statusBadge = {
      label: 'Risco de Excesso',
      color: 'text-amber-800 bg-amber-50 border-amber-200',
    };
  } else if (currentWords >= targetWords * 0.85) {
    statusBadge = { label: 'Bem Preenchida', color: 'text-stone-700 bg-stone-100 border-stone-300' };
  }

  const isCover = currentPage.role === 'cover' || currentPage.id === 1;
  const isBackCover = currentPage.role === 'back-cover' || currentPage.id === pages.length;
  const isTransition = currentPage.role === 'transition';
  const isInternal = !isCover && !isBackCover;

  // Clear selection on page switch
  useEffect(() => {
    setSelectedText('');
    setSelectionIndices(null);
  }, [selectedPageId]);

  // Check physical overflow in A7 preview
  useEffect(() => {
    const checkOverflow = () => {
      if (previewBodyRef.current) {
        const el = previewBodyRef.current;
        setIsPhysicalOverflow(el.scrollHeight > el.clientHeight + 4);
      }
    };
    checkOverflow();
    const timer = setTimeout(checkOverflow, 120);
    return () => clearTimeout(timer);
  }, [currentPage.content, currentPage.title, currentPage.subtitle, currentPage.author, currentPage.fontSize, settings.fontSize, settings.fontFamily, settings.lineHeight]);

  // Track selection inside textarea or preview
  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      if (end > start) {
        const text = textareaRef.current.value.substring(start, end);
        if (text.trim().length > 0) {
          setSelectedText(text);
          setSelectionIndices({ start, end });
          return;
        }
      }
    }

    const winSel = window.getSelection()?.toString();
    if (winSel && winSel.trim().length > 2) {
      setSelectedText(winSel);
      setSelectionIndices(null);
    } else {
      setSelectedText('');
      setSelectionIndices(null);
    }
  };

  // Adjacent pages for moving text
  const nextContentPage = pages.find((p) => p.id === currentPage.id + 1) || null;
  const prevContentPage = pages.find((p) => p.id === currentPage.id - 1) || null;

  const selectedWordCount = selectedText.trim().split(/\s+/).filter(Boolean).length;
  const selectedCharCount = selectedText.length;

  const handleSendSelectedToNext = () => {
    if (!selectedText.trim() || !nextContentPage) return;
    const wordsCount = selectedWordCount;

    if (onSendSelectionToNextPage) {
      onSendSelectionToNextPage(currentPage.id, selectedText, nextContentPage.id);
    } else {
      let newContent = currentPage.content || '';
      if (selectionIndices && textareaRef.current) {
        newContent =
          newContent.substring(0, selectionIndices.start) +
          newContent.substring(selectionIndices.end);
      } else {
        const idx = newContent.indexOf(selectedText);
        if (idx !== -1) {
          newContent = newContent.substring(0, idx) + newContent.substring(idx + selectedText.length);
        } else {
          newContent = newContent.replace(selectedText.trim(), '');
        }
      }
      newContent = newContent.replace(/\n{3,}/g, '\n\n').trim();
      onUpdatePage(currentPage.id, { content: newContent });

      const newNextContent = nextContentPage.content?.trim()
        ? `${selectedText.trim()}\n\n${nextContentPage.content.trim()}`
        : selectedText.trim();
      onUpdatePage(nextContentPage.id, { content: newNextContent });
    }

    setSelectedText('');
    setSelectionIndices(null);
    setSelectionToast(`✓ ${wordsCount} palavras enviadas para a Página ${nextContentPage.editorialNumber}`);
    setTimeout(() => setSelectionToast(null), 3500);
  };

  const handleSendSelectedToPrev = () => {
    if (!selectedText.trim() || !prevContentPage) return;
    const wordsCount = selectedWordCount;

    if (onSendSelectionToPrevPage) {
      onSendSelectionToPrevPage(currentPage.id, selectedText, prevContentPage.id);
    } else {
      let newContent = currentPage.content || '';
      if (selectionIndices && textareaRef.current) {
        newContent =
          newContent.substring(0, selectionIndices.start) +
          newContent.substring(selectionIndices.end);
      } else {
        const idx = newContent.indexOf(selectedText);
        if (idx !== -1) {
          newContent = newContent.substring(0, idx) + newContent.substring(idx + selectedText.length);
        } else {
          newContent = newContent.replace(selectedText.trim(), '');
        }
      }
      newContent = newContent.replace(/\n{3,}/g, '\n\n').trim();
      onUpdatePage(currentPage.id, { content: newContent });

      const newPrevContent = prevContentPage.content?.trim()
        ? `${prevContentPage.content.trim()}\n\n${selectedText.trim()}`
        : selectedText.trim();
      onUpdatePage(prevContentPage.id, { content: newPrevContent });
    }

    setSelectedText('');
    setSelectionIndices(null);
    setSelectionToast(`✓ ${wordsCount} palavras enviadas para a Página ${prevContentPage.editorialNumber}`);
    setTimeout(() => setSelectionToast(null), 3500);
  };

  const handlePackPage = () => {
    if (!isInternal) return;

    // Localiza a próxima página interna que contenha texto real para puxar
    const nextContentPageWithText = pages.find(
      (p) =>
        p.editorialNumber > currentPage.editorialNumber &&
        p.role !== 'cover' &&
        p.role !== 'back-cover' &&
        p.role !== 'transition' &&
        p.role !== 'continuation-cover' &&
        p.content &&
        p.content.trim().length > 0
    );

    if (!nextContentPageWithText) {
      setSelectionToast('ℹ️ As páginas seguintes estão vazias. Não há texto para puxar.');
      setTimeout(() => setSelectionToast(null), 3500);
      return;
    }

    const capacity = getPageCapacity(settings, currentPage);
    if (isPhysicalOverflow || currentWords >= capacity.maxSafeWords) {
      setSelectionToast(
        `ℹ️ Esta página já está preenchida até embaixo (~${currentWords} palavras). Não cabe mais texto sem exceder a folha A7.`
      );
      setTimeout(() => setSelectionToast(null), 4000);
      return;
    }

    if (onPackPageCompletely) {
      const moved = onPackPageCompletely(currentPage.id, nextContentPageWithText.id);
      if (typeof moved === 'number' && moved > 0) {
        setSelectionToast(
          `✓ ${moved} palavras puxadas da Página ${nextContentPageWithText.editorialNumber}. Página preenchida até embaixo!`
        );
      } else {
        const remainingSpace = Math.max(0, capacity.maxSafeWords - currentWords);
        setSelectionToast(
          `ℹ️ O próximo trecho da Página ${nextContentPageWithText.editorialNumber} excede o espaço restante desta página (~${remainingSpace} pal.).`
        );
      }
      setTimeout(() => setSelectionToast(null), 3800);
    }
  };

  const handleCascadeFill = () => {
    if (!onCascadeFillPages) return;
    const changed = onCascadeFillPages();
    if (changed) {
      setSelectionToast('✓ Páginas reorganizadas em cascata (primeiras cheias, finais livres)!');
    } else {
      setSelectionToast('✓ As páginas já estão perfeitamente distribuídas em ordem contínua (primeiras cheias, finais livres)!');
    }
    setTimeout(() => setSelectionToast(null), 3500);
  };

  const handlePullFromPrev = () => {
    onPullParagraphFromPrev(currentPage.id);
    setSelectionToast('✓ Parágrafo puxado da página anterior');
    setTimeout(() => setSelectionToast(null), 2500);
  };

  const handlePushToNext = () => {
    onMoveParagraphToNext(currentPage.id);
    setSelectionToast('✓ Parágrafo movido para a próxima página');
    setTimeout(() => setSelectionToast(null), 2500);
  };

  const handlePullFromNext = () => {
    onPullParagraphFromNext(currentPage.id);
    setSelectionToast('✓ Parágrafo puxado da próxima página');
    setTimeout(() => setSelectionToast(null), 2500);
  };

  const handleWrapSelection = (prefix: string, suffix: string = prefix, placeholder: string = 'texto') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = currentPage.content || '';
    const sel = current.slice(start, end);
    const textToWrap = sel || placeholder;
    const newContent = current.slice(0, start) + prefix + textToWrap + suffix + current.slice(end);
    onUpdatePage(currentPage.id, { content: newContent });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + textToWrap.length);
    }, 50);
  };

  // Word-style font size stepping for selected text
  const currentSelectionInfo = useMemo(() => {
    const content = currentPage.content || '';
    if (!selectionIndices) {
      if (selectedText.trim()) {
        const idx = content.indexOf(selectedText);
        if (idx !== -1) {
          return detectSelectionScale(content, idx, idx + selectedText.length);
        }
      }
      return { currentScale: 1.0, outerStart: 0, outerEnd: 0, innerText: selectedText, hasTag: false };
    }
    return detectSelectionScale(content, selectionIndices.start, selectionIndices.end);
  }, [selectionIndices, selectedText, currentPage.content]);

  const currentSelectionScale = currentSelectionInfo.currentScale;
  const isSelectionScaled = currentSelectionScale !== 1.0;
  // Show real pt value like Word (scale × base font size of the page)
  const currentSelectionPt = Math.round(effectiveFontSizePt * currentSelectionScale * 10) / 10;
  const currentSelectionScaleDisplay = `${currentSelectionPt} pt`;

  const handleStepSelectionFontSize = (delta: 1 | -1) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = currentPage.content || '';
    const info = detectSelectionScale(current, start, end);
    if (!info.innerText.trim()) return;

    let bestIdx = 5; // default 1.0
    let bestDiff = Math.abs(info.currentScale - SELECTION_FONT_STEPS[5]);
    for (let i = 0; i < SELECTION_FONT_STEPS.length; i++) {
      const diff = Math.abs(info.currentScale - SELECTION_FONT_STEPS[i]);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestIdx = i;
      }
    }

    const newIdx = Math.max(0, Math.min(SELECTION_FONT_STEPS.length - 1, bestIdx + delta));
    const newScale = SELECTION_FONT_STEPS[newIdx];

    let replacement = info.innerText;
    let newSelStart = info.outerStart;
    let newSelEnd = info.outerStart + info.innerText.length;

    if (newScale !== 1.0) {
      const openTag = `<span style="font-size: ${newScale}em">`;
      const closeTag = `</span>`;
      replacement = `${openTag}${info.innerText}${closeTag}`;
      newSelStart = info.outerStart + openTag.length;
      newSelEnd = newSelStart + info.innerText.length;
    }

    const newContent =
      current.slice(0, info.outerStart) + replacement + current.slice(info.outerEnd);

    onUpdatePage(currentPage.id, { content: newContent });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newSelStart, newSelEnd);
      setSelectedText(info.innerText);
      setSelectionIndices({ start: newSelStart, end: newSelEnd });
    }, 50);
  };

  const handleResetSelectionFontSize = () => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = currentPage.content || '';
    const info = detectSelectionScale(current, start, end);
    if (!info.innerText.trim() || !info.hasTag) return;

    const replacement = info.innerText;
    const newSelStart = info.outerStart;
    const newSelEnd = info.outerStart + info.innerText.length;
    const newContent =
      current.slice(0, info.outerStart) + replacement + current.slice(info.outerEnd);

    onUpdatePage(currentPage.id, { content: newContent });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newSelStart, newSelEnd);
      setSelectedText(info.innerText);
      setSelectionIndices({ start: newSelStart, end: newSelEnd });
    }, 50);
  };

  return (
    <div className="space-y-6">
      {/* Top mode bar if in poster mode */}
      {isPosterMode && (
        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs font-medium w-fit">
          <button
            type="button"
            onClick={() => setActiveTabSubMode('pages')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTabSubMode === 'pages'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Páginas 1 a 8 (Frente)
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSubMode('poster')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTabSubMode === 'poster'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-stone-700" />
            <span>Pôster A4 Contínuo (Verso)</span>
          </button>
        </div>
      )}

      {isPosterMode && activeTabSubMode === 'poster' ? (
        <div className="space-y-4">
          <PosterEditor
            settings={settings.posterSettings}
            onChange={(updated) => onUpdateSettings({ ...settings, posterSettings: updated })}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onGoToReadingPreview}
              className="flex items-center gap-1.5 px-5 py-2 text-xs text-white bg-stone-900 hover:bg-stone-800 rounded font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <span>Ver na Prévia de Leitura</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Page Selector Strip */}
          <div className="bg-white border border-stone-200 rounded-xl p-2.5 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
            {pages.map((p) => {
              const isSelected = p.id === selectedPageId;
              const words = (p.content || '').split(/\s+/).filter(Boolean).length;
              let roleLabel = `Pág. ${p.editorialNumber}`;
              if (p.role === 'cover') roleLabel = 'Capa';
              else if (p.role === 'back-cover') roleLabel = 'Contracapa';
              else if (p.role === 'transition') roleLabel = `Pág. ${p.editorialNumber} (Centro)`;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPageId(p.id)}
                  className={`px-3 py-2 rounded-lg text-left transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-stone-900 text-white font-medium shadow-xs'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold">{roleLabel}</span>
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-stone-300' : 'text-stone-400'
                      }`}
                    >
                      {words}w
                    </span>
                  </div>
                  <div
                    className={`text-[10px] truncate max-w-[100px] mt-0.5 ${
                      isSelected ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    {p.title || (words > 0 ? `${words} palavras` : 'Em branco')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Page Editor Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Editor Controls */}
            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-serif font-bold text-stone-900">
                    {isCover
                      ? 'Capa Principal (Página 1)'
                      : isBackCover
                      ? `Contracapa Final (Página ${currentPage.editorialNumber})`
                      : isTransition
                      ? `Página ${currentPage.editorialNumber} · Transição Central`
                      : `Página ${currentPage.editorialNumber} · Texto Interno`}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded border font-medium ${statusBadge.color}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-mono">{currentWords} palavras</span>
                  <span>·</span>
                  <span className="font-mono">{currentChars} caracteres</span>
                </div>
              </div>

              {/* Title / Subtitle Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                    <span>Título / Cabeçalho da Página</span>
                    {!isCover && (
                      <span className="text-[10px] text-stone-400 font-normal">
                        Opcional (pode deixar em branco)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={isCover ? (currentPage.title || '') : (/^P[áa]gina\s+\d+$/i.test((currentPage.title || '').trim()) ? '' : (currentPage.title || ''))}
                    onChange={(e) => onUpdatePage(currentPage.id, { title: e.target.value })}
                    placeholder={isCover ? 'Título da Obra' : 'Em branco (opcional)'}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
                  />
                </div>

                {isCover ? (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Subtítulo da Capa
                    </label>
                    <input
                      type="text"
                      value={currentPage.subtitle || ''}
                      onChange={(e) => onUpdatePage(currentPage.id, { subtitle: e.target.value })}
                      placeholder="Ex: Uma crônica de bolso"
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Subtítulo ou Intertítulo (Opcional)
                    </label>
                    <input
                      type="text"
                      value={currentPage.subtitle || ''}
                      onChange={(e) => onUpdatePage(currentPage.id, { subtitle: e.target.value })}
                      placeholder="Ex: Capítulo I, Notas, etc."
                      className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
                    />
                  </div>
                )}
              </div>

              {isCover && (
                <div>
                  <label htmlFor="cover-author" className="block text-xs font-semibold text-stone-700 mb-1">
                    Autor da Capa
                  </label>
                  <input
                    id="cover-author"
                    type="text"
                    value={currentPage.author || ''}
                    onChange={(e) => onUpdatePage(currentPage.id, { author: e.target.value })}
                    placeholder="Nome ou assinatura (opcional)"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
                  />
                </div>
              )}

              {/* Word Header & Footer Quick Status & Action */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <FileText className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-semibold text-stone-700">Topo & Rodapé (Estilo Word):</span>
                  <span className="text-[11px] text-stone-500">
                    {getHeaderFooterContent(currentPage, pages.length, settings, pages[0]?.title, pages[0]?.author).showHeader
                      ? 'Topo ativo'
                      : 'Topo inativo'}{' '}
                    ·{' '}
                    {getHeaderFooterContent(currentPage, pages.length, settings, pages[0]?.title, pages[0]?.author).showFooter
                      ? 'Rodapé ativo'
                      : 'Rodapé inativo'}
                  </span>
                  {pageCapacity.isExpanded && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Área expandida (+{pageCapacity.gainPercent}%)</span>
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsHFModalOpen(true)}
                  className="text-[11px] font-semibold text-stone-900 hover:text-stone-700 underline cursor-pointer"
                >
                  Configurar / Personalizar ⚙
                </button>
              </div>

              {/* Content Textarea & Unified Action Block */}
              <div className="space-y-0">
                {/* Linha 1: Título da Seção e Badges de Status / Capacidade */}
                <div className="flex items-center justify-between pb-1.5 flex-wrap gap-2">
                  <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <span>{isCover ? 'Texto adicional da capa' : 'Conteúdo da Página'}</span>
                    {isInternal && (
                      <span className="text-[11px] text-stone-400 font-normal hidden sm:inline">
                        (Selecione um trecho para movê-lo)
                      </span>
                    )}
                  </label>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-stone-600 font-sans font-medium bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                      Tamanho: <strong>{effectiveFontSizePt} pt</strong>
                      {currentPage.fontSize && currentPage.fontSize !== 'inherit' && (
                        <span className="text-amber-800 ml-1 font-semibold">(personalizado)</span>
                      )}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Capacidade: ~{targetWords} palavras
                      {pageCapacity.isExpanded && (
                        <span className="text-emerald-700 font-sans font-medium ml-1 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                          +Área Expandida
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Linha 2: Barra de Ferramentas (Formatação à esquerda + Controle de Fonte à direita) */}
                <div className="flex items-center justify-between pb-1.5 flex-wrap gap-1.5">
                  <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded border border-stone-200/80 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleWrapSelection('**', '**', 'negrito')}
                      title="Negrito (**texto**)"
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Bold className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWrapSelection('*', '*', 'itálico')}
                      title="Itálico (*texto*)"
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Italic className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWrapSelection('***', '***', 'negrito e itálico')}
                      title="Negrito e Itálico (***texto***)"
                      className="px-1 py-0.5 text-stone-700 hover:text-stone-900 hover:bg-white rounded text-[10px] font-bold italic transition-colors cursor-pointer"
                    >
                      BI
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWrapSelection('`', '`', 'sombreado')}
                      title="Sombreado / Código (`texto`)"
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Code className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWrapSelection('==', '==', 'destaque')}
                      title="Marca-texto amarelo (==destaque==)"
                      className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded transition-colors cursor-pointer"
                    >
                      <Highlighter className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWrapSelection('~~', '~~', 'riscado')}
                      title="Tachado (~~texto~~)"
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Strikethrough className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWrapSelection('<u>', '</u>', 'sublinhado')}
                      title="Sublinhado (<u>texto</u>)"
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Underline className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWrapSelection('> ', '', 'Citação')}
                      title="Citação em bloco (> texto)"
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Quote className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepSelectionFontSize(-1)}
                      title="Diminuir tamanho da fonte do trecho selecionado (A-)"
                      className="px-1 py-0.5 text-stone-700 hover:text-stone-900 hover:bg-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStepSelectionFontSize(+1)}
                      title="Aumentar tamanho da fonte do trecho selecionado (A+)"
                      className="px-1 py-0.5 text-stone-700 hover:text-stone-900 hover:bg-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      A+
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLinkModalOpen(true)}
                      className="p-1 text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 rounded transition-colors cursor-pointer"
                      title="Inserir Link em Markdown ([Texto](URL), tooltip, referências, âncoras ou arquivos)"
                    >
                      <LinkIcon className="w-3 h-3 text-amber-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsQrModalOpen(true)}
                      className="p-1 text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200/90 rounded transition-colors cursor-pointer"
                      title="Inserir QR Code Phygital ([qr: Legenda](URL) - Pasta no Drive, arquivos ou nuvem)"
                    >
                      <QrCode className="w-3 h-3 text-purple-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsImageModalOpen(true)}
                      className={`p-1 rounded transition-colors cursor-pointer relative ${
                        activeImages.hasImages && activeImages.layout !== 'none'
                          ? 'text-teal-900 bg-teal-100 border border-teal-300'
                          : 'text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/90'
                      }`}
                      title="Adicionar ou Configurar Imagem A7 (Folha inteira, meia folha, 2 ou 4 fotos)"
                    >
                      <ImageIcon className="w-3 h-3 text-teal-700" />
                      {activeImages.hasImages && activeImages.layout !== 'none' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse absolute -top-0.5 -right-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Controle do Tamanho da Fonte do Texto Desta Página */}
                  <div className="flex items-center gap-1 bg-stone-100/90 p-0.5 rounded border border-stone-200/90 text-xs shadow-2xs shrink-0">
                    <div className="flex items-center gap-0.5 text-stone-700 px-1 py-0.5 text-[11px] font-semibold select-none">
                      <Type className="w-3.5 h-3.5 text-stone-700" />
                      <span className="hidden sm:inline">Fonte:</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStepFontSize(-0.5)}
                      title="Diminuir tamanho da fonte do texto desta página (A-)"
                      className="px-1.5 py-0.5 text-stone-700 hover:text-stone-900 hover:bg-white rounded font-bold text-[11px] transition-colors cursor-pointer border border-transparent hover:border-stone-200"
                    >
                      A-
                    </button>

                    <select
                      value={currentPage.fontSize || 'inherit'}
                      onChange={(e) => {
                        const val = e.target.value;
                        onUpdatePage(currentPage.id, {
                          fontSize: val === 'inherit' ? undefined : (val as any),
                        });
                      }}
                      title="Tamanho da fonte para o texto desta página"
                      className="bg-white border border-stone-300 text-stone-800 text-[11px] font-medium rounded px-1.5 py-0.5 cursor-pointer hover:border-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[130px] sm:max-w-none"
                    >
                      <option value="inherit">
                        Padrão do Livro ({globalFontSizePt} pt)
                      </option>
                      <option value="6.5pt">6.5 pt · Mínima</option>
                      <option value="7pt">7.0 pt · Muito Pequena</option>
                      <option value="7.5pt">7.5 pt · BuJo / Legenda</option>
                      <option value="8pt">8.0 pt · Compacta</option>
                      <option value="8.5pt">8.5 pt · Padrão A7</option>
                      <option value="9pt">9.0 pt · Leitura Fina</option>
                      <option value="9.5pt">9.5 pt · Moderada</option>
                      <option value="10pt">10.0 pt · Média</option>
                      <option value="10.5pt">10.5 pt · Confortável</option>
                      <option value="11pt">11.0 pt · Ampliada</option>
                      <option value="11.5pt">11.5 pt · Grande</option>
                      <option value="12pt">12.0 pt · Destaque</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleStepFontSize(+0.5)}
                      title="Aumentar tamanho da fonte do texto desta página (A+)"
                      className="px-1.5 py-0.5 text-stone-700 hover:text-stone-900 hover:bg-white rounded font-bold text-[11px] transition-colors cursor-pointer border border-transparent hover:border-stone-200"
                    >
                      A+
                    </button>

                    {currentPage.fontSize && currentPage.fontSize !== 'inherit' && (
                      <button
                        type="button"
                        onClick={() => onUpdatePage(currentPage.id, { fontSize: undefined })}
                        title="Restaurar tamanho padrão do livro"
                        className="text-[10px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium ml-0.5"
                      >
                        ↺ Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Page Image Status Banner */}
                {activeImages.hasImages && activeImages.layout !== 'none' && (
                  <div className="mb-2 flex items-center justify-between px-3 py-1.5 bg-teal-50/90 border border-teal-200 rounded-lg text-xs text-teal-950 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <ImageIcon className="w-4 h-4 text-teal-700 shrink-0" />
                      <div className="min-w-0 truncate">
                        <span className="font-bold">
                          {activeImages.layout === 'full' && 'Imagem em Sangria Total (Folha inteira A7)'}
                          {activeImages.layout === 'half' && `Meia Folha A7 (${activeImages.position === 'bottom' ? 'Metade inferior' : 'Metade superior'})`}
                          {activeImages.layout === 'two' && 'Duas Imagens na Mesma Folha (2 Poses A7)'}
                          {activeImages.layout === 'four' && 'Quatro Imagens na Mesma Folha (4 Poses A7)'}
                        </span>
                        {activeImages.caption && (
                          <span className="text-[11px] text-teal-800 ml-1.5 italic truncate">
                            — "{activeImages.caption}"
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => setIsImageModalOpen(true)}
                        className="text-[11px] font-semibold text-teal-800 hover:text-teal-950 underline cursor-pointer"
                      >
                        Configurar
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImages}
                        className="p-1 text-teal-700 hover:text-red-600 rounded hover:bg-teal-100 transition-colors cursor-pointer"
                        title="Remover imagens desta página"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                <p id="page-spacing-hint" className="text-[10px] text-stone-500 mb-1">
                  Espaços são preservados. Tab insere 4 espaços; Shift+Tab sai do campo.
                </p>
                <textarea
                  ref={textareaRef}
                  aria-label={isCover ? 'Texto adicional da capa' : 'Conteúdo da Página'}
                  aria-describedby="page-spacing-hint"
                  rows={8}
                  value={currentPage.content || ''}
                  onChange={(e) => onUpdatePage(currentPage.id, { content: e.target.value })}
                  onKeyDown={(e) => handleTextareaTab(e, (content) => onUpdatePage(currentPage.id, { content }))}
                  onSelect={handleSelectionChange}
                  onKeyUp={handleSelectionChange}
                  onMouseUp={handleSelectionChange}
                  placeholder={isCover
                    ? 'Escreva o texto que deve aparecer abaixo do subtítulo. Deixe vazio para uma capa simples.'
                    : 'Escreva ou edite o conteúdo desta página... Dica: selecione qualquer trecho com o mouse para enviá-lo diretamente para a próxima página.'}
                  style={{
                    tabSize: TAB_SIZE,
                    fontSize: `${Math.max(12, Math.min(18, Math.round(effectiveFontSizePt * 1.35)))}px`,
                  }}
                  className={`w-full p-3 font-serif border border-stone-300 ${
                    isInternal ? 'rounded-t-lg border-b-stone-200' : 'rounded-lg'
                  } focus:ring-1 focus:ring-stone-900 focus:border-stone-900 leading-relaxed text-stone-800 bg-[#FCFCFA]` }
                />

                {/* Bloco Único Consolidado após Conteúdo da Página */}
                {isInternal && (
                  <div className="border border-t-0 border-stone-300 rounded-b-lg bg-[#FAF9F6] p-2.5 space-y-2">
                    {/* Seção de Trecho Selecionado (Aparece de forma limpa quando o usuário seleciona texto) */}
                    {selectedText.trim() ? (
                      <div className="bg-amber-100/90 border border-amber-300 rounded-lg px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs animate-in fade-in">
                        <div className="flex items-center gap-2 min-w-0">
                          <Scissors className="w-4 h-4 text-amber-900 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-amber-950">
                              {selectedWordCount} palavras selecionadas:
                            </span>
                            <span className="text-[11px] text-stone-700 italic truncate block max-w-[200px] sm:max-w-[260px]">
                              "{selectedText.trim()}"
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                          {/* 1. Controle da Fonte do Trecho Selecionado (Estilo Word: A- / valor pt / A+) */}
                          <div className="flex items-center gap-0.5 bg-white/95 border border-amber-300 rounded-md px-1.5 py-0.5 shadow-sm">
                            <span className="text-[10px] font-semibold text-stone-500 select-none mr-1 hidden sm:inline">
                              T:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStepSelectionFontSize(-1)}
                              title="Diminuir tamanho da fonte do trecho selecionado (A-)"
                              className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-amber-100 font-bold text-[11px] rounded transition-colors cursor-pointer border border-transparent hover:border-amber-300"
                            >
                              A-
                            </button>
                            <span
                              title={`Fonte do trecho: ${currentSelectionScaleDisplay} (base da página: ${effectiveFontSizePt} pt)`}
                              className="px-2 py-0.5 bg-white text-stone-900 border border-stone-200 rounded text-[11px] font-mono font-bold min-w-[52px] text-center select-none shadow-inner cursor-default"
                            >
                              {currentSelectionScaleDisplay}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStepSelectionFontSize(+1)}
                              title="Aumentar tamanho da fonte do trecho selecionado (A+)"
                              className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-950 hover:bg-amber-100 font-bold text-[11px] rounded transition-colors cursor-pointer border border-transparent hover:border-amber-300"
                            >
                              A+
                            </button>
                            {isSelectionScaled && (
                              <button
                                type="button"
                                onClick={handleResetSelectionFontSize}
                                title={`Restaurar tamanho padrão deste trecho (${effectiveFontSizePt} pt)`}
                                className="text-[10px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium ml-0.5"
                              >
                                ↺
                              </button>
                            )}
                          </div>

                          {/* 3. Mover para Próxima/Anterior */}
                          {nextContentPage && (
                            <button
                              type="button"
                              onClick={handleSendSelectedToNext}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-800 hover:bg-amber-900 text-white font-bold rounded shadow-xs cursor-pointer transition-colors"
                              title={`Enviar trecho selecionado para o início da Página ${nextContentPage.editorialNumber}`}
                            >
                              <span>Enviar para Pág. {nextContentPage.editorialNumber}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {prevContentPage && (
                            <button
                              type="button"
                              onClick={handleSendSelectedToPrev}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-medium rounded cursor-pointer transition-colors"
                              title={`Enviar trecho selecionado para o final da Página ${prevContentPage.editorialNumber}`}
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                              <span>Pág. {prevContentPage.editorialNumber}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedText('');
                              setSelectionIndices(null);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-700 text-xs rounded hover:bg-amber-200/50 cursor-pointer"
                            title="Cancelar seleção"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-stone-500 flex items-center justify-between px-0.5">
                        <span className="flex items-center gap-1.5">
                          <span className="text-amber-800 font-semibold">💡 Dica:</span>
                          <span>Selecione qualquer trecho no texto acima para movê-lo de página.</span>
                        </span>
                        <span className="font-mono text-stone-400 text-[10px]">
                          {currentWords} palavras nesta página
                        </span>
                      </div>
                    )}

                    {/* Feedback Toast */}
                    {selectionToast && (
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 shadow-2xs animate-in fade-in transition-all ${
                          selectionToast.startsWith('ℹ️')
                            ? 'bg-amber-900 text-amber-50 border border-amber-800'
                            : 'bg-emerald-900 text-emerald-50 border border-emerald-800'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {selectionToast.startsWith('ℹ️') ? (
                            <Info className="w-4 h-4 text-amber-300 shrink-0" />
                          ) : (
                            <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                          )}
                          <span className="font-medium leading-snug">
                            {selectionToast.replace(/^[✓ℹ️]\s*/, '')}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectionToast(null)}
                          className="text-stone-300 hover:text-white cursor-pointer p-0.5 rounded hover:bg-black/20"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    {/* Barra de Fluxo de Parágrafos e Preenchimento */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-stone-200/70">
                      {/* Ajustes de Parágrafos */}
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={handlePullFromPrev}
                          disabled={currentPage.id <= 2}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-stone-100 border border-stone-300 rounded text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                          title="Puxa o último parágrafo da página anterior para o início desta página"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Puxar da Anterior</span>
                        </button>

                        <button
                          type="button"
                          onClick={handlePushToNext}
                          disabled={currentPage.id >= pages.length - 1}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-stone-100 border border-stone-300 rounded text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                          title="Empurra o último parágrafo desta página para o início da próxima página"
                        >
                          <span>Empurrar p/ Próxima</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={handlePullFromNext}
                          disabled={currentPage.id >= pages.length - 1}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-stone-100 border border-stone-300 rounded text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                          title="Puxa o primeiro parágrafo da próxima página para o final desta página"
                        >
                          <span>Puxar da Próxima</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Ferramentas de Preenchimento da Página */}
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {onPackPageCompletely && (
                          <button
                            type="button"
                            onClick={handlePackPage}
                            disabled={currentPage.id >= pages.length - 1}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-medium rounded disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                            title="Puxa texto da página seguinte até preencher esta página completamente até embaixo"
                          >
                            <Sparkles className="w-3 h-3 text-amber-700" />
                            <span>Encher até Embaixo</span>
                          </button>
                        )}

                        {onCascadeFillPages && (
                          <button
                            type="button"
                            onClick={handleCascadeFill}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-medium rounded cursor-pointer transition-colors shadow-2xs"
                            title="Reorganiza todas as páginas em cascata (primeiras cheias, finais livres)"
                          >
                            <span>Preencher Páginas em Ordem</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedPageId((prev) => Math.max(1, prev - 1))}
                  disabled={selectedPageId === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Página Anterior</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPageId((prev) => Math.min(pages.length, prev + 1))}
                  disabled={selectedPageId === pages.length}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded disabled:opacity-40 cursor-pointer"
                >
                  <span>Próxima Página</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right 5 cols: Live Physical Panel Simulation */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="text-[11px] font-medium text-stone-500 mb-2 flex items-center gap-1.5">
                <span>Simulação do Painel Físico A7 (74,25 × 105 mm)</span>
                {selectedText.trim() && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5 font-semibold animate-pulse">
                    {currentSelectionScaleDisplay}
                  </span>
                )}
              </div>

              {/* Exact aspect ratio 74.25 : 105 ≈ 1 : 1.414 (ISO A) */}
              {(() => {
                const marginPaddingClass =
                  settings.margin === 'compact'
                    ? 'p-2.5'
                    : settings.margin === 'generous'
                    ? 'p-5'
                    : 'p-3.5';
                const safeMarginInsetClass =
                  settings.margin === 'compact'
                    ? 'inset-1.5'
                    : settings.margin === 'generous'
                    ? 'inset-3.5'
                    : 'inset-2.5';
                const previewFontSizeStyle: React.CSSProperties = {
                  fontSize: `${effectiveFontSizePt}pt`,
                  lineHeight: settings.lineHeight === 'relaxed' ? 1.55 : 1.35,
                };

                // Layout 2: Meia Folha no A7 (50% do papel = 74,25 × 52,5 mm)
                if (activeImages.layout === 'half') {
                  const isTop = activeImages.position !== 'bottom';
                  const bookTitle = pages[0]?.title || '';
                  const bookAuthor = pages[0]?.author || '';
                  const hfData = getHeaderFooterContent(
                    currentPage,
                    pages.length,
                    settings,
                    bookTitle,
                    bookAuthor
                  );

                  return (
                    <div
                      className="w-full max-w-[280px] aspect-[74.25/105] bg-white border border-stone-300 rounded shadow-md p-0 flex flex-col justify-between text-stone-900 relative overflow-hidden"
                      style={{
                        fontFamily:
                          settings.fontFamily === 'serif'
                            ? 'Cormorant Garamond, serif'
                            : 'Plus Jakarta Sans, sans-serif',
                      }}
                    >
                      {isTop ? (
                        <>
                          {/* Metade Superior (50% do A7 = 74,25 × 52,5 mm): Foto Meia Folha Sangrada */}
                          <div className="w-full h-1/2 relative overflow-hidden shrink-0 border-b border-stone-200">
                            <PageImageRenderer
                              layout="half"
                              images={activeImages.images}
                              caption={activeImages.caption}
                              showLabels
                            />
                          </div>

                          {/* Metade Inferior (50% do A7): Conteúdo de Texto com Margens e Rodapé Word */}
                          <div className={`w-full h-1/2 ${marginPaddingClass} flex flex-col justify-between overflow-hidden relative shrink-0 bg-white`}>
                            <div
                              className={`absolute ${safeMarginInsetClass} border border-dashed border-stone-200 pointer-events-none rounded-xs`}
                            />
                            <div
                              style={previewFontSizeStyle}
                              className="space-y-1 text-stone-800 flex-1 flex flex-col overflow-hidden relative z-10"
                            >
                              {currentPage.title?.trim() && (
                                <h5 className="font-bold text-xs font-serif text-stone-900 mb-0.5 border-b border-stone-100 pb-0.5 shrink-0 truncate">
                                  {currentPage.title}
                                </h5>
                              )}
                              <div className="flex-1 overflow-hidden">
                                <MarkdownContent
                                  content={currentPage.content || ''}
                                  textAlign={settings.textAlign}
                                  onNavigateAnchor={handleAnchorNavigation}
                                />
                              </div>
                            </div>

                            {/* Rodapé Word-Style Interativo */}
                            {hfData.showFooter ? (
                              <div
                                onClick={() => setIsHFModalOpen(true)}
                                title="Rodapé (Clique para editar como no Word)"
                                className={`relative z-10 flex items-center justify-between text-[7.5px] text-stone-500 cursor-pointer hover:bg-amber-100/60 hover:text-stone-950 rounded px-1 transition-colors select-none group shrink-0 ${
                                  hfData.showFooterDivider ? 'border-t border-stone-200 pt-0.5' : ''
                                }`}
                              >
                                <span className="truncate max-w-[90px]">{hfData.footerLeft}</span>
                                {hfData.footerCenter && (
                                  <span className="truncate max-w-[70px] text-center">
                                    {hfData.footerCenter}
                                  </span>
                                )}
                                <span className="font-mono text-right shrink-0">{hfData.footerRight}</span>
                              </div>
                            ) : (
                              <div
                                onClick={() => setIsHFModalOpen(true)}
                                title="Rodapé Oculto (Área liberada para texto da página). Clique para editar."
                                className="absolute bottom-1 right-2 z-20 text-[6.5px] text-stone-400 hover:text-stone-800 bg-white/95 hover:bg-amber-100 border border-transparent hover:border-stone-300 rounded px-1 cursor-pointer transition-colors shadow-2xs opacity-0 hover:opacity-100"
                              >
                                <span className="font-mono">[Rodapé Expandido ⚙]</span>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Metade Superior (50% do A7): Cabeçalho Word e Conteúdo de Texto com Margens */}
                          <div className={`w-full h-1/2 ${marginPaddingClass} flex flex-col justify-between overflow-hidden relative shrink-0 bg-white border-b border-stone-200`}>
                            <div
                              className={`absolute ${safeMarginInsetClass} border border-dashed border-stone-200 pointer-events-none rounded-xs`}
                            />
                            {/* Cabeçalho Word-Style Interativo */}
                            {hfData.showHeader ? (
                              <div
                                onClick={() => setIsHFModalOpen(true)}
                                title="Cabeçalho (Clique para editar como no Word)"
                                className={`relative z-10 flex items-center justify-between text-[8px] text-stone-500 cursor-pointer hover:bg-amber-100/60 hover:text-stone-950 rounded px-1 transition-colors select-none group shrink-0 ${
                                  hfData.showTopDivider ? 'border-b border-stone-200 pb-0.5' : ''
                                }`}
                              >
                                <span className="truncate max-w-[85px]">{hfData.headerLeft}</span>
                                {hfData.headerCenter && (
                                  <span className="truncate max-w-[70px] text-center font-medium">
                                    {hfData.headerCenter}
                                  </span>
                                )}
                                <span className="font-mono text-right shrink-0">{hfData.headerRight}</span>
                              </div>
                            ) : (
                              <div
                                onClick={() => setIsHFModalOpen(true)}
                                title="Topo Desativado (Área liberada para texto da página). Clique para editar."
                                className="absolute top-1 right-2 z-20 text-[6.5px] text-stone-400 hover:text-stone-800 bg-white/95 hover:bg-amber-100 border border-transparent hover:border-stone-300 rounded px-1 cursor-pointer transition-colors shadow-2xs opacity-0 hover:opacity-100"
                              >
                                <span className="font-mono">[Topo Expandido ⚙]</span>
                              </div>
                            )}

                            <div
                              style={previewFontSizeStyle}
                              className="space-y-1 text-stone-800 flex-1 flex flex-col overflow-hidden relative z-10"
                            >
                              {currentPage.title?.trim() && (
                                <h5 className="font-bold text-xs font-serif text-stone-900 mb-0.5 border-b border-stone-100 pb-0.5 shrink-0 truncate">
                                  {currentPage.title}
                                </h5>
                              )}
                              <div className="flex-1 overflow-hidden">
                                <MarkdownContent
                                  content={currentPage.content || ''}
                                  textAlign={settings.textAlign}
                                  onNavigateAnchor={handleAnchorNavigation}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Metade Inferior (50% do A7 = 74,25 × 52,5 mm): Foto Meia Folha Sangrada */}
                          <div className="w-full h-1/2 relative overflow-hidden shrink-0">
                            <PageImageRenderer
                              layout="half"
                              images={activeImages.images}
                              caption={activeImages.caption}
                              showLabels
                            />
                          </div>
                        </>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    className={`w-full max-w-[280px] aspect-[74.25/105] bg-white border border-stone-300 rounded shadow-md ${
                      activeImages.layout === 'full' || activeImages.layout === 'two' || activeImages.layout === 'four' ? 'p-0' : marginPaddingClass
                    } flex flex-col justify-between text-stone-900 relative overflow-hidden`}
                    style={{
                      fontFamily:
                        settings.fontFamily === 'serif'
                          ? 'Cormorant Garamond, serif'
                          : 'Plus Jakarta Sans, sans-serif',
                    }}
                  >
                    {/* Safe Margins outline indicator (omitted in full bleed) */}
                    {activeImages.layout !== 'full' && (
                      <div
                        className={`absolute ${safeMarginInsetClass} border border-dashed border-stone-200 pointer-events-none rounded-xs`}
                      />
                    )}

                    {/* Header (Topo) - Estilo Word Interativo (omitted in full bleed) */}
                    {activeImages.layout === 'full' ? null : (() => {
                      const bookTitle = pages[0]?.title || '';
                      const bookAuthor = pages[0]?.author || '';
                      const hfData = getHeaderFooterContent(
                        currentPage,
                        pages.length,
                        settings,
                        bookTitle,
                        bookAuthor
                      );

                      if (hfData.showHeader) {
                        return (
                          <div
                            onClick={() => setIsHFModalOpen(true)}
                            title="Cabeçalho (Clique para editar como no Word)"
                            className={`relative z-10 flex items-center justify-between text-[8px] text-stone-500 cursor-pointer hover:bg-amber-100/60 hover:text-stone-950 rounded px-1 transition-colors select-none group ${
                              hfData.showTopDivider ? 'border-b border-stone-200 pb-0.5' : ''
                            }`}
                          >
                            <span className="truncate max-w-[85px]">{hfData.headerLeft}</span>
                            {hfData.headerCenter && (
                              <span className="truncate max-w-[70px] text-center font-medium">
                                {hfData.headerCenter}
                              </span>
                            )}
                            <span className="font-mono text-right shrink-0">{hfData.headerRight}</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          onClick={() => setIsHFModalOpen(true)}
                          title="Topo Desativado (Área liberada para texto da página). Clique para editar."
                          className="absolute top-1 right-2 z-20 text-[6.5px] text-stone-400 hover:text-stone-800 bg-white/95 hover:bg-amber-100 border border-transparent hover:border-stone-300 rounded px-1 cursor-pointer transition-colors shadow-2xs opacity-0 group-hover:opacity-100"
                        >
                          <span className="font-mono">[Topo Expandido ⚙]</span>
                        </div>
                      );
                    })()}

                    {/* Body Preview */}
                    <div
                      ref={previewBodyRef}
                      className={`relative z-10 flex-1 overflow-hidden ${
                        activeImages.layout === 'full'
                          ? 'h-full p-0'
                          : `${getHeaderFooterContent(currentPage, pages.length, settings).showHeader ? 'pt-1.5' : 'pt-0.5'} ${getHeaderFooterContent(currentPage, pages.length, settings).showFooter ? 'pb-1.5' : 'pb-0.5'} flex flex-col`
                      }`}
                    >
                      {activeImages.layout === 'full' ? (
                        <div className="w-full h-full">
                          <PageImageRenderer
                            layout="full"
                            images={activeImages.images}
                            caption={activeImages.caption}
                            showLabels
                          />
                        </div>
                      ) : activeImages.layout === 'two' ? (
                        <div className="w-full h-full flex flex-col">
                          <PageImageRenderer
                            layout="two"
                            images={activeImages.images}
                            showLabels
                            className="flex-1"
                          />
                        </div>
                      ) : activeImages.layout === 'four' ? (
                        <div className="w-full h-full flex flex-col">
                          <PageImageRenderer
                            layout="four"
                            images={activeImages.images}
                            showLabels
                            className="flex-1"
                          />
                        </div>
                      ) : isCover ? (
                        <CoverPageContent page={currentPage} settings={settings} variant="editor" onNavigateAnchor={handleAnchorNavigation} />
                      ) : isBackCover ? (
                        <div className="h-full flex flex-col justify-between p-2 text-center">
                          <div className="text-[9px] uppercase tracking-widest text-stone-400">
                            Contracapa
                          </div>
                          {currentPage.content?.trim() && (
                            <div className="text-[10.5px] italic text-stone-700 leading-relaxed">
                              <MarkdownContent
                                content={currentPage.content}
                                textAlign="center"
                                onNavigateAnchor={handleAnchorNavigation}
                              />
                            </div>
                          )}
                          {currentPage.dateOrPublisher?.trim() && (
                            <div className="text-[9px] text-stone-400 font-mono">
                              {currentPage.dateOrPublisher}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={previewFontSizeStyle}
                          className="space-y-1.5 text-stone-800 flex-1 flex flex-col"
                        >
                          {currentPage.title?.trim() && (
                            <h5 className="font-bold text-xs font-serif text-stone-900 mb-1 border-b border-stone-100 pb-0.5 shrink-0">
                              {currentPage.title}
                            </h5>
                          )}
                          <div className="flex-1 overflow-hidden">
                            <MarkdownContent
                              content={currentPage.content || ''}
                              textAlign={settings.textAlign}
                              onNavigateAnchor={handleAnchorNavigation}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer (Rodapé) - Estilo Word Interativo */}
                    {activeImages.layout === 'full' ? null : (() => {
                  const bookTitle = pages[0]?.title || '';
                  const bookAuthor = pages[0]?.author || '';
                  const hfData = getHeaderFooterContent(
                    currentPage,
                    pages.length,
                    settings,
                    bookTitle,
                    bookAuthor
                  );

                  if (hfData.showFooter) {
                    return (
                      <div
                        onClick={() => setIsHFModalOpen(true)}
                        title="Rodapé (Clique para editar como no Word)"
                        className={`relative z-10 flex items-center justify-between text-[7.5px] text-stone-500 cursor-pointer hover:bg-amber-100/60 hover:text-stone-950 rounded px-1 transition-colors select-none group ${
                          hfData.showFooterDivider ? 'border-t border-stone-200 pt-0.5' : ''
                        }`}
                      >
                        <span className="truncate max-w-[90px]">{hfData.footerLeft}</span>
                        {hfData.footerCenter && (
                          <span className="font-mono text-center shrink-0">
                            {hfData.footerCenter}
                          </span>
                        )}
                        <span className="font-mono text-right shrink-0">{hfData.footerRight}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      onClick={() => setIsHFModalOpen(true)}
                      title="Rodapé Desativado (Área liberada para texto da página). Clique para editar."
                      className="absolute bottom-1 right-2 z-20 text-[6.5px] text-stone-400 hover:text-stone-800 bg-white/95 hover:bg-amber-100 border border-transparent hover:border-stone-300 rounded px-1 cursor-pointer transition-colors shadow-2xs opacity-0 group-hover:opacity-100"
                    >
                      <span className="font-mono">[Rodapé Expandido ⚙]</span>
                    </div>
                  );
                })()}

                {/* Subtle Overlap warning directly inside the physical card */}
                {isPhysicalOverflow && (isInternal || isCover) && (
                  <div className="absolute bottom-1 inset-x-2 bg-rose-50/95 border border-rose-300 rounded px-2 py-0.5 text-[7.5px] text-rose-900 flex items-center justify-between shadow-xs z-20 backdrop-blur-xs">
                    <span className="font-semibold flex items-center gap-1">
                      ⚠️ Texto excede margem A7
                    </span>
                    {nextContentPage && (
                      <button
                        type="button"
                        onClick={() => {
                          onMoveParagraphToNext(currentPage.id);
                          setSelectionToast('✓ Parágrafo excedente movido para a próxima página');
                          setTimeout(() => setSelectionToast(null), 2500);
                        }}
                        className="text-rose-950 underline font-bold hover:text-rose-700 cursor-pointer ml-1"
                        title="Enviar último parágrafo para a próxima página"
                      >
                        Mover excedente →
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

              {/* Action button to open Header & Footer editor */}
              <button
                type="button"
                onClick={() => setIsHFModalOpen(true)}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 shadow-2xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-stone-600" />
                <span>Editar Topo e Rodapé (Estilo Word)</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Header & Footer Modal */}
      <HeaderFooterModal
        isOpen={isHFModalOpen}
        onClose={() => setIsHFModalOpen(false)}
        settings={settings}
        onChangeSettings={onUpdateSettings}
        currentPage={currentPage}
        totalPages={pages.length}
        onUpdatePage={onUpdatePage}
      />

      {/* Link Insert Assistant Modal */}
      <LinkInsertModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsert={handleInsertLink}
        initialSelectedText={selectedText}
        pages={pages}
      />

      {/* Phygital QR Code Generator Modal */}
      <QrCodeInsertModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onInsert={handleInsertQrCode}
        initialSelectedText={selectedText}
      />

      {/* A7 Page Image Modal */}
      <ImageInsertModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        page={currentPage}
        onApply={handleApplyImages}
      />
    </div>
  );
};
