import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Health / status check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// AI text condensation endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, targetWords = 480, title = '' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texto não fornecido.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: 'Chave GEMINI_API_KEY não configurada no servidor.',
        useFallback: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Você é um curador e editor literário encarregado de condensar um texto para um minilivro impresso em folha A4 de 8 páginas (com exatamente 6 páginas internas de texto, páginas 2 a 7).

O texto a seguir ultrapassou a capacidade física do livreto. Reescreva e condense o conteúdo em língua portuguesa para que caiba com conforto visual nas 6 páginas internas (meta de 420 a 500 palavras no total, com leitura agradável e fluida).

Diretrizes:
- Preserve a voz autoral, a essência do raciocínio ou da narrativa, os títulos e o clímax.
- Estruture o texto em 6 parágrafos ou seções proporcionais, usando markdown limpo se desejar subtítulos breves.
- Não deixe nenhuma frase cortada pela metade nem termos vazios.
- Retorne apenas o texto condensado final pronto para distribuição, sem metadados ou comentários introdutórios como "Aqui está o resumo:".

Título da obra: "${title}"
Texto original:
${text}`,
    });

    const summary = response.text || '';
    res.json({
      summary,
      success: true,
    });
  } catch (error: any) {
    console.error('API Summarize error:', error);
    res.status(500).json({
      error: error?.message || 'Erro ao processar resumo com IA.',
      useFallback: true,
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
