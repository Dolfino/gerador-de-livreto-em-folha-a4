import React from 'react';
import { Printer, Download, Sparkles, HelpCircle, BookOpen, Image as ImageIcon } from 'lucide-react';
import { OutputMode } from '../types';

interface HeaderProps {
  onDownloadPDF: () => void;
  onPrint: () => void;
  onLoadTestBooklet: () => void;
  onLoadImageTestBooklet?: () => void;
  onOpenGuide: () => void;
  activeTab: 'edit' | 'pages' | 'sheet' | 'reader';
  setActiveTab: (tab: 'edit' | 'pages' | 'sheet' | 'reader') => void;
  outputMode: OutputMode;
  pageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onDownloadPDF,
  onPrint,
  onLoadTestBooklet,
  onLoadImageTestBooklet,
  onOpenGuide,
  activeTab,
  setActiveTab,
  outputMode,
  pageCount,
}) => {
  const modeSubtitle = (() => {
    switch (outputMode) {
      case 'poster-back':
        return '1 Folha A4 · 8 Páginas + Pôster Duplex';
      case 'continuation-16p':
        return '1 Folha A4 · 16 Páginas Minizine Duplex';
      case 'booklet-bound-16p':
        return '1 Folha A4 · 16 Páginas Caderno A7 Duplex';
      case 'front-only':
      default:
        return '1 Folha A4 · 8 Páginas Frente Única';
    }
  })();

  return (
    <header className="border-b border-stone-200 bg-[#FCFAF7] sticky top-0 z-30 px-4 md:px-8 py-3.5 no-print">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark + mode descriptor */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('edit');
            }}
            className="text-lg md:text-xl font-serif font-bold tracking-tight text-stone-900 hover:text-stone-700 transition-colors"
          >
            Minilivro 8P
          </a>
          <span className="hidden sm:inline-block text-xs text-stone-400">·</span>
          <span className="hidden sm:inline-block text-xs text-stone-600 font-sans font-medium bg-stone-100 px-2 py-0.5 rounded">
            {modeSubtitle}
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100/70 p-1 rounded-lg border border-stone-200/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            1. Preparar Conteúdo
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pages'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            2. Revisar Páginas (1–{pageCount})
          </button>
          <button
            onClick={() => setActiveTab('reader')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reader'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            3. Prévia de Leitura
          </button>
          <button
            onClick={() => setActiveTab('sheet')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sheet'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            4. Folha Aberta A4
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {onLoadImageTestBooklet && (
            <button
              type="button"
              onClick={onLoadImageTestBooklet}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs text-teal-900 bg-teal-50/90 hover:bg-teal-100 border border-teal-300 rounded font-medium transition-colors shadow-2xs cursor-pointer"
              title="Carregar álbum de teste com os 4 formatos físicos de imagem no A7 (Sangria total, meia folha, 2 e 4 poses)"
            >
              <ImageIcon className="w-3.5 h-3.5 text-teal-700" />
              <span>Álbum A7 Fotos</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLoadTestBooklet}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-900 bg-amber-50/90 hover:bg-amber-100 border border-amber-300 rounded font-medium transition-colors shadow-2xs cursor-pointer"
            title="Carregar exemplar com instruções de montagem impressas em cada painel"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Exemplar de Teste</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded font-medium transition-colors shadow-2xs cursor-pointer"
            title="Ver instruções passo a passo de como dobrar e cortar a folha A4"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Guia de Dobra</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300/80 rounded font-medium transition-colors shadow-2xs cursor-pointer"
            title="Imprimir diretamente do navegador"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs text-white bg-stone-900 hover:bg-stone-800 rounded font-medium transition-colors shadow-2xs cursor-pointer"
            title="Gerar e baixar PDF em folha A4 horizontal"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PDF</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="flex md:hidden items-center justify-around gap-1 pt-2.5 mt-2 border-t border-stone-200/60 text-xs">
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-1 rounded text-center ${
            activeTab === 'edit' ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-600'
          }`}
        >
          1. Texto
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`flex-1 py-1 rounded text-center ${
            activeTab === 'pages' ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-600'
          }`}
        >
          2. Páginas
        </button>
        <button
          onClick={() => setActiveTab('reader')}
          className={`flex-1 py-1 rounded text-center ${
            activeTab === 'reader' ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-600'
          }`}
        >
          3. Leitura
        </button>
        <button
          onClick={() => setActiveTab('sheet')}
          className={`flex-1 py-1 rounded text-center ${
            activeTab === 'sheet' ? 'bg-stone-200 text-stone-900 font-bold' : 'text-stone-600'
          }`}
        >
          4. Folha A4
        </button>
      </div>
    </header>
  );
};
