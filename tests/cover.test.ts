import assert from 'node:assert/strict';
import test from 'node:test';
import { BULLET_JOURNAL_PAGES } from '../src/data/sampleBooks';
import { generateMinibookPDF } from '../src/utils/pdfGenerator';
import { DEFAULT_HEADER_FOOTER, type BookSettings } from '../src/types';

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

test('PDF includes edited cover text and author', async () => {
  const cover = {
    ...BULLET_JOURNAL_PAGES[0],
    title: 'Meu Diário',
    subtitle: 'Nova edição',
    author: 'Meu Nome',
    content: '## Minha capa\nTexto personalizado na capa.',
  };
  const pdf = (await generateMinibookPDF([cover], settings)).output();
  for (const text of ['Meu Diário', 'Nova edição', '(Minha) Tj', '(capa) Tj', '(personalizado) Tj', 'MEU NOME']) {
    assert.ok(pdf.includes(text), `PDF deveria incluir ${text}`);
  }
});

test('PDF includes the Bullet Journal cover template text', async () => {
  const pdf = (await generateMinibookPDF(BULLET_JOURNAL_PAGES, settings)).output();
  assert.ok(pdf.includes('(MEU) Tj'));
  assert.ok(pdf.includes('(BULLET) Tj'));
  assert.ok(pdf.includes('(JOURNAL) Tj'));
  assert.ok(pdf.includes('Propósito:'));
  assert.ok(pdf.includes('PLANEJAMENTO PESSOAL'));
});

test('PDF uses the selected font size for cover text', async () => {
  const cover = { ...BULLET_JOURNAL_PAGES[0], content: 'Texto curto' };
  const getBodyFontSize = async (fontSize: '6.5pt' | '12pt') => {
    const pdf = (await generateMinibookPDF([{ ...cover, fontSize }], settings)).output();
    const textIndex = pdf.indexOf('(Texto) Tj');
    assert.ok(textIndex >= 0);
    const fontCommands = [...pdf.slice(0, textIndex).matchAll(/\/F\d+ ([\d.]+) Tf/g)];
    return Number(fontCommands.at(-1)?.[1]);
  };

  assert.equal(await getBodyFontSize('6.5pt'), 6);
  assert.equal(await getBodyFontSize('12pt'), 11.5);
});
