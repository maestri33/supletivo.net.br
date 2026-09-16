# Design System — Supletivo.net.br

## Core Design Principles

1. **Pátria Amada Refinada:** O verde e o azul representam a seriedade e autoridade institucional do diploma oficial reconhecido pelo MEC/CNE e publicado no Diário Oficial; o amarelo atua estritamente como acento de energia, foco de atenção e conversão primária.
2. **Tipografia de Alto Impacto e Contraste:** Títulos maciços em `Archivo Black` com entrelinha comprimida (`1.08`), contrapostos à extrema clareza funcional e neutralidade geométrica da `Inter` no corpo de texto e elementos de interface.
3. **Física Espacial e Profundidade Tátil (Antigravity):** Sensação de gravidade zero obtida por cards flutuantes com sombras suaves multicamadas (`--shadow-zero-g`), micro-rotações responsivas, painéis translúcidos em vidro temperado com desfoque de fundo (`backdrop-filter: blur(16px)`) e resposta espacial ao movimento.
4. **Ergonomia Touch Mobile Rigorosa:** Todos os alvos de interação e campos de formulário respeitam dimensões mínimas de toque (`--input-height: 48px`), eliminando atrasos de clique e flash cinza via `-webkit-tap-highlight-color: transparent`.
5. **Acessibilidade Inegociável (WCAG AA / AAA):** Toda combinação de cor de texto e superfície cumpre a proporção de contraste mínima de 4.5:1 (AA) para corpo e 3:1 para display/UI, com o par Amarelo/Ink operando em 11.8:1 (AAA).

---

## Colors

A paleta de cores é inspirada na identidade visual nacional brasileira, calibrada digitalmente para alto contraste e saturação:

