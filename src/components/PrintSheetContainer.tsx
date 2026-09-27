import React from 'react';
import { PageDocument, BookSettings } from '../types';
import { parseMarkdownText } from '../utils/pdfGenerator';
import { getHeaderFooterContent } from '../utils/headerFooterHelper';
import { MarkdownContent } from './MarkdownContent';
import { PageImageRenderer } from './PageImageRenderer';
import { resolvePageImages } from '../utils/imageHelper';
import { Scissors } from 'lucide-react';

interface PrintSheetContainerProps {
  pages: PageDocument[];
  settings: BookSettings;
}

export const PrintSheetContainer: React.FC<PrintSheetContainerProps> = ({ pages, settings }) => {
  const mode = settings.outputMode || 'front-only';
  const isPoster = mode === 'poster-back';
  const isContinuation = mode === 'continuation-16p';
  const isBound = mode === 'booklet-bound-16p';

  return (
    <div className="print-only print-sheet-container bg-white text-stone-900 overflow-hidden box-border">
      {/* PAGE 1: FRONT */}
      <div
        className="w-[297mm] h-[210mm] relative grid grid-rows-2 grid-cols-4 box-border bg-white page-break-after-always"
        style={{
          fontFamily:
            settings.fontFamily === 'serif'
              ? 'Cormorant Garamond, serif'
              : 'Plus Jakarta Sans, sans-serif',
        }}
      >
        {isBound ? (
          <>
            {/* Bound Front: Row 0 [16, 1, 14, 3], Row 1 [12, 5, 10, 7] */}
            {[16, 1, 14, 3].map((pageId) => (
              <BoundPanel key={pageId} pageId={pageId} pages={pages} settings={settings} />
            ))}
            {[12, 5, 10, 7].map((pageId) => (
              <BoundPanel key={pageId} pageId={pageId} pages={pages} settings={settings} />
            ))}
          </>
        ) : (
          <>
            {/* Minizine Front: Top Row [5, 4, 3, 2] (Rotated 180°), Bottom Row [6, 7, 8, 1] (0°) */}
            {[5, 4, 3, 2].map((pageId) => {
              const page = pages.find((p) => p.id === pageId) || {
                id: pageId,
                stableId: `p-${pageId}`,
                editorialNumber: pageId,
                role: 'content' as const,
                content: '',
                title: `Página ${pageId}`,
              };
              const isFull = resolvePageImages(page).layout === 'full';
              return (
                <div
                  key={pageId}
                  className={`relative w-[74.25mm] h-[105mm] border-r border-b border-stone-300 box-border overflow-hidden ${
                    isFull ? 'p-0' : 'p-2.5'
                  } flex flex-col justify-between`}
                >
                  <div className="w-full h-full rotate-180 transform flex flex-col justify-between">
                    <PrintPanelContent
                      page={page}
                      settings={settings}
                      totalPages={pages.length}
                      bookTitle={pages[0]?.title}
                      bookAuthor={pages[0]?.author}
                    />
                  </div>
                </div>
              );
            })}

            {[6, 7, 8, 1].map((pageId) => {
              const page = pages.find((p) => p.id === pageId) || {
                id: pageId,
                stableId: `p-${pageId}`,
                editorialNumber: pageId,
                role: 'content' as const,
                content: '',
                title: `Página ${pageId}`,
              };
              const isFull = resolvePageImages(page).layout === 'full';
              return (
                <div
                  key={pageId}
                  className={`relative w-[74.25mm] h-[105mm] border-r border-b border-stone-300 box-border overflow-hidden ${
                    isFull ? 'p-0' : 'p-2.5'
                  } flex flex-col justify-between`}
                >
                  <PrintPanelContent
                    page={page}
                    settings={settings}
                    totalPages={pages.length}
                    bookTitle={pages[0]?.title}
                    bookAuthor={pages[0]?.author}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* PAGE 2: BACK (if Duplex mode) */}
      {(isPoster || isContinuation || isBound) && (
        <div
          className="w-[297mm] h-[210mm] relative box-border bg-white"
          style={{
            fontFamily:
              settings.fontFamily === 'serif'
                ? 'Cormorant Garamond, serif'
                : 'Plus Jakarta Sans, sans-serif',
          }}
        >
          {isPoster ? (
            <div className="w-[297mm] h-[210mm] relative box-border bg-white overflow-hidden">
              {settings.posterSettings.orientation === 'portrait' ? (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[210mm] h-[297mm] rotate-90 transform overflow-hidden flex flex-col justify-between">
                  {settings.posterSettings.backgroundImage && (
                    <img
                      src={settings.posterSettings.backgroundImage}
                      alt="Arte Pôster"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {(settings.posterSettings.title?.trim() ||
                    settings.posterSettings.subtitle?.trim() ||
                    settings.posterSettings.bodyText?.trim() ||
                    settings.posterSettings.author?.trim()) && (
                    <div
                      className={`relative z-10 p-10 h-full flex flex-col justify-between ${
                        !settings.posterSettings.backgroundImage ? 'border-2 border-stone-800' : ''
                      }`}
                    >
                      {(settings.posterSettings.title?.trim() ||
                        settings.posterSettings.subtitle?.trim()) && (
                        <div className="text-center">
                          {!settings.posterSettings.backgroundImage && (
                            <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-1">
                              Minilivro 8P · Edição Pôster A4
                            </div>
                          )}
                          {settings.posterSettings.title?.trim() && (
                            <h1 className="text-3xl font-bold font-serif">
                              {settings.posterSettings.title}
                            </h1>
                          )}
                          {settings.posterSettings.subtitle?.trim() && (
                            <p className="text-xs text-stone-600 italic">
                              {settings.posterSettings.subtitle}
                            </p>
                          )}
                        </div>
                      )}

                      {settings.posterSettings.bodyText?.trim() && (
                        <div className="my-auto py-8 text-center max-w-lg mx-auto">
                          <p className="text-sm italic leading-relaxed text-stone-800">
                            {settings.posterSettings.bodyText}
                          </p>
                        </div>
                      )}

                      {settings.posterSettings.author?.trim() && (
                        <div className="flex items-center justify-between text-[10px] text-stone-500 border-t border-stone-300 pt-2 font-mono">
                          <span>{settings.posterSettings.author}</span>
                          <span>Folha A4 Completa (Verso)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={`w-full h-full relative overflow-hidden flex flex-col justify-between ${
                    !settings.posterSettings.backgroundImage ? 'border-2 border-stone-800 p-10' : ''
                  }`}
                >
                  {settings.posterSettings.backgroundImage && (
                    <img
                      src={settings.posterSettings.backgroundImage}
                      alt="Arte Pôster"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  {(settings.posterSettings.title?.trim() ||
                    settings.posterSettings.subtitle?.trim() ||
                    settings.posterSettings.bodyText?.trim() ||
                    settings.posterSettings.author?.trim()) && (
                    <div className="relative z-10 p-10 h-full flex flex-col justify-between">
                      {(settings.posterSettings.title?.trim() ||
                        settings.posterSettings.subtitle?.trim()) && (
                        <div className="text-center">
                          {!settings.posterSettings.backgroundImage && (
                            <div className="text-[10px] uppercase tracking-widest text-stone-600 mb-1">
                              Minilivro 8P · Edição Pôster A4
                            </div>
                          )}
                          {settings.posterSettings.title?.trim() && (
                            <h1 className="text-3xl font-bold font-serif">
                              {settings.posterSettings.title}
                            </h1>
                          )}
                          {settings.posterSettings.subtitle?.trim() && (
                            <p className="text-xs text-stone-600 italic">
                              {settings.posterSettings.subtitle}
                            </p>
                          )}
                        </div>
                      )}

                      {settings.posterSettings.bodyText?.trim() && (
                        <div className="my-auto py-8 text-center max-w-lg mx-auto">
                          <p className="text-sm italic leading-relaxed text-stone-800">
                            {settings.posterSettings.bodyText}
                          </p>
                        </div>
                      )}

                      {settings.posterSettings.author?.trim() && (
                        <div className="flex items-center justify-between text-[10px] text-stone-500 border-t border-stone-300 pt-2 font-mono">
                          <span>{settings.posterSettings.author}</span>
                          <span>Folha A4 Completa (Verso)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : isBound ? (
            <div className="w-[297mm] h-[210mm] grid grid-rows-2 grid-cols-4 box-border">
              {[4, 13, 2, 15].map((pageId) => (
                <BoundPanel key={pageId} pageId={pageId} pages={pages} settings={settings} />
              ))}
              {[8, 9, 6, 11].map((pageId) => (
                <BoundPanel key={pageId} pageId={pageId} pages={pages} settings={settings} />
              ))}
            </div>
          ) : (
            <div className="w-[297mm] h-[210mm] grid grid-rows-2 grid-cols-4 box-border">
              {[10, 11, 12, 13].map((pageId) => {
                const page = pages.find((p) => p.id === pageId) || {
                  id: pageId,
                  stableId: `p-${pageId}`,
                  editorialNumber: pageId,
                  role: 'content' as const,
                  content: '',
                  title: `Página ${pageId}`,
                };
                return (
                  <div
                    key={pageId}
                    className="relative w-[74.25mm] h-[105mm] border-r border-b border-stone-300 box-border overflow-hidden p-2.5 flex flex-col justify-between"
                  >
                    <div className="w-full h-full rotate-180 transform flex flex-col justify-between">
                      <PrintPanelContent
                        page={page}
                        settings={settings}
                        totalPages={pages.length}
                        bookTitle={pages[0]?.title}
                        bookAuthor={pages[0]?.author}
                      />
                    </div>
                  </div>
                );
              })}

              {[9, 16, 15, 14].map((pageId) => {
                const page = pages.find((p) => p.id === pageId) || {
                  id: pageId,
                  stableId: `p-${pageId}`,
                  editorialNumber: pageId,
                  role: 'content' as const,
                  content: '',
                  title: `Página ${pageId}`,
                };
                return (
                  <div
                    key={pageId}
                    className="relative w-[74.25mm] h-[105mm] border-r border-b border-stone-300 box-border overflow-hidden p-2.5 flex flex-col justify-between"
                  >
                    <PrintPanelContent
                      page={page}
                      settings={settings}
                      totalPages={pages.length}
                      bookTitle={pages[0]?.title}
                      bookAuthor={pages[0]?.author}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BoundPanel: React.FC<{
  pageId: number;
  pages: PageDocument[];
  settings: BookSettings;
}> = ({ pageId, pages, settings }) => {
  const page = pages.find((p) => p.id === pageId) || {
    id: pageId,
    stableId: `p-${pageId}`,
    editorialNumber: pageId,
    role: 'content' as const,
    content: '',
    title: `Página ${pageId}`,
  };

  return (
    <div className="relative w-[74.25mm] h-[105mm] border-r border-b border-stone-300 box-border overflow-hidden p-2.5 flex flex-col justify-between">
      <PrintPanelContent
        page={page}
        settings={settings}
        totalPages={pages.length}
        bookTitle={pages[0]?.title}
        bookAuthor={pages[0]?.author}
      />
    </div>
  );
};

const PrintPanelContent: React.FC<{
  page: PageDocument;
  settings: BookSettings;
  totalPages?: number;
  bookTitle?: string;
  bookAuthor?: string;
}> = ({ page, settings, totalPages = 8, bookTitle, bookAuthor }) => {
  const isCover = page.role === 'cover' || page.id === 1;
  const isBackCover = page.role === 'back-cover';

  const hf = getHeaderFooterContent(page, totalPages, settings, bookTitle, bookAuthor);
  const pageImages = resolvePageImages(page);

  if (pageImages.hasImages && pageImages.layout === 'full') {
    return (
      <div className="w-full h-full overflow-hidden">
        <PageImageRenderer
          layout="full"
          images={pageImages.images}
          caption={pageImages.caption}
          isPrint
        />
      </div>
    );
  }

  if (pageImages.hasImages && pageImages.layout === 'half') {
    const isTop = pageImages.position !== 'bottom';
    return (
      <div className="w-full h-full flex flex-col justify-between text-stone-900 overflow-hidden">
        {isTop ? (
          <>
            <div className="w-full h-1/2 relative overflow-hidden shrink-0 border-b border-stone-200">
              <PageImageRenderer
                layout="half"
                images={pageImages.images}
                caption={pageImages.caption}
                isPrint
              />
            </div>
            <div className="w-full h-1/2 p-2.5 flex flex-col justify-between overflow-hidden shrink-0 bg-white">
              <div className="space-y-1 text-[8.5pt] text-stone-800 leading-snug">
                {page.title && (
                  <h2 className="font-bold text-[9.5pt] font-serif text-stone-900 mb-0.5 pb-0.5 border-b border-stone-100 shrink-0 truncate">
                    {page.title}
                  </h2>
                )}
                <div className="overflow-hidden">
                  <MarkdownContent content={page.content || ''} textAlign={settings.textAlign} isPrint />
                </div>
              </div>
              {hf.showFooter && (
                <div
                  className={`flex items-center justify-between text-[7pt] text-stone-400 shrink-0 ${
                    hf.showFooterDivider ? 'border-t border-stone-200 pt-0.5' : ''
                  }`}
                >
                  <span className="truncate max-w-[120px]">{hf.footerLeft}</span>
                  <span className="font-mono text-right shrink-0">{hf.footerRight}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-full h-1/2 p-2.5 flex flex-col justify-between overflow-hidden shrink-0 bg-white border-b border-stone-200">
              {hf.showHeader && (
                <div
                  className={`flex items-center justify-between text-[7.5pt] text-stone-400 shrink-0 ${
                    hf.showTopDivider ? 'border-b border-stone-200 pb-0.5' : ''
                  }`}
                >
                  <span className="truncate max-w-[120px]">{hf.headerLeft}</span>
                  <span className="font-mono text-right shrink-0">{hf.headerRight}</span>
                </div>
              )}
              <div className="space-y-1 text-[8.5pt] text-stone-800 leading-snug my-auto">
                {page.title && (
                  <h2 className="font-bold text-[9.5pt] font-serif text-stone-900 mb-0.5 pb-0.5 border-b border-stone-100 shrink-0 truncate">
                    {page.title}
                  </h2>
                )}
                <div className="overflow-hidden">
                  <MarkdownContent content={page.content || ''} textAlign={settings.textAlign} isPrint />
                </div>
              </div>
            </div>
            <div className="w-full h-1/2 relative overflow-hidden shrink-0">
              <PageImageRenderer
                layout="half"
                images={pageImages.images}
                caption={pageImages.caption}
                isPrint
              />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-between text-stone-900 overflow-hidden">
      {hf.showHeader && (
        <div
          className={`flex items-center justify-between text-[7.5pt] text-stone-400 ${
            hf.showTopDivider ? 'border-b border-stone-200 pb-0.5 mb-1' : 'mb-1'
          }`}
        >
          <span className="truncate max-w-[120px]">{hf.headerLeft}</span>
          {hf.headerCenter && (
            <span className="truncate max-w-[90px] text-center font-medium">
              {hf.headerCenter}
            </span>
          )}
          <span className="font-mono text-right shrink-0">{hf.headerRight}</span>
        </div>
      )}

      <div className="flex-1 overflow-hidden leading-snug flex flex-col">
        {pageImages.hasImages && pageImages.layout === 'two' ? (
          <div className="w-full h-full flex flex-col">
            <PageImageRenderer layout="two" images={pageImages.images} isPrint className="flex-1" />
          </div>
        ) : pageImages.hasImages && pageImages.layout === 'four' ? (
          <div className="w-full h-full flex flex-col">
            <PageImageRenderer layout="four" images={pageImages.images} isPrint className="flex-1" />
          </div>
        ) : isCover ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-2">
            {(page.title?.trim() || page.subtitle?.trim() || page.author?.trim()) && (
              <div className="w-8 h-0.5 bg-stone-900 mb-2" />
            )}
            {page.title?.trim() && (
              <h1 className="text-[12pt] font-serif font-bold leading-tight">{page.title}</h1>
            )}
            {page.subtitle?.trim() && (
              <p className="text-[8pt] text-stone-600 italic mt-1">{page.subtitle}</p>
            )}
            {page.author?.trim() && (
              <p className="text-[7.5pt] text-stone-800 font-medium mt-3 uppercase tracking-wider">
                {page.author}
              </p>
            )}
          </div>
        ) : isBackCover ? (
          <div className="h-full flex flex-col justify-between text-center p-2">
            <span className="text-[7pt] uppercase tracking-widest text-stone-400">Contracapa</span>
            {page.content?.trim() && (
              <div className="text-[8.5pt] italic text-stone-700 leading-relaxed">
                <MarkdownContent content={page.content} textAlign="center" isPrint />
              </div>
            )}
            {page.dateOrPublisher?.trim() && (
              <span className="text-[7pt] text-stone-400 font-mono">
                {page.dateOrPublisher}
              </span>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-1 text-[8.5pt] text-stone-800 leading-snug">
            {page.title && (
              <h2 className="font-bold text-[9.5pt] font-serif text-stone-900 mb-0.5 pb-0.5 border-b border-stone-100 shrink-0 truncate">
                {page.title}
              </h2>
            )}
            <div className="flex-1 overflow-hidden">
              <MarkdownContent content={page.content || ''} textAlign={settings.textAlign} isPrint />
            </div>
          </div>
        )}
      </div>

      {hf.showFooter && (
        <div
          className={`flex items-center justify-between text-[7pt] text-stone-400 ${
            hf.showFooterDivider ? 'border-t border-stone-200 pt-0.5 mt-1' : 'mt-1'
          }`}
        >
          <span className="truncate max-w-[120px]">{hf.footerLeft}</span>
          {hf.footerCenter && (
            <span className="font-mono text-center shrink-0">{hf.footerCenter}</span>
          )}
          <span className="font-mono text-right shrink-0">{hf.footerRight}</span>
        </div>
      )}
    </div>
  );
};
