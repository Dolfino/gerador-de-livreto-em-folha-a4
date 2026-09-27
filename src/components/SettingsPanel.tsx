import React, { useState } from 'react';
import {
  BookSettings,
  FontSizeOption,
  FONT_SIZE_OPTIONS,
  MarginOption,
  FoldGuideStyle,
  HeaderFooterSettings,
  TextDistributionMode,
} from '../types';
import {
  Sliders,
  Type,
  Scissors,
  AlignLeft,
  AlignJustify,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { HeaderFooterEditor } from './HeaderFooterEditor';
import { getPageFontSizePt } from '../utils/textDistributor';

interface SettingsPanelProps {
  settings: BookSettings;
  onChange: (updated: BookSettings) => void;
  totalPages?: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  totalPages = 8,
}) => {
  const [isHeaderFooterExpanded, setIsHeaderFooterExpanded] = useState<boolean>(false);

  const update = <K extends keyof BookSettings>(key: K, value: BookSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

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
    <div className="bg-[#FAF7F2] border border-stone-200/80 rounded-xl p-4 space-y-4 text-xs text-stone-700 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-200 pb-2.5 gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-stone-900">
          <Sliders className="w-3.5 h-3.5 text-stone-600" />
          <span>Configurações Tipográficas & Diagramação</span>
        </div>

        {/* Quick Header & Footer Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-200/60 p-0.5 rounded-lg border border-stone-300 text-[11px]">
            <button
              type="button"
              onClick={() => updateHF({ showTopHeader: !hf.showTopHeader })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                hf.showTopHeader
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Ativar/Desativar Topo (Cabeçalho)"
            >
              {hf.showTopHeader ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
              <span>Topo</span>
            </button>

            <button
              type="button"
              onClick={() => updateHF({ showFooter: !hf.showFooter })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors font-medium cursor-pointer ${
                hf.showFooter
                  ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Ativar/Desativar Rodapé"
            >
              {hf.showFooter ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-stone-400" />}
              <span>Rodapé</span>
            </button>
          </div>

          {(!hf.showTopHeader || !hf.showFooter) && (
            <span
              className="hidden md:inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full"
              title="Quando o topo ou rodapé são desativados, a mancha gráfica expande para usar as margens livres"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Área de texto expandida</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsHeaderFooterExpanded((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isHeaderFooterExpanded
                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Editar Topo e Rodapé (Word)</span>
            {isHeaderFooterExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Word Header/Footer Editor */}
      {isHeaderFooterExpanded && (
        <div className="pt-1 pb-2">
          <HeaderFooterEditor
            settings={settings}
            onChange={onChange}
            totalPages={totalPages}
            onClose={() => setIsHeaderFooterExpanded(false)}
          />
        </div>
      )}

      {/* Typographic and Paper grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Fonte / Tamanho */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
            <Type className="w-3 h-3 text-stone-400" />
            Tamanho da Fonte
          </label>
          <select
            aria-label="Tamanho da Fonte"
            value={`${getPageFontSizePt(null, settings)}pt`}
            onChange={(event) => update('fontSize', event.target.value as FontSizeOption)}
            className="w-full bg-white border border-stone-300 text-stone-800 rounded px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            {FONT_SIZE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Família de Fonte */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1">
            Família Tipográfica
          </label>
          <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200">
            <button
              type="button"
              onClick={() => update('fontFamily', 'serif')}
              className={`flex-1 py-1 rounded text-center transition-colors font-serif ${
                settings.fontFamily === 'serif'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Serifada
            </button>
            <button
              type="button"
              onClick={() => update('fontFamily', 'sans')}
              className={`flex-1 py-1 rounded text-center transition-colors font-sans ${
                settings.fontFamily === 'sans'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Sem Serifa
            </button>
          </div>
        </div>

        {/* Alinhamento */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1">
            Alinhamento do Texto
          </label>
          <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200">
            <button
              type="button"
              onClick={() => update('textAlign', 'left')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-colors ${
                settings.textAlign === 'left'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Alinhar à esquerda"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => update('textAlign', 'justify')}
              className={`flex-1 py-1 flex items-center justify-center rounded transition-colors ${
                settings.textAlign === 'justify'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Justificar"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Margens de Segurança */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1">
            Margens Internas
          </label>
          <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200">
            {(['compact', 'standard', 'generous'] as MarginOption[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update('margin', m)}
                className={`flex-1 py-1 rounded text-center capitalize transition-colors ${
                  settings.margin === m
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {m === 'compact' ? '4.5mm' : m === 'standard' ? '6mm' : '8mm'}
              </button>
            ))}
          </div>
        </div>

        {/* Linhas de Dobra */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1">
            Guias de Dobra
          </label>
          <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200">
            {(['dashed', 'subtle', 'none'] as FoldGuideStyle[]).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => {
                  onChange({
                    ...settings,
                    foldGuideStyle: style,
                    showFoldGuides: style !== 'none',
                  });
                }}
                className={`flex-1 py-1 rounded text-center capitalize transition-colors ${
                  settings.foldGuideStyle === style
                    ? 'bg-white text-stone-900 font-semibold shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {style === 'dashed' ? 'Tracejada' : style === 'subtle' ? 'Fina' : 'Oculta'}
              </button>
            ))}
          </div>
        </div>

        {/* Corte Central */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
            <Scissors className="w-3 h-3 text-stone-400" />
            Marca de Corte
          </label>
          <button
            type="button"
            onClick={() => update('showCutGuide', !settings.showCutGuide)}
            className={`w-full py-1.5 px-2 rounded text-center border transition-colors ${
              settings.showCutGuide
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800 font-medium'
                : 'bg-stone-100 border-stone-200 text-stone-500'
            }`}
          >
            {settings.showCutGuide ? '✓ Visível' : 'Oculto'}
          </button>
        </div>

        {/* Preenchimento Sequencial ou Proporcional */}
        <div>
          <label className="block text-[11px] font-medium text-stone-600 mb-1" title="Escolha se prefere preencher as primeiras páginas por completo ou distribuir igualmente">
            Preenchimento
          </label>
          <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200">
            <button
              type="button"
              onClick={() => update('textDistributionMode', 'fill-first')}
              className={`flex-1 py-1 rounded text-center transition-colors text-[10px] ${
                (settings.textDistributionMode || 'fill-first') === 'fill-first'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Preenche as primeiras páginas por completo, deixando as páginas finais livres"
            >
              Cheias
            </button>
            <button
              type="button"
              onClick={() => update('textDistributionMode', 'balanced')}
              className={`flex-1 py-1 rounded text-center transition-colors text-[10px] ${
                settings.textDistributionMode === 'balanced'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Distribui o texto igualmente por todas as páginas"
            >
              Igual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
