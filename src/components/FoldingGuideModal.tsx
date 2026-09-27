import React, { useState } from 'react';
import {
  X,
  Printer,
  Scissors,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { OutputMode } from '../types';

interface FoldingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTestBooklet: () => void;
  outputMode: OutputMode;
}

export const FoldingGuideModal: React.FC<FoldingGuideModalProps> = ({
  isOpen,
  onClose,
  onLoadTestBooklet,
  outputMode,
}) => {
  const [guideMode, setGuideMode] = useState<OutputMode>(outputMode);
  const [activeStep, setActiveStep] = useState<number>(0);

  if (!isOpen) return null;

  const minizineSteps = [
    {
      title: 'Passo 1: Imprimir a Folha A4 em Tamanho Real (100%)',
      desc: 'Imprima em papel A4 padrão (75g ou 90g). No diálogo da sua impressora, marque Escala 100% / Tamanho Real (sem ajustar à página) e impressão em Apenas 1 Lado.',
      detail:
        'A folha sairá com os 8 painéis: a linha superior estará de cabeça para baixo e a inferior na posição normal.',
      badge: 'Impressão 100%',
    },
    {
      title: 'Passo 2: Marcar os Vincos das Dobras',
      desc: 'Dobre a folha ao meio no sentido do comprimento (horizontal, y = 105 mm). Desdobre. Depois dobre ao meio no sentido da largura e dobre novamente as duas metades para marcar as 4 colunas verticais.',
      detail:
        'O objetivo é deixar todos os 8 painéis bem vincados, facilitando a formação do miolo.',
      badge: 'Vincagem',
    },
    {
      title: 'Passo 3: Cortar a Fenda Central (Apenas na Linha Vermelha)',
      desc: 'Dobre a folha ao meio e, com uma tesoura, faça um corte reto ao longo da linha horizontal central, abrangendo apenas as duas colunas do meio (de x = 74,25 mm a x = 222,75 mm).',
      detail:
        'Atenção: NÃO corte até as bordas da folha! O corte deve ter exatamente 148,5 mm de extensão no meio.',
      badge: 'Corte Central',
    },
    {
      title: 'Passo 4: Pressionar as Extremidades Formando uma Cruz',
      desc: 'Abra a folha e dobre-a longitudinalmente. Segure as duas extremidades esquerda e direita e empurre-as em direção ao centro. A abertura central se expandirá formando um formato de cruz ou sinal de mais (+).',
      detail:
        'As páginas internas se voltam umas para as outras automaticamente na orientação correta de leitura.',
      badge: 'Dobra em Cruz',
    },
    {
      title: 'Passo 5: Fechar o Minilivro com a Capa na Frente',
      desc: 'Dobre as abas da cruz de forma que a Página 1 fique como Capa frontal e a Página 8 fique como Contracapa traseira. Alinhe os vincos com a mão ou régua.',
      detail:
        'Pronto! Seu livreto de 8 páginas está montado, sem necessidade de grampos ou cola.',
      badge: 'Finalização',
    },
  ];

  const boundSteps = [
    {
      title: 'Passo 1: Imprimir Duplex (Frente e Verso na Borda Curta)',
      desc: 'Imprima o arquivo em folha A4 com Duplex automático ou manual. É indispensável selecionar "Virar pela borda curta" (Short-Edge Flip) para que as páginas internas casem com precisão milimétrica.',
      detail:
        'Na frente você terá os fólios externos (16-1, 14-3, 12-5, 10-7) e no verso os internos correspondentes.',
      badge: 'Duplex A4',
    },
    {
      title: 'Passo 2: Cortar a Linha Horizontal Central Completa (y = 105 mm)',
      desc: 'Com um estilete e régua de aço (ou guilhotina), corte a folha de ponta a ponta na linha central vermelha em y = 105 mm, separando a folha em duas tiras compridas de 297 × 105 mm.',
      detail: 'Você agora possui duas tiras horizontais frente e verso.',
      badge: 'Corte Horizontal',
    },
    {
      title: 'Passo 3: Cortar a Linha Vertical Central (x = 148,5 mm)',
      desc: 'Corte cada uma das duas tiras ao meio no sentido vertical (x = 148,5 mm). Isso criará exatamente quatro fólios planos de 148,5 × 105 mm.',
      detail:
        'Cada fólio corresponde a duas páginas lado a lado: Fólio 1 (16–1), Fólio 2 (14–3), Fólio 3 (12–5) e Fólio 4 (10–7).',
      badge: '4 Fólios A7',
    },
    {
      title: 'Passo 4: Dobrar Cada Fólio ao Meio',
      desc: 'Dobre cada um dos 4 fólios ao meio na linha vertical restante (em 74,25 mm), criando caderninhos de 74,25 × 105 mm.',
      detail:
        'Ao dobrar, os pares editoriais ficam perfeitos: 16–1 por fora e 2–15 por dentro; 14–3 por fora e 4–13 por dentro; etc.',
      badge: 'Dobra dos Fólios',
    },
    {
      title: 'Passo 5: Encaixar e Prender a Lombada (Grampos ou Costura)',
      desc: 'Encaixe os 4 cadernos uns dentro dos outros do exterior para o interior (Fólio 1 > Fólio 2 > Fólio 3 > Fólio 4). Abra na página central (8–9) e aplique dois grampos ou uma costura de panfleto na dobra da lombada.',
      detail:
        'Parabéns! Você produziu um livro A7 convencional de 16 páginas com encadernação de lombada profissional.',
      badge: 'Encadernação',
    },
  ];

  const posterSteps = [
    {
      title: 'Passo 1: Imprimir Duplex A4 (Frente e Verso)',
      desc: 'Imprima em duplex (virada na borda curta). A frente conterá o livreto de 8 páginas e o verso conterá o pôster contínuo A4.',
      detail: 'Recomendamos papel de gramatura 90g para evitar que o verso transpareça.',
      badge: 'Impressão Duplex',
    },
    {
      title: 'Passo 2: Montar o Livreto pela Fenda Central',
      desc: 'Dobre e corte a fenda central de 148,5 mm como no minizine clássico. Dobre em cruz para ler o livro de 8 páginas normalmente.',
      detail: 'A fenda foi projetada para não danificar o texto e a composição do pôster.',
      badge: 'Montagem Minizine',
    },
    {
      title: 'Passo 3: Desdobrar para Exibir o Pôster',
      desc: 'Quando o leitor desejar, basta abrir completamente a folha A4 e virá-la para o verso. A folha se transforma em um cartaz/pôster contínuo A4 pronto para afixar na parede ou colecionar!',
      detail:
        'Se o modo Retrato foi escolhido, basta girar a folha 90° para visualizá-lo na vertical.',
      badge: 'Pôster Desdobrado',
    },
  ];

  const currentStepList =
    guideMode === 'booklet-bound-16p'
      ? boundSteps
      : guideMode === 'poster-back'
      ? posterSteps
      : minizineSteps;

  const currentStep = currentStepList[Math.min(activeStep, currentStepList.length - 1)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-stone-700" />
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900 leading-tight">
                Guia Visual de Montagem e Dobras
              </h3>
              <p className="text-[11px] text-stone-500">
                Transforme sua folha A4 impressa em um livro físico sem complicação.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs inside Modal */}
        <div className="px-6 pt-3 pb-1 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto text-xs bg-stone-50">
          <button
            type="button"
            onClick={() => {
              setGuideMode('front-only');
              setActiveStep(0);
            }}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors cursor-pointer ${
              guideMode === 'front-only' || guideMode === 'continuation-16p'
                ? 'bg-white text-stone-900 border-t border-x border-stone-200 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Minizine Clássico (1 Corte + Cruz)
          </button>
          <button
            type="button"
            onClick={() => {
              setGuideMode('booklet-bound-16p');
              setActiveStep(0);
            }}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors cursor-pointer ${
              guideMode === 'booklet-bound-16p'
                ? 'bg-white text-stone-900 border-t border-x border-stone-200 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Caderno Encadernado 16P (4 Fólios + Lombada)
          </button>
          <button
            type="button"
            onClick={() => {
              setGuideMode('poster-back');
              setActiveStep(0);
            }}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors cursor-pointer ${
              guideMode === 'poster-back'
                ? 'bg-white text-stone-900 border-t border-x border-stone-200 shadow-2xs font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Verso Pôster A4
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step Pill */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded font-mono">
              {currentStep.badge}
            </span>
            <span className="text-stone-500 font-mono">
              Etapa {activeStep + 1} de {currentStepList.length}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-serif font-bold text-stone-900">{currentStep.title}</h4>
            <p className="text-xs text-stone-700 leading-relaxed">{currentStep.desc}</p>
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-600 italic">
              💡 {currentStep.detail}
            </div>
          </div>

          {/* Quick test booklet download reminder */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Quer testar com um exemplar já pronto e numerado?</span>
            <button
              type="button"
              onClick={() => {
                onLoadTestBooklet();
                onClose();
              }}
              className="px-3 py-1 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded font-medium cursor-pointer"
            >
              Carregar Modelo Numerado
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
          <button
            type="button"
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Etapa Anterior</span>
          </button>

          <div className="flex items-center gap-1.5">
            {currentStepList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                  activeStep === idx ? 'bg-stone-900' : 'bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeStep < currentStepList.length - 1) {
                setActiveStep((prev) => prev + 1);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-1 px-4 py-1.5 text-xs text-white bg-stone-900 hover:bg-stone-800 rounded font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <span>{activeStep < currentStepList.length - 1 ? 'Próxima Etapa' : 'Entendido!'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
