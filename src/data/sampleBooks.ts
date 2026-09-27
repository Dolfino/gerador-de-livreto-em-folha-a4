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

Era uma vez, numa pequena vila de pescadores onde o vento sempre cheirava a sal, um homem chamado **Tomás**. Tomás era um pescador de poucas palavras e coração generoso, que vivia em uma cabana simples à beira-mar. Ao contrário dos outros pescadores, que usavam grandes redes e buscavam o lucro rápido, Tomás pescava apenas o necessário para o seu sustento, respeitando o ritmo e os mistérios do oceano.

Uma noite, uma tempestade violenta desabou sobre a costa. As ondas erguiam-se como muralhas pretas e o vento uivava como um lobo ferido. Tomás passou a noite em claro, ouvindo o clamor dos elementos. Quando o amanhecer finalmente rompeu, trazendo uma calmaria cinzenta, ele caminhou pela praia para avaliar os estragos.

Entre as algas e os destroços trazidos pela maré, algo reluziu. Tomás aproximou-se e soltou um suspiro de espanto. Deitada na areia úmida estava uma gaivota, mas não uma ave comum. **Suas penas brilhavam com o fulgor do ouro puro**, refletindo os primeiros raios de sol. Ela estava viva, mas com uma asa ferida e o olhar enfraquecido.

## O Resgate e a Amizade

Com todo o cuidado, Tomás recolheu a criatura em seus braços calejados. Levou-a para a cabana, improvisou um ninho com tecidos macios e tratou de sua asa com ervas e bálsamos que conhecia. Durante semanas, ele dividiu seu humilde alimento com a ave. A gaivota dourada, por sua vez, observava o pescador com olhos inteligentes, profundos como o próprio mar.

À medida que a asa da ave cicatrizava, uma amizade silenciosa crescia entre eles. Quando Tomás saía em seu pequeno barco de madeira, a gaivota — que já conseguia planar — acompanhava-o do alto. Ela possuía um dom extraordinário:

- Conseguia enxergar as correntes secretas do oceano.
- Localizava os cardumes escondidos nas profundezas.
- Indicava a Tomás exatamente onde lançar a linha através de rasantes precisos.

O pescador nunca mais voltou para casa de mãos vazias, mas mantinha sua promessa de pegar apenas o que precisava.

## A Ameaça da Ganância

A vida era perfeita na sua simplicidade, até que o segredo se espalhou. Outros pescadores da vila viram a ave reluzente e perceberam que Tomás prosperava sem esforço. A ganância logo tomou conta da vila. O homem mais rico da região, um comerciante ganancioso chamado Baltazar, ofereceu uma fortuna a Tomás pela ave.

— *Ela é apenas uma criatura do mar, Tomás. Com o ouro que te darei, poderá comprar um navio de verdade* — argumentou Baltazar.

Tomás recusou categoricamente:
— *A liberdade e a amizade não têm preço. Ela não me pertence.*

Naquela mesma noite, movido pela inveja e pela cobiça, Baltazar invadiu a cabana de Tomás enquanto este dormia e capturou a gaivota dourada, prendendo-a em uma gaiola de ferro pesado.

## O Confronto no Mar Revolto

Ao acordar e ver o ninho vazio, o coração de Tomás apertou-se de dor. Ele correu até o porto e viu o grande navio de Baltazar já se afastando do cais. No convés, a gaiola de ferro exibia a ave, que debatia suas asas de ouro desesperadamente.

Tomás não hesitou. Saltou em seu pequeno barco e remou com todas as suas forças atrás do navio. O céu, como se partilhasse da fúria do pescador, começou a escurecer rapidamente. Uma nova tempestade, ainda mais terrível que a primeira, formou-se em minutos.

As ondas gigantescas sacudiam o navio de Baltazar, que começou a inclinar perigosamente. No meio do caos, a gaiola de ferro soltou-se das amarras e rolou em direção à borda do convés, caindo nas águas turbulentas.

Tomás largou os remos e mergulhou no mar revolto. A água fria tentava puxá-lo para as profundezas, mas ele nadou contra a correnteza até alcançar a gaiola que afundava. Com las últimas forças que lhe restavam, ele conseguiu abrir a tranca submersa.

## O Legado da Pena de Ouro

A gaivota dourada emergiu da gaiola, disparando em direção ao céu como um raio de sol rasgando a tempestade. Ela circulou sobre Tomás, que já não tinha forças para nadar. A ave soltou um canto agudo e melodioso, um som que parecia acalmar as próprias águas.

De repente, uma onda suave, moldada como uma mano gigante, ergueu Tomás e o depositou delicadamente de volta em seu pequeno barco de madeira. O navio de Baltazar, por outro lado, foi empurrado pelo vento de volta ao porto, quebrado e vazio.

