import { PageDocument } from '../types';

export const TEST_BOOKLET_PAGES: PageDocument[] = [
  {
    id: 1,
    stableId: 'p-1',
    editorialNumber: 1,
    role: 'cover',
    title: 'MINILIVRO DE TESTE',
    subtitle: 'Validação Física da Folha A4',
    author: 'Guia de Montagem 8P',
    content: `## CAPA (PÁGINA 1)

Este é o exemplar de teste oficial para conferir a montagem física do seu minilivro de 8 páginas impresso em uma única folha A4.

▲ ORIENTAÇÃO: FRENTE DO LIVRETO
Ao dobrar corretamente, esta capa estará na frente.`,
    dateOrPublisher: 'Edição de Teste · 2026',
  },
  {
    id: 2,
    stableId: 'p-2',
    editorialNumber: 2,
    role: 'content',
    title: 'Página 2 · Início da Leitura',
    content: `### 01. Primeira Abertura

Esta é a **Página 2**, a primeira página de texto interno, visível imediatamente após abrir a capa.

Na folha aberta, esta página foi impressa na **linha superior, quarta coluna**, girada em **180 graus**.

Ao dobrar a folha ao meio na horizontal, ela desce e fica perfeitamente em pé!

- [x] O texto está na orientação correta?
- [x] Não ficou de cabeça para baixo?`,
  },
  {
    id: 3,
    stableId: 'p-3',
    editorialNumber: 3,
    role: 'content',
    title: 'Página 3 · Abertura Esquerda',
    content: `### 02. Par com a Página 2

A **Página 3** fica lado a lado com a Página 2, formando a primeira abertura dupla do minilivro.

- **Posição na folha**: Linha superior, terceira coluna (invertida 180°).
- **Verificação**: A leitura flui suavemente da página 2 para cá.

"A simplicidade de uma única folha de papel que se transforma em livro por meio de dobras precisas."`,
  },
  {
    id: 4,
    stableId: 'p-4',
    editorialNumber: 4,
    role: 'content',
    title: 'Página 4 · Centro do Livro',
    content: `### 03. Abertura Central (Esq.)

A **Página 4** marca o centro do minilivro. Ela fica voltada para a Página 5.

Aqui passava a fenda de corte central! Verifique:
- O corte central não invadiu o texto?
- A lombada está bem alinhada?

Esta página estava originalmente na linha superior, segunda coluna, também girada 180°.`,
  },
  {
    id: 5,
    stableId: 'p-5',
    editorialNumber: 5,
    role: 'content',
    title: 'Página 5 · Centro do Livro',
    content: `### 04. Abertura Central (Dir.)

A **Página 5** completa o miolo central do seu livreto.

- **Posição na folha**: Linha superior, primeira coluna (extremo esquerdo superior, girada 180°).

Se a dobra em cruz foi feita corretamente, as páginas 4 e 5 formam o coração do minilivro com folheamento natural.

Próximo passo: vire para a página 6.`,
  },
  {
    id: 6,
    stableId: 'p-6',
    editorialNumber: 6,
    role: 'content',
    title: 'Página 6 · Segunda Metade',
    content: `### 05. Abertura Final (Esq.)

A **Página 6** inicia a última abertura dupla interna.

- **Posição na folha**: Linha inferior, primeira coluna (posição normal, 0°).
- **Sequência**: O texto continuou da página 5 sem interrupções.

Note que todas as páginas da linha inferior são impressas com orientação direta, sem rotação.`,
  },
  {
    id: 7,
    stableId: 'p-7',
    editorialNumber: 7,
    role: 'content',
    title: 'Página 7 · Conclusão do Texto',
    content: `### 06. Última Página Interna

A **Página 7** encerra o conteúdo textual do minilivro.

- **Posição na folha**: Linha inferior, segunda coluna (posição normal, 0°).

Ao virar esta página, você encontrará a **Página 8 (Contracapa)** fechando o volume.

Todas as 6 páginas internas foram conferidas com sucesso!`,
  },
  {
    id: 8,
    stableId: 'p-8',
    editorialNumber: 8,
    role: 'back-cover',
    title: 'CONTRACAPA (PÁGINA 8)',
    content: `### Validação Concluída!

- Capa: Página 1 (Frente)
- Páginas 2 a 7: Lidas em sequência normal 1 → 8
- Nenhuma página invertida
- Nenhuma frase cortada
- Folha única A4 impressa apenas de um lado

*Minilivro 8P · Montagem Física Aprovada.*`,
    dateOrPublisher: 'www.minilivro8p.app',
  },
];

