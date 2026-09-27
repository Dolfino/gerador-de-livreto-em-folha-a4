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
  title: string;
  subtitle: string;
  body: string;
  author: string;
}> = {
  editor: {
    rule: 'w-8 h-0.5 mb-3',
    title: 'text-base',
    subtitle: 'text-[10px] mt-1',
    body: 'mt-3 text-[9px] leading-snug',
    author: 'text-[10px] mt-3',
  },
  reading: {
    rule: 'w-10 h-0.5 mb-4',
    title: 'text-xl md:text-2xl',
    subtitle: 'text-xs md:text-sm mt-2',
    body: 'mt-4 text-[10px] md:text-xs leading-snug',
    author: 'text-xs mt-4',
  },
  print: {
    rule: 'w-8 h-0.5 mb-2',
    title: 'text-[12pt]',
    subtitle: 'text-[8pt] mt-1',
    body: 'mt-3 leading-snug',
    author: 'text-[7.5pt] mt-3',
  },
  sheet: {
    rule: 'w-6 h-0.5 mb-2',
    title: 'text-[11px]',
    subtitle: 'text-[7.5px] mt-0.5 line-clamp-1',
    body: 'mt-1 text-[7.5px] leading-tight',
    author: 'text-[7.5px] mt-1',
  },
};

export const CoverPageContent: React.FC<CoverPageContentProps> = ({
  page,
  settings,
  variant,
  onNavigateAnchor,
}) => {
  const style = styles[variant];
  const hasHeading = !!(page.title?.trim() || page.subtitle?.trim() || page.author?.trim());
  const hasBody = !!page.content?.trim();

  return (
    <div className={`h-full min-h-0 flex flex-col justify-center items-center text-center ${variant === 'sheet' ? 'p-1' : 'p-2'}`}>
      {hasHeading && <div className={`${style.rule} bg-stone-900 shrink-0`} />}
      {page.title?.trim() && (
        <h4 className={`${style.title} font-bold font-serif leading-tight text-stone-900 shrink-0`}>
          {page.title}
        </h4>
      )}
      {page.subtitle?.trim() && (
        <p className={`${style.subtitle} text-stone-600 italic leading-tight shrink-0`}>
          {page.subtitle}
        </p>
      )}
      {hasBody && (
        <div
          aria-label="Texto da capa"
          className={`${style.body} w-full text-stone-700`}
          style={variant === 'print' ? { fontSize: `${getPageFontSizePt(page, settings)}pt` } : undefined}
        >
          <MarkdownContent
            content={page.content || ''}
            textAlign="center"
            compact={variant === 'sheet'}
            isPrint={variant === 'print'}
            onNavigateAnchor={onNavigateAnchor}
          />
        </div>
      )}
      {page.author?.trim() && (
        <p className={`${style.author} text-stone-800 font-medium tracking-wide uppercase shrink-0`}>
          {page.author}
        </p>
      )}
    </div>
  );
};
