# Minilivro 8P — Gerador de Livreto em Folha Única A4

Aplicação web para produzir um minilivro clássico de 8 páginas (zine) a partir de uma única folha de papel A4 impressa em um único lado. Elimina a necessidade de montagem manual de colunas, ordenação reversa de páginas e rotação manual no Word.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- **Node.js**: versão 18 ou superior
- **npm**

### Instalação e Execução

1. Clone ou baixe este repositório.
2. No diretório raiz, instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse a aplicação no navegador em:
   ```
   http://localhost:3000
   ```

### Variáveis de Ambiente Opcionais (`.env`)
- `GEMINI_API_KEY`: (Opcional) Necessária caso queira utilizar o resumo assistido por IA via Gemini para textos excessivamente longos. Caso não configurada, o aplicativo conta com um condensador inteligente extrativo local integrado.

---

## 📖 Fluxo de Trabalho (3 Passos)

1. **Colar & Preparar Texto**:
   - Cole seu texto longo e defina Título, Subtítulo, Autor e Sinopse da Contracapa.
   - O algoritmo divide o texto preservando parágrafos, frases e listas, distribuindo o miolo nas **páginas 2 a 7**. A **página 1** é a Capa e a **página 8** a Contracapa.
   - Em caso de texto muito longo, escolha entre:
     - Editar/encurtar o texto manualmente;
     - **Dividir em Volumes** (Volume 1, Volume 2, etc., cada qual em sua folha A4);
     - Solicitar versão resumida via IA (apenas se solicitado explicitamente).

2. **Revisar Páginas (1 a 8)**:
   - Inspecione e edite individualmente o conteúdo de cada página.
   - Na **Capa**, edite título, subtítulo, autor e **Texto adicional da capa**. O texto aparece nas prévias, na impressão e no PDF. O controle **Fonte** ajusta o tamanho do texto da capa em todas essas saídas. Apague o texto do modelo se quiser uma capa só com título.
   - Mova trechos de texto facilmente com os botões rápidos de realocação de parágrafos.
   - Acompanhe o medidor visual de capacidade e palavras seguras por página.

3. **Prévia & Impressão**:
   - **Prévia de Leitura**: folheie as páginas duplas (spreads) exatamente na ordem de leitura (1 a 8).
   - **Prévia da Folha Aberta**: veja a imposição exata da folha A4 (297 × 210 mm) com as páginas superiores invertidas em 180°, marcas de dobra e a fenda de corte central.
   - Clique em **Baixar PDF** (gera PDF vetorial com textos selecionáveis) ou **Imprimir**.

### Espaçamento no editor

Na revisão das páginas, espaços consecutivos e recuos são preservados na prévia e no PDF. A tecla **Tab** insere quatro espaços no campo de texto; **Shift+Tab** move o foco para fora dele. Ao distribuir um texto longo automaticamente, revise os recuos depois na página individual.

Trechos com `<small>`, `<big>` ou `<span style="font-size: 0.8em">` mantêm seu tamanho relativo no PDF, inclusive quando há tamanhos diferentes na mesma linha.

Para alinhar dois itens lado a lado, use uma tabela Markdown. As colunas continuam alinhadas ao alterar a fonte:

```markdown
| **□• Tarefa** (a fazer) | **○ Evento** (reunião/data) |
|---|---|
```

---

## 📐 Imposição e Montagem Física

A folha A4 horizontal é dividida em uma grade de 2 linhas por 4 colunas (painéis de ~74,25 × 105 mm):

| Linha | Coluna 1 | Coluna 2 | Coluna 3 | Coluna 4 |
| :--- | :--- | :--- | :--- | :--- |
| **Superior** | **Página 5** (180°) | **Página 4** (180°) | **Página 3** (180°) | **Página 2** (180°) |
| **Inferior** | **Página 6** (0°) | **Página 7** (0°) | **Página 8** (Contracapa, 0°) | **Página 1** (Capa, 0°) |

### Como Dobrar e Cortar:
1. **Imprimir**: Imprima em 100% (tamanho real), apenas na frente da folha A4.
2. **Vincos**: Dobre ao meio na horizontal e desdobre. Dobre ao meio na vertical e em quartos para marcar os 8 retângulos.
3. **Corte Central**: Dobre ao meio na horizontal e, com uma tesoura, corte na dobra central apenas entre a primeira e a terceira dobra vertical (fenda central de 2 painéis). **Não corte as bordas externas**.
4. **Formar Cruz**: Empurre as laterais da folha para o centro; a fenda se abrirá em forma de cruz (+).
5. **Fechar Livreto**: Dobre as abas para os lados trazendo a Capa (Página 1) para a frente e a Contracapa (Página 8) para trás.

---

## 🧪 Validação com o Minilivro de Teste Numerado

Para validar fisicamente o processo antes de imprimir sua obra:
1. Clique no botão **"Exemplar de Teste"** no cabeçalho ou no rodapé.
2. O minilivro de teste é carregado com as páginas 1 a 8 claramente numeradas e com instruções direcionais.
3. Clique em **"Baixar PDF"** ou **"Imprimir"**.
4. Efetue as dobras e o corte e confirme que:
   - A Capa é a Página 1;
   - As páginas são lidas na sequência 1 → 8;
   - Nenhuma página fica invertida no minilivro fechado;
   - O corte central não atinge o texto nem corta a borda da folha.
