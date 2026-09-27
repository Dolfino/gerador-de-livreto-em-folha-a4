import React from 'react';
import {
  BookSettings,
  HeaderFooterSettings,
  HeaderSource,
  FooterSource,
  PageNumberFormat,
  PageNumberPosition,
  HeaderAlign,
} from '../types';
import {
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Hash,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Settings2,
} from 'lucide-react';

interface HeaderFooterEditorProps {
  settings: BookSettings;
  onChange: (updatedSettings: BookSettings) => void;
  currentPageNumber?: number;
  totalPages?: number;
  customPageHeader?: string;
  customPageFooter?: string;
  onUpdatePageCustomHF?: (header?: string, footer?: string) => void;
  onClose?: () => void;
}

export const HeaderFooterEditor: React.FC<HeaderFooterEditorProps> = ({
  settings,
  onChange,
  currentPageNumber,
  totalPages = 8,
  customPageHeader,
  customPageFooter,
  onUpdatePageCustomHF,
  onClose,
}) => {
  const hf: HeaderFooterSettings = settings.headerFooter || {
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

  const updateHF = (partial: Partial<HeaderFooterSettings>) => {
    onChange({
      ...settings,
      headerFooter: {
        ...hf,
        ...partial,
      },
    });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-6 shadow-xs text-xs text-stone-700">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-stone-100 rounded-lg text-stone-800">
            <Settings2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-serif text-stone-900">
              Cabeçalho e Rodapé (Topo e Rodapé)
            </h3>
            <p className="text-[11px] text-stone-500">
              Configure ativação, textos, numeração e estilo como no Microsoft Word.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium cursor-pointer self-start sm:self-center"
          >
            Concluir
          </button>
        )}
      </div>

      {/* Word-style Quick Rules (Primeira Página Diferente) */}
      <div className="bg-amber-50/70 border border-amber-200/90 rounded-lg p-3 space-y-2">
        <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">
          Regras Estilo Word
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hf.differentFirstPage}
              onChange={(e) => updateHF({ differentFirstPage: e.target.checked })}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <span className="font-semibold text-stone-900 block">Primeira Página Diferente (Capa)</span>
              <span className="text-[10.5px] text-stone-600 leading-tight block">
                Oculta automaticamente o cabeçalho e rodapé na página de capa (Página 1).
              </span>
            </div>
          </label>

          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hf.hideOnBackCover}
              onChange={(e) => updateHF({ hideOnBackCover: e.target.checked })}
              className="mt-0.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <div>
              <span className="font-semibold text-stone-900 block">Ocultar na Contracapa</span>
              <span className="text-[10.5px] text-stone-600 leading-tight block">
                Mantém a contracapa final limpa e sem numeração de página.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* SEÇÃO 1: TOPO (CABEÇALHO) */}
      <div className="border border-stone-200 rounded-xl p-4 space-y-3.5 bg-[#FAF7F2]">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              1. Topo da Página (Cabeçalho)
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => updateHF({ showTopHeader: !hf.showTopHeader })}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
              hf.showTopHeader
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
          >
            {hf.showTopHeader ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hf.showTopHeader ? 'Cabeçalho Ativado' : 'Cabeçalho Desativado'}</span>
          </button>
        </div>

        {!hf.showTopHeader && (
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-lg p-2.5 text-[11px] text-emerald-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Área expandida:</strong> Com o cabeçalho desativado, o espaço do topo é liberado para o texto da página, permitindo +1 a 2 linhas extras por página (+10% de capacidade).
            </span>
          </div>
        )}

        {hf.showTopHeader && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Origem do Texto */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Conteúdo do Cabeçalho
                </label>
                <select
                  value={hf.topHeaderSource}
                  onChange={(e) => updateHF({ topHeaderSource: e.target.value as HeaderSource })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white text-xs text-stone-800"
                >
                  <option value="page-title">Título da Página Atual</option>
                  <option value="book-title">Título da Obra (Global)</option>
                  <option value="custom">Texto Personalizado Fixo</option>
                  <option value="none">Sem texto (Apenas número se ativo)</option>
                </select>
              </div>

              {/* Alinhamento do Cabeçalho */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Alinhamento do Texto
                </label>
                <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200">
                  {(['left', 'center', 'right'] as HeaderAlign[]).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateHF({ topHeaderAlign: align })}
                      className={`flex-1 py-1 flex items-center justify-center rounded transition-all cursor-pointer ${
                        hf.topHeaderAlign === align
                          ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                      title={
                        align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'
                      }
                    >
                      {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                      {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                      {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opções de Número e Linha */}
              <div className="flex flex-col justify-end space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hf.showTopPageNumber}
                    onChange={(e) => updateHF({ showTopPageNumber: e.target.checked })}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span className="text-[11px] text-stone-700">Número de página no topo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hf.showTopDivider}
                    onChange={(e) => updateHF({ showTopDivider: e.target.checked })}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <span className="text-[11px] text-stone-700">Linha divisória sutil</span>
                </label>
              </div>
            </div>

            {/* Custom Header Input if custom selected */}
            {hf.topHeaderSource === 'custom' && (
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Texto Fixo do Cabeçalho
                </label>
                <input
                  type="text"
                  value={hf.topHeaderText}
                  onChange={(e) => updateHF({ topHeaderText: e.target.value })}
                  placeholder="Ex: Minilivro 8P · Edição de Bolso"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded bg-white text-xs text-stone-800 focus:ring-1 focus:ring-stone-900"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* SEÇÃO 2: RODAPÉ */}
      <div className="border border-stone-200 rounded-xl p-4 space-y-3.5 bg-[#FAF7F2]">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              2. Rodapé da Página
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => updateHF({ showFooter: !hf.showFooter })}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
              hf.showFooter
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
          >
            {hf.showFooter ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{hf.showFooter ? 'Rodapé Ativado' : 'Rodapé Desativado'}</span>
          </button>
        </div>

        {!hf.showFooter && (
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-lg p-2.5 text-[11px] text-emerald-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Área expandida:</strong> Com o rodapé desativado, o espaço inferior é liberado para o texto da página, permitindo +1 a 2 linhas extras por página (+9% de capacidade).
            </span>
          </div>
        )}

        {hf.showFooter && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Origem do Texto do Rodapé */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Texto de Apoio no Rodapé
                </label>
                <select
                  value={hf.footerSource}
                  onChange={(e) => updateHF({ footerSource: e.target.value as FooterSource })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white text-xs text-stone-800"
                >
                  <option value="book-title">Título da Obra</option>
                  <option value="author">Nome do Autor</option>
                  <option value="page-title">Título da Página</option>
                  <option value="custom">Texto Personalizado</option>
                  <option value="none">Nenhum Texto</option>
                </select>
              </div>

              {/* Formato da Numeração de Página */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Formato do Número de Página
                </label>
                <select
                  value={hf.pageNumberFormat}
                  onChange={(e) => updateHF({ pageNumberFormat: e.target.value as PageNumberFormat })}
                  className="w-full px-2.5 py-1.5 border border-stone-300 rounded bg-white text-xs text-stone-800"
                >
                  <option value="simple">Apenas número (ex: 2)</option>
                  <option value="prefix">Com prefixo (ex: Pág. 2)</option>
                  <option value="fraction">Com total (ex: 2 / {totalPages})</option>
                  <option value="roman">Algarismo Romano (ex: ii)</option>
                  <option value="none">Ocultar número</option>
                </select>
              </div>

              {/* Posição do Número no Rodapé */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Posição da Numeração
                </label>
                <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200">
                  {(['left', 'center', 'right', 'none'] as PageNumberPosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => updateHF({ pageNumberPosition: pos })}
                      className={`flex-1 py-1 text-center rounded transition-all cursor-pointer text-[10px] ${
                        hf.pageNumberPosition === pos
                          ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {pos === 'left'
                        ? 'Esq.'
                        : pos === 'center'
                        ? 'Centro'
                        : pos === 'right'
                        ? 'Dir.'
                        : 'Oculto'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Footer Input if custom selected */}
            {hf.footerSource === 'custom' && (
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Texto Fixo do Rodapé
                </label>
                <input
                  type="text"
                  value={hf.footerText}
                  onChange={(e) => updateHF({ footerText: e.target.value })}
                  placeholder="Ex: Exemplar de leitura livre · 2026"
                  className="w-full px-3 py-1.5 border border-stone-300 rounded bg-white text-xs text-stone-800 focus:ring-1 focus:ring-stone-900"
                />
              </div>
            )}

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hf.showFooterDivider}
                  onChange={(e) => updateHF({ showFooterDivider: e.target.checked })}
                  className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span className="text-[11px] text-stone-700">Linha divisória sutil sobre o rodapé</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* SEÇÃO 3: SOBRESCRITA ESPECÍFICA DESTA PÁGINA (OPCIONAL) */}
      {currentPageNumber !== undefined && onUpdatePageCustomHF && (
        <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-xs">
              Sobrescrever Cabeçalho / Rodapé apenas nesta Página ({currentPageNumber})
            </span>
            <span className="text-[10px] text-stone-500">Opcional</span>
          </div>
          <p className="text-[11px] text-stone-600">
            Se preenchido, substitui a regra global exclusivamente para a página {currentPageNumber}.
            Deixe em branco para usar a configuração padrão do livro.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Cabeçalho específico da Pág. {currentPageNumber}
              </label>
              <input
                type="text"
                value={customPageHeader || ''}
                onChange={(e) => onUpdatePageCustomHF(e.target.value, customPageFooter)}
                placeholder="Padrão do livro..."
                className="w-full px-3 py-1.5 border border-stone-300 rounded bg-white text-xs text-stone-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Rodapé específico da Pág. {currentPageNumber}
              </label>
              <input
                type="text"
                value={customPageFooter || ''}
                onChange={(e) => onUpdatePageCustomHF(customPageHeader, e.target.value)}
                placeholder="Padrão do livro..."
                className="w-full px-3 py-1.5 border border-stone-300 rounded bg-white text-xs text-stone-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
