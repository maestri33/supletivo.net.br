const CF_STICKERS =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261118_061547_979f8673-f904-4102-90a0-6458bce33bc8.png';

function proxyTransparent(url: string, width: number): string {
  return `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(
    url
  )}&w=${width}&q=85`;
}

export const SUPLETIVO_ASSETS = {
  gridA: '/images/grid-a.jpg',
  gridB: '/images/grid-b.jpg',
  gridC: '/images/grid-c.jpg',
  dawnSky: '/images/dawn-sky.jpg',
  diplomaSeal: '/images/diploma-seal.jpg',
  planeSprite: proxyTransparent(CF_STICKERS, 1200),
  trinketSprite: proxyTransparent(CF_STICKERS, 700),
} as const;

export type CropBox = readonly [number, number, number, number];

export const SPRITE_CROPS = {
  plane: [0.594, 0.613, 0.891, 0.816] as CropBox,
  pearl: [0.625, 0.152, 0.863, 0.395] as CropBox,
  capsule: [0.094, 0.656, 0.418, 0.793] as CropBox,
} as const;

export const HEADLINE_TEXT = 'Mas não acabou.';
export const HERO_CARD_ORDER = [5, 2, 0, 1, 3, 4] as const;
export const HERO_CARD_START_TIMES = [0.28, 0.34, 0.38, 0.44, 0.52, 0.58] as const;

export const PIXEL_PALETTE: Record<string, string> = {
  k: '#0B1324', // deep institutional navy ink
  g: '#0B5D43', // deep forest emerald
  y: '#C59017', // brushed antique gold
  w: '#FFFFFF', // crisp cotton white
};

export interface PixelIconDef {
  id: string;
  label: string;
  rows: readonly string[];
}

export const PIXEL_ICONS: readonly PixelIconDef[] = [
  {
    id: 'aviao',
    label: 'Avião de papel',
    rows: [
      '........k',
      '......kkg',
      '....kkwkg',
      '..kkwwkg.',
      'kkwwwkgg.',
      '..kkkgg..',
      '....kg...',
      '....k....',
      '.........',
    ],
  },
  {
    id: 'caderno',
    label: 'Caderno de retomada',
    rows: [
      '.kkkkkkk.',
      'kgwwwwwgk',
      'kgwyyywgk',
      'kgwwwwwgk',
      'kgwkkkwgk',
      'kgwwwwwgk',
      'kgggggggk',
      '.kkkkkkk.',
      '.........',
    ],
  },
  {
    id: 'livro',
    label: 'Livro aberto',
    rows: [
      '.........',
      '.kkk.kkk.',
      'kwwwkwwwk',
      'kwywkwywk',
      'kwwwkwwwk',
      'kgggggggk',
      '.kkkkkkk.',
      '....k....',
      '.........',
    ],
  },
  {
    id: 'relogio',
    label: 'No seu tempo',
    rows: [
      '..kkkkk..',
      '.kwwwwwk.',
      'kwwwkwwwk',
      'kwwwkwwwk',
      'kwwwkyywk',
      'kwwwwwwwk',
      '.kwwwwwk.',
      '..kkkkk..',
      '.........',
    ],
  },
  {
    id: 'capelo',
    label: 'Capelo de formatura',
    rows: [
      '....k....',
      '..kkggk..',
      'kkgggggkk',
      '.kkgggkk.',
      '..kgggk.y',
      '..kgggk.y',
      '..kkkkk.y',
      '.........',
      '.........',
    ],
  },
  {
    id: 'escudo',
    label: 'Escudo LDB Federal',
    rows: [
      '.kkkkkkk.',
      'kgggggggk',
      'kggwggggk',
      'kgggwgggk',
      'kggggwggk',
      '.kgggggk.',
      '..kgggk..',
      '...kkk...',
      '....k....',
    ],
  },
  {
    id: 'diploma',
    label: 'Diploma oficial',
    rows: [
      '....y....',
      '.y..k..y.',
      '...kyk...',
      '..kyyyk..',
      'ykyyyyyky',
      '..kyyyk..',
      '...kyk...',
      '.y..k..y.',
      '....y....',
    ],
  },
] as const;

export type StoryCardCategory = 'passos' | 'historias' | 'seguranca';

