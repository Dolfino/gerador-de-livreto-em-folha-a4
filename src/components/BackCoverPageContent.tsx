import React from 'react';
import { BookSettings, PageDocument } from '../types';
import { getPageFontSizePt } from '../utils/textDistributor';
import { MarkdownContent } from './MarkdownContent';

type BackCoverVariant = 'editor' | 'reading' | 'print' | 'sheet';

interface BackCoverPageContentProps {
  page: PageDocument;
  settings: BookSettings;
  variant: BackCoverVariant;
  onNavigateAnchor?: (anchorId: string) => void;
}

export const BackCoverPageContent: React.FC<BackCoverPageContentProps> = ({
  page,
  settings,
  variant,
  onNavigateAnchor,
}) => {
  const fontPt = getPageFontSizePt(page, settings);
  const isSheet = variant === 'sheet';
  const isReading = variant === 'reading';
  const bodySize = isSheet ? `${fontPt * 0.85}px` : `${Math.max(5.5, fontPt - 0.5) * (isReading ? 1.1 : 1)}pt`;
  const headingSize = isSheet ? `${fontPt * 0.85}px` : `${Math.max(6.5, fontPt - 1) * (isReading ? 1.1 : 1)}pt`;

  return (
    <div className={`h-full min-h-0 flex flex-col justify-between text-center ${isSheet ? 'p-1' : 'p-2'}`}>
      <div className="shrink-0">
        {page.title?.trim() && (
          <div className="uppercase tracking-widest text-stone-500" style={{ fontSize: headingSize }}>
            {page.title}
          </div>
        )}
        {page.subtitle?.trim() && (
          <p className="mt-1 italic text-stone-600" style={{ fontSize: headingSize }}>
            {page.subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        {page.content?.trim() && (
          <div aria-label="Texto da contracapa" className="w-full italic text-stone-700 leading-relaxed" style={{ fontSize: bodySize }}>
            <MarkdownContent
              content={page.content}
              textAlign="center"
              compact={isSheet}
              isPrint={variant === 'print'}
              inheritFontSize
              onNavigateAnchor={onNavigateAnchor}
            />
          </div>
        )}
      </div>

      {page.dateOrPublisher?.trim() && (
        <div className="shrink-0 font-mono text-stone-500" style={{ fontSize: headingSize }}>
          {page.dateOrPublisher}
        </div>
      )}
    </div>
  );
};
