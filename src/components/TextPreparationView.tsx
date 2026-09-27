import React, { useState, useRef } from 'react';
import { BookSettings, OverflowReport, PageDocument, OutputMode } from '../types';
import {
  Sparkles,
  AlertTriangle,
  Layers,
  ArrowRight,
  BookOpen,
  Scissors,
  CheckCircle2,
  FileText,
  Loader2,
  Image as ImageIcon,
  BookCopy,
  Link as LinkIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Code,
  Highlighter,
  Strikethrough,
  Underline,
  Quote,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { extractIntelligentSummary, suggestOptimalTypography, getPageCapacity } from '../utils/textDistributor';
import { PosterEditor } from './PosterEditor';
import { countMarkdownWords } from '../utils/markdownParser';
import { LinkInsertModal } from './LinkInsertModal';
import { QrCodeInsertModal } from './QrCodeInsertModal';

interface TextPreparationViewProps {
  rawText: string;
  setRawText: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  subtitle: string;
  setSubtitle: (val: string) => void;
  author: string;
  setAuthor: (val: string) => void;
  backCoverText: string;
  setBackCoverText: (val: string) => void;
  onDistribute: () => void;
  overflowReport: OverflowReport;
  settings: BookSettings;
  onUpdateSettings: (s: BookSettings) => void;
  onSplitVolumes: () => void;
  onApplySummarizedText: (summarized: string) => void;
  onLoadSampleText: () => void;
  onLoadSample16PText: () => void;
  onLoadTestBooklet: () => void;
  onLoadTest16PBooklet: () => void;
  onLoadMarkdownLinksSample?: () => void;
  onGoToPages: () => void;
}

export const TextPreparationView: React.FC<TextPreparationViewProps> = ({
  rawText,
  setRawText,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  author,
  setAuthor,
  backCoverText,
  setBackCoverText,
  onDistribute,
  overflowReport,
  settings,
  onUpdateSettings,
  onSplitVolumes,
  onApplySummarizedText,
  onLoadSampleText,
  onLoadSample16PText,
  onLoadTestBooklet,
  onLoadTest16PBooklet,
  onLoadMarkdownLinksSample,
  onGoToPages,
}) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showMarkdownLinkGuide, setShowMarkdownLinkGuide] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const is16P =
    settings.outputMode === 'continuation-16p' || settings.outputMode === 'booklet-bound-16p';
  const isPoster = settings.outputMode === 'poster-back';

  const totalWords = countMarkdownWords(rawText);
  const pageCap = getPageCapacity(settings);
  const capacityWords = overflowReport.capacityWords || (is16P ? 1100 : 510);
  const isOverflowing = totalWords > capacityWords;
  const typographySuggestion = suggestOptimalTypography(rawText, settings.outputMode, settings.fontSize, settings);

  const handleInsertLink = (linkMarkdown: string, refDef?: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart ?? rawText.length;
      const end = textareaRef.current.selectionEnd ?? rawText.length;
      const before = rawText.substring(0, start);
      const after = rawText.substring(end);
      let updated = `${before}${linkMarkdown}${after}`;
      if (refDef) {
        updated = `${updated.trim()}\n\n${refDef}`;
      }
      setRawText(updated);
    } else {
      let updated = rawText ? `${rawText}\n\n${linkMarkdown}` : linkMarkdown;
      if (refDef) {
        updated = `${updated.trim()}\n\n${refDef}`;
      }
      setRawText(updated);
    }
  };

  const handleInsertQrCode = (qrMarkdown: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart ?? rawText.length;
      const end = textareaRef.current.selectionEnd ?? rawText.length;
      const before = rawText.substring(0, start);
      const after = rawText.substring(end);
      const prefix = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
      const suffix = after.length > 0 && !after.startsWith('\n') ? '\n\n' : '';
      setRawText(`${before}${prefix}${qrMarkdown}${suffix}${after}`);
    } else {
      setRawText(rawText ? `${rawText}\n\n${qrMarkdown}` : qrMarkdown);
    }
  };

  const handleWrapSelection = (prefix: string, suffix: string = prefix, placeholder: string = 'texto') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = rawText;
    const sel = current.slice(start, end);
    const textToWrap = sel || placeholder;
    const newContent = current.slice(0, start) + prefix + textToWrap + suffix + current.slice(end);
    setRawText(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + textToWrap.length);
    }, 50);
  };

  const handleRequestAISummary = async () => {
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          title: title || 'Minilivro',
          targetWords: capacityWords,
        }),
      });

      const data = await res.json();
      if (res.ok && data.summary) {
        onApplySummarizedText(data.summary);
      } else {
        const fallback = extractIntelligentSummary(rawText, capacityWords - 20);
        onApplySummarizedText(fallback);
      }
    } catch (_err) {
      const fallback = extractIntelligentSummary(rawText, capacityWords - 20);
      onApplySummarizedText(fallback);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSwitchTo16P = (mode: 'continuation-16p' | 'booklet-bound-16p') => {
    onUpdateSettings({ ...settings, outputMode: mode });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome / Guidance Hero */}
      <div className="bg-[#FAF7F2] border border-stone-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest text-stone-500 font-sans font-semibold">
                Etapa 1 de 4 · Preparação do Conteúdo
              </span>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded">
                {is16P
                  ? 'Modo 16 Páginas (Duplex)'
                  : isPoster
                  ? 'Modo Pôster no Verso'
                  : 'Modo Clássico 8 Páginas'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 mt-1">
              {is16P
                ? 'Prepare um livro de 16 páginas a partir de 1 folha A4 duplex'
                : isPoster
                ? 'Livreto de 8 páginas na frente + Pôster A4 completo no verso'
                : 'Transforme um texto longo em um livreto de 8 páginas'}
            </h2>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              {is16P ? (
                <>
                  Cole seu texto longo abaixo. O gerador distribuirá os parágrafos de forma contínua
                  pelas <strong>14 páginas internas de miolo</strong> sem cortar frases nem palavras.
                  A <strong>página 1</strong> é a Capa e a <strong>página 16</strong> a Contracapa.
                </>
              ) : isPoster ? (
                <>
                  O texto será diagramado nas <strong>páginas 2 a 7</strong> na frente da folha A4.
                  No verso, ao desdobrar o livreto, o leitor encontrará um{' '}
                  <strong>pôster contínuo A4</strong> preservando a zona da fenda.
                </>
              ) : (
                <>
                  Cole seu texto abaixo. O gerador distribuirá os parágrafos ordenadamente entre as{' '}
                  <strong>páginas 2 a 7</strong>, mantendo frases inteiras e formatações Markdown. A{' '}
                  <strong>página 1</strong> será sua Capa e a <strong>página 8</strong> a Contracapa.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {is16P ? (
              <>
                <button
                  type="button"
                  onClick={onLoadTest16PBooklet}
                  className="px-3 py-1.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded font-medium transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                >
                  Exemplar de Teste (16P)
                </button>
                <button
                  type="button"
                  onClick={onLoadSample16PText}
                  className="px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded font-medium transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                >
                  Conto Longo (16P)
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onLoadTestBooklet}
                  className="px-3 py-1.5 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded font-medium transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                >
                  Exemplar de Teste (1 a 8)
                </button>
                <button
                  type="button"
                  onClick={onLoadSampleText}
                  className="px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded font-medium transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                >
                  Conto Literário
                </button>
                {onLoadMarkdownLinksSample && (
                  <button
                    type="button"
                    onClick={onLoadMarkdownLinksSample}
                    className="px-3 py-1.5 text-xs text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded font-medium transition-colors whitespace-nowrap shadow-2xs cursor-pointer flex items-center gap-1.5"
                    title="Carrega texto com os 5 formatos de links (direto, tooltip, referências, âncoras e autolinks)"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-sky-700" />
                    <span>Exemplo de Links (5 Formatos)</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Poster Configuration Panel (if poster mode is active) */}
      {isPoster && (
        <PosterEditor
          settings={settings.posterSettings}
          onChange={(updated) => onUpdateSettings({ ...settings, posterSettings: updated })}
        />
      )}

      {/* Book Metadata Grid */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <h3 className="text-sm font-serif font-bold text-stone-900 border-b border-stone-100 pb-2">
          Informações da Edição ({is16P ? 'Capa e Contracapa de 16 Páginas' : 'Capa e Contracapa'})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Título do Minilivro <span className="text-amber-700">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: O Pequeno Príncipe"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Subtítulo (Opcional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: Edição Artesanal de Bolso"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nome do Autor / Criador (Opcional)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex: Antoine de Saint-Exupéry"
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Texto da Contracapa ({is16P ? 'Página 16' : 'Página 8'})
          </label>
          <input
            type="text"
            value={backCoverText}
            onChange={(e) => setBackCoverText(e.target.value)}
            placeholder="Sinopse curta, frase de fechamento, créditos da publicação ou contato do autor..."
            className="w-full px-3 py-2 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
          />
        </div>
      </div>

      {/* Main Raw Textarea Area */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
          <div>
            <h3 className="text-sm font-serif font-bold text-stone-900">
              Texto Longo para o Miolo ({is16P ? 'Páginas 2 a 15' : 'Páginas 2 a 7'})
            </h3>
            <p className="text-[11px] text-stone-500 flex items-center gap-1.5 flex-wrap">
              <span>Suporta Markdown e Links:</span>
              <code className="bg-stone-100 px-1 rounded text-stone-700"># Título</code>
              <code className="bg-stone-100 px-1 rounded text-stone-700">## Subtítulo</code>
              <code className="bg-stone-100 px-1 rounded text-stone-700">**negrito**</code>
              <code className="bg-stone-100 px-1 rounded text-stone-700">[Link](url)</code>
              <button
                type="button"
                onClick={() => setShowMarkdownLinkGuide((v) => !v)}
                className="text-amber-800 hover:text-amber-950 font-semibold underline inline-flex items-center gap-0.5 ml-1 cursor-pointer"
              >
                <span>{showMarkdownLinkGuide ? 'Ocultar Guia de Links' : 'Ver Guia de Links Markdown'}</span>
                {showMarkdownLinkGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap">
            <span
              className={`font-mono ${
                isOverflowing ? 'text-amber-800 font-bold' : 'text-stone-600'
              }`}
            >
              Palavras: <strong>{totalWords}</strong> / ~{capacityWords} máx.
            </span>
            {pageCap.isExpanded && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Capacidade expandida (+{pageCap.gainPercent}%)</span>
              </span>
            )}
            <span className="text-stone-300">·</span>
            <span className="text-stone-500 font-mono">{rawText.length} caracteres</span>
          </div>
        </div>

        {/* Overflow Alert / Actions Banner */}
        {isOverflowing && (
          <div className="bg-amber-50 border border-amber-300/80 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-xs font-bold text-amber-900">
                  O texto inserido ({totalWords} palavras) excede a capacidade segura recomendada (~
                  {capacityWords} palavras).
                </h4>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Para não cortar frases ou reduzir a fonte além da legibilidade, você pode:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
              {/* Option to switch to 16 pages! */}
              {!is16P && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSwitchTo16P('continuation-16p')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-amber-900 hover:bg-amber-800 rounded font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <BookCopy className="w-3.5 h-3.5" />
                    <span>Expandir para Modo 16P (Continuação)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchTo16P('booklet-bound-16p')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-900 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Expandir para Modo 16P (Caderno)</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onSplitVolumes}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-950 bg-amber-100 hover:bg-amber-200/80 border border-amber-300 rounded font-medium transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-amber-800" />
                <span>
                  Dividir em {Math.ceil(totalWords / capacityWords)} Folhas/Volumes Independentes
                </span>
              </button>

              <button
                type="button"
                onClick={handleRequestAISummary}
                disabled={isSummarizing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-900 bg-white hover:bg-amber-50 border border-amber-300 rounded font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSummarizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                )}
                <span>Condensar Texto para Caber (~{capacityWords} pal.)</span>
              </button>
            </div>
          </div>
        )}

        {/* Typography Auto-Fit Recommendation (if needed) */}
        {typographySuggestion.isNeeded && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
            <div className="flex items-start sm:items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
              <span className="text-amber-900 font-medium">
                {typographySuggestion.reason}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onUpdateSettings({ ...settings, fontSize: typographySuggestion.suggestedFontSize });
                onDistribute();
              }}
              className="px-3 py-1.5 bg-amber-900 hover:bg-amber-800 text-white font-semibold rounded shadow-2xs transition-colors shrink-0 cursor-pointer text-xs"
            >
              Aplicar Fonte {typographySuggestion.suggestedFontSize === 'sm' ? 'Pequena (sm)' : typographySuggestion.suggestedFontSize === 'lg' ? 'Grande (lg)' : 'Média (md)'}
            </button>
          </div>
        )}

        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded border border-stone-200/80">
            <button
              type="button"
              onClick={() => handleWrapSelection('**', '**', 'negrito')}
              title="Negrito (**texto**)"
              className="p-1.5 text-stone-700 hover:text-stone-950 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapSelection('*', '*', 'itálico')}
              title="Itálico (*texto*)"
              className="p-1.5 text-stone-700 hover:text-stone-950 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapSelection('***', '***', 'negrito e itálico')}
              title="Negrito e Itálico (***texto***)"
              className="px-1.5 py-1 text-stone-800 hover:text-stone-950 hover:bg-white rounded text-[10px] font-bold italic transition-colors cursor-pointer"
            >
              BI
            </button>
            <button
              type="button"
              onClick={() => handleWrapSelection('`', '`', 'sombreado')}
              title="Sombreado / Código (`texto`)"
              className="p-1.5 text-stone-700 hover:text-stone-950 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapSelection('==', '==', 'destaque')}
              title="Marca-texto amarelo (==destaque== ou <mark>)"
              className="p-1.5 text-amber-700 hover:text-amber-950 hover:bg-amber-100 rounded transition-colors cursor-pointer"
            >
              <Highlighter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapSelection('~~', '~~', 'riscado')}
              title="Tachado (~~texto~~)"
              className="p-1.5 text-stone-700 hover:text-stone-950 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapSelection('<u>', '</u>', 'sublinhado')}
              title="Sublinhado (<u>texto</u>)"
              className="p-1.5 text-stone-700 hover:text-stone-950 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleWrapSelection('> ', '', 'Citação em bloco')}
              title="Citação em bloco (> texto)"
              className="p-1.5 text-stone-700 hover:text-stone-950 hover:bg-white rounded transition-colors cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                const sel = textareaRef.current
                  ? rawText.slice(textareaRef.current.selectionStart, textareaRef.current.selectionEnd)
                  : '';
                setSelectedText(sel);
                setIsLinkModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 rounded transition-colors cursor-pointer ml-0.5"
              title="Inserir Link em Markdown ([Texto](URL), referências, âncoras ou arquivos)"
            >
              <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
              <span>Link</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const sel = textareaRef.current
                  ? rawText.slice(textareaRef.current.selectionStart, textareaRef.current.selectionEnd)
                  : '';
                setSelectedText(sel);
                setIsQrModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200/90 rounded transition-colors cursor-pointer ml-0.5"
              title="Inserir QR Code Phygital ([qr: Legenda](URL) - Pasta no Drive, arquivos ou nuvem)"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-700" />
              <span>QR Code Phygital</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowMarkdownLinkGuide((v) => !v)}
            className="text-amber-800 hover:text-amber-950 font-medium text-xs underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{showMarkdownLinkGuide ? 'Ocultar Guia de Formatação e Links' : 'Ver Guia de Formatação & Links'}</span>
            {showMarkdownLinkGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <textarea
          ref={textareaRef}
          rows={12}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Cole seu texto longo aqui... Pode usar quebras de linha para indicar parágrafos e marcadores markdown (# Título, ## Subtítulo, **negrito**, etc)."
          className="w-full p-3.5 text-xs font-serif border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 focus:border-stone-900 leading-relaxed text-stone-800 bg-[#FCFCFA]"
        />

        {/* Markdown Links & Text Formatting Visual Guide */}
        {showMarkdownLinkGuide && (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-4 text-xs animate-in fade-in">
            {/* 1. Estilos de Texto e Sombreado */}
            <div className="space-y-2">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                1. Estilos de Texto, Sombreado & Citações
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">Itálico e Negrito:</span>
                  <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    *itálico*, **negrito**, ***ambos***
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Também aceita sublinhados: <code>_itálico_</code>, <code>__negrito__</code>.
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">Sombreado (Inline Code):</span>
                  <code className="text-stone-800 bg-stone-100 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    `texto sombreado`
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Aplica fundo cinza elegante e fonte monoespaçada.
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">Marca-texto (Highlight):</span>
                  <code className="text-amber-900 bg-amber-100 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    ==texto destacado== ou &lt;mark&gt;
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Simula caneta marca-texto amarela (aceita <code>==</code> e <code>&lt;mark&gt;</code>).
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">Tachado (Strikethrough):</span>
                  <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    ~~texto riscado~~
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Dois tios <code>~~</code> para riscar palavras ou preços antigos.
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">Sublinhado:</span>
                  <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    &lt;u&gt;texto sublinhado&lt;/u&gt;
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Tag HTML <code>&lt;u&gt;</code> para sublinhar termos importantes.
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">Citação em Bloco:</span>
                  <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    &gt; Isto é uma citação em bloco.
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Sinal <code>&gt;</code> no início cria bloco recuado com barra âmbar.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Links Hipertexto */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-700" />
                  2. Hiperlinks em Markdown (6 Formatos)
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  [Texto](URL ou arquivo.ext)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">1. Link Direto (Inline):</span>
                  <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    [Guia de Markdown](https://markdownguide.org)
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Texto clicável entre colchetes seguido pela URL entre parênteses sem espaço.
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">2. Com Título (Hover Tooltip):</span>
                  <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    [DuckDuckGo](https://duckduckgo.com "Buscador")
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Exibe balão de dica (tooltip) quando o leitor passa o mouse.
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">3. Links por Referência:</span>
                  <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    Visite o [Google][1] ... [1]: https://google.com
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Mantém o miolo limpo com as definições de URL ao final.
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">4. Links Internos (Âncoras):</span>
                  <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    Ir para [Contato](#contato) com ## Contato
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Navega diretamente até o título correspondente no livreto.
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-stone-200 space-y-1">
                  <span className="font-bold text-stone-800 block">5. Links Automáticos:</span>
                  <code className="text-amber-800 bg-amber-50 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    &lt;https://exemplo.com&gt; ou &lt;suporte@exemplo.com&gt;
                  </code>
                  <span className="text-stone-500 block text-[10px]">
                    Transforma URLs brutas e e-mails entre &lt; &gt; em links automáticos.
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-200/80 space-y-1">
                  <span className="font-bold text-emerald-950 block">6. Arquivos Locais (Mesma Pasta / Anexos):</span>
                  <code className="text-emerald-800 bg-emerald-100/70 px-1 py-0.5 rounded block font-mono text-[10.5px]">
                    [Planilha](planilha.xlsx) ou [Relatório](anexos/relatorio.pdf)
                  </code>
                  <span className="text-emerald-800/80 block text-[10px]">
                    Abre arquivos da mesma pasta no computador do leitor via caminho relativo.
                  </span>
                </div>
              </div>

              <div className="bg-amber-50/90 border border-amber-200 text-amber-950 rounded p-2.5 text-[10.5px] leading-relaxed space-y-1">
                <span className="font-bold block">⚠️ Regras de Ouro para Links e Arquivos no PDF:</span>
                <ul className="list-disc list-inside space-y-0.5 text-stone-700">
                  <li><strong>Extensão obrigatória:</strong> inclua sempre o formato (ex: <code>.pdf</code>, <code>.xlsx</code>, <code>.docx</code>, <code>.png</code>).</li>
                  <li><strong>Evite espaços e acentos:</strong> prefira hífens como <code>meu-manual.pdf</code> em vez de <code>meu manual.pdf</code>.</li>
                  <li><strong>Envio seguro:</strong> envie o PDF e os arquivos anexos compactados juntos em um arquivo <code>.zip</code>.</li>
                </ul>
              </div>
            </div>

            {/* 3. QR Codes e Experiência Phygital */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-purple-950 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-purple-700" />
                  3. QR Codes e Experiência Phygital (Nuvem / Google Drive / Celular)
                </span>
                <span className="text-[10.5px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full uppercase">
                  Físico + Digital
                </span>
              </div>

              <div className="p-3 bg-gradient-to-r from-purple-50/70 via-white to-purple-50/50 rounded-lg border border-purple-200/80 space-y-2 text-[11px]">
                <p className="text-purple-950 leading-relaxed">
                  O conceito <strong>Phygital</strong> une o impresso offline à internet. Quando o leitor aponta a câmera do smartphone para o livreto impresso em folha A4, abre imediatamente a <strong>pasta do Google Drive, planilhas, modelos 3D ou vídeos</strong>. No PDF digital, o código também é 100% clicável!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2 bg-white rounded border border-purple-100 space-y-1">
                    <span className="font-bold text-purple-900 block">Sintaxe Padrão com Legenda:</span>
                    <code className="text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded block font-mono text-[10.5px]">
                      [qr: Pasta no Drive com Planilhas](https://drive.google.com/...)
                    </code>
                    <span className="text-stone-500 text-[10px] block">
                      Cria o QR Code centralizado com legenda e link interativo.
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded border border-purple-100 space-y-1">
                    <span className="font-bold text-purple-900 block">Tamanhos Disponíveis (sm, md, lg):</span>
                    <code className="text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded block font-mono text-[10.5px]">
                      [qr: Legenda|sm](url) ou [qr: Legenda|lg](url)
                    </code>
                    <span className="text-stone-500 text-[10px] block">
                      <code>sm</code> (16mm), <code>md</code> (20mm - Recomendado), <code>lg</code> (25mm).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-2 text-[11px] text-stone-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>
              Ao avançar, as primeiras páginas são preenchidas por completo (páginas finais livres se o texto terminar antes).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDistribute}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded font-medium transition-colors cursor-pointer"
              title="Preenche as páginas iniciais por completo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Preencher Páginas em Ordem</span>
            </button>
            <button
              type="button"
              onClick={onGoToPages}
              className="flex items-center gap-1.5 px-5 py-2 text-xs text-white bg-stone-900 hover:bg-stone-800 rounded font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <span>Avançar para Revisão ({is16P ? '16 Págs' : '8 Págs'})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Link Insert Assistant Modal */}
      <LinkInsertModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsert={handleInsertLink}
        initialSelectedText={selectedText}
      />

      {/* Phygital QR Code Generator Modal */}
      <QrCodeInsertModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        onInsert={handleInsertQrCode}
        initialSelectedText={selectedText}
      />
    </div>
  );
};