export const TEST_BOOKLET_16P: PageDocument[] = [
  {
    id: 1,
    stableId: 'p-1',
    editorialNumber: 1,
    role: 'cover',
    title: 'CADERNO 16P TESTE',
    subtitle: 'Edição de 16 Páginas Duplex',
    author: 'Oficina Minilivro 8P',
    content: `## CAPA PRINCIPAL (PÁGINA 1)

Livreto de 16 páginas produzido em **1 única folha A4 impressa em duplex (frente e verso)**.

- Fólio Externo: Capa (pág 1) e Contracapa (pág 16).
- Verifique a escala: 100% no leitor de PDF.`,
    dateOrPublisher: 'Edição 16P · 2026',
  },
  {
    id: 2,
    stableId: 'p-2',
    editorialNumber: 2,
    role: 'content',
    title: 'Página 2 · Guarda / Início',
    content: `### 01. Apresentação
Esta é a **Página 2**, par com a contracapa interna (15) no fólio externo.
A leitura do miolo começa aqui com total nitidez e margens generosas.`,
  },
  {
    id: 3,
    stableId: 'p-3',
    editorialNumber: 3,
    role: 'content',
    title: 'Página 3 · Segundo Fólio',
    content: `### 02. Par com a Página 2
A **Página 3** pertence ao segundo fólio. Ao abrir a primeira abertura dupla (2-3), o leitor transita naturalmente entre os cadernos.`,
  },
  {
    id: 4,
    stableId: 'p-4',
    editorialNumber: 4,
    role: 'content',
    title: 'Página 4 · Desenvolvimento',
    content: `### 03. Continuidade
No caderno encadernado, a página 4 forma par com a página 13 no verso do segundo fólio. A soma das páginas emparelhadas é sempre 17.`,
  },
  {
    id: 5,
    stableId: 'p-5',
    editorialNumber: 5,
    role: 'content',
    title: 'Página 5 · Terceiro Fólio',
    content: `### 04. Rumo ao Centro
A **Página 5** introduz o terceiro fólio. O volume ganha corpo com 16 páginas ricas e densas, perfeitas para contos completos.`,
  },
  {
    id: 6,
    stableId: 'p-6',
    editorialNumber: 6,
    role: 'content',
    title: 'Página 6 · Expansão',
    content: `### 05. Abertura 6–7
A **Página 6** se abre voltada para a página 7. Cada página possui sua área segura respeitada para a costura ou grampo.`,
  },
  {
    id: 7,
    stableId: 'p-7',
    editorialNumber: 7,
    role: 'content',
    title: 'Página 7 · Entrada do Núcleo',
    content: `### 06. Pré-Centro
Estamos na **Página 7**. A próxima virada de página revela o centro exato da publicação e da lombada!`,
  },
  {
    id: 8,
    stableId: 'p-8',
    editorialNumber: 8,
    role: 'transition',
    title: 'Página 8 · Centro / Transição',
    content: `### 07. Centro da Publicação
No modo **Caderno Encadernado**, as páginas 8 e 9 formam a abertura central onde passam os dois grampos ou a costura.
No modo **Continuação**, esta página orienta: *"Desdobre e vire a folha para continuar a leitura"*.`,
  },
  {
    id: 9,
    stableId: 'p-9',
    editorialNumber: 9,
    role: 'continuation-cover',
    title: 'Página 9 · Centro (Dir.)',
    content: `### 08. Início da Segunda Metade
A **Página 9** inicia o retorno pelo interior dos cadernos. Na abertura 8-9 do caderno, os pontos de costura ficam visíveis.`,
  },
  {
    id: 10,
    stableId: 'p-10',
    editorialNumber: 10,
    role: 'content',
    title: 'Página 10 · Retorno',
    content: `### 09. Fólio Interno
Página 10. Forma par físico no fólio com a página 7 (10 + 7 = 17). O texto segue fluido.`,
  },
  {
    id: 11,
    stableId: 'p-11',
    editorialNumber: 11,
    role: 'content',
    title: 'Página 11 · Terceiro Fólio',
    content: `### 10. Aprofundamento
Página 11, par com a página 6 no terceiro fólio. A consistência da mancha gráfica preserva a legibilidade.`,
  },
  {
    id: 12,
    stableId: 'p-12',
    editorialNumber: 12,
    role: 'content',
    title: 'Página 12 · Resolução',
    content: `### 11. Clímax e Desfecho
Página 12. O miolo se aproxima dos capítulos finais com ritmo equilibrado.`,
  },
  {
    id: 13,
    stableId: 'p-13',
    editorialNumber: 13,
    role: 'content',
    title: 'Página 13 · Segundo Fólio',
    content: `### 12. Conclusões
Página 13, par com a página 4. O leitor sente o volume físico e o acabamento profissional de um livreto A7 encadernado.`,
  },
  {
    id: 14,
    stableId: 'p-14',
    editorialNumber: 14,
    role: 'content',
    title: 'Página 14 · Epílogo',
    content: `### 13. Última Abertura
Página 14. Forma par com a página 15. Aqui são fechados os arcos narrativos ou as notas explicativas.`,
  },
  {
    id: 15,
    stableId: 'p-15',
    editorialNumber: 15,
    role: 'content',
    title: 'Página 15 · Guarda Final',
    content: `### 14. Colofão e Créditos
Página 15, interna à contracapa. Ideal para colofão, dados de publicação, tipografia e contatos do autor.`,
  },
  {
    id: 16,
    stableId: 'p-16',
    editorialNumber: 16,
    role: 'back-cover',
    title: 'CONTRACAPA (PÁGINA 16)',
    content: `### Caderno 16P Concluído!

- Fólio 1 (externo): 16–1 / 2–15
- Fólio 2: 14–3 / 4–13
- Fólio 3: 12–5 / 6–11
- Fólio 4 (interno): 10–7 / 8–9

*Montagem A4 Duplex com encadernação de lombada aprovada.*`,
    dateOrPublisher: 'www.minilivro8p.app',
  },
];

