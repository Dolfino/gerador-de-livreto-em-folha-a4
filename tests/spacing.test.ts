import assert from 'node:assert/strict';
import test from 'node:test';
import { parseMarkdownText } from '../src/utils/markdownParser';
import { generateMinibookPDF } from '../src/utils/pdfGenerator';
import { DEFAULT_HEADER_FOOTER, type BookSettings, type PageDocument } from '../src/types';

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
