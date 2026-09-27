import React from 'react';
import { PageImageLayout } from '../types';
import { Image as ImageIcon } from 'lucide-react';

interface PageImageRendererProps {
  layout: PageImageLayout;
  images: string[];
  position?: 'top' | 'bottom';
  caption?: string;
  className?: string;
  isPrint?: boolean;
  compact?: boolean;
  showLabels?: boolean;
}

export const PageImageRenderer: React.FC<PageImageRendererProps> = ({
  layout,
  images,
  position = 'top',
  caption,
  className = '',
  isPrint = false,
  compact = false,
  showLabels = false,
}) => {
  if (layout === 'none' || !images || images.length === 0) return null;

  // Render 1: Imagem na folha inteira (Sem bordas / Sangria total no A7)
  if (layout === 'full') {
    const src = images[0];
    return (
      <div className={`relative w-full h-full overflow-hidden bg-stone-100 ${className}`}>
        {src ? (
          <img
            src={src}
            alt={caption || 'Imagem em sangria total no A7'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-2 text-center">
            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-[10px]">Sangria Total A7</span>
          </div>
        )}

        {/* Optional floating caption */}
        {caption && !compact && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 pt-6 text-white text-center">
            <p className="text-[10px] md:text-xs font-medium leading-tight drop-shadow-xs">
              {caption}
            </p>
          </div>
        )}

        {showLabels && !isPrint && !compact && (
          <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Sangria Total
          </div>
        )}
      </div>
    );
  }

  // Render 2: Meia folha (Uma única imagem ocupando metade do A7: 74,25 × 52,5 mm)
  if (layout === 'half') {
    const src = images[0];
    return (
      <div
        className={`w-full h-full overflow-hidden bg-stone-100 relative ${className}`}
      >
        {src ? (
          <img
            src={src}
            alt={caption || 'Imagem em meio formato A7'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-1 text-center">
            <ImageIcon className="w-5 h-5 mb-0.5 opacity-50" />
            <span className="text-[9px]">Meia Folha A7 (50%)</span>
          </div>
        )}

        {caption && !compact && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 pt-3 text-white text-center">
            <p className="text-[8.5px] truncate drop-shadow-xs">{caption}</p>
          </div>
        )}

        {showLabels && !isPrint && !compact && (
          <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[7.5px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            Meia Folha (50%)
          </div>
        )}
      </div>
    );
  }

  // Render 3: Duas imagens na mesma folha (Dividida ao meio / Layout 2 por página)
  if (layout === 'two') {
    const img1 = images[0];
    const img2 = images[1];

    return (
      <div className={`w-full h-full flex flex-col divide-y divide-white/80 overflow-hidden bg-stone-100 ${className}`}>
        {/* Pose 1 (Superior) */}
        <div className="relative w-full h-1/2 overflow-hidden bg-stone-100">
          {img1 ? (
            <img
              src={img1}
              alt="Pose 1 (Superior)"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 text-[9px]">
              <span>Pose 1 (Superior)</span>
            </div>
          )}
          {showLabels && !isPrint && !compact && (
            <span className="absolute top-1 left-1 bg-black/60 text-white text-[7.5px] font-mono px-1 rounded">
              Pose 1
            </span>
          )}
        </div>

        {/* Pose 2 (Inferior) */}
        <div className="relative w-full h-1/2 overflow-hidden bg-stone-100">
          {img2 ? (
            <img
              src={img2}
              alt="Pose 2 (Inferior)"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 text-[9px]">
              <span>Pose 2 (Inferior)</span>
            </div>
          )}
          {showLabels && !isPrint && !compact && (
            <span className="absolute top-1 left-1 bg-black/60 text-white text-[7.5px] font-mono px-1 rounded">
              Pose 2
            </span>
          )}
        </div>
      </div>
    );
  }

  // Render 4: Quatro imagens na mesma folha (Dividida em quatro / Layout 4 por página / 4 poses)
  if (layout === 'four') {
    return (
      <div
        className={`w-full h-full grid grid-cols-2 grid-rows-2 gap-[1px] bg-white overflow-hidden ${className}`}
      >
        {[0, 1, 2, 3].map((idx) => {
          const src = images[idx];
          return (
            <div key={idx} className="relative w-full h-full overflow-hidden bg-stone-100">
              {src ? (
                <img
                  src={src}
                  alt={`Pose ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-1 text-center">
                  <ImageIcon className="w-3.5 h-3.5 opacity-40 mb-0.5" />
                  <span className="text-[8px] font-mono">Q{idx + 1}</span>
                </div>
              )}
              {showLabels && !isPrint && !compact && (
                <span className="absolute top-0.5 left-0.5 bg-black/60 text-white text-[7px] font-mono px-0.5 rounded">
                  P{idx + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};
