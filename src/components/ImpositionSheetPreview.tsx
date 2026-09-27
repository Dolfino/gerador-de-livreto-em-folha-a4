import React, { useState } from 'react';
import { PageDocument, BookSettings } from '../types';
import {
  Scissors,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  Download,
  Info,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { parseMarkdownText } from '../utils/pdfGenerator';
import { getHeaderFooterContent } from '../utils/headerFooterHelper';
import { MarkdownContent } from './MarkdownContent';
import { PageImageRenderer } from './PageImageRenderer';
import { resolvePageImages } from '../utils/imageHelper';
import { getPageFontSizePt } from '../utils/textDistributor';
import { CoverPageContent } from './CoverPageContent';

interface ImpositionSheetPreviewProps {
  pages: PageDocument[];
  settings: BookSettings;
  onDownloadPDF: () => void;
  onPrint: () => void;
  volumeNumber?: number;
  totalVolumes?: number;
}

interface PanelGridItem {
  id: number;
  label: string;
  rotated: boolean;
  folio?: string;
}

export const ImpositionSheetPreview: React.FC<ImpositionSheetPreviewProps> = ({
  pages,
  settings,
  onDownloadPDF,
  onPrint,
  volumeNumber,
  totalVolumes,
}) => {
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1);
  const [activeFace, setActiveFace] = useState<'front' | 'back'>('front');

  const isDuplexMode = settings.outputMode !== 'front-only';
  const isPosterMode = settings.outputMode === 'poster-back';
  const isContinuation16P = settings.outputMode === 'continuation-16p';
  const isBound16P = settings.outputMode === 'booklet-bound-16p';

  // Grid mapping for Front and Back
  const getPanelData = (face: 'front' | 'back'): { row0: PanelGridItem[]; row1: PanelGridItem[] } => {
    if (isBound16P) {
      // 4 folios outside on front, inside on back
      if (face === 'front') {
        return {
          row0: [
            { id: 16, label: 'Pág. 16 (Contracapa)', rotated: false, folio: 'Fólio 1 Ext' },
            { id: 1, label: 'Pág. 1 (Capa)', rotated: false, folio: 'Fólio 1 Ext' },
            { id: 14, label: 'Pág. 14', rotated: false, folio: 'Fólio 2 Ext' },
            { id: 3, label: 'Pág. 3', rotated: false, folio: 'Fólio 2 Ext' },
          ],
          row1: [
            { id: 12, label: 'Pág. 12', rotated: false, folio: 'Fólio 3 Ext' },
            { id: 5, label: 'Pág. 5', rotated: false, folio: 'Fólio 3 Ext' },
            { id: 10, label: 'Pág. 10', rotated: false, folio: 'Fólio 4 Ext' },
            { id: 7, label: 'Pág. 7', rotated: false, folio: 'Fólio 4 Ext' },
          ],
        };
      } else {
        // Back face (short edge duplex flip)
        return {
          row0: [
            { id: 4, label: 'Pág. 4', rotated: false, folio: 'Fólio 2 Int' },
            { id: 13, label: 'Pág. 13', rotated: false, folio: 'Fólio 2 Int' },
            { id: 2, label: 'Pág. 2', rotated: false, folio: 'Fólio 1 Int' },
            { id: 15, label: 'Pág. 15', rotated: false, folio: 'Fólio 1 Int' },
          ],
          row1: [
            { id: 8, label: 'Pág. 8 (Centro)', rotated: false, folio: 'Fólio 4 Int' },
            { id: 9, label: 'Pág. 9 (Centro)', rotated: false, folio: 'Fólio 4 Int' },
            { id: 6, label: 'Pág. 6', rotated: false, folio: 'Fólio 3 Int' },
            { id: 11, label: 'Pág. 11', rotated: false, folio: 'Fólio 3 Int' },
          ],
        };
      }
    } else if (isContinuation16P && face === 'back') {
      // Continuation 16P back face
      return {
        row0: [
          { id: 10, label: 'Pág. 10', rotated: true },
          { id: 11, label: 'Pág. 11', rotated: true },
          { id: 12, label: 'Pág. 12', rotated: true },
          { id: 13, label: 'Pág. 13', rotated: true },
        ],
        row1: [
          { id: 9, label: 'Pág. 9 (Parte II)', rotated: false },
          { id: 16, label: 'Pág. 16 (Contracapa)', rotated: false },
          { id: 15, label: 'Pág. 15', rotated: false },
          { id: 14, label: 'Pág. 14', rotated: false },
        ],
      };
    } else {
      // Standard Front (8 panels minizine)
      return {
        row0: [
          { id: 5, label: 'Pág. 5', rotated: true },
          { id: 4, label: 'Pág. 4', rotated: true },
          { id: 3, label: 'Pág. 3', rotated: true },
          { id: 2, label: 'Pág. 2', rotated: true },
        ],
        row1: [
          { id: 6, label: 'Pág. 6', rotated: false },
          { id: 7, label: 'Pág. 7', rotated: false },
          { id: 8, label: 'Pág. 8', rotated: false },
          { id: 1, label: 'Pág. 1 (Capa)', rotated: false },
        ],
      };
    }
  };

  const currentPanels = getPanelData(activeFace);

  return (
    <div className="space-y-6">
      {/* Top Description & Action Bar */}
      <div className="bg-[#FAF7F2] border border-stone-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-widest text-stone-500 font-sans font-semibold">
              Etapa 4 de 4 · Folha Aberta A4
            </span>
            {totalVolumes && totalVolumes > 1 && (
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                Volume {volumeNumber} de {totalVolumes}
              </span>
            )}
            <span className="text-[11px] font-bold text-stone-700 bg-stone-200/70 px-2 py-0.5 rounded">
              {isDuplexMode ? '2 Faces (Frente & Verso)' : '1 Face (Frente Única)'}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-serif font-bold text-stone-900 mt-0.5">
            Disposição exata que será impressa no papel
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            {isBound16P
              ? '4 fólios A7 alinhados para corte central horizontal e encadernação de lombada.'
              : isPosterMode && activeFace === 'back'
              ? 'Pôster contínuo A4 ocupando todo o verso com indicação da fenda.'
              : 'Linha superior invertida (180°), linha inferior normal (0°) e corte central.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Face selector if duplex */}
          {isDuplexMode && (
            <div className="flex bg-stone-200/80 p-0.5 rounded-lg border border-stone-300 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveFace('front')}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeFace === 'front'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Frente
              </button>
              <button
                type="button"
                onClick={() => setActiveFace('back')}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeFace === 'back'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Verso {isPosterMode ? '(Pôster)' : ''}
              </button>
            </div>
          )}

          {/* Toggle overlays */}
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border transition-colors cursor-pointer ${
              showOverlays
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Guias & Rótulos</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-white border border-stone-300 rounded text-xs">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
              className="p-1.5 hover:bg-stone-100 text-stone-700 cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-stone-600">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(1.4, s + 0.1))}
              className="p-1.5 hover:bg-stone-100 text-stone-700 cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-stone-900 hover:bg-stone-800 rounded font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PDF</span>
          </button>
        </div>
      </div>

      {/* Sheet Simulation Canvas */}
      <div className="overflow-x-auto p-4 md:p-8 bg-stone-200/50 rounded-2xl flex justify-center items-center min-h-[520px]">
        {/* Poster Back Face Special View */}
        {isPosterMode && activeFace === 'back' ? (
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150"
          >
            <div className="w-[891px] h-[630px] bg-white border border-stone-400 shadow-2xl relative select-none overflow-hidden">
              {/* Slit indication on the physical sheet */}
              {showOverlays && (
                <div className="absolute left-[222.75px] right-[222.75px] top-1/2 -translate-y-1/2 h-0 border-t-2 border-dashed border-red-500 z-30 flex items-center justify-center pointer-events-none">
                  <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 shadow-xs">
                    <Scissors className="w-3 h-3" />
                    CORTE DA FENDA CENTRAL (148,5 mm)
                  </span>
                </div>
              )}

              {settings.posterSettings.orientation === 'portrait' ? (
                /* Portrait poster rotated 90deg to fit onto 297x210 landscape sheet */
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[630px] h-[891px] rotate-90 transform overflow-hidden flex flex-col justify-between"
                  style={{
                    fontFamily:
                      settings.fontFamily === 'serif'
                        ? 'Cormorant Garamond, serif'
                        : 'Plus Jakarta Sans, sans-serif',
                  }}
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
                    <div
                      className={`relative z-10 p-8 h-full flex flex-col justify-between ${
                        !settings.posterSettings.backgroundImage ? 'border-2 border-stone-800/60' : ''
                      }`}
                    >
                      {(settings.posterSettings.title?.trim() || settings.posterSettings.subtitle?.trim()) && (
                        <div className="text-center">
                          {!settings.posterSettings.backgroundImage && (
                            <div className="text-xs uppercase tracking-widest text-stone-600 mb-2">
                              Minilivro 8P · Edição Especial Pôster A4
                            </div>
                          )}
                          {settings.posterSettings.title?.trim() && (
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">
                              {settings.posterSettings.title}
                            </h1>
                          )}
                          {settings.posterSettings.subtitle?.trim() && (
                            <p className="text-sm text-stone-600 italic mt-2">
                              {settings.posterSettings.subtitle}
                            </p>
                          )}
                        </div>
                      )}

                      {settings.posterSettings.bodyText?.trim() && (
                        <div className="max-w-xl mx-auto text-center my-auto py-6">
                          <p className="text-base md:text-lg leading-relaxed italic text-stone-800">
                            {settings.posterSettings.bodyText}
                          </p>
                        </div>
                      )}

                      {settings.posterSettings.author?.trim() && (
                        <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-300 pt-3 font-mono">
                          <span>{settings.posterSettings.author}</span>
                          <span>Folha A4 Completa (Verso)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Landscape poster upright directly on 297x210 landscape sheet */
                <div
                  className="w-full h-full relative overflow-hidden flex flex-col justify-between"
                  style={{
                    fontFamily:
                      settings.fontFamily === 'serif'
                        ? 'Cormorant Garamond, serif'
                        : 'Plus Jakarta Sans, sans-serif',
                  }}
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
                    <div
                      className={`relative z-10 p-8 h-full flex flex-col justify-between ${
                        !settings.posterSettings.backgroundImage ? 'border-2 border-stone-800/60' : ''
                      }`}
                    >
                      {(settings.posterSettings.title?.trim() || settings.posterSettings.subtitle?.trim()) && (
                        <div className="text-center">
                          {!settings.posterSettings.backgroundImage && (
                            <div className="text-xs uppercase tracking-widest text-stone-600 mb-2">
                              Minilivro 8P · Edição Especial Pôster A4
                            </div>
                          )}
                          {settings.posterSettings.title?.trim() && (
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight">
                              {settings.posterSettings.title}
                            </h1>
                          )}
                          {settings.posterSettings.subtitle?.trim() && (
                            <p className="text-sm text-stone-600 italic mt-2">
                              {settings.posterSettings.subtitle}
                            </p>
                          )}
                        </div>
                      )}

                      {settings.posterSettings.bodyText?.trim() && (
                        <div className="max-w-xl mx-auto text-center my-auto py-6">
                          <p className="text-base md:text-lg leading-relaxed italic text-stone-800">
                            {settings.posterSettings.bodyText}
                          </p>
                        </div>
                      )}

                      {settings.posterSettings.author?.trim() && (
                        <div className="flex items-center justify-between text-xs text-stone-500 border-t border-stone-300 pt-3 font-mono">
                          <span>{settings.posterSettings.author}</span>
                          <span>Folha A4 Completa (Verso)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 8-Panel Grid (Front or Back) */
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150"
          >
            {/* Real A4 landscape proportion: 297mm x 210mm -> 891px x 630px */}
            <div className="w-[891px] h-[630px] bg-white border border-stone-400 shadow-2xl relative grid grid-rows-2 grid-cols-4 select-none">
              {/* Central Horizontal Cut Line or Fold Line */}
              <div
                className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0 z-20 pointer-events-none ${
                  isBound16P
                    ? 'border-t-2 border-dashed border-red-500'
                    : 'border-t border-dashed border-stone-400'
                }`}
              >
                {isBound16P && showOverlays && (
                  <div className="absolute left-1/2 -translate-x-1/2 -top-3.5 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 shadow-xs">
                    <Scissors className="w-3 h-3" />
                    CORTE HORIZONTAL COMPLETO (Separação em 2 Tiras)
                  </div>
                )}
              </div>

              {/* Vertical Fold/Cut Lines */}
              <div
                className={`absolute top-0 bottom-0 left-1/4 -translate-x-1/2 w-0 border-l z-20 pointer-events-none ${
                  isBound16P ? 'border-dashed border-red-400' : 'border-dashed border-stone-400'
                }`}
              />
              <div
                className={`absolute top-0 bottom-0 left-2/4 -translate-x-1/2 w-0 border-l z-20 pointer-events-none ${
                  isBound16P ? 'border-dashed border-red-500' : 'border-dashed border-stone-400'
                }`}
              >
                {isBound16P && showOverlays && (
                  <div className="absolute top-1/4 -translate-y-1/2 -left-12 bg-red-600 text-white text-[8px] px-1 py-0.5 rounded font-mono font-bold">
                    Corte Vertical
                  </div>
                )}
              </div>
              <div
                className={`absolute top-0 bottom-0 left-3/4 -translate-x-1/2 w-0 border-l z-20 pointer-events-none ${
                  isBound16P ? 'border-dashed border-red-400' : 'border-dashed border-stone-400'
                }`}
              />

              {/* Minizine Central Slit (for non-bound modes) */}
              {!isBound16P && showOverlays && (
                <div className="absolute left-1/4 right-1/4 top-1/2 -translate-y-1/2 h-0 border-t-2 border-red-600 z-30 pointer-events-none flex items-center justify-center">
                  <div className="bg-red-600 text-white text-[9.5px] font-mono px-2 py-0.5 rounded shadow-xs flex items-center gap-1 uppercase tracking-wider font-bold">
                    <Scissors className="w-3 h-3" />
                    Corte Central (Fenda de 148,5 mm)
                  </div>
                </div>
              )}

              {/* ROW 0 (Top 4 panels) */}
              {currentPanels.row0.map((panel, idx) => {
                const pageDoc = pages.find((p) => p.id === panel.id) || {
                  id: panel.id,
                  stableId: `p-${panel.id}`,
                  editorialNumber: panel.id,
                  role: 'content' as const,
                  title: `Página ${panel.id}`,
                  content: '',
                };

                return (
                  <ImpositionPanelCard
                    key={`r0-${panel.id}-${idx}`}
                    page={pageDoc}
                    label={panel.label}
                    isRotated={panel.rotated}
                    showOverlays={showOverlays}
                    settings={settings}
                    folioTag={panel.folio}
                    totalPages={pages.length}
                    bookTitle={pages[0]?.title}
                    bookAuthor={pages[0]?.author}
                  />
                );
              })}

              {/* ROW 1 (Bottom 4 panels) */}
              {currentPanels.row1.map((panel, idx) => {
                const pageDoc = pages.find((p) => p.id === panel.id) || {
                  id: panel.id,
                  stableId: `p-${panel.id}`,
                  editorialNumber: panel.id,
                  role: 'content' as const,
                  title: `Página ${panel.id}`,
                  content: '',
                };

                return (
                  <ImpositionPanelCard
                    key={`r1-${panel.id}-${idx}`}
                    page={pageDoc}
                    label={panel.label}
                    isRotated={panel.rotated}
                    showOverlays={showOverlays}
                    settings={settings}
                    folioTag={panel.folio}
                    totalPages={pages.length}
                    bookTitle={pages[0]?.title}
                    bookAuthor={pages[0]?.author}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Assembly Guide Summary Pill */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-700 shadow-2xs">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-stone-500 shrink-0" />
          <span>
            {isBound16P ? (
              <>
                <strong>Caderno Encadernado:</strong> Corte a folha em 4 fólios de 148,5 × 105 mm,
                dobre cada fólio ao meio e encadeie-os pela lombada (pares: 16-1, 14-3, 12-5, 10-7).
              </>
            ) : isPosterMode ? (
              <>
                <strong>Verso Pôster:</strong> Dobre o minizine normalmente para leitura. Ao abrir e
                desdobrar a folha, o leitor encontra o pôster contínuo A4 no verso!
              </>
            ) : isContinuation16P ? (
              <>
                <strong>Continuação 16P:</strong> Após ler as páginas 1 a 8, desdobre a folha, vire
                para a face traseira e refaça a dobra para acompanhar os capítulos 9 a 16.
              </>
            ) : (
              <>
                <strong>Montagem 8P:</strong> Dobre ao meio no comprimento, corte apenas a linha
                central vermelha (fenda), empurre as pontas formando uma cruz e feche em livro!
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={onPrint}
          className="shrink-0 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-medium transition-colors cursor-pointer"
        >
          Imprimir Agora
        </button>
      </div>
    </div>
  );
};

const ImpositionPanelCard: React.FC<{
  page: PageDocument;
  label: string;
  isRotated: boolean;
  showOverlays: boolean;
  settings: BookSettings;
  folioTag?: string;
  totalPages?: number;
  bookTitle?: string;
  bookAuthor?: string;
}> = ({
  page,
  label,
  isRotated,
  showOverlays,
  settings,
  folioTag,
  totalPages = 8,
  bookTitle,
  bookAuthor,
}) => {
  const isCover = page.role === 'cover' || page.id === 1;
  const isBackCover = page.role === 'back-cover';

  const hf = getHeaderFooterContent(page, totalPages, settings, bookTitle, bookAuthor);
  const pageImages = resolvePageImages(page);
  const pageFontSizePt = getPageFontSizePt(page, settings);
  const previewThumbnailSize = Math.max(6, Math.min(10.5, pageFontSizePt * 0.85));
  const thumbTextStyle: React.CSSProperties = {
    fontSize: `${previewThumbnailSize}px`,
    lineHeight: settings.lineHeight === 'relaxed' ? 1.45 : 1.25,
  };

  return (
    <div
      className={`relative border-r border-b border-stone-200 ${
        pageImages.hasImages && pageImages.layout === 'full' ? 'p-0' : 'p-3'
      } overflow-hidden flex flex-col justify-between bg-white`}
    >
      {/* Overlay Badge */}
      {showOverlays && (
        <div
          className={`absolute z-30 flex items-center justify-between text-[9px] font-mono px-2 py-0.5 rounded shadow-2xs pointer-events-none ${
            isRotated
              ? 'top-2 right-2 bg-stone-800 text-white'
              : 'bottom-2 right-2 bg-stone-100 border border-stone-300 text-stone-800'
          }`}
        >
          <div className="flex items-center gap-1">
            {isRotated && <RotateCw className="w-2.5 h-2.5 text-amber-400" />}
            <span className="font-bold">{label}</span>
            {isRotated && <span className="text-[8px] text-amber-300">(180°)</span>}
            {folioTag && <span className="ml-1 text-[8px] text-stone-400">· {folioTag}</span>}
          </div>
        </div>
      )}

      {/* Internal Content (rotated or normal) */}
      <div
        className={`w-full h-full flex flex-col justify-between transition-transform ${
          isRotated ? 'rotate-180 transform' : ''
        }`}
        style={{
          fontFamily:
            settings.fontFamily === 'serif'
              ? 'Cormorant Garamond, serif'
              : 'Plus Jakarta Sans, sans-serif',
        }}
      >
        {pageImages.hasImages && pageImages.layout === 'full' ? (
          <div className="w-full h-full">
            <PageImageRenderer
              layout="full"
              images={pageImages.images}
              caption={pageImages.caption}
              compact
              showLabels
            />
          </div>
        ) : pageImages.hasImages && pageImages.layout === 'half' ? (
          <div className="w-full h-full flex flex-col justify-between">
            {pageImages.position !== 'bottom' ? (
              <>
                <div className="w-full h-1/2 relative overflow-hidden border-b border-stone-200 shrink-0">
                  <PageImageRenderer layout="half" images={pageImages.images} compact />
                </div>
                <div className="w-full h-1/2 p-1.5 flex flex-col justify-between overflow-hidden bg-white text-[8px] leading-tight shrink-0">
                  <div style={thumbTextStyle} className="overflow-hidden">
                    {page.title?.trim() && (
                      <h5 className="font-bold text-[9px] font-serif text-stone-900 mb-0.5 shrink-0 truncate">
                        {page.title}
                      </h5>
                    )}
                    <MarkdownContent content={page.content || ''} compact textAlign={settings.textAlign} />
                  </div>
                  {hf.showFooter ? (
                    <div className="text-[7px] text-stone-400 text-right pt-0.5 border-t border-stone-100 font-mono">
                      {hf.footerRight || `Pág. ${page.editorialNumber}`}
                    </div>
                  ) : (
                    <div className="text-[7px] text-stone-300 text-right font-mono">Pág. {page.editorialNumber}</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-1/2 p-1.5 flex flex-col justify-between overflow-hidden bg-white text-[8px] leading-tight shrink-0 border-b border-stone-200">
                  {hf.showHeader ? (
                    <div className="text-[7px] text-stone-400 pb-0.5 border-b border-stone-100 flex justify-between font-mono">
                      <span className="truncate max-w-[45px]">{hf.headerLeft}</span>
                      <span>{hf.headerRight}</span>
                    </div>
                  ) : null}
                  <div style={thumbTextStyle} className="overflow-hidden my-auto">
                    {page.title?.trim() && (
                      <h5 className="font-bold text-[9px] font-serif text-stone-900 mb-0.5 shrink-0 truncate">
                        {page.title}
                      </h5>
                    )}
                    <MarkdownContent content={page.content || ''} compact textAlign={settings.textAlign} />
                  </div>
                </div>
                <div className="w-full h-1/2 relative overflow-hidden shrink-0">
                  <PageImageRenderer layout="half" images={pageImages.images} compact />
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Panel Header */}
            {hf.showHeader ? (
              <div className={`flex items-center justify-between text-[7.5px] text-stone-400 ${hf.showTopDivider ? 'border-b border-stone-100 pb-0.5' : 'pb-0.5'}`}>
                <span className="truncate max-w-[65px]">{hf.headerLeft}</span>
                {hf.headerCenter && <span className="truncate max-w-[50px] text-center">{hf.headerCenter}</span>}
                <span className="font-mono text-right shrink-0">{hf.headerRight}</span>
              </div>
            ) : null}

            {/* Panel Content Preview */}
            <div className={`flex-1 ${hf.showHeader ? 'pt-1' : 'pt-0.5'} ${hf.showFooter ? 'pb-1' : 'pb-0.5'} overflow-hidden text-stone-800 text-[8.5px] leading-tight flex flex-col`}>
              {pageImages.hasImages && pageImages.layout === 'two' ? (
                <div className="w-full h-full flex flex-col">
                  <PageImageRenderer
                    layout="two"
                    images={pageImages.images}
                    compact
                    showLabels
                    className="flex-1"
                  />
                </div>
              ) : pageImages.hasImages && pageImages.layout === 'four' ? (
                <div className="w-full h-full flex flex-col">
                  <PageImageRenderer
                    layout="four"
                    images={pageImages.images}
                    compact
                    showLabels
                    className="flex-1"
                  />
                </div>
              ) : isCover ? (
                <CoverPageContent page={page} settings={settings} variant="sheet" />
              ) : isBackCover ? (
                <div className="h-full flex flex-col justify-between text-center p-1">
                  <span className="text-[7.5px] uppercase tracking-wider text-stone-400">
                    Contracapa
                  </span>
                  {page.content?.trim() && (
                    <div className="text-[8px] italic text-stone-600 line-clamp-4">
                      <MarkdownContent content={page.content} compact textAlign="center" />
                    </div>
                  )}
                  {page.dateOrPublisher?.trim() && (
                    <span className="text-[7.5px] text-stone-400 font-mono">
                      {page.dateOrPublisher}
                    </span>
                  )}
                </div>
              ) : (
                <div style={thumbTextStyle} className="flex-1 flex flex-col">
                  {page.title?.trim() && (
                    <h5 className="font-bold text-[9px] font-serif text-stone-900 mb-0.5 shrink-0 truncate">
                      {page.title}
                    </h5>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <MarkdownContent content={page.content || ''} compact textAlign={settings.textAlign} />
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            {hf.showFooter ? (
              <div className={`flex items-center justify-between text-[7px] text-stone-400 ${hf.showFooterDivider ? 'border-t border-stone-100 pt-0.5' : 'pt-0.5'}`}>
                <span className="truncate max-w-[65px]">{hf.footerLeft}</span>
                {hf.footerCenter && <span className="font-mono text-center shrink-0">{hf.footerCenter}</span>}
                <span className="font-mono text-right shrink-0">{hf.footerRight}</span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
