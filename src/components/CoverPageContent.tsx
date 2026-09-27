import React from 'react';
import { BookSettings, PageDocument } from '../types';
import { getPageFontSizePt } from '../utils/textDistributor';
import { MarkdownContent } from './MarkdownContent';

type CoverVariant = 'editor' | 'reading' | 'print' | 'sheet';

interface CoverPageContentProps {
  page: PageDocument;
  settings: BookSettings;
  variant: CoverVariant;
  onNavigateAnchor?: (anchorId: string) => void;
}

const styles: Record<CoverVariant, {
  rule: string;
  subtitle: string;
  body: string;
  author: string;
}> = {
  editor: {
    rule: 'w-8 h-0.5 mb-3',
    subtitle: 'mt-1',
    body: 'mt-3 leading-snug',
    author: 'mt-3',
  },
  reading: {
    rule: 'w-10 h-0.5 mb-4',
    subtitle: 'mt-2',
    body: 'mt-4 leading-snug',
    author: 'mt-4',
  },
  print: {
    rule: 'w-8 h-0.5 mb-2',
    subtitle: 'mt-1',
    body: 'mt-3 leading-snug',
    author: 'mt-3',
  },
  sheet: {
    rule: 'w-6 h-0.5 mb-2',
    subtitle: 'mt-0.5 line-clamp-1',
    body: 'mt-1 leading-tight',
    author: 'mt-1',
  },
};

export const CoverPageContent: React.FC<CoverPageContentProps> = ({
  page,
  settings,
  variant,
  onNavigateAnchor,
}) => {
  const style = styles[variant];
  const bodyPt = getPageFontSizePt(page, settings);
  const fontSizes = variant === 'sheet'
    ? {
        title: `${bodyPt * 0.85 + 3.8}px`,
        subtitle: `${bodyPt * 0.85}px`,
        body: `${bodyPt * 0.85}px`,
        author: `${bodyPt * 0.85}px`,
      }
    : variant === 'reading'
    ? {
        title: `${bodyPt * 2.05}pt`,
        subtitle: `${bodyPt * 1.15}pt`,
        body: `${bodyPt * 1.1}pt`,
        author: `${bodyPt * 1.05}pt`,
      }
    : {
        title: `${bodyPt + 3.5}pt`,
        subtitle: `${Math.max(5.5, bodyPt - 1)}pt`,
        body: `${Math.max(5.5, bodyPt - 0.5)}pt`,
        author: `${Math.max(5.5, bodyPt - 1)}pt`,
      };
  const hasHeading = !!(page.title?.trim() || page.subtitle?.trim() || page.author?.trim());
  const hasBody = !!page.content?.trim();

  return (
    <div className={`h-full min-h-0 flex flex-col justify-center items-center text-center ${variant === 'sheet' ? 'p-1' : 'p-2'}`}>
      {hasHeading && <div className={`${style.rule} bg-stone-900 shrink-0`} />}
      {page.title?.trim() && (
        <h4 className="font-bold font-serif leading-tight text-stone-900 shrink-0" style={{ fontSize: fontSizes.title }}>
          {page.title}
        </h4>
      )}
      {page.subtitle?.trim() && (
        <p className={`${style.subtitle} text-stone-600 italic leading-tight shrink-0`} style={{ fontSize: fontSizes.subtitle }}>
          {page.subtitle}
        </p>
      )}
      {hasBody && (
        <div
          aria-label="Texto da capa"
          className={`${style.body} w-full text-stone-700`}
          style={{ fontSize: fontSizes.body }}
        >
          <MarkdownContent
            content={page.content || ''}
            textAlign="center"
            compact={variant === 'sheet'}
            isPrint={variant === 'print'}
            inheritFontSize
            onNavigateAnchor={onNavigateAnchor}
          />
        </div>
      )}
      {page.author?.trim() && (
        <p className={`${style.author} text-stone-800 font-medium tracking-wide uppercase shrink-0`} style={{ fontSize: fontSizes.author }}>
          {page.author}
        </p>
      )}
    </div>
  );
};