export interface StoryCardItem {
  index: number;
  id: string;
  url: string;
  col: 0 | 1;
  row: 0 | 1;
  category: StoryCardCategory;
  categoryLabel: string;
  tag: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  summary: string;
  metricLabel: string;
  metricValue: string;
  detailPoints: readonly string[];
  ctaLabel: string;
  ctaStage: 'medio' | 'fundamental';
}

export const STORY_CARDS: readonly StoryCardItem[] = [
  {
    index: 0,
    id: 'o-recomeco',
    url: SUPLETIVO_ASSETS.gridA,
    col: 0,
    row: 0,
    category: 'passos',
    categoryLabel: 'Passo a Passo',
    tag: 'CAPÍTULO 01',
    shortLabel: 'O recomeço',
    title: 'A decisão que muda tudo',
    subtitle: 'Sem filas, sem julgamento e com acolhimento humano',
    summary:
      'Quase todo adulto que parou os estudos carrega essa pendência em silêncio. Aqui a inscrição é simples, respeitosa e começa com orientação pedagógica de verdade.',
    metricLabel: 'Primeiro passo',
    metricValue: 'Acolhimento imediato',
    detailPoints: [
      'Você não precisa explicar nem justificar por que parou',
      'Atendimento humano do primeiro contato até o certificado',
      'Acesso organizado ao ambiente de preparação EJA',
    ],
    ctaLabel: 'Dar o primeiro passo',
    ctaStage: 'medio',
  },
  {
    index: 1,
    id: 'conquista-diploma',
    url: SUPLETIVO_ASSETS.gridA,
    col: 1,
    row: 0,
    category: 'passos',
    categoryLabel: 'Passo a Passo',
    tag: 'CERTIFICADO',
    shortLabel: 'Diploma oficial',
    title: 'Um ciclo fechado de verdade',
    subtitle: 'O alívio de transformar uma pausa em conquista',
    summary:
      'Para quem precisou trabalhar cedo, cuidar da família ou assumir responsabilidades antes da hora. Agora você encerra essa etapa com dignidade e respaldo em lei.',
    metricLabel: 'Validade',
    metricValue: 'Todo o Brasil',
    detailPoints: [
      'Aceito em faculdades públicas e privadas',
      'Válido para empresas, carteira assinada e promoções',
      'Válido para concursos públicos e cursos técnicos',
    ],
    ctaLabel: 'Quero meu diploma',
    ctaStage: 'medio',
  },
  {
    index: 2,
    id: 'acesso-faculdade',
    url: SUPLETIVO_ASSETS.gridA,
    col: 0,
    row: 1,
    category: 'historias',
    categoryLabel: 'Histórias Reais',
    tag: 'FACULDADE',
    shortLabel: 'Acesso à faculdade',
    title: 'O sonho da graduação volta à mesa',
    subtitle: 'Enem, ProUni, Fies e vestibulares abertos',
    summary:
      'Milhares de adultos adiam o ensino superior por causa de um único documento. Com o diploma oficial homologado, o próximo capítulo deixa de ser distante.',
    metricLabel: 'Destino comum',
    metricValue: 'Graduação & Tecnólogo',
    detailPoints: [
      'Aceito em universidades presenciais e EAD',
      'Certificado com histórico escolar completo',
      'Mesma força jurídica do ensino médio regular',
    ],
    ctaLabel: 'Quero ir para a faculdade',
    ctaStage: 'medio',
  },
  {
    index: 3,
    id: 'diario-oficial',
    url: SUPLETIVO_ASSETS.gridA,
    col: 1,
    row: 1,
    category: 'seguranca',
    categoryLabel: 'Segurança Legal',
    tag: 'HOMOLOGAÇÃO',
    shortLabel: 'Diário Oficial',
    title: 'Seu nome no Diário Oficial',
    subtitle: 'Conferência pública e autenticidade incontestável',
    summary:
      'Todo certificado emitido pela instituição parceira credenciada pelo CEE recebe registro público consultável — segurança real para apresentar em qualquer lugar.',
    metricLabel: 'Registro',
    metricValue: 'CEE + Diário Oficial',
    detailPoints: [
      'Instituição de ensino autorizada pelo Conselho Estadual de Educação',
      'Documentação auditável por RHs, faculdades e bancas',
      'Transparência total em cada etapa do processo',
    ],
    ctaLabel: 'Garantir certificado oficial',
    ctaStage: 'medio',
  },
  {
    index: 4,
    id: 'orgulho-familia',
    url: SUPLETIVO_ASSETS.gridB,
    col: 0,
    row: 0,
    category: 'historias',
    categoryLabel: 'Histórias Reais',
    tag: 'SUPERAÇÃO',
    shortLabel: 'Orgulho em família',
    title: 'O peso que sai das costas',
    subtitle: 'Camila R., 34 anos · Voltou após 12 anos parada',
    summary:
      '“Parei no 2º ano quando minha filha nasceu. Por anos eu travava quando perguntavam sobre escolaridade. Estudei no silêncio das noites em casa e hoje faço Pedagogia.”',
    metricLabel: 'Rotina de estudo',
    metricValue: '30 min por noite',
    detailPoints: [
      'Sem julgamento pelo tempo fora da escola',
      'Material direto ao ponto para adultos que trabalham',
      'Exemplo vivo de persistência para filhos e família',
    ],
    ctaLabel: 'Retomar minha história',
    ctaStage: 'medio',
  },
  {
    index: 5,
    id: 'estudo-no-ritmo',
    url: SUPLETIVO_ASSETS.gridB,
    col: 1,
    row: 0,
    category: 'passos',
    categoryLabel: 'Passo a Passo',
    tag: 'CAPÍTULO 02',
    shortLabel: 'No seu ritmo',
    title: 'Estudo que cabe na vida adulta',
    subtitle: 'No silêncio da noite, no intervalo ou no fim de semana',
    summary:
      'Esqueça horários rígidos e deslocamento noturno até a escola. Nossa plataforma de preparação a distância respeita sua rotina com apostilas objetivas e simulados práticos.',
    metricLabel: 'Preparação',
    metricValue: 'A distância · No seu ritmo',
    detailPoints: [
      'Conteúdo enxuto que funciona em qualquer tela com internet',
      'Simulados objetivos no formato da avaliação oficial',
      'Avance com segurança pelos temas que você já domina',
    ],
    ctaLabel: 'Quero estudar no meu tempo',
    ctaStage: 'medio',
  },
  {
    index: 6,
    id: 'prova-presencial',
    url: SUPLETIVO_ASSETS.gridB,
    col: 0,
    row: 1,
    category: 'passos',
    categoryLabel: 'Passo a Passo',
    tag: 'CAPÍTULO 03',
    shortLabel: 'Prova presencial',
    title: 'A prova presencial que legitima tudo',
    subtitle: 'Agendamento flexível no polo parceiro credenciado',
    summary:
      'Quando estiver pronto(a), você realiza a avaliação presencial oficial exigida pela legislação brasileira. É esse rigor que garante que seu diploma seja aceito sem ressalvas.',
    metricLabel: 'Exigência legal',
    metricValue: 'Avaliação presencial CEE',
    detailPoints: [
      'É a prova presencial que dá 100% de legitimidade ao certificado',
      'Você só agenda quando se sentir confiante nos simulados',
      'Acompanhamento completo até a entrega do certificado',
    ],
    ctaLabel: 'Entender a prova presencial',
    ctaStage: 'medio',
  },
  {
    index: 7,
    id: 'degrau-a-degrau',
    url: SUPLETIVO_ASSETS.gridB,
    col: 1,
    row: 1,
    category: 'passos',
    categoryLabel: 'Passo a Passo',
    tag: 'MÉTODO EJA',
    shortLabel: 'Método para adultos',
    title: 'Feito para quem já tem bagagem de vida',
    subtitle: 'Foco no essencial que cai na avaliação oficial',
    summary:
      'Você não precisa repetir três anos de aulas expositivas. A metodologia EJA reconhece sua experiência de adulto e organiza o conteúdo com clareza e respeito.',
    metricLabel: 'Modalidade',
    metricValue: 'Fundamental e Médio',
    detailPoints: [
      'Ensino Fundamental a partir de 15 anos completos',
      'Ensino Médio a partir de 18 anos completos',
      'Linguagem clara, respeitosa e aplicada',
    ],
    ctaLabel: 'Ver qual etapa posso fazer',
    ctaStage: 'fundamental',
  },
  {
    index: 8,
    id: 'amparo-ldb',
    url: SUPLETIVO_ASSETS.gridC,
    col: 0,
    row: 0,
    category: 'seguranca',
    categoryLabel: 'Segurança Legal',
    tag: 'LEI FEDERAL',
    shortLabel: 'Lei 9.394/96',
    title: 'Direito amparado pela Lei 9.394/96',
    subtitle: 'Educação de Jovens e Adultos prevista na LDB',
    summary:
      'A conclusão pela modalidade EJA é um direito previsto na Lei de Diretrizes e Bases da Educação Nacional (Art. 37 e 38) — caminho sério, regulamentado e sem atalhos.',
    metricLabel: 'Base legal',
    metricValue: 'LDB · Art. 37 e 38',
    detailPoints: [
      'Legislação federal vigente em todos os estados',
      'Certificado com a mesma força legal do ensino tradicional',
      'Sem promessas milagrosas ou atalhos fora da lei',
    ],
    ctaLabel: 'Matricular com segurança',
    ctaStage: 'medio',
  },
  {
    index: 9,
    id: 'promocao-carreira',
    url: SUPLETIVO_ASSETS.gridC,
    col: 1,
    row: 0,
    category: 'historias',
    categoryLabel: 'Histórias Reais',
    tag: 'CARREIRA',
    shortLabel: 'Carreira destravada',
    title: 'A promoção que só esperava um papel',
    subtitle: 'Rafael M., 29 anos · Promovido a supervisor logístico',
    summary:
      '“Eu já liderava o turno inteiro, mas o RH não podia formalizar meu cargo sem o Ensino Médio. Encarei os estudos à noite, fiz a prova presencial e assinei minha promoção.”',
    metricLabel: 'Impacto real',
    metricValue: 'Vaga & aumento destravados',
    detailPoints: [
      'Atende exigência imediata de RH e grandes empresas',
      'Permite ingresso em cursos técnicos (SENAI, ETEC, etc.)',
      'Valoriza toda a experiência profissional que você já construiu',
    ],
    ctaLabel: 'Destravar minha carreira',
    ctaStage: 'medio',
  },
  {
    index: 10,
    id: 'concursos-publicos',
    url: SUPLETIVO_ASSETS.gridC,
    col: 0,
    row: 1,
    category: 'historias',
    categoryLabel: 'Histórias Reais',
    tag: 'CONCURSOS',
    shortLabel: 'Concursos públicos',
    title: 'Pronto para editais e concursos públicos',
    subtitle: 'Esferas municipais, estaduais e federais',
    summary:
      'Concursos de nível médio abrem caminho para estabilidade real. Com seu certificado homologado e publicado oficialmente, você cumpre a escolaridade exigida na posse.',
    metricLabel: 'Reconhecimento',
    metricValue: 'Bancas oficiais do país',
    detailPoints: [
      'Documentação aceita na posse de cargos públicos',
      'Histórico e certificado emitidos conforme normas oficiais',
      'Prepare-se para o próximo passo com tranquilidade',
    ],
    ctaLabel: 'Garantir requisito para concurso',
    ctaStage: 'medio',
  },
  {
    index: 11,
    id: 'garantia-7-dias',
    url: SUPLETIVO_ASSETS.gridC,
    col: 1,
    row: 1,
    category: 'seguranca',
    categoryLabel: 'Segurança Legal',
    tag: 'GARANTIA CDC',
    shortLabel: 'Garantia 7 dias',
    title: '7 dias para conhecer sem pressão',
    subtitle: 'Art. 49 do Código de Defesa do Consumidor + LGPD',
    summary:
      'Entre na plataforma, explore o material com calma e tire todas as dúvidas. Se nos primeiros 7 dias decidir que ainda não é a hora, devolvemos 100% do valor.',
    metricLabel: 'Investimento único',
    metricValue: '12x R$ 99 ou R$ 999 Pix',
    detailPoints: [
      'Sem mensalidades recorrentes ou taxas surpresa',
      'Direito de arrependimento garantido em lei (7 dias)',
      'Dados protegidos conforme a LGPD (Lei 13.709/18)',
    ],
    ctaLabel: 'Conhecer sem risco',
    ctaStage: 'medio',
  },
] as const;

