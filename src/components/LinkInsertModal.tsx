import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  ExternalLink,
  MessageSquare,
  Bookmark,
  Hash,
  Mail,
  Paperclip,
  AlertTriangle,
  FolderCheck,
  CheckCircle2,
  Sparkles,
  X,
  Check,
  Info,
  Copy,
} from 'lucide-react';
import { PageDocument } from '../types';
import {
  slugify,
  formatMarkdownLink,
  validateRelativeFileLink,
} from '../utils/markdownParser';

interface LinkInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (linkText: string, refDefinition?: string) => void;
  initialSelectedText?: string;
  pages?: PageDocument[];
}

type LinkType = 'inline' | 'title' | 'ref' | 'anchor' | 'autolink' | 'file';

export const LinkInsertModal: React.FC<LinkInsertModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialSelectedText = '',
  pages = [],
}) => {
  const [activeTab, setActiveTab] = useState<LinkType>('inline');
  const [text, setText] = useState(initialSelectedText);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [refId, setRefId] = useState('1');
  const [selectedAnchor, setSelectedAnchor] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract available headings from all pages for anchor suggestions
  const availableHeadings: Array<{ title: string; slug: string; pageNum: number }> = [];
  pages.forEach((p) => {
    if (p.content) {
      const lines = p.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          availableHeadings.push({
            title: headingText,
            slug: slugify(headingText),
            pageNum: p.editorialNumber,
          });
        }
      }
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (initialSelectedText) {
        setText(initialSelectedText);
      }
      setCopied(false);
    }
  }, [isOpen, initialSelectedText]);

  if (!isOpen) return null;

  // Compute live preview
  let targetUrl = url;
  if (activeTab === 'anchor') {
    targetUrl = selectedAnchor || url;
  }

  const { insertText, refDef } = formatMarkdownLink({
    type: activeTab,
    text: text.trim() || (activeTab === 'file' ? 'Abrir Arquivo' : 'Texto do Link'),
    url:
      targetUrl.trim() ||
      (activeTab === 'autolink'
        ? 'https://exemplo.com'
        : activeTab === 'file'
        ? 'planilha.xlsx'
        : 'https://exemplo.com'),
    title: title.trim(),
    refId: refId.trim(),
  });

  const handleConfirm = () => {
    onInsert(insertText, refDef);
    onClose();
  };

  const handleCopyPreview = () => {
    const fullText = refDef ? `${insertText}\n\n${refDef}` : insertText;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-900 rounded-md">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">Assistente de Links Markdown</h3>
              <p className="text-[11px] text-stone-500">
                Hiperlinks interativos para Web, Âncoras e Arquivos Locais (.pdf, .xlsx, .docx, .png)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 p-1 gap-1 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('inline')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'inline'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            1. Direto
          </button>
          <button
            onClick={() => setActiveTab('title')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'title'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            2. Título
          </button>
          <button
            onClick={() => setActiveTab('ref')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'ref'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            3. Ref
          </button>
          <button
            onClick={() => setActiveTab('anchor')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'anchor'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            4. Âncora
          </button>
          <button
            onClick={() => setActiveTab('autolink')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'autolink'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            5. Auto
          </button>
          <button
            onClick={() => {
              setActiveTab('file');
              if (!url || url.startsWith('http') || url.startsWith('#')) {
                setUrl('planilha.xlsx');
              }
              if (!text || text === 'Texto do Link') {
                setText('Abrir Planilha de Gastos');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'file'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
            6. Arquivo Local
          </button>
        </div>

        {/* Content Form */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Form Fields based on tab */}
          {activeTab !== 'autolink' && (
            <div>
              <label className="block text-stone-700 font-medium mb-1">
                Texto clicável entre colchetes <code className="text-amber-800">[ ]</code>:
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: Guia de Markdown, Visite nosso site..."
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          )}

          {activeTab === 'inline' && (
            <div>
              <label className="block text-stone-700 font-medium mb-1">
                URL de destino entre parênteses <code className="text-amber-800">( )</code>:
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: https://www.markdownguide.org"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                💡 Não deixe espaço entre os colchetes e os parênteses: <code>[Texto](url)</code>.
              </p>
            </div>
          )}

          {activeTab === 'title' && (
            <>
              <div>
                <label className="block text-stone-700 font-medium mb-1">URL de destino:</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Ex: https://duckduckgo.com"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Título de Dica (Tooltip / Hover text) entre aspas:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: O buscador focado em privacidade"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  💡 Aparece em um balão de texto quando o leitor repousa o cursor sobre o link.
                </p>
              </div>
            </>
          )}

          {activeTab === 'ref' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    Identificador de referência:
                  </label>
                  <input
                    type="text"
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    placeholder="Ex: 1, google, docs"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Título (opcional):</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Buscador Google"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-700 font-medium mb-1">URL de destino:</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Ex: https://google.com"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  💡 O código Markdown insere <code>[{text || 'Texto'}][{refId || '1'}]</code> no parágrafo e a definição <code>[{refId || '1'}]: {url || 'url'}</code> ao final.
                </p>
              </div>
            </>
          )}

          {activeTab === 'anchor' && (
            <div className="space-y-3">
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Escolha um Título existente no livreto:
                </label>
                {availableHeadings.length > 0 ? (
                  <div className="max-h-32 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100 bg-stone-50">
                    {availableHeadings.map((h, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSelectedAnchor(`#${h.slug}`);
                          if (!text) setText(h.title);
                        }}
                        className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-amber-100/60 transition-colors ${
                          selectedAnchor === `#${h.slug}` ? 'bg-amber-100 font-semibold text-amber-950' : 'text-stone-700'
                        }`}
                      >
                        <span className="truncate">{h.title}</span>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-2">
                          #{h.slug} (Pág. {h.pageNum})
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-stone-400 italic">
                    Nenhum título (# Título) encontrado nas páginas ainda. Digite a âncora abaixo.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Ou digite a âncora manualmente <code className="text-amber-800">#nome-do-titulo</code>:
                </label>
                <input
                  type="text"
                  value={selectedAnchor || url}
                  onChange={(e) => {
                    const val = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                    setSelectedAnchor(val);
                    setUrl(val);
                  }}
                  placeholder="#contato ou #introducao"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'autolink' && (
            <div>
              <label className="block text-stone-700 font-medium mb-1">
                URL bruta ou endereço de E-mail:
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: https://exemplo.com ou suporte@exemplo.com"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                💡 Envolve a URL ou e-mail com os sinais de menor e maior <code>&lt; &gt;</code>, tornando-o clicável automaticamente.
              </p>
            </div>
          )}

          {activeTab === 'file' && (() => {
            const validation = validateRelativeFileLink(url);
            return (
              <div className="space-y-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    Nome ou Caminho Relativo do Arquivo <code className="text-emerald-800">( )</code>:
                  </label>
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Ex: planilha.xlsx, grafico.png, anexos/relatorio.pdf"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (url.startsWith('anexos/')) {
                          setUrl(url.replace(/^anexos\//, ''));
                        } else {
                          setUrl(`anexos/${url.replace(/^\.?\/?/, '')}`);
                        }
                      }}
                      title="Alternar prefixo de subpasta anexos/"
                      className="px-2.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg shrink-0 font-mono text-[11px] transition-colors"
                    >
                      {url.startsWith('anexos/') ? '− anexos/' : '+ anexos/'}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">
                    📁 Use apenas o nome do arquivo com extensão (ou subpasta à frente como <code>anexos/arquivo.pdf</code>). Não inclua C:/ ou /home/.
                  </p>
                </div>

                {/* Quick extension helper badges */}
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1">Extensões comuns (clique para aplicar):</span>
                  <div className="flex flex-wrap gap-1">
                    {['.pdf', '.xlsx', '.docx', '.png', '.jpg', '.csv', '.zip'].map((ext) => (
                      <button
                        key={ext}
                        type="button"
                        onClick={() => {
                          const base = url.split('?')[0].split('#')[0].replace(/\.[a-zA-Z0-9]+$/, '');
                          setUrl(`${base || 'arquivo'}${ext}`);
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                          url.endsWith(ext)
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {ext}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time validation feedback */}
                {validation.isAbsolutePath && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Caminho de disco rígido detectado!</p>
                      <p className="text-[10px] text-rose-700 mt-0.5">
                        Não inclua letras de unidade (ex: C:/) nem pastas do sistema (/home, /Users). O link deve ser relativo à pasta do PDF.
                      </p>
                      <button
                        type="button"
                        onClick={() => setUrl(validation.suggestion)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-900 bg-rose-200/80 hover:bg-rose-200 px-2 py-0.5 rounded"
                      >
                        <Sparkles className="w-3 h-3" /> Tornar relativo: {validation.suggestion}
                      </button>
                    </div>
                  </div>
                )}

                {!validation.extension && !validation.isAbsolutePath && url.trim().length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">⚠️ Regra 1: A extensão é obrigatória!</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">
                        Inclua o formato (ex: <code>.pdf</code>, <code>.xlsx</code>, <code>.docx</code>, <code>.png</code>). Se colocar apenas <code>[Planilha](planilha)</code>, o link não funcionará.
                      </p>
                      <button
                        type="button"
                        onClick={() => setUrl(validation.suggestion)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-2 py-0.5 rounded"
                      >
                        <Sparkles className="w-3 h-3" /> Adicionar extensão: {validation.suggestion}
                      </button>
                    </div>
                  </div>
                )}

                {validation.hasSpacesOrAccents && !validation.isAbsolutePath && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">⚠️ Regra 2: Evite espaços e acentos no arquivo!</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">
                        Espaços e acentos podem quebrar o link em alguns leitores de PDF. Prefira hífens (-) ou sublinhados (_).
                      </p>
                      <button
                        type="button"
                        onClick={() => setUrl(validation.suggestion)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-2 py-0.5 rounded"
                      >
                        <Sparkles className="w-3 h-3" /> Corrigir automaticamente para "{validation.suggestion}"
                      </button>
                    </div>
                  </div>
                )}

                {validation.isValid && !validation.hasSpacesOrAccents && url.trim().length > 0 && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Caminho relativo perfeitamente formatado para o PDF!</span>
                  </div>
                )}

                {/* 3 Golden Rules Box */}
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1.5 text-[11px] text-stone-700">
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <FolderCheck className="w-4 h-4 text-emerald-700" />
                    Regras de Ouro para não quebrar o link no PDF:
                  </span>
                  <ul className="space-y-1 text-[10.5px] list-disc list-inside text-stone-600">
                    <li>
                      <strong>1. A Extensão é Obrigatória:</strong> ex: <code>.pdf</code>, <code>.xlsx</code>, <code>.docx</code>, <code>.png</code>.
                    </li>
                    <li>
                      <strong>2. Evite Espaços e Acentos:</strong> prefira <code>meu-manual.pdf</code> ou <code>meu_manual.pdf</code> em vez de <code>meu manual.pdf</code>.
                    </li>
                    <li>
                      <strong>3. Mantenha os Arquivos Juntos no Envio:</strong> compacte o PDF e os arquivos anexos em formato <code>.zip</code> para que abram corretamente no computador de quem receber.
                    </li>
                  </ul>
                </div>
              </div>
            );
          })()}

          {/* Syntax Live Preview Box */}
          <div className="bg-stone-900 text-stone-100 rounded-lg p-3 space-y-1.5 font-mono text-[11px] relative">
            <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase font-sans">
              <span>Código Markdown Gerado:</span>
              <button
                type="button"
                onClick={handleCopyPreview}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <div className="text-amber-300 select-all font-bold">{insertText}</div>
            {refDef && (
              <div className="text-stone-400 text-[10px] pt-1 border-t border-stone-800">
                {refDef}
              </div>
            )}
          </div>

          {/* Pro-Tips Alert */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-amber-900 text-[11px]">
            <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Dicas de Formatação:</span>
              <span>
                Sempre use <code>https://</code> para links externos. Os links funcionarão interativamente no leitor digital e com formatação elegante no PDF e na folha impressa.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-stone-200 flex items-center justify-between bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-medium text-xs transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-stone-900 text-white hover:bg-stone-800 font-medium text-xs shadow-xs transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Inserir no Texto
          </button>
        </div>
      </div>
    </div>
  );
};
