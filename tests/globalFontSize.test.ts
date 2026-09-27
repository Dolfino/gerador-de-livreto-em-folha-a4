import assert from 'node:assert/strict';
import test from 'node:test';
import { BULLET_JOURNAL_PAGES } from '../src/data/sampleBooks';
import { DEFAULT_HEADER_FOOTER, FONT_SIZE_OPTIONS, type BookSettings } from '../src/types';
import { getPageCapacity, getPageFontSizePt } from '../src/utils/textDistributor';
import { generateMinibookPDF } from '../src/utils/pdfGenerator';

const baseSettings: BookSettings = {
  outputMode: 'front-only',
  posterSettings: {
    orientation: 'landscape', title: '', subtitle: '', author: '', bodyText: '',
    showCutSlitZone: false, theme: 'literary',
  },
  headerFooter: DEFAULT_HEADER_FOOTER,
  fontSize: '10pt', fontFamily: 'sans', margin: 'standard', textAlign: 'left',
  lineHeight: 'normal', showFoldGuides: false, foldGuideStyle: 'dashed',
  showCutGuide: false, showPageNumbers: false, showPanelHeadersInPrint: false,
  coverStyle: 'classic',
};

test('all global font choices affect effective size and page capacity', () => {
  let previousCapacity = Infinity;
  for (const { value } of FONT_SIZE_OPTIONS) {
    const settings = { ...baseSettings, fontSize: value };
    assert.equal(getPageFontSizePt(null, settings), Number.parseFloat(value));
    const capacity = getPageCapacity(settings).words;
    assert.ok(capacity < previousCapacity, `${value} should reduce capacity`);
    previousCapacity = capacity;
  }
});

test('PDF uses a global font size when the page inherits it', async () => {
  const cover = { ...BULLET_JOURNAL_PAGES[0], fontSize: undefined, content: 'Texto curto' };
  for (const value of ['6.5pt', '10pt', '12pt'] as const) {
    const pdf = (await generateMinibookPDF([cover], { ...baseSettings, fontSize: value })).output();
    const textIndex = pdf.indexOf('(Texto) Tj');
    assert.ok(textIndex >= 0);
    const fontCommands = [...pdf.slice(0, textIndex).matchAll(/\/F\d+ ([\d.]+) Tf/g)];
    assert.equal(Number(fontCommands.at(-1)?.[1]), Number.parseFloat(value) - 0.5);
  }
});
