import React from 'react';
import { X, Printer, CheckCircle2, AlertCircle, RotateCw } from 'lucide-react';
import { OutputMode } from '../types';

interface PrintInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPrint: () => void;
  outputMode: OutputMode;
}

export const PrintInstructionsModal: React.FC<PrintInstructionsModalProps> = ({
  isOpen,
  onClose,
  onConfirmPrint,
  outputMode,
}) => {
  if (!isOpen) return null;

  const isDuplex = outputMode !== 'front-only';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-stone-700" />
            <h3 className="text-base font-serif font-bold text-stone-900">
              Instruções de Impressão Perfeita
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-stone-700">
          <p className="leading-relaxed">
            Para que as dobras e os cortes coincidam milimetricamente com a grade da folha A4 (297 × 210 mm), configure a impressora conforme as opções abaixo:
          </p>

          <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 text-xs">Escala: 100% / Tamanho Real</strong>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Desmarque a opção “Ajustar à página” ou “Reduzir para caber”. O arquivo já possui as dimensões exatas de 297 × 210 mm.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 text-xs">Orientação: Paisagem (Horizontal)</strong>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Selecione formato de papel A4 com orientação Paisagem.
                </p>
              </div>
            </div>

            {isDuplex ? (
              <div className="flex items-start gap-2.5 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                <RotateCw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-950 text-xs">
                    Frente e Verso (Duplex): Virar pela borda curta
                  </strong>
                  <p className="text-[11px] text-amber-900/90 mt-0.5">
                    Selecione <strong>“Virar pela borda curta” (Short-Edge Flip)</strong> nas configurações duplex da impressora.
                  </p>
                  <p className="text-[10px] text-amber-800 mt-1 italic">
                    * Impressora manual? Imprima primeiro a página 1, recoloque a folha na bandeja mantendo a mesma orientação e imprima a página 2.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900 text-xs">Impressão em Apenas 1 Lado</strong>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    O minilivro de 8 páginas utiliza somente a frente da folha A4.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-stone-700 hover:bg-stone-200 rounded font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onConfirmPrint();
            }}
            className="flex items-center gap-1.5 px-5 py-2 text-xs text-white bg-stone-900 hover:bg-stone-800 rounded font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Abrir Diálogo de Impressão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
