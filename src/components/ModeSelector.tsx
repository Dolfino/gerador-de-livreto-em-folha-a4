import React from 'react';
import { OutputMode } from '../types';
import { FileText, Image as ImageIcon, BookCopy, BookOpen, Check } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: OutputMode;
  onSelectMode: (mode: OutputMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  const modes: {
    id: OutputMode;
    title: string;
    badge: string;
    sheetTag: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'front-only',
      title: '1. Somente Frente',
      badge: '8 Páginas',
      sheetTag: '1 Folha A4 · 1 Lado',
      desc: 'Formato clássico com 1 corte central e dobra em cruz. Imprime só na frente.',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'poster-back',
      title: '2. Verso Pôster',
      badge: '8 Pág. + Pôster',
      sheetTag: '1 Folha A4 · Duplex',
      desc: 'Páginas 1 a 8 na frente e pôster contínuo A4 no verso ao desdobrar.',
      icon: <ImageIcon className="w-4 h-4" />,
    },
    {
      id: 'continuation-16p',
      title: '3. Continuação 16P',
      badge: '16 Páginas',
      sheetTag: '1 Folha A4 · Duplex',
      desc: 'Minizine duplo: págs. 1–8 na frente, transição na pág. 8 e 9–16 no verso.',
      icon: <BookCopy className="w-4 h-4" />,
    },
    {
      id: 'booklet-bound-16p',
      title: '4. Caderno Encadernado',
      badge: '16 Páginas',
      sheetTag: '1 Folha A4 · Duplex',
      desc: 'Corte em 4 fólios A7 encaixados e presos na lombada com grampos ou costura.',
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-[#FCFAF7] border border-stone-200/90 rounded-xl p-3 md:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-stone-200/70">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded">
            Modo de Saída
          </span>
          <span className="text-xs font-semibold text-stone-800">
            Escolha o formato e a montagem física da folha A4:
          </span>
        </div>
        <span className="text-[11px] text-stone-500 font-sans">
          Duplex recomendado: <span className="font-medium text-stone-700">Virada na Borda Curta</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {modes.map((m) => {
          const isSelected = currentMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`text-left p-3 rounded-lg border transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-white border-stone-900 shadow-sm ring-1 ring-stone-900 text-stone-900'
                  : 'bg-stone-50/70 hover:bg-white border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className={isSelected ? 'text-stone-900' : 'text-stone-500'}>
                      {m.icon}
                    </span>
                    <span>{m.title}</span>
                  </div>
                  {isSelected ? (
                    <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : null}
                </div>

                <p className="text-[11px] leading-relaxed mb-2 text-stone-600">
                  {m.desc}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-stone-100/80 mt-auto">
                <span className="font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                  {m.badge}
                </span>
                <span className="text-stone-500 font-mono text-[9.5px]">
                  {m.sheetTag}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
