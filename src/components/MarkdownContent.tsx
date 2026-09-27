import React from 'react';
import {
  ExternalLink,
  Hash,
  Paperclip,
  FileSpreadsheet,
  FileImage,
  FileText,
  FolderArchive,
  File,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { parseMarkdownText, MarkdownSpan, ParsedLine } from '../utils/markdownParser';
import { generateQrCodeSvg } from '../utils/qrCodeHelper';

interface MarkdownContentProps {
  content: string;
  textAlign?: 'left' | 'justify' | 'center';
  className?: string;
  compact?: boolean;
  isPrint?: boolean;
  onNavigateAnchor?: (anchorId: string) => void;
  externalRefMap?: Map<string, { href: string; title?: string }>;
}

function getFileIcon(ext?: string) {
  const e = (ext || '').toLowerCase();
  if (['xlsx', 'xls', 'csv'].includes(e)) return FileSpreadsheet;
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(e)) return FileImage;
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(e)) return FileText;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return FolderArchive;
  return Paperclip;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  textAlign = 'left',
  className = '',
  compact = false,
  isPrint = false,
  onNavigateAnchor,
  externalRefMap,
}) => {
  const parsedLines = parseMarkdownText(content || '', externalRefMap);

  const handleAnchorClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    const cleanId = href.replace(/^#/, '');

    if (onNavigateAnchor) {
      onNavigateAnchor(cleanId);
      return;
    }

    // Default DOM scroll fallback
    const target =
      document.getElementById(`heading-${cleanId}`) ||
      document.getElementById(cleanId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ring-2', 'ring-amber-400', 'bg-amber-50', 'transition-all');
      setTimeout(() => {
        target.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-50');
      }, 1800);
    }
  };

  const renderSpan = (span: MarkdownSpan, sIdx: number) => {
    if (span.type === 'link') {
      if (span.isAnchor) {
        return (
          <a
            key={sIdx}
            href={span.href}
            onClick={(e) => handleAnchorClick(e, span.href || '')}
            title={span.title || `Ir para âncora ${span.href}`}
            className={`cursor-pointer inline-flex items-center gap-0.5 font-medium underline transition-colors ${
              isPrint
                ? 'text-stone-900 underline decoration-stone-300'
                : 'text-amber-800 hover:text-amber-950 underline decoration-amber-400 hover:decoration-amber-700 bg-amber-50/70 hover:bg-amber-100/80 px-1 py-0.2 rounded'
            } ${span.bold ? 'font-bold' : ''} ${span.italic ? 'italic' : ''}`}
          >
            {!compact && !isPrint && <Hash className="w-2.5 h-2.5 inline opacity-60 text-amber-700" />}
            <span>{span.text}</span>
          </a>
        );
      }

      // Relative local file link
      if (span.isFileLink) {
        const IconComponent = getFileIcon(span.fileExtension);
        return (
          <a
            key={sIdx}
            href={span.href}
            target="_blank"
            rel="noopener noreferrer"
            title={
              span.title
                ? `${span.title} (Arquivo relativo: ${span.href})`
                : `Arquivo relativo: ${span.href} (aberto a partir da mesma pasta do PDF)`
            }
            className={`cursor-pointer inline-flex items-center gap-1 font-medium transition-colors ${
              isPrint
                ? 'text-stone-900 underline decoration-emerald-500'
                : 'text-emerald-800 hover:text-emerald-950 underline decoration-emerald-400 hover:decoration-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/60 px-1 py-0.2 rounded text-[0.95em]'
            } ${span.bold ? 'font-bold' : ''} ${span.italic ? 'italic' : ''}`}
          >
            {!compact && !isPrint && (
              <IconComponent className="w-2.5 h-2.5 inline text-emerald-700 opacity-80 shrink-0" />
            )}
            <span>{span.text}</span>
          </a>
        );
      }

      // Phygital QR Code link
      if (span.isQrCode) {
        return (
          <a
            key={sIdx}
            href={span.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`QR Code Phygital: ${span.text} (${span.href})`}
            className={`cursor-pointer inline-flex items-center gap-1 font-semibold transition-colors ${
              isPrint
                ? 'text-stone-900 underline decoration-purple-500'
                : 'text-purple-800 hover:text-purple-950 underline decoration-purple-400 hover:decoration-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-1 py-0.2 rounded text-[0.95em]'
            }`}
          >
            {!compact && <QrCode className="w-2.5 h-2.5 inline text-purple-700 opacity-90 shrink-0" />}
            <span>{span.text}</span>
          </a>
        );
      }

      // External or standard web link
      return (
        <a
          key={sIdx}
          href={span.href}
          target="_blank"
          rel="noopener noreferrer"
          title={span.title ? `${span.title} (${span.href})` : span.href}
          className={`cursor-pointer inline-flex items-center gap-0.5 font-medium transition-colors ${
            isPrint
              ? 'text-stone-900 underline decoration-stone-400'
              : 'text-sky-700 hover:text-sky-900 underline decoration-sky-300 hover:decoration-sky-600'
          } ${span.bold ? 'font-bold' : ''} ${span.italic ? 'italic' : ''}`}
        >
          <span>{span.text}</span>
          {!compact && !isPrint && !span.isAutolink && (
            <ExternalLink className="w-2.5 h-2.5 inline opacity-60 hover:opacity-100 shrink-0" />
          )}
        </a>
      );
    }

    let formatClasses = '';
    if (span.bold) formatClasses += ' font-bold';
    if (span.italic) formatClasses += ' italic';
    if (span.strikethrough) formatClasses += ' line-through decoration-stone-500/70';
    if (span.underline) formatClasses += ' underline decoration-stone-500/80 underline-offset-2';
    if (span.highlight) {
      formatClasses += isPrint
        ? ' bg-amber-100/90 text-stone-900 px-0.5 py-0.2 rounded-2xs'
        : ' bg-amber-200/85 text-amber-950 px-1 py-0.2 rounded-2xs shadow-2xs';
    }

    let spanStyle: React.CSSProperties | undefined = undefined;
    if (span.fontSizeScale && span.fontSizeScale !== 1) {
      spanStyle = { fontSize: `${span.fontSizeScale}em` };
    }

    if (span.type === 'code') {
      return (
        <code
          key={sIdx}
          style={spanStyle}
          className={`font-mono bg-stone-100 text-stone-800 rounded px-1.5 py-0.5 text-[0.88em] ${
            isPrint ? 'border border-stone-200' : ''
          }${formatClasses}`}
        >
          {span.text}
        </code>
      );
    }

    return (
      <span
        key={sIdx}
        style={spanStyle}
        className={formatClasses.trim()}
      >
        {span.text}
      </span>
    );
  };

  const renderLine = (line: ParsedLine, idx: number) => {
    // Reference definitions are omitted from visible view
    if (line.isReferenceDef) return null;

    if (!line.text && !line.isQrCode) {
      return <div key={idx} className={compact ? 'h-0.5' : isPrint ? 'h-1' : 'h-1.5'} />;
    }

    // Phygital QR Code Card
    if (line.isQrCode && line.qrUrl) {
      const qrSvg = generateQrCodeSvg(line.qrUrl);
      const isSm = line.qrSize === 'sm';
      const isLg = line.qrSize === 'lg';

      const sizeClasses = compact
        ? 'w-10 h-10'
        : isSm
        ? 'w-14 h-14'
        : isLg
        ? 'w-24 h-24'
        : 'w-20 h-20';

      return (
        <div
          key={idx}
          className={`my-2 p-2 rounded-lg border text-center transition-all ${
            isPrint
              ? 'border-stone-300 bg-white'
              : 'border-purple-200/90 bg-gradient-to-b from-purple-50/60 via-white to-purple-50/40 shadow-2xs hover:shadow-xs'
          } ${compact ? 'p-1 my-1' : ''}`}
        >
          {/* Phygital Badge */}
          {!compact && (
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[8.5px] font-semibold tracking-wider text-purple-700 bg-purple-100/80 rounded-full uppercase">
                <Smartphone className="w-2.5 h-2.5" />
                <span>Phygital · Escaneie com a Câmera</span>
              </span>
            </div>
          )}

          {/* QR Code Container */}
          <div className="flex justify-center items-center my-0.5">
            <a
              href={line.qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Abrir link direto: ${line.qrUrl}`}
              className="inline-block p-1 bg-white rounded border border-stone-200 shadow-2xs hover:scale-[1.03] transition-transform cursor-pointer"
            >
              <div
                className={`${sizeClasses} flex items-center justify-center`}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </a>
          </div>

          {/* Caption */}
          {line.qrCaption && (
            <p
              className={`font-semibold text-stone-800 leading-tight mt-1 ${
                compact ? 'text-[8px] line-clamp-1' : isPrint ? 'text-[8.5pt]' : 'text-[10.5px]'
              }`}
            >
              {line.qrCaption}
            </p>
          )}

          {!compact && !isPrint && (
            <a
              href={line.qrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[9px] text-purple-600 hover:text-purple-800 underline mt-0.5 transition-colors"
            >
              <span className="truncate max-w-[190px]">{line.qrUrl}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          )}
        </div>
      );
    }

    if (line.isHeading1) {
      return (
        <h4
          key={idx}
          id={line.anchorId ? `heading-${line.anchorId}` : undefined}
          className={`font-bold font-serif text-stone-900 scroll-mt-6 ${
            compact
              ? 'text-[10px] pt-0.5'
              : isPrint
              ? 'text-[10pt] pt-1 pb-0.5 border-b border-stone-100'
              : 'text-xs md:text-sm pt-1 pb-0.5 border-b border-stone-100'
          }`}
        >
          {line.spans.map(renderSpan)}
        </h4>
      );
    }

    if (line.isHeading2) {
      return (
        <h5
          key={idx}
          id={line.anchorId ? `heading-${line.anchorId}` : undefined}
          className={`font-bold text-stone-900 scroll-mt-6 ${
            compact
              ? 'text-[9.5px] pt-0.5'
              : isPrint
              ? 'text-[9pt] pt-0.5'
              : 'text-[11px] md:text-xs pt-1'
          }`}
        >
          {line.spans.map(renderSpan)}
        </h5>
      );
    }

    if (line.isHeading3) {
      return (
        <h6
          key={idx}
          id={line.anchorId ? `heading-${line.anchorId}` : undefined}
          className={`font-semibold text-stone-800 scroll-mt-6 ${
            compact ? 'text-[9px]' : isPrint ? 'text-[8.5pt]' : 'text-[10.5px]'
          }`}
        >
          {line.spans.map(renderSpan)}
        </h6>
      );
    }

    if (line.isBlockquote) {
      return (
        <blockquote
          key={idx}
          className={`border-l-2.5 border-amber-600/70 bg-amber-50/50 pl-2.5 py-1 my-1 italic text-stone-700 rounded-r ${
            compact ? 'text-[8.5px]' : isPrint ? 'text-[9pt]' : 'text-xs'
          }`}
        >
          {line.spans.map(renderSpan)}
        </blockquote>
      );
    }

    if (line.isDivider) {
      return (
        <hr
          key={idx}
          className={`border-stone-200/80 ${compact ? 'my-1' : isPrint ? 'my-1.5' : 'my-2'}`}
        />
      );
    }

    if (line.isTableRow && line.tableCells && line.tableCells.length > 0) {
      const isHeader = line.isTableHeader;
      if (line.tableCells.length === 2) {
        return (
          <div
            key={idx}
            className={`grid grid-cols-2 gap-1.5 py-0.5 items-baseline ${
              compact
                ? 'text-[7.8px] leading-tight'
                : isPrint
                ? 'text-[8pt] leading-tight'
                : 'text-[9.5px] md:text-[10.5px] leading-snug'
            } ${
              isHeader
                ? 'font-bold border-b border-stone-200 text-stone-900 pb-0.5 mb-0.5'
                : 'text-stone-800'
            }`}
          >
            <div className="flex items-center gap-1 min-w-0 truncate">
              {line.tableCells[0].spans.map(renderSpan)}
            </div>
            <div className="flex items-center gap-1 min-w-0 truncate">
              {line.tableCells[1].spans.map(renderSpan)}
            </div>
          </div>
        );
      }

      return (
        <div
          key={idx}
          className={`grid gap-0.5 py-0.5 items-center text-stone-800 text-center ${
            compact
              ? 'text-[7.5px] leading-tight'
              : isPrint
              ? 'text-[8pt] leading-tight'
              : 'text-[9.5px] leading-snug'
          } ${
            isHeader
              ? 'font-bold border-b border-stone-200 text-stone-900 pb-0.5 mb-0.5'
              : ''
          }`}
          style={{
            gridTemplateColumns: `repeat(${line.tableCells.length}, minmax(0, 1fr))`,
          }}
        >
          {line.tableCells.map((cell, cIdx) => (
            <div
              key={cIdx}
              className={`px-0.5 min-w-0 overflow-hidden text-ellipsis ${
                cIdx === 0 && line.tableCells && line.tableCells.length > 4 ? 'text-left font-medium' : 'text-center'
              }`}
            >
              {cell.spans.map(renderSpan)}
            </div>
          ))}
        </div>
      );
    }

    if (line.isBullet) {
      return (
        <div key={idx} className={`flex items-start gap-1 ${compact ? 'pl-0.5' : 'pl-1.5'}`}>
          <span className="text-stone-400 select-none">•</span>
          <div className="flex-1 leading-snug">{line.spans.map(renderSpan)}</div>
        </div>
      );
    }

    const alignClass =
      textAlign === 'justify' ? 'text-justify' : textAlign === 'center' ? 'text-center' : 'text-left';

    return (
      <p
        key={idx}
        className={`${alignClass} leading-relaxed ${
          compact ? 'line-clamp-6 text-[8.5px]' : ''
        }`}
      >
        {line.spans.map(renderSpan)}
      </p>
    );
  };

  return <div className={`space-y-1.5 ${className}`}>{parsedLines.map(renderLine)}</div>;
};
