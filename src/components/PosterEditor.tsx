import React from 'react';
import { PosterSettings, PosterOrientation, PosterTheme } from '../types';
import { Sliders, Type, Scissors, Sparkles, Image as ImageIcon, RotateCw } from 'lucide-react';

interface PosterEditorProps {
  settings: PosterSettings;
  onChange: (updated: PosterSettings) => void;
}

export const PosterEditor: React.FC<PosterEditorProps> = ({ settings, onChange }) => {
  const update = <K extends keyof PosterSettings>(key: K, value: PosterSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        update('backgroundImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-stone-700" />
          <h3 className="text-sm font-serif font-bold text-stone-900">
            Composição do Pôster A4 (Verso da Folha)
          </h3>
        </div>
        <span className="text-[11px] text-stone-500 bg-stone-100 px-2.5 py-1 rounded">
          Dimensão física: A4 (297 × 210 mm)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orientation selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-stone-500" />
            Orientação Visual do Pôster
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update('orientation', 'portrait')}
              className={`p-2.5 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                settings.orientation === 'portrait'
                  ? 'border-stone-900 bg-stone-900 text-white font-medium shadow-xs'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <div className="font-bold">Em pé (Retrato)</div>
              <div className={`text-[10px] ${settings.orientation === 'portrait' ? 'text-stone-300' : 'text-stone-500'}`}>
                210 × 297 mm lógico
              </div>
            </button>
            <button
              type="button"
              onClick={() => update('orientation', 'landscape')}
              className={`p-2.5 rounded-lg border text-left transition-all text-xs cursor-pointer ${
                settings.orientation === 'landscape'
                  ? 'border-stone-900 bg-stone-900 text-white font-medium shadow-xs'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <div className="font-bold">Deitada (Paisagem)</div>
              <div className={`text-[10px] ${settings.orientation === 'landscape' ? 'text-stone-300' : 'text-stone-500'}`}>
                297 × 210 mm direto
              </div>
            </button>
          </div>
          <p className="text-[10.5px] text-stone-500 leading-tight">
            * O PDF sempre sai em A4 paisagem para manter o duplex alinhado; no modo retrato, a arte é rotacionada 90° para visualização ao desdobrar.
          </p>
        </div>

        {/* Theme selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stone-500" />
            Estilo Visual do Pôster
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: 'literary', name: 'Editorial Literário' },
                { id: 'minimal', name: 'Minimalista Clássico' },
                { id: 'vintage', name: 'Gravura & Moldura' },
                { id: 'bold', name: 'Cartaz Tipográfico' },
              ] as { id: PosterTheme; name: string }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => update('theme', t.id)}
                className={`px-2.5 py-2 rounded-lg border text-xs text-left transition-all cursor-pointer ${
                  settings.theme === t.id
                    ? 'border-stone-900 bg-stone-100 text-stone-900 font-semibold'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-600'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slit Indicator Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <Scissors className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Área Crítica do Corte Central (Fenda)</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-amber-800">
              <input
                type="checkbox"
                checked={settings.showCutSlitZone}
                onChange={(e) => update('showCutSlitZone', e.target.checked)}
                className="rounded border-amber-300 text-amber-900 focus:ring-amber-500"
              />
              Destacar linha de corte na prévia
            </label>
          </div>
          <p className="text-[11px] text-amber-800/90 mt-0.5">
            Ao montar o minizine, uma fenda central de 148,5 mm é cortada na folha. O texto do pôster foi posicionado fora da fenda para não ser danificado.
          </p>
        </div>
      </div>

      {/* Poster Text Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Título Principal do Pôster
          </label>
          <input
            type="text"
            value={settings.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Ex: O Pescador e a Gaivota Dourada"
            className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Subtítulo ou Lema
          </label>
          <input
            type="text"
            value={settings.subtitle}
            onChange={(e) => update('subtitle', e.target.value)}
            placeholder="Ex: Não procure por terra firme com âncoras de ferro..."
            className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Assinatura / Autor / Edição
          </label>
          <input
            type="text"
            value={settings.author}
            onChange={(e) => update('author', e.target.value)}
            placeholder="Ex: Sofia Alencar · Tiragem Artesanal"
            className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-stone-900 focus:border-stone-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
          <span>Texto Lírico ou Poema Central do Pôster</span>
          <span className="text-[11px] text-stone-400 font-normal">
            Dica: parágrafos curtos, estrofes ou uma citação marcante
          </span>
        </label>
        <textarea
          rows={3}
          value={settings.bodyText}
          onChange={(e) => update('bodyText', e.target.value)}
          placeholder="Insira aqui o manifesto, poema ou síntese que ocupará o centro do pôster desdobrado..."
          className="w-full p-2.5 text-xs border border-stone-300 rounded font-serif focus:ring-1 focus:ring-stone-900 focus:border-stone-900 leading-relaxed"
        />
      </div>

      {/* Background artwork upload */}
      <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-stone-800">Imagem de Fundo ou Arte do Pôster</span>
          <p className="text-[11px] text-stone-500">
            Opcional. Formatos PNG ou JPG recomendados. Se vazio, o pôster usará uma composição tipográfica com molduras artísticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {settings.backgroundImage && (
            <button
              type="button"
              onClick={() => update('backgroundImage', undefined)}
              className="px-2.5 py-1 text-xs text-red-700 hover:bg-red-50 border border-red-200 rounded"
            >
              Remover Imagem
            </button>
          )}
          <label className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded font-medium cursor-pointer transition-colors text-stone-800">
            <span>{settings.backgroundImage ? 'Trocar Arte...' : 'Upload de Arte...'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