Quando Tomás abriu os olhos, a tempestade havia desaparecido. A gaivota dourada pousou na proa do seu barco. Ela olhou para ele uma última vez, e suas penas brilharam com tanta intensidade que Tomás teve que fechar os olhos. Quando os abriu novamente, a ave havia partido, deixando em seu lugar uma única **pena de ouro maciço**.

Tomás guardou a pena, mas nunca a vendeu. Ela tornou-se um lembrete do valor da lealdade e do respeito à natureza. Ele continuou a pescar todos os dias em seu pequeno barco e, dizem os mais antigos, sempre que Tomás enfrentava uma névoa densa, um brilho dourado surgia no céu para lhe mostrar o caminho de volta para casa.`;

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

export const BULLET_JOURNAL_PAGES: PageDocument[] = [
  {
    id: 1,
    stableId: 'p-1',
    editorialNumber: 1,
    role: 'cover',
    title: 'BULLET JOURNAL',
    subtitle: 'Pocket Minilivro 8P · Foco & Produtividade',
    author: 'Planejamento Pessoal',
    dateOrPublisher: 'Ciclo: ____/____ a ____/____',
    content: `## MEU BULLET JOURNAL
**Propósito:** _______________________________
**Data de Início:** ___/___/2026

> "Acompanhe o passado, organize o presente e planeje o futuro com clareza."

▲ **Minilivro de Bolso em Folha A4 Única**
Dobre em 8 páginas e leve seu foco no bolso para qualquer lugar, livre de distrações digitais.`,
  },
  {
    id: 2,
    stableId: 'p-2',
    editorialNumber: 2,
    role: 'content',
    fontSize: '7.5pt',
    title: 'Índice & Legenda',
    content: `### 📑 ÍNDICE
**p.3** Metas · **p.4-5** Diário · **p.6** Hábitos/$ · **p.7** Ideias · **p.8** Fim

### 🗝️ LEGENDA (KEY)
*Inicie simples; adapte conforme sua rotina evoluir:*

| **□• Tarefa** (a fazer) | **○ Evento** (reunião/data) |
| **[/] Andamento** (iniciada) | **— Nota** (ideia/fato) |
| **[X] Concluída** (finalizada) | **\* Urgente** (crucial) |
| **[>] Migrada** (p/ amanhã) | **! Inspiração** (sacada) |
| **[<] Agendada** (Future Log) | **👁 Pesquisar** (buscar/ler) |
| **[//] Cancelada** (nula) | **$ Finanças** (gastos/contas) |`,
  },
  {
    id: 3,
    stableId: 'p-3',
    editorialNumber: 3,
    role: 'content',
    title: 'Página 3 · Metas & Log Futuro',
    content: `### Metas & Future Log
*Registre compromissos com ○ e agendamentos com <:*

| **Datas & Compromissos** | **Prioridades do Ciclo** |
| ○ ___/___ : _____________ | * [•] __________________ |
| ○ ___/___ : _____________ | * [•] __________________ |
| ○ ___/___ : _____________ | * [•] __________________ |
| < Agendado: _____________ | [•] ____________________ |
| < Agendado: _____________ | [•] ____________________ |

---
**Foco Principal da Semana:**
- * [•] __________________________________
- [•] ____________________________________`,
  },
  {
    id: 4,
    stableId: 'p-4',
    editorialNumber: 4,
    role: 'content',
    title: 'Página 4 · Log Diário (1ª Parte)',
    content: `### SEG | ___/___
- [•] _______________________________
- [/] _______________________________
- ○ Reunião / Horário: ______________

### TER | ___/___
- * [•] _____________________________
- [•] _______________________________
- — Nota: ___________________________

### QUA | ___/___
- [•] _______________________________
- 👁 Pesquisar: ______________________
- ! Ideia: __________________________`,
  },
  {
    id: 5,
    stableId: 'p-5',
    editorialNumber: 5,
    role: 'content',
    title: 'Página 5 · Log Diário (2ª Parte)',
    content: `### QUI | ___/___
- * [•] _____________________________
- [•] _______________________________
- $ Conta / Gasto: __________________

### SEX | ___/___
- [•] _______________________________
- [•] _______________________________
- ○ Alinhamento: ____________________

### SÁB & DOM | ___/___
- [•] Pendência pessoal: ____________
- ○ Lazer / Aniversário: ____________
- — Reflexão do fim de semana: ______`,
  },
  {
    id: 6,
    stableId: 'p-6',
    editorialNumber: 6,
    role: 'content',
    fontSize: '7.5pt',
    title: 'Página 6 · Hábitos & Finanças',
    content: `### Rastreador de Hábitos
*Marque [X] no dia cumprido:*
| Hábito | S | T | Q | Q | S | S | D |
| Leitura | □ | □ | □ | □ | □ | □ | □ |
| Exercício | □ | □ | □ | □ | □ | □ | □ |
| Água 2L | □ | □ | □ | □ | □ | □ | □ |
| Sono 7h+ | □ | □ | □ | □ | □ | □ | □ |

---
### $ Controle Financeiro
- $ Entrada / Receita: R$ ____________
- $ Fixo (Contas a pagar): R$ _______
- $ Variável / Gastos: R$ ___________
- $ Saldo do Ciclo: R$ ______________`,
  },
  {
    id: 7,
    stableId: 'p-7',
    editorialNumber: 7,
    role: 'content',
    title: 'Página 7 · Brain Dump & Ideias',
    content: `### ! Inspiração & Ideias
*Pensamentos criativos e sacadas repentinas:*
- ! __________________________________
- ! __________________________________
- ! __________________________________

---
### 👁 Pesquisar & Aprofundar
*Temas para buscar na internet, ler ou estudar:*
- 👁 _________________________________
- 👁 _________________________________
- 👁 _________________________________

---
### — Notas & Fatos
- — _________________________________
- — _________________________________`,
  },
  {
    id: 8,
    stableId: 'p-8',
    editorialNumber: 8,
    role: 'back-cover',
    title: 'CONTRACAPA · FECHAMENTO',
    dateOrPublisher: 'Minilivro 8P · Método Bullet Journal',
    content: `### 🏁 Balanço do Ciclo
*Revise suas tarefas antes de arquivar:*

- [X] Tarefas concluídas: ______
- [>] Migradas p/ próximo livreto: ______
- [<] Agendadas no Future Log: ______
- [//] Descartadas / canceladas: ______

---
### 📝 Aprendizado & Vitória
- **Maior conquista:** __________________
- **Ajuste para a próxima:** ___________

*Livreto arquivado em: ____/____/2026*`,
  },
];