export interface StudentOutcome {
  id: string;
  name: string;
  age: string;
  location: string;
  arcLabel: string;
  achievement: string;
  quote: string;
  stageLabel: string;
  photoUrl: string;
  col: 0 | 1;
  row: 0 | 1;
  cardIndex: number;
}

export const STUDENT_OUTCOMES: readonly StudentOutcome[] = [
  {
    id: 'rafael',
    name: 'Rafael Mendes',
    age: '29 anos',
    location: 'São Paulo · SP',
    arcLabel: '8 anos de pausa → Promoção formalizada',
    achievement: 'Promovido a supervisor logístico',
    quote:
      '“Eu já liderava a equipe há dois anos, mas o RH não podia assinar minha promoção sem o Ensino Médio. Estudei trinta minutos toda noite, fiz minha prova oficial e finalmente destravei minha carreira.”',
    stageLabel: 'Ensino Médio EJA',
    photoUrl: SUPLETIVO_ASSETS.gridC,
    col: 1,
    row: 0,
    cardIndex: 9,
  },
  {
    id: 'camila',
    name: 'Camila Rodrigues',
    age: '34 anos',
    location: 'Belo Horizonte · MG',
    arcLabel: '12 anos fora da escola → Ensino Superior',
    achievement: 'Ingressou na faculdade de Pedagogia',
    quote:
      '“Parei no segundo ano quando minha filha nasceu e carreguei essa vergonha em silêncio por mais de uma década. Voltei sem julgamento, fechei meu ciclo e hoje ela me vê estudando na faculdade.”',
    stageLabel: 'Ensino Médio EJA',
    photoUrl: SUPLETIVO_ASSETS.gridB,
    col: 0,
    row: 0,
    cardIndex: 4,
  },
  {
    id: 'patricia',
    name: 'Patrícia Alves',
    age: '31 anos',
    location: 'Curitiba · PR',
    arcLabel: '10 anos adiando → Cargo público',
    achievement: 'Certificado aceito em concurso municipal',
    quote:
      '“Tinha muito receio de promessas fáceis na internet. Quando entendi o amparo da LDB e vi que a avaliação final era presencial em polo credenciado, fiz com paz de espírito e tomei posse.”',
    stageLabel: 'Ensino Médio EJA',
    photoUrl: SUPLETIVO_ASSETS.gridA,
    col: 0,
    row: 0,
    cardIndex: 10,
  },
] as const;

