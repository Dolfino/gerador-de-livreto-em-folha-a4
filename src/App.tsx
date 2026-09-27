import React, { useState, useEffect, useMemo } from 'react';
import { BookSettings, PageDocument, OverflowReport, OutputMode, DEFAULT_HEADER_FOOTER } from './types';
import { Header } from './components/Header';
import { ModeSelector } from './components/ModeSelector';
import { SettingsPanel } from './components/SettingsPanel';
import { TextPreparationView } from './components/TextPreparationView';
import { PageEditorView } from './components/PageEditorView';
import { ReadingPreview } from './components/ReadingPreview';
import { ImpositionSheetPreview } from './components/ImpositionSheetPreview';
import { FoldingGuideModal } from './components/FoldingGuideModal';
import { PrintInstructionsModal } from './components/PrintInstructionsModal';
import { HeaderFooterModal } from './components/HeaderFooterModal';
import { PrintSheetContainer } from './components/PrintSheetContainer';
import {
  distributeTextAcrossPages,
  splitIntoMultipleVolumes,
  balanceAdjacentPages,
  autoBalanceBookPages,
  cascadeFillBookPages,
  packPageCompletely,
  FONT_CAPACITIES,
} from './utils/textDistributor';
import { generateMinibookPDF } from './utils/pdfGenerator';
import {
  TEST_BOOKLET_PAGES,
  TEST_BOOKLET_16P,
  TEST_BOOKLET_WITH_IMAGES,
  LITERARY_SAMPLE_TEXT,
  LITERARY_SAMPLE_16P,
  MARKDOWN_LINKS_SAMPLE_TEXT,
} from './data/sampleBooks';
import {
  Layers,
  Sparkles,
  BookOpen,
  Printer,
  Download,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const DEFAULT_SETTINGS: BookSettings = {
  outputMode: 'front-only',
  posterSettings: {
    orientation: 'landscape',
    title: 'O Pescador e a Gaivota Dourada',
    subtitle: 'Uma crônica marítima sobre o silêncio',
    author: 'Sofia Alencar',
    bodyText:
      '“Não procurem por terra firme com âncoras de ferro. O mar guarda os seus maiores segredos apenas para quem sabe escutar o silêncio entre as ondas.”',
    showCutSlitZone: true,
    theme: 'literary',
  },
  headerFooter: DEFAULT_HEADER_FOOTER,
  fontSize: 'md',
  fontFamily: 'serif',
  margin: 'standard',
  textAlign: 'left',
  lineHeight: 'normal',
  showFoldGuides: true,
  foldGuideStyle: 'dashed',
  showCutGuide: true,
  showPageNumbers: true,
  showPanelHeadersInPrint: true,
  coverStyle: 'classic',
  textDistributionMode: 'fill-first',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'edit' | 'pages' | 'reader' | 'sheet'>('edit');
  const [settings, setSettings] = useState<BookSettings>(DEFAULT_SETTINGS);

  // Content state
  const [title, setTitle] = useState<string>('O Pescador e a Gaivota Dourada');
  const [subtitle, setSubtitle] = useState<string>('Uma crônica marítima sobre o silêncio');
  const [author, setAuthor] = useState<string>('Sofia Alencar');
  const [backCoverText, setBackCoverText] = useState<string>(
    'Uma história sobre escuta, coragem e os caminhos inesperados que o mar nos ensina a percorrer.'
  );
  const [rawText, setRawText] = useState<string>(LITERARY_SAMPLE_TEXT);

  // Pages state
  const [pages, setPages] = useState<PageDocument[]>(() => {
    const { pages: initialPages } = distributeTextAcrossPages(
      LITERARY_SAMPLE_TEXT,
      DEFAULT_SETTINGS,
      []
    );
    if (initialPages[0]) {
      initialPages[0].title = 'O Pescador e a Gaivota Dourada';
      initialPages[0].subtitle = 'Uma crônica marítima sobre o silêncio';
      initialPages[0].author = 'Sofia Alencar';
    }
    const last = initialPages[initialPages.length - 1];
    if (last) {
      last.content =
        'Uma história sobre escuta, coragem e os caminhos inesperados que o mar nos ensina a percorrer.';
    }
    return initialPages;
  });

  // Multi-Volume state
  const [volumes, setVolumes] = useState<PageDocument[][] | null>(null);
  const [activeVolumeIndex, setActiveVolumeIndex] = useState<number>(0);

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isHFModalOpen, setIsHFModalOpen] = useState(false);

  // Active pages (either single edition or active volume)
  const activePages = useMemo(() => {
    if (volumes && volumes[activeVolumeIndex]) {
      return volumes[activeVolumeIndex];
    }
    return pages;
  }, [volumes, activeVolumeIndex, pages]);

  // Compute overflow report
  const overflowReport: OverflowReport = useMemo(() => {
    const { report } = distributeTextAcrossPages(rawText, settings, activePages);
    return report;
  }, [rawText, settings, activePages]);

  // When Settings change, redistribute dynamically if font size, header/footer, margin or distribution mode changes
  const handleSettingsChange = (newSettings: BookSettings) => {
    const distModeChanged = newSettings.textDistributionMode !== settings.textDistributionMode;
    const fontSizeChanged = newSettings.fontSize !== settings.fontSize;
    const hfChanged =
      newSettings.headerFooter?.showTopHeader !== settings.headerFooter?.showTopHeader ||
      newSettings.headerFooter?.showFooter !== settings.headerFooter?.showFooter;
    const marginChanged = newSettings.margin !== settings.margin;
    setSettings(newSettings);

    if (
      (distModeChanged || fontSizeChanged || (activeTab === 'edit' && (hfChanged || marginChanged))) &&
      rawText
    ) {
      const { pages: newPages } = distributeTextAcrossPages(rawText, newSettings, pages);
      if (newPages[0]) {
        newPages[0].title = title;
        newPages[0].subtitle = subtitle;
        newPages[0].author = author;
      }
      const last = newPages[newPages.length - 1];
      if (last) {
        last.content = backCoverText;
      }
      setPages(newPages);
    }
  };

  // When Mode changes, redistribute automatically
  const handleSelectMode = (newMode: OutputMode) => {
    const updatedSettings: BookSettings = { ...settings, outputMode: newMode };
    setSettings(updatedSettings);

    const { pages: newPages } = distributeTextAcrossPages(rawText, updatedSettings, pages);
    if (newPages[0]) {
      newPages[0].title = title;
      newPages[0].subtitle = subtitle;
      newPages[0].author = author;
    }
    const last = newPages[newPages.length - 1];
    if (last) {
      last.content = backCoverText;
    }
    setPages(newPages);
  };

  // Handle Distribute Button click
  const handleDistribute = () => {
    const { pages: newPages } = distributeTextAcrossPages(rawText, settings, pages);
    if (newPages[0]) {
      newPages[0].title = title;
      newPages[0].subtitle = subtitle;
      newPages[0].author = author;
    }
    const last = newPages[newPages.length - 1];
    if (last) {
      last.content = backCoverText;
    }
    setPages(newPages);
    setVolumes(null);
  };

  // Handle Page Update
  const handleUpdatePage = (id: number, updated: Partial<PageDocument>) => {
    const updatedList = activePages.map((p) => (p.id === id ? { ...p, ...updated } : p));
    if (volumes) {
      const newVols = [...volumes];
      newVols[activeVolumeIndex] = updatedList;
      setVolumes(newVols);
    } else {
      setPages(updatedList);
    }

    if (id === 1) {
      if (updated.title !== undefined) setTitle(updated.title);
      if (updated.subtitle !== undefined) setSubtitle(updated.subtitle);
      if (updated.author !== undefined) setAuthor(updated.author);
    }
    if (id === activePages.length) {
      if (updated.content !== undefined) setBackCoverText(updated.content);
    }
  };

  // Move paragraph from page X to next page
  const handleMoveParagraphToNext = (fromPageId: number) => {
    const pageIndex = activePages.findIndex((p) => p.id === fromPageId);
    if (pageIndex === -1 || pageIndex >= activePages.length - 1) return;

    const source = activePages[pageIndex];
    const target = activePages[pageIndex + 1];

    const sourceParagraphs = source.content.split(/\n\n+/).filter(Boolean);
    if (sourceParagraphs.length === 0) return;

    const lastPara = sourceParagraphs.pop();
    const newSourceContent = sourceParagraphs.join('\n\n');
    const newTargetContent = target.content ? `${lastPara}\n\n${target.content}` : (lastPara || '');

    handleUpdatePage(source.id, { content: newSourceContent });
    handleUpdatePage(target.id, { content: newTargetContent });
  };

  // Pull paragraph from next page into target page
  const handlePullParagraphFromNext = (toPageId: number) => {
    const pageIndex = activePages.findIndex((p) => p.id === toPageId);
    if (pageIndex === -1 || pageIndex >= activePages.length - 1) return;

    const target = activePages[pageIndex];
    const next = activePages[pageIndex + 1];

    const nextParagraphs = next.content.split(/\n\n+/).filter(Boolean);
    if (nextParagraphs.length === 0) return;

    const firstPara = nextParagraphs.shift();
    const newNextContent = nextParagraphs.join('\n\n');
    const newTargetContent = target.content ? `${target.content}\n\n${firstPara}` : (firstPara || '');

    handleUpdatePage(target.id, { content: newTargetContent });
    handleUpdatePage(next.id, { content: newNextContent });
  };

  // Pull paragraph from previous page into target page
  const handlePullParagraphFromPrev = (toPageId: number) => {
    const pageIndex = activePages.findIndex((p) => p.id === toPageId);
    if (pageIndex <= 1) return;

    const prev = activePages[pageIndex - 1];
    const target = activePages[pageIndex];

    const prevParagraphs = prev.content.split(/\n\n+/).filter(Boolean);
    if (prevParagraphs.length === 0) return;

    const lastPara = prevParagraphs.pop();
    const newPrevContent = prevParagraphs.join('\n\n');
    const newTargetContent = target.content ? `${lastPara}\n\n${target.content}` : (lastPara || '');

    handleUpdatePage(prev.id, { content: newPrevContent });
    handleUpdatePage(target.id, { content: newTargetContent });
  };

  // Rebalance all internal pages dynamically
  const handleRebalanceAllPages = () => {
    const rebalanced = autoBalanceBookPages(activePages, settings);
    if (volumes) {
      const newVols = [...volumes];
      newVols[activeVolumeIndex] = rebalanced;
      setVolumes(newVols);
    } else {
      setPages(rebalanced);
    }
  };

  // Balance two adjacent pages 50/50 dynamically
  const handleBalanceAdjacentPages = (pageIdA: number, pageIdB: number) => {
    const idxA = activePages.findIndex((p) => p.id === pageIdA);
    const idxB = activePages.findIndex((p) => p.id === pageIdB);
    if (idxA === -1 || idxB === -1) return;

    const { pageA, pageB } = balanceAdjacentPages(activePages[idxA], activePages[idxB], settings);
    const updated = [...activePages];
    updated[idxA] = pageA;
    updated[idxB] = pageB;

    if (volumes) {
      const newVols = [...volumes];
      newVols[activeVolumeIndex] = updated;
      setVolumes(newVols);
    } else {
      setPages(updated);
    }
  };

  // Cascade fill pages (fill earlier pages completely, leave final pages empty)
  const handleCascadeFillPages = (): boolean => {
    const filled = cascadeFillBookPages(activePages, settings);
    const hasChanged = filled.some(
      (p, i) =>
        p.content?.trim() !== activePages[i]?.content?.trim() ||
        p.title?.trim() !== activePages[i]?.title?.trim()
    );
    if (hasChanged) {
      if (volumes) {
        const newVols = [...volumes];
        newVols[activeVolumeIndex] = filled;
        setVolumes(newVols);
      } else {
        setPages(filled);
      }
    }
    return hasChanged;
  };

  // Pack current page to full capacity by pulling text from the next page
  const handlePackPageCompletely = (sourcePageId: number, nextPageId: number): number => {
    const idxA = activePages.findIndex((p) => p.id === sourcePageId);
    const idxB = activePages.findIndex((p) => p.id === nextPageId);
    if (idxA === -1 || idxB === -1) return 0;

    const { sourcePage, nextPage, wordsMoved } = packPageCompletely(
      activePages[idxA],
      activePages[idxB],
      settings
    );
    if (wordsMoved > 0) {
      const updated = [...activePages];
      updated[idxA] = sourcePage;
      updated[idxB] = nextPage;

      if (volumes) {
        const newVols = [...volumes];
        newVols[activeVolumeIndex] = updated;
        setVolumes(newVols);
      } else {
        setPages(updated);
      }
    }
    return wordsMoved;
  };

  // Move user-selected text snippet to next page
  const handleSendSelectionToNextPage = (
    sourcePageId: number,
    selectedText: string,
    targetPageId: number
  ) => {
    const trimmed = selectedText.trim();
    if (!trimmed) return;

    const sourceIdx = activePages.findIndex((p) => p.id === sourcePageId);
    const targetIdx = activePages.findIndex((p) => p.id === targetPageId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const sourcePage = activePages[sourceIdx];
    const targetPage = activePages[targetIdx];

    let newSourceContent = sourcePage.content;
    const pos = newSourceContent.indexOf(selectedText);
    if (pos !== -1) {
      newSourceContent =
        newSourceContent.slice(0, pos) + newSourceContent.slice(pos + selectedText.length);
    } else {
      newSourceContent = newSourceContent.replace(trimmed, '');
    }

    newSourceContent = newSourceContent.replace(/\n{3,}/g, '\n\n').trim();

    const newTargetContent = targetPage.content?.trim()
      ? `${trimmed}\n\n${targetPage.content.trim()}`
      : trimmed;

    const updated = [...activePages];
    updated[sourceIdx] = { ...sourcePage, content: newSourceContent };
    updated[targetIdx] = { ...targetPage, content: newTargetContent };

    if (volumes) {
      const newVols = [...volumes];
      newVols[activeVolumeIndex] = updated;
      setVolumes(newVols);
    } else {
      setPages(updated);
    }
  };

  // Move user-selected text snippet to previous page
  const handleSendSelectionToPrevPage = (
    sourcePageId: number,
    selectedText: string,
    targetPageId: number
  ) => {
    const trimmed = selectedText.trim();
    if (!trimmed) return;

    const sourceIdx = activePages.findIndex((p) => p.id === sourcePageId);
    const targetIdx = activePages.findIndex((p) => p.id === targetPageId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const sourcePage = activePages[sourceIdx];
    const targetPage = activePages[targetIdx];

    let newSourceContent = sourcePage.content;
    const pos = newSourceContent.indexOf(selectedText);
    if (pos !== -1) {
      newSourceContent =
        newSourceContent.slice(0, pos) + newSourceContent.slice(pos + selectedText.length);
    } else {
      newSourceContent = newSourceContent.replace(trimmed, '');
    }

    newSourceContent = newSourceContent.replace(/\n{3,}/g, '\n\n').trim();

    const newTargetContent = targetPage.content?.trim()
      ? `${targetPage.content.trim()}\n\n${trimmed}`
      : trimmed;

    const updated = [...activePages];
    updated[sourceIdx] = { ...sourcePage, content: newSourceContent };
    updated[targetIdx] = { ...targetPage, content: newTargetContent };

    if (volumes) {
      const newVols = [...volumes];
      newVols[activeVolumeIndex] = updated;
      setVolumes(newVols);
    } else {
      setPages(updated);
    }
  };

  // Split into volumes
  const handleSplitVolumes = () => {
    const vols = splitIntoMultipleVolumes(rawText, settings, title, author, backCoverText);
    setVolumes(vols);
    setActiveVolumeIndex(0);
    setActiveTab('sheet');
  };

  // Apply AI or Intelligent Summary
  const handleApplySummarizedText = (summarized: string) => {
    setRawText(summarized);
    const { pages: newPages } = distributeTextAcrossPages(summarized, settings, pages);
    if (newPages[0]) {
      newPages[0].title = title;
      newPages[0].subtitle = subtitle;
      newPages[0].author = author;
    }
    const last = newPages[newPages.length - 1];
    if (last) {
      last.content = backCoverText;
    }
    setPages(newPages);
  };

  // Load 8P Sample Text
  const handleLoadSampleText = () => {
    setTitle('O Pescador e a Gaivota Dourada');
    setSubtitle('Uma crônica marítima sobre o silêncio');
    setAuthor('Sofia Alencar');
    setBackCoverText(
      'Uma história sobre escuta, coragem e os caminhos inesperados que o mar nos ensina a percorrer.'
    );
    setRawText(LITERARY_SAMPLE_TEXT);

    const { pages: newPages } = distributeTextAcrossPages(LITERARY_SAMPLE_TEXT, settings, []);
    if (newPages[0]) {
      newPages[0].title = 'O Pescador e a Gaivota Dourada';
      newPages[0].subtitle = 'Uma crônica marítima sobre o silêncio';
      newPages[0].author = 'Sofia Alencar';
    }
    const last = newPages[newPages.length - 1];
    if (last) {
      last.content =
        'Uma história sobre escuta, coragem e os caminhos inesperados que o mar nos ensina a percorrer.';
    }
    setPages(newPages);
    setVolumes(null);
  };

  // Load 16P Sample Text
  const handleLoadSample16PText = () => {
    setTitle('As Cartas Secretas do Farol Velho');
    setSubtitle('Mistérios guardados pelas marés');
    setAuthor('Gabriel de Castro');
    setBackCoverText(
      'Uma novela poética sobre luzes, mensagens oceânicas e a coragem de zarpar sem mapa.'
    );
    setRawText(LITERARY_SAMPLE_16P);

    const updatedSettings = { ...settings };
    if (settings.outputMode === 'front-only' || settings.outputMode === 'poster-back') {
      updatedSettings.outputMode = 'continuation-16p';
      setSettings(updatedSettings);
    }

    const { pages: newPages } = distributeTextAcrossPages(
      LITERARY_SAMPLE_16P,
      updatedSettings,
      []
    );
    if (newPages[0]) {
      newPages[0].title = 'As Cartas Secretas do Farol Velho';
      newPages[0].subtitle = 'Mistérios guardados pelas marés';
      newPages[0].author = 'Gabriel de Castro';
    }
    const last = newPages[newPages.length - 1];
    if (last) {
      last.content =
        'Uma novela poética sobre luzes, mensagens oceânicas e a coragem de zarpar sem mapa.';
    }
    setPages(newPages);
    setVolumes(null);
  };

  // Load Markdown Links Sample Text
  const handleLoadMarkdownLinksSample = () => {
    setTitle('O Guia do Viajante Conectado');
    setSubtitle('Hyperlinks e Estruturas em Markdown');
    setAuthor('Redação Minilivro');
    setBackCoverText(
      'Publicação interativa com suporte nativo aos 5 formatos de hyperlinks em Markdown.'
    );
    setRawText(MARKDOWN_LINKS_SAMPLE_TEXT);

    const { pages: newPages } = distributeTextAcrossPages(
      MARKDOWN_LINKS_SAMPLE_TEXT,
      settings,
      []
    );
    if (newPages[0]) {
      newPages[0].title = 'O Guia do Viajante Conectado';
      newPages[0].subtitle = 'Hyperlinks e Estruturas em Markdown';
      newPages[0].author = 'Redação Minilivro';
    }
    const last = newPages[newPages.length - 1];
    if (last) {
      last.content =
        'Publicação interativa com suporte nativo aos 5 formatos de hyperlinks em Markdown.';
    }
    setPages(newPages);
    setVolumes(null);
  };

  // Load 8P Numbered Test Booklet
  const handleLoadTestBooklet = () => {
    setSettings((s) => ({ ...s, outputMode: 'front-only' }));
    setPages(TEST_BOOKLET_PAGES);
    setTitle('MINILIVRO DE TESTE');
    setSubtitle('Validação Física da Folha A4');
    setAuthor('Guia de Montagem 8P');
    setBackCoverText('Validação Concluída! Montagem Física Aprovada.');
    setVolumes(null);
    setActiveTab('sheet');
  };

  // Load 16P Numbered Test Booklet
  const handleLoadTest16PBooklet = () => {
    setSettings((s) => ({ ...s, outputMode: 'booklet-bound-16p' }));
    setPages(TEST_BOOKLET_16P);
    setTitle('CADERNO 16P TESTE');
    setSubtitle('Edição de 16 Páginas Duplex');
    setAuthor('Oficina Minilivro 8P');
    setBackCoverText('Caderno 16P Concluído! Montagem Duplex aprovada.');
    setVolumes(null);
    setActiveTab('sheet');
  };

  // Load 8P Photos & Layouts Test Booklet (Sangria total, meia folha, 2 poses, 4 poses)
  const handleLoadImageTestBooklet = () => {
    setSettings((s) => ({ ...s, outputMode: 'front-only' }));
    setPages(TEST_BOOKLET_WITH_IMAGES);
    setTitle('ÁLBUM FOTOGRÁFICO A7');
    setSubtitle('4 Formatos Físicos no Minilivro');
    setAuthor('Oficina Editorial A4');
    setBackCoverText('Montagem de 8 páginas concluída com os 4 formatos físicos de imagem calibrados para o painel A7.');
    setVolumes(null);
    setActiveTab('pages');
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    const doc = await generateMinibookPDF(activePages, settings, {
      fileName: `${title.toLowerCase().replace(/\s+/g, '-')}-a4.pdf`,
      volumeNumber: volumes ? activeVolumeIndex + 1 : undefined,
      totalVolumes: volumes ? volumes.length : undefined,
    });
    const cleanTitle = title
      ? title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      : 'minilivro';
    doc.save(`${cleanTitle}-a4.pdf`);
  };

  // Trigger Print modal / print dialog
  const handleOpenPrintModal = () => {
    setIsPrintModalOpen(true);
  };

  const handleConfirmDirectPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      {/* Top Header */}
      <Header
        onDownloadPDF={handleDownloadPDF}
        onPrint={handleOpenPrintModal}
        onLoadTestBooklet={handleLoadTestBooklet}
        onLoadImageTestBooklet={handleLoadImageTestBooklet}
        onOpenGuide={() => setIsGuideOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        outputMode={settings.outputMode}
        pageCount={activePages.length}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-5 md:py-7 space-y-5 no-print">
        {/* PROMINENT MODE SELECTOR BAR */}
        <ModeSelector currentMode={settings.outputMode} onSelectMode={handleSelectMode} />

        {/* Global Typographic and Print Settings */}
        <SettingsPanel
          settings={settings}
          onChange={handleSettingsChange}
          totalPages={activePages.length}
        />

        {/* Multi-Volume Switcher Banner (if active) */}
        {volumes && volumes.length > 1 && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-800" />
              <span className="font-semibold text-amber-950">
                Texto longo dividido em {volumes.length} Volumes independentes (cada um em 1 folha
                A4):
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {volumes.map((_, vIdx) => (
                <button
                  key={vIdx}
                  type="button"
                  onClick={() => setActiveVolumeIndex(vIdx)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                    activeVolumeIndex === vIdx
                      ? 'bg-amber-900 text-white font-bold shadow-2xs'
                      : 'bg-white text-stone-700 hover:bg-amber-100 border border-amber-300'
                  }`}
                >
                  Volume {vIdx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: PREPARAR TEXTO */}
        {activeTab === 'edit' && (
          <TextPreparationView
            rawText={rawText}
            setRawText={setRawText}
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            author={author}
            setAuthor={setAuthor}
            backCoverText={backCoverText}
            setBackCoverText={setBackCoverText}
            onDistribute={handleDistribute}
            overflowReport={overflowReport}
            settings={settings}
            onUpdateSettings={setSettings}
            onSplitVolumes={handleSplitVolumes}
            onApplySummarizedText={handleApplySummarizedText}
            onLoadSampleText={handleLoadSampleText}
            onLoadSample16PText={handleLoadSample16PText}
            onLoadTestBooklet={handleLoadTestBooklet}
            onLoadTest16PBooklet={handleLoadTest16PBooklet}
            onLoadMarkdownLinksSample={handleLoadMarkdownLinksSample}
            onGoToPages={() => {
              handleDistribute();
              setActiveTab('pages');
            }}
          />
        )}

        {/* TAB 2: REVISAR PÁGINAS */}
        {activeTab === 'pages' && (
          <PageEditorView
            pages={activePages}
            onUpdatePage={handleUpdatePage}
            settings={settings}
            onUpdateSettings={setSettings}
            onMoveParagraphToNext={handleMoveParagraphToNext}
            onPullParagraphFromNext={handlePullParagraphFromNext}
            onPullParagraphFromPrev={handlePullParagraphFromPrev}
            onRebalanceAllPages={handleRebalanceAllPages}
            onCascadeFillPages={handleCascadeFillPages}
            onBalanceAdjacentPages={handleBalanceAdjacentPages}
            onPackPageCompletely={handlePackPageCompletely}
            onSendSelectionToNextPage={handleSendSelectionToNextPage}
            onSendSelectionToPrevPage={handleSendSelectionToPrevPage}
            onGoToReadingPreview={() => setActiveTab('reader')}
          />
        )}

        {/* TAB 3: PRÉVIA DE LEITURA */}
        {activeTab === 'reader' && (
          <ReadingPreview
            pages={activePages}
            settings={settings}
            onGoToSheetPreview={() => setActiveTab('sheet')}
            onEditPage={(pageId) => {
              setActiveTab('pages');
            }}
          />
        )}

        {/* TAB 4: FOLHA ABERTA A4 */}
        {activeTab === 'sheet' && (
          <ImpositionSheetPreview
            pages={activePages}
            settings={settings}
            onDownloadPDF={handleDownloadPDF}
            onPrint={handleOpenPrintModal}
            volumeNumber={volumes ? activeVolumeIndex + 1 : undefined}
            totalVolumes={volumes ? volumes.length : undefined}
          />
        )}
      </main>

      {/* Hidden container specifically for Browser Ctrl+P Direct Printing */}
      <PrintSheetContainer pages={activePages} settings={settings} />

      {/* Modals */}
      <FoldingGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onLoadTestBooklet={handleLoadTestBooklet}
        outputMode={settings.outputMode}
      />

      <PrintInstructionsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onConfirmPrint={handleConfirmDirectPrint}
        outputMode={settings.outputMode}
      />

      <HeaderFooterModal
        isOpen={isHFModalOpen}
        onClose={() => setIsHFModalOpen(false)}
        settings={settings}
        onChangeSettings={setSettings}
        totalPages={activePages.length}
      />
    </div>
  );
}
