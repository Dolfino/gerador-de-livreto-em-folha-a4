import React, { useState } from 'react';
import { PageDocument, BookSettings } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  LayoutGrid,
  Columns,
  Printer,
  Download,
  ArrowRight,
  RotateCw,
  Image as ImageIcon,
  Scissors,
} from 'lucide-react';
import { parseMarkdownText } from '../utils/pdfGenerator';
import { getHeaderFooterContent } from '../utils/headerFooterHelper';
import { MarkdownContent } from './MarkdownContent';
import { slugify } from '../utils/markdownParser';
import { PageImageRenderer } from './PageImageRenderer';
import { resolvePageImages } from '../utils/imageHelper';

interface ReadingPreviewProps {
  pages: PageDocument[];
  settings: BookSettings;
  onGoToSheetPreview: () => void;
  onEditPage: (pageId: number) => void;
}

export const ReadingPreview: React.FC<ReadingPreviewProps> = ({
  pages,
  settings,
  onGoToSheetPreview,
  onEditPage,
}) => {
  const [viewMode, setViewMode] = useState<'spread' | 'sequence' | 'poster'>('spread');
  const [spreadIndex, setSpreadIndex] = useState<number>(0);

  const is16P =
    settings.outputMode === 'continuation-16p' || settings.outputMode === 'booklet-bound-16p';
  const isPosterMode = settings.outputMode === 'poster-back';

  // Construct dynamic spreads based on pages
  const spreads: {
    left: PageDocument | null;
    right: PageDocument | null;
    label: string;
    isTransition?: boolean;
    isCenterSpread?: boolean;
  }[] = [];

  // Spread 0: Cover (Right only)
  spreads.push({
    left: null,
    right: pages.find((p) => p.id === 1) || null,
    label: 'Capa (Página 1)',
  });

  if (!is16P) {
    // 8-page spreads
    spreads.push(
      {
        left: pages.find((p) => p.id === 2) || null,
        right: pages.find((p) => p.id === 3) || null,
        label: 'Abertura 1 (Páginas 2 & 3)',
      },
      {
        left: pages.find((p) => p.id === 4) || null,
        right: pages.find((p) => p.id === 5) || null,
        label: 'Abertura Central (Páginas 4 & 5)',
        isCenterSpread: true,
      },
      {
        left: pages.find((p) => p.id === 6) || null,
        right: pages.find((p) => p.id === 7) || null,
        label: 'Abertura Final (Páginas 6 & 7)',
      },
      {
        left: pages.find((p) => p.id === 8) || null,
        right: null,
        label: 'Contracapa (Página 8)',
      }
    );
  } else if (settings.outputMode === 'continuation-16p') {
    // 16-page continuation
    spreads.push(
      {
        left: pages.find((p) => p.id === 2) || null,
        right: pages.find((p) => p.id === 3) || null,
        label: 'Parte I · Páginas 2 & 3',
      },
      {
        left: pages.find((p) => p.id === 4) || null,
        right: pages.find((p) => p.id === 5) || null,
        label: 'Parte I · Páginas 4 & 5',
      },
      {
        left: pages.find((p) => p.id === 6) || null,
        right: pages.find((p) => p.id === 7) || null,
        label: 'Parte I · Páginas 6 & 7',
      },
      {
        left: pages.find((p) => p.id === 8) || null,
        right: pages.find((p) => p.id === 9) || null,
        label: 'Transição: Desdobre e Vire a Folha (Págs. 8 & 9)',
        isTransition: true,
      },
      {
        left: pages.find((p) => p.id === 10) || null,
        right: pages.find((p) => p.id === 11) || null,
        label: 'Parte II · Páginas 10 & 11',
      },
      {
        left: pages.find((p) => p.id === 12) || null,
        right: pages.find((p) => p.id === 13) || null,
        label: 'Parte II · Páginas 12 & 13',
      },
      {
        left: pages.find((p) => p.id === 14) || null,
        right: pages.find((p) => p.id === 15) || null,
        label: 'Parte II · Páginas 14 & 15',
      },
      {
        left: pages.find((p) => p.id === 16) || null,
        right: null,
        label: 'Contracapa Final (Página 16)',
      }
    );
  } else {
    // booklet-bound-16p (consecutive spreads 2-3, 4-5, 6-7, 8-9, 10-11, 12-13, 14-15, 16)
    for (let p = 2; p <= 14; p += 2) {
      const leftP = pages.find((page) => page.id === p) || null;
      const rightP = pages.find((page) => page.id === p + 1) || null;
      spreads.push({
        left: leftP,
        right: rightP,
        label: `Abertura Páginas ${p} & ${p + 1}`,
        isCenterSpread: p === 8,
      });
    }
    spreads.push({
      left: pages.find((p) => p.id === 16) || null,
      right: null,
      label: 'Contracapa Final (Página 16)',
    });
  }

  const safeSpreadIndex = Math.min(spreadIndex, spreads.length - 1);
  const currentSpread = spreads[safeSpreadIndex];

  const handleAnchorNavigation = (anchorSlug: string) => {
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      if (p.content) {
        const lines = p.content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#')) {
            const h = trimmed.replace(/^#+\s*/, '');
            if (slugify(h) === anchorSlug) {
              if (viewMode === 'spread') {
                const sIdx = spreads.findIndex((s) => s.left?.id === p.id || s.right?.id === p.id);
                if (sIdx !== -1) setSpreadIndex(sIdx);
              }
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
              }, 120);
              return;
            }
          }
        }
      }
    }

    const el =
      document.getElementById(`heading-${anchorSlug}`) || document.getElementById(anchorSlug);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-amber-400', 'bg-amber-50');
      setTimeout(() => el.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-50'), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-[#FAF7F2] border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-stone-500 font-sans font-semibold">
            Etapa 3 de 4 · Experiência de Leitura
          </span>
          <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 mt-0.5">
            {isPosterMode && viewMode === 'poster'
              ? 'Pôster A4 Contínuo (Verso Desdobrado)'
              : 'Páginas em ordem cronológica de folheamento'}
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Exatamente como o leitor experimentará o livro após a dobra física.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPosterMode && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'poster' ? 'spread' : 'poster')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
                viewMode === 'poster'
                  ? 'bg-stone-900 text-white border-stone-900 font-semibold'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{viewMode === 'poster' ? 'Ver Páginas' : 'Ver Pôster do Verso'}</span>
            </button>
          )}

          {viewMode !== 'poster' && (
            <div className="flex bg-stone-200/70 p-0.5 rounded-lg border border-stone-300 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('spread')}
                className={`flex items-center gap-1 px-3 py-1 rounded transition-all cursor-pointer ${
                  viewMode === 'spread'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Página Dupla</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sequence')}
                className={`flex items-center gap-1 px-3 py-1 rounded transition-all cursor-pointer ${
                  viewMode === 'sequence'
                    ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Todas as Páginas</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onGoToSheetPreview}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-stone-900 hover:bg-stone-800 rounded font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span>Ver Folha Aberta A4</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Poster View Mode */}
      {viewMode === 'poster' && isPosterMode && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm flex flex-col items-center">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
              Orientação:{' '}
              {settings.posterSettings.orientation === 'portrait'
                ? 'Em pé (Retrato 210 × 297 mm)'
                : 'Deitada (Paisagem 297 × 210 mm)'}
            </span>
          </div>

          <div
            className={`w-full max-w-2xl bg-amber-50/30 border border-stone-300 rounded shadow-md p-8 relative flex flex-col justify-between text-stone-900 overflow-hidden ${
              settings.posterSettings.orientation === 'portrait'
                ? 'aspect-[210/297] max-w-md'
                : 'aspect-[297/210]'
            }`}
            style={{
              fontFamily:
                settings.fontFamily === 'serif'
                  ? 'Cormorant Garamond, serif'
                  : 'Plus Jakarta Sans, sans-serif',
            }}
          >
            {/* Background art image if supplied */}
            {settings.posterSettings.backgroundImage && (
              <img
                src={settings.posterSettings.backgroundImage}
                alt="Arte do pôster"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}

            {/* Cut Slit Zone Indicator */}
            {settings.posterSettings.showCutSlitZone && (
              <div
                className={`absolute pointer-events-none border border-dashed border-red-500 bg-red-500/10 flex items-center justify-center text-[10px] font-mono text-red-700 z-20 ${
                  settings.posterSettings.orientation === 'landscape'
                    ? 'left-1/4 right-1/4 top-1/2 -translate-y-1/2 h-6'
                    : 'top-1/4 bottom-1/4 left-1/2 -translate-x-1/2 w-6'
                }`}
              >
                <div className="flex items-center gap-1 bg-white/90 px-1 py-0.5 rounded shadow-2xs">
                  <Scissors className="w-3 h-3 text-red-600" />
                  <span>Fenda do Corte Central</span>
                </div>
              </div>
            )}

            {/* Only render text if user actually typed any content in the poster fields */}
            {(settings.posterSettings.title?.trim() ||
              settings.posterSettings.subtitle?.trim() ||
              settings.posterSettings.bodyText?.trim() ||
              settings.posterSettings.author?.trim()) && (
              <div
                className={`relative z-10 p-6 h-full flex flex-col justify-between ${
                  !settings.posterSettings.backgroundImage ? 'border border-stone-800/40' : ''
                }`}
              >
                {(settings.posterSettings.title?.trim() || settings.posterSettings.subtitle?.trim()) && (
                  <div className="text-center">
                    {!settings.posterSettings.backgroundImage && (
                      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-sans mb-1">
                        Minilivro 8P · Edição Pôster
                      </div>
                    )}
                    {settings.posterSettings.title?.trim() && (
                      <h1 className="text-2xl md:text-3xl font-bold font-serif leading-tight">
                        {settings.posterSettings.title}
                      </h1>
                    )}
                    {settings.posterSettings.subtitle?.trim() && (
                      <p className="text-xs text-stone-600 italic mt-1">
                        {settings.posterSettings.subtitle}
                      </p>
                    )}
                  </div>
                )}

                {settings.posterSettings.bodyText?.trim() && (
                  <div className="my-auto py-6 text-center max-w-lg mx-auto">
                    <p className="text-sm md:text-base leading-relaxed italic text-stone-800">
                      {settings.posterSettings.bodyText}
                    </p>
                  </div>
                )}

                {settings.posterSettings.author?.trim() && (
                  <div className="flex items-center justify-between text-[10px] text-stone-500 border-t border-stone-300 pt-2 font-mono">
                    <span>{settings.posterSettings.author}</span>
                    <span>Folha A4 Desdobrada</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Book Spread View Mode */}
      {viewMode === 'spread' && (
        <div className="space-y-4">
          {/* Spread Navigator */}
          <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <button
              type="button"
              onClick={() => setSpreadIndex((prev) => Math.max(0, prev - 1))}
              disabled={safeSpreadIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Abertura Anterior</span>
            </button>

            <div className="text-center">
              <span className="text-xs font-bold text-stone-900 block font-serif">
                {currentSpread?.label}
              </span>
              <span className="text-[10px] text-stone-500">
                Abertura {safeSpreadIndex + 1} de {spreads.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSpreadIndex((prev) => Math.min(spreads.length - 1, prev + 1))}
              disabled={safeSpreadIndex === spreads.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded disabled:opacity-30 cursor-pointer"
            >
              <span>Próxima Abertura</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Transition banner if on transition spread in 16p continuation */}
          {currentSpread?.isTransition && (
            <div className="bg-amber-100/90 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 flex items-center gap-3">
              <RotateCw className="w-5 h-5 text-amber-800 shrink-0" />
              <div>
                <strong>Atenção à virada física:</strong> Ao chegar à página 8, o leitor desdobra a
                folha A4, vira para a face traseira (verso) e refaz as dobras para continuar a
                leitura da página 9 até a contracapa 16!
              </div>
            </div>
          )}

          {/* Book Spread Simulation Container */}
          <div className="bg-[#FAF7F2] border border-stone-300 rounded-2xl p-6 md:p-10 shadow-sm flex justify-center">
            <div className="flex w-full max-w-3xl aspect-[148.5/105] shadow-xl rounded-lg overflow-hidden bg-white border border-stone-300 relative">
              {/* Center Spine shadow */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/5 via-black/15 to-black/5 pointer-events-none z-20" />

              {/* Left Page */}
              {(() => {
                const leftImg = currentSpread?.left ? resolvePageImages(currentSpread.left) : null;
                const isLeftNoPad =
                  leftImg?.hasImages &&
                  (leftImg.layout === 'full' ||
                    leftImg.layout === 'half' ||
                    leftImg.layout === 'two' ||
                    leftImg.layout === 'four');
                return (
                  <div
                    className={`w-1/2 border-r border-stone-200 relative bg-[#FCFCFA] ${
                      isLeftNoPad ? 'p-0 overflow-hidden' : 'p-5 md:p-8'
                    } flex flex-col justify-between`}
                  >
                    {currentSpread?.left ? (
                      <PageBookFace
                        page={currentSpread.left}
                        settings={settings}
                        totalPages={pages.length}
                        bookTitle={pages[0]?.title}
                        bookAuthor={pages[0]?.author}
                        onEdit={() => onEditPage(currentSpread.left!.id)}
                        onNavigateAnchor={handleAnchorNavigation}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[11px] text-stone-400 italic">
                        (Início do livreto fechado)
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Right Page */}
              {(() => {
                const rightImg = currentSpread?.right ? resolvePageImages(currentSpread.right) : null;
                const isRightNoPad =
                  rightImg?.hasImages &&
                  (rightImg.layout === 'full' ||
                    rightImg.layout === 'half' ||
                    rightImg.layout === 'two' ||
                    rightImg.layout === 'four');
                return (
                  <div
                    className={`w-1/2 relative bg-[#FCFCFA] ${
                      isRightNoPad ? 'p-0 overflow-hidden' : 'p-5 md:p-8'
                    } flex flex-col justify-between`}
                  >
                    {currentSpread?.right ? (
                      <PageBookFace
                        page={currentSpread.right}
                        settings={settings}
                        totalPages={pages.length}
                        bookTitle={pages[0]?.title}
                        bookAuthor={pages[0]?.author}
                        onEdit={() => onEditPage(currentSpread.right!.id)}
                        onNavigateAnchor={handleAnchorNavigation}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-[11px] text-stone-400 italic">
                        (Final do livreto fechado)
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Sequential View Mode */}
      {viewMode === 'sequence' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {pages.map((p) => {
            const hf = getHeaderFooterContent(
              p,
              pages.length,
              settings,
              pages[0]?.title,
              pages[0]?.author
            );
            const pImages = resolvePageImages(p);

            return (
              <div
                key={p.id}
                onClick={() => onEditPage(p.id)}
                className={`aspect-[74.25/105] bg-white border border-stone-200 hover:border-stone-900 rounded ${
                  pImages.hasImages &&
                  (pImages.layout === 'full' ||
                    pImages.layout === 'half' ||
                    pImages.layout === 'two' ||
                    pImages.layout === 'four')
                    ? 'p-0 overflow-hidden'
                    : 'p-2.5'
                } flex flex-col justify-between shadow-2xs cursor-pointer transition-all hover:shadow-xs relative`}
              >
                {pImages.hasImages && pImages.layout === 'full' ? (
                  <PageImageRenderer
                    layout="full"
                    images={pImages.images}
                    caption={pImages.caption}
                    compact
                    showLabels
                  />
                ) : pImages.hasImages && pImages.layout === 'half' ? (
                  <div className="w-full h-full flex flex-col">
                    {pImages.position !== 'bottom' ? (
                      <>
                        <div className="w-full h-1/2 relative overflow-hidden border-b border-stone-200 shrink-0">
                          <PageImageRenderer layout="half" images={pImages.images} compact />
                        </div>
                        <div className="w-full h-1/2 p-2 flex flex-col justify-between overflow-hidden bg-white text-[8px] leading-tight shrink-0">
                          <div className="overflow-hidden">
                            {p.title && <strong className="block text-stone-900 line-clamp-1">{p.title}</strong>}
                            <MarkdownContent content={p.content || ''} compact textAlign={settings.textAlign} onNavigateAnchor={handleAnchorNavigation} />
                          </div>
                          {hf.showFooter ? (
                            <div className="text-[7px] text-stone-400 text-right pt-0.5 border-t border-stone-100 font-mono">
                              {hf.footerRight || `Pág. ${p.editorialNumber}`}
                            </div>
                          ) : (
                            <div className="text-[7px] text-stone-300 text-right font-mono">Pág. {p.editorialNumber}</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-1/2 p-2 flex flex-col justify-between overflow-hidden bg-white text-[8px] leading-tight shrink-0 border-b border-stone-200">
                          {hf.showHeader && (
                            <div className="text-[7px] text-stone-400 pb-0.5 border-b border-stone-100 flex justify-between font-mono">
                              <span className="truncate max-w-[45px]">{hf.headerLeft}</span>
                              <span>{hf.headerRight}</span>
                            </div>
                          )}
                          <div className="overflow-hidden my-auto">
                            {p.title && <strong className="block text-stone-900 line-clamp-1">{p.title}</strong>}
                            <MarkdownContent content={p.content || ''} compact textAlign={settings.textAlign} onNavigateAnchor={handleAnchorNavigation} />
                          </div>
                        </div>
                        <div className="w-full h-1/2 relative overflow-hidden shrink-0">
                          <PageImageRenderer layout="half" images={pImages.images} compact />
                        </div>
                      </>
                    )}
                  </div>
                ) : pImages.hasImages && pImages.layout === 'two' ? (
                  <PageImageRenderer
                    layout="two"
                    images={pImages.images}
                    compact
                    showLabels
                    className="h-full"
                  />
                ) : pImages.hasImages && pImages.layout === 'four' ? (
                  <PageImageRenderer
                    layout="four"
                    images={pImages.images}
                    compact
                    showLabels
                    className="h-full"
                  />
                ) : (
                  <>
                    {hf.showHeader && (
                      <div className={`flex items-center justify-between text-[8px] text-stone-400 ${hf.showTopDivider ? 'border-b border-stone-100 pb-0.5' : ''}`}>
                        <span className="truncate max-w-[50px]">{hf.headerLeft}</span>
                        <span className="font-mono">{hf.headerRight}</span>
                      </div>
                    )}

                    <div className="text-[9px] line-clamp-6 text-stone-700 font-serif leading-tight">
                      {p.title && <strong className="block text-stone-900 line-clamp-1">{p.title}</strong>}
                      <MarkdownContent content={p.content || ''} compact textAlign={settings.textAlign} onNavigateAnchor={handleAnchorNavigation} />
                    </div>

                    {hf.showFooter ? (
                      <div className={`flex items-center justify-between text-[8px] text-stone-400 ${hf.showFooterDivider ? 'border-t border-stone-100 pt-0.5' : ''}`}>
                        <span className="truncate max-w-[45px]">{hf.footerLeft}</span>
                        <span className="font-mono">{hf.footerRight}</span>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PageBookFace: React.FC<{
  page: PageDocument;
  settings: BookSettings;
  totalPages: number;
  bookTitle?: string;
  bookAuthor?: string;
  onEdit: () => void;
  onNavigateAnchor?: (anchorSlug: string) => void;
}> = ({ page, settings, totalPages, bookTitle, bookAuthor, onEdit, onNavigateAnchor }) => {
  const isCover = page.role === 'cover' || page.id === 1;
  const isBackCover = page.role === 'back-cover';

  const hf = getHeaderFooterContent(page, totalPages, settings, bookTitle, bookAuthor);
  const pageImages = resolvePageImages(page);

  if (pageImages.hasImages && pageImages.layout === 'full') {
    return (
      <div onClick={onEdit} className="w-full h-full cursor-pointer relative group">
        <PageImageRenderer
          layout="full"
          images={pageImages.images}
          caption={pageImages.caption}
          showLabels
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-[9px] px-2 py-0.5 rounded backdrop-blur-xs font-sans">
          Clique p/ Editar ✎
        </div>
      </div>
    );
  }

  // Se a página possuir layout "half" (Meia Folha no A7: 50% da folha = 74,25 × 52,5 mm)
  if (pageImages.hasImages && pageImages.layout === 'half') {
    const isTop = pageImages.position !== 'bottom';
    return (
      <div
        onClick={onEdit}
        className="h-full flex flex-col justify-between cursor-pointer group select-none overflow-hidden"
        style={{
          fontFamily:
            settings.fontFamily === 'serif'
              ? 'Cormorant Garamond, serif'
              : 'Plus Jakarta Sans, sans-serif',
        }}
      >
        {isTop ? (
          <>
            {/* Top Half: 50% da folha preenchida com a foto */}
            <div className="w-full h-1/2 relative overflow-hidden shrink-0 border-b border-stone-200">
              <PageImageRenderer
                layout="half"
                images={pageImages.images}
                caption={pageImages.caption}
                showLabels
              />
            </div>
            {/* Bottom Half: 50% de texto com margem editorial e rodapé */}
            <div className="w-full h-1/2 p-3 md:p-5 flex flex-col justify-between overflow-hidden shrink-0 bg-[#FCFCFA]">
              <div className="space-y-1 md:space-y-1.5 text-xs md:text-sm leading-relaxed overflow-hidden">
                {page.title && (
                  <h4 className="font-bold text-sm md:text-base font-serif text-stone-900 mb-0.5 border-b border-stone-100 pb-0.5 shrink-0 truncate">
                    {page.title}
                  </h4>
                )}
                <div className="overflow-hidden">
                  <MarkdownContent
                    content={page.content || ''}
                    textAlign={settings.textAlign}
                    onNavigateAnchor={onNavigateAnchor}
                  />
                </div>
              </div>

              {hf.showFooter ? (
                <div className={`flex items-center justify-between text-[9px] text-stone-400 shrink-0 ${hf.showFooterDivider ? 'border-t border-stone-100 pt-1' : 'pt-1'}`}>
                  <span className="truncate max-w-[130px]">{hf.footerLeft}</span>
                  {hf.footerCenter && <span className="font-mono text-center shrink-0">{hf.footerCenter}</span>}
                  <span className="font-mono group-hover:text-stone-900 transition-colors text-right shrink-0">
                    {hf.footerRight || `Pág. ${page.editorialNumber}`} ✎
                  </span>
                </div>
              ) : (
                <div className="text-[8.5px] text-stone-300 text-right group-hover:text-stone-600 transition-colors shrink-0">
                  Editar pág. {page.editorialNumber} ✎
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Top Half: 50% de texto com cabeçalho editorial */}
            <div className="w-full h-1/2 p-3 md:p-5 flex flex-col justify-between overflow-hidden shrink-0 bg-[#FCFCFA] border-b border-stone-200">
              {hf.showHeader ? (
                <div className={`flex items-center justify-between text-[9.5px] text-stone-400 shrink-0 ${hf.showTopDivider ? 'border-b border-stone-100 pb-1' : 'pb-1'}`}>
                  <span className="truncate max-w-[120px]">{hf.headerLeft}</span>
                  {hf.headerCenter && <span className="truncate max-w-[100px] text-center">{hf.headerCenter}</span>}
                  <span className="font-mono text-right shrink-0">{hf.headerRight}</span>
                </div>
              ) : null}

              <div className="space-y-1 md:space-y-1.5 text-xs md:text-sm leading-relaxed overflow-hidden my-auto">
                {page.title && (
                  <h4 className="font-bold text-sm md:text-base font-serif text-stone-900 mb-0.5 border-b border-stone-100 pb-0.5 shrink-0 truncate">
                    {page.title}
                  </h4>
                )}
                <div className="overflow-hidden">
                  <MarkdownContent
                    content={page.content || ''}
                    textAlign={settings.textAlign}
                    onNavigateAnchor={onNavigateAnchor}
                  />
                </div>
              </div>
            </div>
            {/* Bottom Half: 50% da folha preenchida com a foto */}
            <div className="w-full h-1/2 relative overflow-hidden shrink-0">
              <PageImageRenderer
                layout="half"
                images={pageImages.images}
                caption={pageImages.caption}
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
      onClick={onEdit}
      className="h-full flex flex-col justify-between cursor-pointer group"
      style={{
        fontFamily:
          settings.fontFamily === 'serif'
            ? 'Cormorant Garamond, serif'
            : 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {hf.showHeader ? (
        <div className={`flex items-center justify-between text-[9.5px] text-stone-400 ${hf.showTopDivider ? 'border-b border-stone-100 pb-1' : 'pb-1'}`}>
          <span className="truncate max-w-[120px]">{hf.headerLeft}</span>
          {hf.headerCenter && <span className="truncate max-w-[100px] text-center">{hf.headerCenter}</span>}
          <span className="font-mono text-right shrink-0">{hf.headerRight}</span>
        </div>
      ) : null}

      <div className={`flex-1 ${hf.showHeader ? 'pt-3' : 'pt-0.5'} ${hf.showFooter ? 'pb-3' : 'pb-0.5'} overflow-hidden text-stone-800 flex flex-col`}>
        {pageImages.hasImages && pageImages.layout === 'two' ? (
          <div className="w-full h-full flex flex-col">
            <PageImageRenderer layout="two" images={pageImages.images} showLabels className="flex-1" />
          </div>
        ) : pageImages.hasImages && pageImages.layout === 'four' ? (
          <div className="w-full h-full flex flex-col">
            <PageImageRenderer layout="four" images={pageImages.images} showLabels className="flex-1" />
          </div>
        ) : isCover ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-2">
            {(page.title?.trim() || page.subtitle?.trim() || page.author?.trim()) && (
              <div className="w-10 h-0.5 bg-stone-900 mb-4" />
            )}
            {page.title?.trim() && (
              <h3 className="text-xl md:text-2xl font-bold font-serif leading-tight text-stone-900">
                {page.title}
              </h3>
            )}
            {page.subtitle?.trim() && (
              <p className="text-xs md:text-sm text-stone-600 mt-2 italic">{page.subtitle}</p>
            )}
            {page.author?.trim() && (
              <p className="text-xs text-stone-800 font-semibold mt-4 tracking-widest uppercase">
                {page.author}
              </p>
            )}
          </div>
        ) : isBackCover ? (
          <div className="h-full flex flex-col justify-between p-2 text-center">
            <div className="text-[10px] uppercase tracking-widest text-stone-400">Contracapa</div>
            {page.content?.trim() && (
              <div className="text-xs md:text-sm italic text-stone-700 leading-relaxed max-w-xs mx-auto">
                <MarkdownContent
                  content={page.content}
                  textAlign="center"
                  onNavigateAnchor={onNavigateAnchor}
                />
              </div>
            )}
            {page.dateOrPublisher?.trim() && (
              <div className="text-[10px] text-stone-400 font-mono">
                {page.dateOrPublisher}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 text-xs md:text-sm leading-relaxed flex-1 flex flex-col">
            {page.title && (
              <h4 className="font-bold text-sm md:text-base font-serif text-stone-900 mb-1 border-b border-stone-100 pb-1 shrink-0">
                {page.title}
              </h4>
            )}
            <div className="flex-1 overflow-hidden">
              <MarkdownContent
                content={page.content || ''}
                textAlign={settings.textAlign}
                onNavigateAnchor={onNavigateAnchor}
              />
            </div>
          </div>
        )}
      </div>

      {hf.showFooter ? (
        <div className={`flex items-center justify-between text-[9px] text-stone-400 ${hf.showFooterDivider ? 'border-t border-stone-100 pt-1' : 'pt-1'}`}>
          <span className="truncate max-w-[130px]">{hf.footerLeft}</span>
          {hf.footerCenter && <span className="font-mono text-center shrink-0">{hf.footerCenter}</span>}
          <span className="font-mono group-hover:text-stone-900 transition-colors text-right shrink-0">
            {hf.footerRight || `Pág. ${page.editorialNumber}`} ✎
          </span>
        </div>
      ) : (
        <div className="text-[8px] text-stone-300 text-right opacity-0 group-hover:opacity-100 transition-opacity">
          Editar pág. {page.editorialNumber} ✎
        </div>
      )}
    </div>
  );
};