export const LITERARY_SAMPLE_TEXT = `# O Pescador e a Gaivota Dourada

Havia na enseada de pedra um velho pescador de nome Vicente, cujos olhos tinham a mesma cor azul-profunda da maré alta ao amanhecer. Vicente conhecia cada vento pelo perfume de sal e cada corrente marítima pelo rumor nas quilhas do seu pequeno barco de pinho.

Nas manhãs de névoa densa, quando outros marinheiros hesitassem em soltar as amarras, Vicente içava a sua vela remendada e rumava para o largo. Ele dizia que o mar guarda os seus maiores segredos apenas para quem sabe escutar o silêncio entre as ondas.

Certo dia, enquanto o sol despontava como uma brasa redonda sobre o horizonte, uma gaivota de asas claras e pontas douradas pousou na proa do seu barco. Ela não pedia migalhas nem peixe; apenas olhava Vicente com uma serenidade que parecia vir de tempos imemoriais.

— Para onde você voa quando a tempestade fecha o céu? — perguntou Vicente, falando baixo para não assustar o pássaro. A gaivota inclinou a cabeça e soltou um chamado nítido, apontando a asa em direção às ilhas esquecidas ao norte.

Vicente ajustou o leme e seguiu o rumo indicado pelo pássaro solar. As águas, antes revoltas, abriram-se em uma planície de prata límpida, onde cardumes inteiros brilhavam sob o sol como joias dispersas.

Ali compreendeu que nem toda rota precisa de cartas náuticas de papel: algumas dependem da coragem de confiar no inesperado e na sabedoria que a própria natureza nos sopra quando estamos prontos para ouvir.

Ao entardecer, quando Vicente retornou à aldeia com a rede cheia e o coração em paz, a gaivota alçou voo rumo às estrelas nascentes, deixando na proa uma única pena que reluzia como ouro polido na penumbra do cais.`;

