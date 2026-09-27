import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Maximize2,
  Columns,
  Grid,
  Upload,
  Link as LinkIcon,
  Trash2,
  X,
  Check,
  Sparkles,
  Info,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { PageDocument, PageImageLayout } from '../types';
import {
  IMAGE_LAYOUTS,
  SAMPLE_IMAGES,
  fileToDataUrl,
  resolvePageImages,
} from '../utils/imageHelper';
import { PageImageRenderer } from './PageImageRenderer';

interface ImageInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: PageDocument;
  onApply: (params: {
    layout: PageImageLayout;
    images: string[];
    position?: 'top' | 'bottom';
    caption?: string;
  }) => void;
}

export const ImageInsertModal: React.FC<ImageInsertModalProps> = ({
  isOpen,
  onClose,
  page,
  onApply,
}) => {
  const [selectedLayout, setSelectedLayout] = useState<PageImageLayout>('full');
  const [images, setImages] = useState<string[]>([]);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const [caption, setCaption] = useState<string>('');
  const [activeSlotIdx, setActiveSlotIdx] = useState<number>(0);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const resolved = resolvePageImages(page);
      if (resolved.hasImages && resolved.layout !== 'none') {
        setSelectedLayout(resolved.layout);
        setImages(resolved.images);
        setPosition(resolved.position || 'top');
        setCaption(resolved.caption || page.imageCaption || '');
      } else {
        setSelectedLayout('full');
        setImages([SAMPLE_IMAGES[0].url]);
        setPosition('top');
        setCaption(page.imageCaption || '');
      }
      setActiveSlotIdx(0);
      setCustomUrlInput('');
    }
  }, [isOpen, page]);

  if (!isOpen) return null;

  const currentLayoutDef = IMAGE_LAYOUTS.find((l) => l.id === selectedLayout) || IMAGE_LAYOUTS[0];
  const requiredSlots = currentLayoutDef.slotsCount;

  const handleSelectLayout = (layoutId: PageImageLayout) => {
    setSelectedLayout(layoutId);
    const targetSlots = IMAGE_LAYOUTS.find((l) => l.id === layoutId)?.slotsCount || 1;
    // Adapt existing images or fill with samples
    const newImages = [...images];
    while (newImages.length < targetSlots) {
      const sample = SAMPLE_IMAGES[newImages.length % SAMPLE_IMAGES.length];
      newImages.push(sample.url);
    }
    setImages(newImages.slice(0, targetSlots));
    setActiveSlotIdx(0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        const next = [...images];
        next[activeSlotIdx] = dataUrl;
        setImages(next);
      } catch (err) {
        console.error('Erro ao ler imagem:', err);
      }
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const next = [...images];
    next[activeSlotIdx] = customUrlInput.trim();
    setImages(next);
    setCustomUrlInput('');
  };

  const handleSelectPreset = (url: string) => {
    const next = [...images];
    next[activeSlotIdx] = url;
    setImages(next);
  };

  const handleRemoveImageAt = (idx: number) => {
    const next = [...images];
    next[idx] = '';
    setImages(next);
  };

  const handleConfirm = () => {
    onApply({
      layout: selectedLayout,
      images: images.filter(Boolean),
      position,
      caption: caption.trim() || undefined,
    });
    onClose();
  };

  const handleClearAll = () => {
    onApply({
      layout: 'none',
      images: [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 text-white shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20 shadow-xs">
              <ImageIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif tracking-tight">
                  Layout de Imagens no A7 (Página {page.editorialNumber})
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-amber-400 text-stone-950 rounded-full uppercase">
                  4 Formatos Físicos
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Página inteira, meia folha, duas ou quatro poses calibradas para o painel de 74,25 × 105 mm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* 4 Layout Cards */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
              1. Selecione o Modo de Enquadramento no A7
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {IMAGE_LAYOUTS.map((item, idx) => {
                const isSelected = selectedLayout === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectLayout(item.id)}
                    className={`p-3 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-2 ring-amber-500/50'
                        : 'border-stone-200 bg-white hover:bg-stone-50 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      {/* Mini Visual Diagram */}
                      <div className="w-full aspect-[74.25/105] max-h-24 bg-stone-100 rounded border border-stone-200 mb-2 overflow-hidden relative p-1 flex items-center justify-center">
                        {item.id === 'full' && (
                          <div className="w-full h-full bg-amber-200 border border-amber-400 rounded-xs flex items-center justify-center">
                            <span className="text-[9px] font-mono font-bold text-amber-900">100% Bleed</span>
                          </div>
                        )}
                        {item.id === 'half' && (
                          <div className="w-full h-full flex flex-col justify-between">
                            <div className="w-full h-[48%] bg-amber-200 border border-amber-400 rounded-xs flex items-center justify-center">
                              <span className="text-[8px] font-mono font-bold text-amber-900">50% Foto</span>
                            </div>
                            <div className="w-full h-[48%] bg-stone-200/80 border border-dashed border-stone-300 rounded-xs flex items-center justify-center">
                              <span className="text-[7.5px] font-mono text-stone-500">Texto</span>
                            </div>
                          </div>
                        )}
                        {item.id === 'two' && (
                          <div className="w-full h-full flex flex-col justify-between gap-1">
                            <div className="w-full h-1/2 bg-amber-200 border border-amber-400 rounded-xs flex items-center justify-center">
                              <span className="text-[8px] font-mono font-bold text-amber-900">Pose 1</span>
                            </div>
                            <div className="w-full h-1/2 bg-amber-300 border border-amber-400 rounded-xs flex items-center justify-center">
                              <span className="text-[8px] font-mono font-bold text-amber-900">Pose 2</span>
                            </div>
                          </div>
                        )}
                        {item.id === 'four' && (
                          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
                            {[1, 2, 3, 4].map((q) => (
                              <div key={q} className="bg-amber-200 border border-amber-400 rounded-2xs flex items-center justify-center">
                                <span className="text-[7.5px] font-mono font-bold text-amber-900">Q{q}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-stone-900 mb-0.5">
                        <span className="text-amber-800">{idx + 1}.</span>
                        <span>{item.name}</span>
                      </div>
                      <div className="text-[10px] text-stone-500 leading-tight">
                        {item.alias}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-stone-100 text-[9.5px] text-stone-600 font-mono">
                      {item.dimensionMm}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form & Live Simulation Split Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
            {/* Left Column: Image Slots & Upload (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* Slot Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center justify-between">
                  <span>2. Selecione a Foto para Configurar ({requiredSlots} {requiredSlots === 1 ? 'posição' : 'posições'})</span>
                  <span className="text-[10.5px] font-normal text-stone-500">Clique na pose para trocar</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Array.from({ length: requiredSlots }).map((_, slotIdx) => {
                    const isCurrentSlot = activeSlotIdx === slotIdx;
                    const slotImg = images[slotIdx];
                    const slotLabel =
                      requiredSlots === 1
                        ? 'Imagem Principal'
                        : requiredSlots === 2
                        ? slotIdx === 0
                          ? 'Pose 1 (Superior)'
                          : 'Pose 2 (Inferior)'
                        : `Quadrante ${slotIdx + 1}`;

                    return (
                      <button
                        key={slotIdx}
                        type="button"
                        onClick={() => setActiveSlotIdx(slotIdx)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isCurrentSlot
                            ? 'border-amber-600 bg-amber-50 shadow-xs ring-1 ring-amber-600'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="w-full aspect-[4/3] bg-stone-100 rounded-lg overflow-hidden mb-1.5 relative border border-stone-200">
                          {slotImg ? (
                            <img src={slotImg} alt={slotLabel} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">
                              Sem foto
                            </div>
                          )}
                          {slotImg && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImageAt(slotIdx);
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors"
                              title="Remover imagem deste slot"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] font-bold text-stone-900 truncate">{slotLabel}</div>
                        <div className="text-[9.5px] text-stone-500 font-mono">
                          {slotImg ? 'Definida' : 'Vazio'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload or URL for Active Slot */}
              <div className="p-3.5 bg-white border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800 border-b border-stone-100 pb-2">
                  <span>Configurar Imagem: {requiredSlots === 1 ? 'Principal' : `Pose ${activeSlotIdx + 1}`}</span>
                  <span className="text-[10px] font-normal text-stone-500">JPG, PNG, WebP</span>
                </div>

                {/* File Upload Button */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-600" />
                    <span>Upload do Computador...</span>
                  </button>

                  {images[activeSlotIdx] && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageAt(activeSlotIdx)}
                      className="p-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
                      title="Limpar imagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Paste URL */}
                <div>
                  <div className="text-[11px] font-semibold text-stone-700 mb-1">Ou cole uma URL da web:</div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-[#FCFCFA] text-stone-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      disabled={!customUrlInput.trim()}
                      className="px-3 py-1.5 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg disabled:opacity-40 cursor-pointer transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* Curated Presets */}
                <div>
                  <div className="text-[11px] font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>Galeria Rápida de Demonstração (1 clique):</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {SAMPLE_IMAGES.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => handleSelectPreset(sample.url)}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-stone-200 hover:border-amber-600 transition-all cursor-pointer"
                        title={sample.name}
                      >
                        <img src={sample.url} alt={sample.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[7px] truncate px-1 py-0.5 text-center">
                          {sample.category}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optional Half position & Caption */}
              {selectedLayout === 'half' && (
                <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    Posição da Meia Foto no A7:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPosition('top')}
                      className={`py-1.5 px-3 rounded-lg border text-xs cursor-pointer font-semibold ${
                        position === 'top'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      Foto no Topo (Texto Abaixo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosition('bottom')}
                      className={`py-1.5 px-3 rounded-lg border text-xs cursor-pointer font-semibold ${
                        position === 'bottom'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                          : 'border-stone-200 bg-white text-stone-700'
                      }`}
                    >
                      Foto na Base (Texto Acima)
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Caption */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Legenda Opcional da Imagem
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ex: Ilustração Botânica · Prancha I"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white shadow-2xs text-stone-900"
                />
              </div>
            </div>

            {/* Right Column: Live A7 Simulation (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-stone-100 border border-stone-200 rounded-xl">
              <div className="w-full text-center mb-2">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Prévia Real do Painel Físico A7 (74,25 × 105 mm)
                </span>
              </div>

              {/* A7 Card Simulation */}
              <div className="w-full max-w-[210px] aspect-[74.25/105] bg-white border border-stone-400 rounded-md shadow-lg relative overflow-hidden flex flex-col justify-between">
                {selectedLayout === 'full' && (
                  <PageImageRenderer
                    layout="full"
                    images={images}
                    caption={caption}
                    showLabels
                  />
                )}

                {selectedLayout === 'half' && (
                  <div className="w-full h-full flex flex-col justify-between">
                    {position === 'top' ? (
                      <>
                        <div className="w-full h-1/2 relative overflow-hidden shrink-0 border-b border-stone-200">
                          <PageImageRenderer
                            layout="half"
                            images={images}
                            caption={caption}
                            showLabels
                          />
                        </div>
                        <div className="w-full h-1/2 p-2.5 text-[8.5px] text-stone-600 flex flex-col justify-between overflow-hidden bg-white shrink-0">
                          <div className="space-y-1">
                            <div className="font-bold text-[9.5px] text-stone-900 border-b border-stone-200 pb-0.5 truncate">
                              {page.title || 'Título da Página'}
                            </div>
                            <p className="line-clamp-3 italic text-[8px] text-stone-700 leading-snug">
                              {page.content || 'O texto do seu livreto ocupa harmoniosamente a outra metade do painel A7, equilibrando imagem e literatura.'}
                            </p>
                          </div>
                          <div className="text-[7.5px] text-stone-400 text-right pt-0.5 border-t border-stone-100 font-mono">
                            Pág. {page.editorialNumber}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-1/2 p-2.5 text-[8.5px] text-stone-600 flex flex-col justify-between overflow-hidden bg-white shrink-0 border-b border-stone-200">
                          <div className="text-[7.5px] text-stone-400 pb-0.5 border-b border-stone-100 flex justify-between font-mono">
                            <span>Cabeçalho A7</span>
                            <span>{page.editorialNumber}</span>
                          </div>
                          <div className="space-y-1 my-auto">
                            <div className="font-bold text-[9.5px] text-stone-900 border-b border-stone-200 pb-0.5 truncate">
                              {page.title || 'Título da Página'}
                            </div>
                            <p className="line-clamp-3 italic text-[8px] text-stone-700 leading-snug">
                              {page.content || 'O texto do seu livreto ocupa harmoniosamente a outra metade do painel A7, equilibrando imagem e literatura.'}
                            </p>
                          </div>
                        </div>
                        <div className="w-full h-1/2 relative overflow-hidden shrink-0">
                          <PageImageRenderer
                            layout="half"
                            images={images}
                            caption={caption}
                            showLabels
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {selectedLayout === 'two' && (
                  <PageImageRenderer
                    layout="two"
                    images={images}
                    caption={caption}
                    showLabels
                  />
                )}

                {selectedLayout === 'four' && (
                  <PageImageRenderer
                    layout="four"
                    images={images}
                    caption={caption}
                    showLabels
                  />
                )}
              </div>

              <div className="mt-3 text-center text-[10.5px] text-stone-600 font-mono">
                {currentLayoutDef.dimensionMm}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3 py-1.5 text-xs font-semibold text-red-700 hover:text-red-900 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            Remover Imagens Desta Página
          </button>

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
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Aplicar Layout no A7</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
