import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Smartphone,
  ExternalLink,
  FolderSync,
  FileSpreadsheet,
  Video,
  Globe,
  MessageCircle,
  Copy,
  Check,
  X,
  Sparkles,
  Info,
  Maximize2,
} from 'lucide-react';
import {
  PHYGITAL_PRESETS,
  QrPreset,
  QrCodeSize,
  generateQrCodeSvg,
  formatQrCodeMarkdown,
} from '../utils/qrCodeHelper';

interface QrCodeInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (qrMarkdown: string) => void;
  initialSelectedText?: string;
}

export const QrCodeInsertModal: React.FC<QrCodeInsertModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialSelectedText = '',
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('google-drive');
  const [url, setUrl] = useState<string>('https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9-exemplo');
  const [caption, setCaption] = useState<string>(initialSelectedText || 'Pasta no Drive com Planilhas e Anexos');
  const [size, setSize] = useState<QrCodeSize>('md');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialSelectedText) {
      setCaption(initialSelectedText);
    }
  }, [isOpen, initialSelectedText]);

  if (!isOpen) return null;

  const currentPreset = PHYGITAL_PRESETS.find((p) => p.id === selectedPresetId) || PHYGITAL_PRESETS[0];

  const handleSelectPreset = (preset: QrPreset) => {
    setSelectedPresetId(preset.id);
    if (!url || url.includes('drive.google.com') || url.includes('dropbox.com') || url.includes('youtube.com')) {
      setUrl(preset.exampleUrl);
    }
    if (!caption || caption === 'Pasta no Drive com Planilhas e Anexos') {
      setCaption(preset.defaultCaption);
    }
  };

  const cleanUrl = url.trim() || 'https://drive.google.com';
  const cleanCaption = caption.trim() || 'Acesse o Conteúdo Digital';
  const previewSvg = generateQrCodeSvg(cleanUrl);
  const markdownText = formatQrCodeMarkdown({
    caption: cleanCaption,
    url: cleanUrl,
    size,
  });

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmInsert = () => {
    onInsert(markdownText);
    onClose();
  };

  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'google-drive':
        return <FolderSync className="w-4 h-4 text-emerald-600" />;
      case 'cloud-file':
        return <FileSpreadsheet className="w-4 h-4 text-sky-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'website':
        return <Globe className="w-4 h-4 text-indigo-600" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-600" />;
      default:
        return <QrCode className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-stone-300/80 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20 shadow-xs">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif tracking-tight">
                  Gerador de QR Code Phygital
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-amber-400/90 text-stone-950 rounded-full uppercase">
                  Físico + Digital
                </span>
              </div>
              <p className="text-xs text-purple-200">
                Imprima no A4 e escaneie com a câmera do celular para abrir arquivos e nuvem
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Phygital Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50/40 border border-purple-200/80 rounded-xl p-3.5 flex items-start gap-3">
            <div className="p-2 bg-purple-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed text-purple-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-900">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>O que é a Experiência Phygital?</span>
              </div>
              <p className="text-purple-900/90">
                Representa a <strong>integração perfeita entre o mundo físico (offline) e o digital (online)</strong>. O leitor segura o livreto de papel impresso e, ao apontar a câmera do celular para o QR Code, abre instantaneamente uma <strong>pasta no Google Drive com planilhas, arquivos de apoio, áudios ou vídeos</strong>.
              </p>
              <p className="text-[11px] text-purple-800/80 italic">
                * No PDF gerado, o QR Code também é um link hipertexto 100% clicável no computador ou tablet.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              1. Selecione o Tipo de Integração Digital
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PHYGITAL_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-start gap-2 p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/80 shadow-2xs ring-1 ring-purple-600'
                        : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getPresetIcon(preset.id)}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-900 truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-stone-500 leading-tight line-clamp-1">
                        {preset.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields & Live Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
            {/* Left Inputs */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1 flex items-center justify-between">
                  <span>URL ou Link de Destino (Online)</span>
                  <span className="text-[10px] font-normal text-stone-500">Google Drive, Dropbox, YouTube, etc.</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={currentPreset.placeholder}
                    className="w-full pl-3 pr-8 py-2 text-xs font-mono border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-700 focus:border-purple-700 bg-white shadow-2xs text-stone-900"
                  />
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-purple-700"
                      title="Testar abrir link em nova aba"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Dica: Para pastas do Google Drive, certifique-se de que o compartilhamento está marcado como &ldquo;Qualquer pessoa com o link pode ver&rdquo;.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Legenda Impressa no Livreto
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex: Pasta no Drive com Planilhas e Anexos"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-700 focus:border-purple-700 bg-white shadow-2xs text-stone-900"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Texto descritivo posicionado logo abaixo do QR Code na folha A4.
                </p>
              </div>

              {/* Size Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-purple-700" />
                  <span>Tamanho no Livreto A7 (74 × 105 mm)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSize('sm')}
                    className={`py-2 px-2 text-center rounded-lg border text-xs cursor-pointer transition-all ${
                      size === 'sm'
                        ? 'border-purple-600 bg-purple-50/90 text-purple-900 font-bold ring-1 ring-purple-600'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-semibold">Pequeno</div>
                    <div className="text-[10px] text-stone-500">16 × 16 mm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSize('md')}
                    className={`py-2 px-2 text-center rounded-lg border text-xs cursor-pointer transition-all ${
                      size === 'md'
                        ? 'border-purple-600 bg-purple-50/90 text-purple-900 font-bold ring-1 ring-purple-600 shadow-2xs'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center gap-0.5">
                      <span>Médio</span>
                      <span className="text-[9px] bg-purple-200 text-purple-900 px-1 py-0.2 rounded-full">Ideal</span>
                    </div>
                    <div className="text-[10px] text-stone-500">20 × 20 mm</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSize('lg')}
                    className={`py-2 px-2 text-center rounded-lg border text-xs cursor-pointer transition-all ${
                      size === 'lg'
                        ? 'border-purple-600 bg-purple-50/90 text-purple-900 font-bold ring-1 ring-purple-600'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <div className="font-semibold">Grande</div>
                    <div className="text-[10px] text-stone-500">25 × 25 mm</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <div className="w-full text-center mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Simulação no Papel A4 Impresso
                </span>
              </div>

              {/* Realistic Card Simulation */}
              <div className="w-full max-w-[210px] p-3 rounded-xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 via-white to-purple-50/30 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 mb-1.5">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-purple-700 bg-purple-100 rounded-full uppercase">
                    <Smartphone className="w-2.5 h-2.5" />
                    <span>Phygital</span>
                  </span>
                </div>

                <div className="flex justify-center items-center my-1">
                  <div
                    className={`p-1.5 bg-white rounded border border-stone-200 shadow-2xs flex items-center justify-center ${
                      size === 'sm' ? 'w-24 h-24' : size === 'lg' ? 'w-36 h-36' : 'w-30 h-30'
                    }`}
                    dangerouslySetInnerHTML={{ __html: previewSvg }}
                  />
                </div>

                <p className="text-[11px] font-bold text-stone-800 leading-tight mt-1 px-1">
                  {cleanCaption}
                </p>

                <p className="text-[8.5px] text-purple-800/80 italic mt-0.5">
                  Escaneie com a câmera do celular
                </p>
              </div>

              <div className="mt-3 text-center">
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Testar link no navegador</span>
                </a>
              </div>
            </div>
          </div>

          {/* Generated Markdown Preview */}
          <div className="bg-stone-100/90 rounded-xl p-3 border border-stone-200/80 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-0.5">
                Código Markdown Gerado
              </span>
              <code className="text-xs font-mono text-purple-900 truncate block bg-white px-2 py-1 rounded border border-stone-200">
                {markdownText}
              </code>
            </div>
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-100/90 border-t border-stone-200 flex items-center justify-between flex-wrap gap-2">
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>Compatível com Google Drive, Dropbox, YouTube e links web</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmInsert}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Inserir QR Code Phygital</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
