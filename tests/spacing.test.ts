import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMarkdownText } from '../src/utils/markdownParser';
import { generateMinibookPDF } from '../src/utils/pdfGenerator';
import { DEFAULT_HEADER_FOOTER, type BookSettings, type PageDocument } from '../src/types';

const settings: BookSettings = {
  outputMode: 'front-only',
  posterSettings: {
    orientation: 'landscape', title: '', subtitle: '', author: '', bodyText: '',
    showCutSlitZone: false, theme: 'literary',
  },
  headerFooter: DEFAULT_HEADER_FOOTER,
  fontSize: 'sm', fontFamily: 'sans', margin: 'standard', textAlign: 'left',
  lineHeight: 'normal', showFoldGuides: false, foldGuideStyle: 'dashed',
  showCutGuide: false, showPageNumbers: false, showPanelHeadersInPrint: false,
  coverStyle: 'classic',
};

test('preserves the gap inside a reduced font span with bold labels', () => {
  const source = '<span style="font-size: 0.8em"> **□• Tarefa** (a fazer)               **○ Evento** (reunião/data)</span>';
  const [line] = parseMarkdownText(source);
  assert.equal(line.text, ' □• Tarefa (a fazer)               ○ Evento (reunião/data)');
  assert.equal(line.raw, source);
  assert.ok(line.spans.every((span) => span.fontSizeScale === 0.8));
  assert.equal(line.spans.find((span) => span.text === '○ Evento')?.bold, true);
});

test('keeps indentation and spacing in paragraphs, headings, lists and quotes', () => {
  for (const source of [
    '    Tarefa    Evento  ',
    '    **Tarefa**    Evento  ',
    '    # Tarefa    Evento  ',
    '    ## Tarefa    Evento  ',
    '    ### Tarefa    Evento  ',
    '    - Tarefa    Evento  ',
    '    > Tarefa    Evento  ',
  ]) {
    assert.equal(parseMarkdownText(source)[0].text, '    Tarefa    Evento  ', source);
  }
});

test('renders pasted tabs as four spaces while retaining links and original source', () => {
  const source = '\t**Tarefa**\t[Evento](https://example.com)';
  const [line] = parseMarkdownText(source);
  assert.equal(line.text, '    Tarefa    Evento');
  assert.equal(line.raw, source);
  assert.equal(line.spans.find((span) => span.type === 'link')?.href, 'https://example.com');
});

test('exports indentation, repeated spaces and pasted tabs into the PDF text', async () => {
  const page: PageDocument = {
    id: 2, stableId: 'spacing-test', editorialNumber: 2, role: 'content',
    content: '    Tarefa               Evento\n\tRecuo\tFinal',
  };
  const doc = await generateMinibookPDF([page], settings);
  const pdf = doc.output();
  assert.ok(pdf.includes('(    Tarefa               Evento) Tj'));
  assert.ok(pdf.includes('(    Recuo    Final) Tj'));
  assert.equal(doc.getNumberOfPages(), 1);
});

test('PDF applies inline sizes to mixed text, tables and the back cover', async () => {
  const pages: PageDocument[] = [
    {
      id: 2, stableId: 'inline-sizes', editorialNumber: 2, role: 'content',
      fontSize: '10pt',
      content: 'Normal <span style="font-size: 0.8em">Pequeno</span> normal <big>Grande</big> fim\n' +
        '| <small>Coluna menor</small> | Coluna normal |\n|---|---|\n' +
        '<span style="font-size: 0.8em">[Ligação](https://example.com)</span>',
    },
    {
      id: 8, stableId: 'back-cover-sizes', editorialNumber: 8, role: 'back-cover',
      fontSize: '10pt',
      content: 'Contracapa <span style="font-size: 0.8em">Miúdo</span> fim',
    },
  ];
  const doc = await generateMinibookPDF(pages, settings);
  const pdf = doc.output();
  const fontSizeBefore = (value: string): number => {
    const index = pdf.indexOf(`(${value}) Tj`);
    assert.ok(index >= 0, `PDF should contain ${value}`);
    const fonts = [...pdf.slice(0, index).matchAll(/\/F\d+ ([\d.]+) Tf/g)];
    return Number(fonts.at(-1)?.[1]);
  };

  assert.equal(fontSizeBefore('Normal'), 10);
  assert.equal(fontSizeBefore('Pequeno'), 8);
  assert.equal(fontSizeBefore('Grande'), 12.5);
  assert.equal(fontSizeBefore('Coluna'), 8.2);
  assert.equal(fontSizeBefore('Ligação'), 8);
  assert.ok(pdf.includes('/URI (https://example.com)'));
  assert.ok(Math.abs(fontSizeBefore('Miúdo') - 7.6) < 0.001);
});