export const LITERARY_SAMPLE_16P = `# As Cartas Secretas do Farol Velho

### I. A Torre de Pedra
O farol da Ponta dos Naufrágios erguia-se há quase dois séculos sobre o rochedo de basalto negro, resistindo às rajadas do Atlântico com a serenidade impassível dos monumentos esquecidos. Seus degraus de caracol em ferro fundido rangiam como passos fantasmagóricos ao vento, mas para o jovem arquivista Gabriel, aquele rumor era a única música capaz de aplacar sua insônia.

Ele havia chegado à vila costeira com a missão de inventariar o diário do último faroleiro, Mestre Bartolomeu, cujo desaparecimento misterioso em 1943 alimentava lendas entre os marinheiros locais. Dizia-se que Bartolomeu conversava com as estrelas e recebia correspondências entregues não por carteiros, mas pelas correntes oceânicas em garrafas de vidro esmeralda.

### II. O Baú de Jacarandá
No compartimento sob a lâmpada de prisma Fresnel, Gabriel encontrou o baú trancado com um cadeado de latão gravado com uma bússola de oito pontas. Quando a chave enferrujada finalmente cedeu, não havia relatórios meteorológicos nem livros contábeis, mas maços de cartas atadas com cordéis de linho azul-marinho.

A primeira carta, datada da noite de São João de 1928, descrevia uma ilha flutuante que surgia apenas quando a maré atingia o seu ponto mais baixo durante o equinócio de outono. "Não procurem por terra firme com âncoras de ferro", escrevia o faroleiro com uma caligrafia firme e elegante. "Ela só se ancora naqueles que esqueceram o medo de zarpar sem mapa."

### III. A Mensagem das Marés
À medida que lia cada folha amarelada pelo salitre, Gabriel percebia que as cartas não eram memórias comuns, mas instruções cifradas. Cada parágrafo correspondia a uma coordenada celeste visível através das lentes do farol em noites sem lua. A cada solstício, o feixe luminoso devia ser alinhado com constelações esquecidas pelos astrônomos modernos.

Na sexta carta, Bartolomeu revelava o encontro com uma viajante solitária que navegava em uma canoa de casca de bétula. Ela não falava português nem francês, mas comunicava-se desenhando constelações na areia úmida da praia. A viajante havia deixado um amuleto de quartzo que, quando exposto ao feixe da lâmpada, projetava no teto abobadado um mapa de rotas submarinas até então ignoradas pela humanidade.

### IV. O Segredo Revelado
Na última folha, escrita com tinta de lula no próprio dia do desaparecimento, o faroleiro deixara seu adeus: "Aos que vierem depois de mim, não lamentem meu sumiço. O farol não serve apenas para avisar dos recifes; serve para iluminar a passagem entre este mar e o outro. A maré está cheia, o vento sul nos chama e a gaivota de asas de ouro já pousou no parapeito."

Gabriel levantou os olhos do papel. Através da vidraça circular do topo da torre, o sol poente derramava ouro sobre as ondas. No parapeito de ferro do terraço, exatamente como narrado no texto, uma ave de asas reluzentes observava o horizonte com olhos serenos, esperando o instante exato em que a primeira estrela acendesse a sua luz.`;

export const MARKDOWN_LINKS_SAMPLE_TEXT = `# O Guia do Viajante Conectado

### I. Conectando Ideias
Navegar pela literatura moderna é como seguir trilhas de hipertexto. Visite o [Guia Oficial de Markdown](https://www.markdownguide.org) para aprender mais sobre essa linguagem simples e elegante que conecta autores e leitores no mundo inteiro.

Para explorar fontes e documentações seguras na web, você pode consultar o [Buscador DuckDuckGo](https://duckduckgo.com "O buscador focado em privacidade"), ideal para pesquisas acadêmicas sem rastreamento de dados.

### II. Redes e Comunidades
Se você deseja compartilhar seus projetos editoriais em código aberto, acesse o [GitHub do Projeto][github] ou pesquise novas referências no [Google Acadêmico][google].

A tipografia e a paginação física deste livreto convidam você a explorar a [Seção de Contato](#contato) para enviar suas dúvidas ou sugestões de novas obras.

### III. Contato e Suporte
## Contato
Envie um e-mail para <suporte@minilivro.app> ou acesse o site oficial em <https://minilivro8p.app>.

### IV. Anexos e Arquivos Locais
Para aprofundar os estudos com materiais que acompanham este livreto na mesma pasta:
- Consulte a [Planilha de Gastos](planilha-gastos.xlsx) da expedição.
- Abra a [Imagem do Gráfico](grafico.png) com os dados visuais.
- Leia o [Documento Auxiliar](documento-auxiliar.pdf) para referências extras.
- Na subpasta técnica: [Ver Relatório Técnico](anexos/relatorio.pdf).

### V. Estilos Tipográficos & Sombreado
Demonstração dos novos estilos suportados:
- Palavras em *itálico*, **negrito** e ***negrito com itálico***.
- Fundo cinza para palavras em \`código sombreado\`.
- Realce especial com ==marca-texto amarelo== e <mark>fundo destacado</mark>.
- Revisões com ~~texto riscado~~ e termos com <u>sublinhado editorial</u>.

> "A leitura de um livro impresso em folha única conecta a simplicidade do papel à riqueza digital dos hiperlinks."

### VI. Integração Phygital & Nuvem
O conceito **Phygital** une o papel físico ao mundo digital online:
[qr: Pasta no Drive com Planilhas e Anexos](https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9-exemplo)

Aponte a câmera do celular para o livreto impresso para acessar os arquivos na nuvem, ou clique no QR Code no arquivo PDF digital!

[google]: https://google.com "Buscador Google"
[github]: https://github.com "Repositório GitHub"
`;