### Primárias & Acentos
- **Verde Institucional (`--green` / #00734d)**: Elementos de segurança, credibilidade, barras de progresso e validação MEC/SISTEC.
- **Verde Profundo (`--green-deep` / #005238)**: Estados de hover, gradientes institucionais e superfícies solenes.
- **Amarelo Conversão (`--yellow` / #ffc400)**: O acento mais brilhante do sistema. Reservado estritamente para o botão principal de conversão (CTA), alertas de escassez e seleções de texto (`::selection`). O texto sobre o amarelo é **sempre `--ink`** (#0b1220), atingindo contraste de **11.8:1** (WCAG AAA).
- **Amarelo Suave (`--yellow-soft` / #ffd75e)**: Detalhes secundários, badges e bordas sutis sobre fundos escuros.
- **Azul Noturno (`--blue` / #002776)**: Cor de autoridade, cabeçalhos, anéis de foco em fundos claros e profundidade.
- **Azul Profundo (`--blue-deep` / #001a52)**: Variações para gradientes de cabeçalho e atmosfera noturna.

### Neutros e Superfícies
- **Ink (`--ink` / #0b1220)**: Fundo escuro de seções de autoridade/preço e cor primária de texto sobre superfícies claras.
- **Ink Soft (`--ink-soft` / #121d33)**: Superfície de cartões internos em seções escuras.
- **Paper (`--paper` / #ffffff)**: Branco puro para cartões em destaque e fundo padrão da aplicação.
- **Paper Soft (`--paper-soft` / #f5f7f3)**: Fundo alternado suave para criar ritmo de leitura e separar blocos de conteúdo.
- **Line Light (`--line-light` / #e3e7ee)**: Linhas divisórias neutras e bordas de 1px em cards claros.

### Texto Auxiliar & Contraste Auditado
- **Muted on Dark (`--muted-on-dark` / #b9c3db)**: Contraste de **7.8:1** sobre `#0b1220` e **9.2:1** sobre `#002776` (WCAG AAA).
- **Muted on Light (`--muted-on-light` / #49536a)**: Contraste de **5.1:1** sobre `#ffffff` (WCAG AA).

### Cores Semânticas de Estado (Auditadas WCAG AA > 4.5:1)
- **Danger (`--danger` / #b91c1c | `--danger-bg` / #fee2e2)**: Erros de validação (CPF/telefone inválido, falha de envio).
- **Success (`--success` / #15803d | `--success-bg` / #dcfce7)**: Conclusão de etapas, formulário validado e código OTP correto.
- **Warning (`--warning` / #92400e | `--warning-bg` / #fef3c7)**: Alertas de escassez de vagas e expiração de condição promocional.
- **Info (`--info` / #0369a1 | `--info-bg` / #e0f2fe)**: Notas informativas e orientações passo a passo.

---

## Typography

### Famílias Tipográficas
- **Display**: `'Archivo Black', system-ui, sans-serif` (peso 400 nativo ultra-bold).
- **Body & UI**: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` (pesos 400 normal, 700 negrito).

### Escala Tipográfica Fluida (Clamps Responsivos)
- **Hero**: `clamp(2.85rem, 1.1rem + 8vw, 6.8rem)` — impacto visual e conversão instantânea.
- **H2**: `clamp(2rem, 1.3rem + 3vw, 3.6rem)` — seções principais da página.
- **H2 Compact (`--text-h2-sm`)**: `clamp(1.55rem, 1.2rem + 1.6vw, 2.4rem)` — seções de FAQ e blocos didáticos.
- **H3**: `clamp(1.15rem, 1.05rem + 0.5vw, 1.35rem)` — títulos de cartões e passos de matrícula.
- **Price**: `clamp(3.2rem, 2rem + 5.6vw, 6rem)` — precificação clara e transparente.
- **Body Large (`--text-lg`)**: `clamp(1.125rem, 1.02rem + 0.55vw, 1.375rem)` — subtítulos de destaque e chamadas.
- **Body Regular (`--text-base`)**: `clamp(1rem, 0.95rem + 0.35vw, 1.125rem)` — leitura contínua e acessível.
- **Kicker / Eyebrow**: `0.8rem` (`letter-spacing: 0.16em`, uppercase, peso 700).

---

## Layout & Ritmo

- **Container Padrão**: `width: min(100% - 2 * var(--gutter), 68rem)` (1088px máximo).
- **Container Estreito (`narrow`)**: `46rem` (736px) — centralização de FAQ e fluxos focados de leitura.
- **Gutters Laterais**: `clamp(1.25rem, 4vw, 2.5rem)` — respiro seguro em smartphones pequenos até ultrawide.
- **Espaçamento entre Seções**: `clamp(4.5rem, 3rem + 6vw, 9rem)` — ritmo editorial claro, sem excesso de vazios.

---

## Elevation & Depth (Antigravity Engine)

1. **Nível 0 (Flat)**: Fundo plano em `--paper` ou `--ink`.
2. **Nível 1 (Borda Sutil)**: Cartões em `--paper` com borda de 1px em `--line-light`.
3. **Nível 2 (Glassmorphism Translúcido)**:
   - `.glass-panel`: Fundo `rgba(11, 18, 32, 0.7)` com `backdrop-filter: blur(16px)` e borda `rgba(255, 255, 255, 0.12)`.
   - `.glass-panel-light`: Fundo `rgba(255, 255, 255, 0.75)` com `backdrop-filter: blur(16px)` e borda `rgba(255, 255, 255, 0.6)`.
4. **Nível 3 (Sombras Zero-G)**:
   - `--shadow-zero-g`: `0 24px 48px -12px rgba(0, 0, 0, 0.4), 0 12px 24px -8px rgba(0, 0, 0, 0.2)`.
   - `--shadow-floating`: `0 30px 60px -15px rgba(0, 0, 0, 0.45), 0 0 1px 1px rgba(255, 255, 255, 0.1)`.
5. **Profundidade Espacial 3D (`transform-style: preserve-3d`)**:
   - `.layer-z-sm`: `translateZ(12px)`.
   - `.layer-z-md`: `translateZ(24px)`.
   - `.layer-z-lg`: `translateZ(40px)`.

---

## Shapes & Arredondamentos

- **Pílula (`--radius-pill` / 999px)**: Botões principais de conversão (`.btn`) e badges de destaque promocional.
- **Cartões Principais (`--radius` / 18px)**: Módulos de conteúdo, depoimentos e passos do supletivo.
- **Cartões em Destaque (`--radius-lg` / 28px)**: Seção Hero, cartões de preço e painéis de elegibilidade.
- **Campos de Formulário (`--input-radius` / 10px)**: Caixas de texto, selects e botões secundários.

---

## Components

### 1. Botão Principal (CTA `.btn`)
- **Fundo**: `--yellow` (`#ffc400`).
- **Texto**: `--ink` (`#0b1220`), peso 700, pílula (`999px`), sem quebra de linha (`white-space: nowrap`).
- **Varredura Luminosa (Shine)**: Feixe de luz suave que atravessa o botão a cada 6.5s via animação CSS `@keyframes btn-shine`.
- **Micro-interações**: Hover com elevação de `-2px` e sombra expandida; clique (`:active`) com retorno tátil a `0.99`.
- **Foco Acessível**: Anel duplo em `:focus-visible` com offset limpo.

### 2. Entradas de Formulário (Touch Ergonomics)
- **Dimensões**: Altura mínima de `48px` (`--input-height`).
- **Tipografia**: `1rem` para evitar zoom automático em dispositivos iOS.
- **Foco**: Anel azul `--blue` com realce translúcido (`0 0 0 3px rgba(0, 39, 118, 0.18)`).

### 3. Painel de Elegibilidade e Dúvidas
- Cartões com seleção interativa de série/idade e feedback visual imediato.

### 4. Barra Fixa Mobile (Sticky CTA)
- Fixada no rodapé em telas móveis com respeito estrito a `env(safe-area-inset-bottom)`.

---

## Media, Imagery & Iconography Guidelines

### 1. Fotografia e Imagens Humanas (Anti-Stock Fake)
- **Representatividade Real Brasileira**: Retratar o público real do Supletivo (adultos de 25 a 55 anos, trabalhadores, mães, profissionais de serviços, comércio e indústria).
- **Zero "Modelos de High School Americano"**: Expressamente proibido o uso de fotos genéricas de bancos de imagem com jovens adolescentes brancos segurando livros em corredores de universidade americana. Isso destrói a identificação e aciona desconfiança imediata de golpe no público de EJA.
- **Iluminação e Textura Natural**: Luz ambiente real (janela de casa, iluminação do local de trabalho). Rostos expressivos de conquista e alívio com imperfeições sutis e humanas (sem efeito plástico de filtros de IA exagerados).
- **Performance Web**:
  - Formatos obrigatórios: **WebP** e **AVIF** com compressão balanceada.
  - Atributos mandatórios em tags `<img>`: `loading="lazy"`, `decoding="async"` e dimensões explícitas (`width` e `height`) para zerar o Cumulative Layout Shift (CLS).

### 2. Vídeos e Depoimentos (Prova Social UGC)
- **Formato Selfie / UGC (User-Generated Content)**: Alunos reais gravando com o próprio celular em formato vertical (9:16) ou horizontal (16:9), segurando o certificado físico ou diploma oficial em mãos.
- **Performance-First (Padrão Façade)**:
  - **Proibido Autoplay com Áudio**: Não surpreenda o usuário nem consuma planos de dados móveis pré-pagos.
  - **Carregamento sob Demanda (Lazy Video Façade)**: Vídeos na página inicial não devem baixar megabytes de `.mp4` no carregamento da página. Exibe-se apenas uma imagem de capa (poster) leve com um botão de play. O stream só inicia quando o usuário toca para assistir.
  - **Infraestrutura**: Hospedagem externa em Cloudflare Stream ou Cloudflare R2 com streaming adaptativo. Nenhum arquivo binário de vídeo pesado deve ser commitado no repositório Git.

### 3. Vetores e Ícones (SVG Cirúrgico)
- **Espessura de Traço Consistente**: Todos os ícones devem manter traço óptico padronizado (`stroke-width: 2` ou `2.2`, `stroke-linecap: round`, `stroke-linejoin: round`).
- **Cores por Tokens**:
  - Ícones neutros herdam cor via `stroke="currentColor"`.
  - Ícones de destaque e validação usam estritamente tokens (`var(--green)`, `var(--yellow)`, `var(--blue)`).
- **Bundle Zero-Bloat**:
  - Proibido importar bibliotecas pesadas completas (ex: pacotes de ícones de dezenas de megabytes).
  - Priorizar SVGs inline otimizados (sem tags `<defs>` ou metadados desnecessários do Illustrator/Figma) ou importação pontual de ícones do `lucide-react`.

### 4. Ilustrações e Diagramas Técnicos (Anti-Corporate Memphis)
- **Proibição do "Corporate Memphis"**:
  - Proibido utilizar ilustrações genéricas de tecnologia com pessoas azuis/roxas de membros gigantes e cabeças minúsculas ("slop corporativo de IA"). Esse estilo infantiliza o serviço e reduz a seriedade jurídica do certificado.
- **Estilo Documental e Técnico**:
  - Diagramas vetoriais claros dos passos (Matrícula ➔ Conferência de Documentos ➔ Handoff Parceiro ➔ Diploma).
  - Selos oficiais e marcas d'água mecânicas com linhas de segurança guilhochê (linhas finas inspiradas em notas de papel-moeda e diplomas oficiais).

---

## Do's and Don'ts

### DO's
- **DO**: Sempre use texto escuro (`--ink`) sobre fundos amarelos (`--yellow`) para garantir conformidade AAA (11.8:1).
- **DO**: Reserve a fonte `Archivo Black` exclusivamente para títulos e números de destaque; mantenha corpo e botões em `Inter`.
- **DO**: Respeite o kill-switch de movimento `@media (prefers-reduced-motion: reduce)` desativando inclinações 3D e loops visuais.
- **DO**: Mantenha altura mínima de toque de 48px para todos os campos e botões em telas sensíveis ao toque.
- **DO**: Use fotos autênticas de brasileiros adultos trabalhadores com luz natural; use o padrão Façade para depoimentos em vídeo.
- **DO**: Mantenha traços de ícones SVG consistentes (`stroke-width: 2` ou `2.2`) e herança de cor via tokens.

### DON'Ts
- **DON'T**: Nunca use texto branco sobre fundo amarelo.
- **DON'T**: Nunca use gradientes genéricos roxo/magenta estilizados ("estética SaaS genérica").
- **DON'T**: Nunca permita que o botão principal de conversão quebre em duas linhas no mobile.
- **DON'T**: Nunca aplique sombras duras, secas e pretas opacas estilo material inicial.
- **DON'T**: Nunca instale bibliotecas pesadas de ícones que aumentem o bundle; use SVGs otimizados inline.
- **DON'T**: Nunca use fotos de banco americano com adolescentes em corredores de universidade (anti-stock fake).
- **DON'T**: Nunca utilize ilustrações estilo "Corporate Memphis" (bonecos roxos desproporcionais).
- **DON'T**: Nunca faça autoplay de vídeos com áudio ligado em dispositivos móveis.