export type AgeBracket = '18plus' | '15to17' | 'under15';

export interface EligibilityResult {
  bracket: AgeBracket;
  eligible: boolean;
  badge: string;
  headline: string;
  explanation: string;
  recommendedStage: 'medio' | 'fundamental' | null;
  ctaLabel: string | null;
  legalNote: string;
}

export function evaluateEligibility(bracket: AgeBracket): EligibilityResult {
  if (bracket === '18plus') {
    return {
      bracket,
      eligible: true,
      badge: 'Apto para Ensino Médio e Fundamental',
      headline: 'Sim — a lei já garante seu direito de concluir o Ensino Médio.',
      explanation:
        'Com 18 anos completos ou mais, você cumpre integralmente a exigência da Lei Federal nº 9.394/96 (LDB) para retomar e concluir o Ensino Médio pela modalidade EJA, com preparação a distância no seu ritmo e avaliação presencial oficial.',
      recommendedStage: 'medio',
      ctaLabel: 'Iniciar minha retomada no Ensino Médio',
      legalNote: 'Base legal: LDB Art. 38, §1º, inciso II — idade mínima de 18 anos para o Ensino Médio.',
    };
  }
  if (bracket === '15to17') {
    return {
      bracket,
      eligible: true,
      badge: 'Apto para Ensino Fundamental',
      headline: 'Você já pode concluir o Ensino Fundamental pela modalidade EJA.',
      explanation:
        'Entre 15 e 17 anos completos, a legislação brasileira já autoriza a conclusão do Ensino Fundamental na modalidade EJA com prova presencial oficial. Para o Ensino Médio, a lei exige aguardar completar 18 anos.',
      recommendedStage: 'fundamental',
      ctaLabel: 'Iniciar matrícula no Ensino Fundamental',
      legalNote: 'Base legal: LDB Art. 38, §1º, inciso I — idade mínima de 15 anos para o Ensino Fundamental.',
    };
  }
  return {
    bracket,
    eligible: false,
    badge: 'Ainda não atingiu a idade mínima legal',
    headline: 'Pela lei brasileira, o supletivo EJA começa aos 15 anos.',
    explanation:
      'Levamos sua história e a legislação a sério: pela Lei Federal nº 9.394/96 (LDB), nenhuma instituição pode certificar via EJA menores de 15 anos. Siga firme na escola regular e, se precisar no futuro, estaremos de portas abertas.',
    recommendedStage: null,
    ctaLabel: null,
    legalNote: 'Compromisso com transparência: seguimos rigorosamente a Lei nº 9.394/96.',
  };
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'validade',
    question: 'O certificado do Supletivo Brasil é reconhecido e válido em todo o Brasil?',
    answer:
      'Sim. Todo o processo segue a Lei Federal nº 9.394/96 (LDB) para Educação de Jovens e Adultos (EJA), com certificação emitida por instituição de ensino parceira autorizada pelo Conselho Estadual de Educação (CEE) e publicação/homologação oficial. É aceito em faculdades, empresas, cursos técnicos e concursos públicos em todo o território nacional.',
  },
  {
    id: 'prova',
    question: 'Por que a avaliação final precisa ser presencial?',
    answer:
      'Porque a legislação brasileira exige que a prova de certificação EJA seja presencial em polo credenciado. Longe de ser um obstáculo, essa etapa é a sua maior proteção — é ela que comprova a legitimidade do diploma. Desconfie de qualquer promessa de certificado sem avaliação oficial. Você estuda no seu ritmo com nosso material preparatório a distância e agenda a prova quando se sentir seguro(a).',
  },
  {
    id: 'preco',
    question: 'Existe alguma mensalidade além dos 12x de R$ 99 ou R$ 999 no Pix?',
    answer:
      'Não. O investimento é transparente e fechado: 12x de R$ 99 no cartão de crédito ou R$ 999 à vista no Pix, sem mensalidades recorrentes nem surpresas no meio do caminho. Inclui inscrição, acesso completo ao ambiente de estudos a distância, simulados preparatórios e orientação humana até a emissão do certificado.',
  },
  {
    id: 'tempo',
    question: 'Quanto tempo leva para concluir o Ensino Médio?',
    answer:
      'Cada história tem o seu ritmo. Como a preparação a distância é direta ao ponto e feita para adultos que trabalham, quem dedica de 30 a 45 minutos por dia avança com constância até se sentir pronto para a avaliação presencial oficial, sempre respeitando os prazos regimentais e legais da instituição credenciada.',
  },
  {
    id: 'faculdade-concurso',
    question: 'Posso usar o diploma para faculdade, Enem e concurso público?',
    answer:
      'Sim. O certificado de conclusão do Ensino Médio EJA tem exatamente a mesma validade jurídica do certificado obtido no ensino regular. Você pode se matricular em universidades presenciais ou EAD, prestar Enem, ProUni, Fies, cursos técnicos e tomar posse em concursos públicos.',
  },
  {
    id: 'garantia',
    question: 'E se eu começar e perceber que ainda não é o meu momento?',
    answer:
      'Você tem garantia legal incondicional de 7 dias corridos após a matrícula (Art. 49 do Código de Defesa do Consumidor). Se explorar o material e decidir não seguir agora, basta solicitar o cancelamento dentro do prazo para reembolso integral.',
  },
] as const;

export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export interface EnrollmentFormInput {
  name: string;
  whatsapp: string;
  email: string;
  stage: 'medio' | 'fundamental';
  payment: 'parcelado' | 'pix';
  state: string;
}

export interface EnrollmentFormValidation {
  valid: boolean;
  errors: Partial<Record<keyof EnrollmentFormInput, string>>;
}

export function formatBrazilPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function validateEnrollmentForm(
  input: EnrollmentFormInput
): EnrollmentFormValidation {
  const errors: Partial<Record<keyof EnrollmentFormInput, string>> = {};
  const trimmedName = input.name.trim();
  const digits = input.whatsapp.replace(/\D/g, '');
  const trimmedEmail = input.email.trim();

  if (trimmedName.length < 3) {
    errors.name = 'Informe seu nome completo.';
  }
  if (digits.length < 10 || digits.length > 11) {
    errors.whatsapp = 'Informe um WhatsApp válido com DDD (ex: 11 99999-9999).';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = 'Informe um e-mail válido para envio dos dados de acesso.';
  }
  if (!BRAZIL_STATES.includes(input.state as (typeof BRAZIL_STATES)[number])) {
    errors.state = 'Selecione seu estado (UF).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