export const TEST_BOOKLET_WITH_IMAGES: PageDocument[] = [
  {
    id: 1,
    stableId: 'p-1',
    editorialNumber: 1,
    role: 'cover',
    title: 'ÁLBUM FOTOGRÁFICO A7',
    subtitle: '4 Formatos Físicos no Minilivro',
    author: 'Oficina Editorial A4',
    content: 'Exemplar com os 4 formatos de imagem: sangria total, meia folha, 2 poses e 4 poses no A7.',
    dateOrPublisher: 'Edição Especial de Arte · 2026',
  },
  {
    id: 2,
    stableId: 'p-2',
    editorialNumber: 2,
    role: 'content',
    title: 'Página 2 · Sangria Total',
    imageLayout: 'full',
    images: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80'],
    imageCaption: 'Sangria Total no A7 (74,25 × 105 mm) — Sem bordas',
    content: `### 1. Imagem na Folha Inteira (Sem Bordas)
Como dizer: **"Imagem em sangria total no A7"** ou **"Imagem em página inteira"**.
Significado: A foto cobre todo o papel (74,25 × 105 mm).`,
  },
  {
    id: 3,
    stableId: 'p-3',
    editorialNumber: 3,
    role: 'content',
    title: 'Página 3 · Meia Folha no Topo',
    imageLayout: 'half',
    imagePosition: 'top',
    images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'],
    imageCaption: 'Meia folha no topo (74,25 × 52,5 mm)',
    content: `### 2. Meia Folha (Meio Formato A7)
Como dizer: **"Imagem ocupando meia página do A7"** ou **"Imagem em meio formato A7"**.

A imagem ocupa a metade superior do papel, deixando este espaço inferior para leitura e anotações explicativas.`,
  },
  {
    id: 4,
    stableId: 'p-4',
    editorialNumber: 4,
    role: 'content',
    title: 'Página 4 · Meia Folha na Base',
    imageLayout: 'half',
    imagePosition: 'bottom',
    images: ['https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80'],
    imageCaption: 'Meia folha na base (74,25 × 52,5 mm)',
    content: `### 2. Meia Folha na Base
Aqui o texto explicativo fica no topo da página e a fotografia ancora a parte inferior da folha A7.

Excelente para gráficos ou ilustrações de rodapé com texto de suporte.`,
  },
  {
    id: 5,
    stableId: 'p-5',
    editorialNumber: 5,
    role: 'content',
    title: 'Página 5 · Duas Imagens',
    imageLayout: 'two',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&q=80',
    ],
    content: `### 3. Duas Imagens na Mesma Folha
Como dizer: **"Duas imagens por folha (Layout 2 por página)"** ou **"Duas poses no mesmo A7"**.

Significado: O papel A7 é dividido ao meio, posicionando uma imagem em cada metade (2 poses de 74,25 × 52,5 mm).`,
  },
  {
    id: 6,
    stableId: 'p-6',
    editorialNumber: 6,
    role: 'content',
    title: 'Página 6 · Quatro Imagens',
    imageLayout: 'four',
    images: [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80',
    ],
    content: `### 4. Quatro Imagens na Mesma Folha
Como dizer: **"Quatro imagens por folha (Layout 4 por página)"** ou **"Quatro poses no mesmo A7"**.

Significado: O papel A7 é dividido em 4 partes iguais em grade 2×2 (formato A9: 37,1 × 52,5 mm).`,
  },
  {
    id: 7,
    stableId: 'p-7',
    editorialNumber: 7,
    role: 'content',
    title: 'Página 7 · Galeria Phygital',
    content: `### Conexão Phygital
Acesse a galeria em alta resolução com todas as imagens originais na nuvem:

[qr: Galeria de Fotos no Google Drive](https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9-fotos)

Aponte a câmera do celular para abrir os arquivos diretamente do livreto físico impresso!`,
  },
  {
    id: 8,
    stableId: 'p-8',
    editorialNumber: 8,
    role: 'back-cover',
    title: 'Contracapa',
    content: `Montagem de 8 páginas concluída com os 4 formatos físicos de imagem calibrados para o painel A7.`,
    dateOrPublisher: 'Coleção Fotográfica · 2026',
  },
];
