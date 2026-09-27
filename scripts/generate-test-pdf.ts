import fs from 'fs';
import path from 'path';
import { generateMinibookPDF } from '../src/utils/pdfGenerator';
import { TEST_BOOKLET_PAGES } from '../src/data/sampleBooks';
import { BookSettings, DEFAULT_HEADER_FOOTER } from '../src/types';

const defaultSettings: BookSettings = {
  outputMode: 'front-only',
  posterSettings: {
    orientation: 'landscape',
    title: 'Minilivro de Teste',
    subtitle: 'Validação Física da Folha A4',
    author: 'Guia de Montagem 8P',
    bodyText: 'Exemplar de teste para validação física.',
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
};

const doc = await generateMinibookPDF(TEST_BOOKLET_PAGES, defaultSettings, {
  fileName: 'minilivro-teste-numerado.pdf',
});

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync(path.join(publicDir, 'minilivro-teste-numerado.pdf'), pdfBuffer);
console.log('Successfully generated public/minilivro-teste-numerado.pdf');