export const BULLET_JOURNAL_SAMPLE_TEXT = `# MEU BULLET JOURNAL

### I. Índice & Legenda
**p.3** Metas · **p.4-5** Diário · **p.6** Hábitos/$ · **p.7** Ideias · **p.8** Fim

### Legenda de Símbolos
| **□• Tarefa** (a fazer) | **○ Evento** (reunião/data) |
| **[/] Andamento** (iniciada) | **— Nota** (ideia/fato) |
| **[X] Concluída** (finalizada) | **\* Urgente** (crucial) |
| **[>] Migrada** (p/ amanhã) | **! Inspiração** (sacada) |
| **[<] Agendada** (Future Log) | **👁 Pesquisar** (buscar/ler) |
| **[//] Cancelada** (nula) | **$ Finanças** (gastos/contas) |

### II. Metas & Log Futuro
| **Datas & Compromissos** | **Prioridades do Ciclo** |
| ○ ___/___ : _____________ | * [•] __________________ |
| ○ ___/___ : _____________ | * [•] __________________ |
| < Agendado: _____________ | [•] ____________________ |

---
**Top Foco:**
- * [•] Prioridade principal da semana

### III. Log Diário (Seg a Qua)
### SEG | ___/___
- [•] Tarefa importante do dia
- [/] Tarefa em andamento
- ○ Reunião / Compromisso

### TER & QUA
- * [•] Atividade crítica urgente
- — Nota ou observação rápida
- 👁 Pesquisar tema na internet

### IV. Log Diário (Qui a Dom)
### QUI & SEX
- [•] Revisão de projetos
- $ Pagamento / Conta do mês
- ○ Alinhamento de equipe

### SÁB & DOM
- [•] Lazer e descanso merecido
- — Ideia criativa do fim de semana

### V. Hábitos & Finanças
| Hábito | S | T | Q | Q | S | S | D |
| Leitura | □ | □ | □ | □ | □ | □ | □ |
| Exercício | □ | □ | □ | □ | □ | □ | □ |
| Água 2L | □ | □ | □ | □ | □ | □ | □ |

---
### $ Finanças
- $ Entrada: R$ ___________
- $ Gastos / Contas: R$ ___________
- $ Saldo final: R$ ___________

### VI. Brain Dump & Pesquisas
### ! Ideias Repentinas
- ! Sacada criativa para projetos
- ! Inspiração de leitura ou escrita

---
### 👁 Pesquisas & Estudos
- 👁 Artigo / livro para ler
- 👁 Tema técnico para aprofundar`;
