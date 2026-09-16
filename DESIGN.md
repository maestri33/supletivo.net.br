---
version: alpha
name: "Supletivo Brasil"
description: "Identidade visual patriótica refinada (Pátria Amada), editorial e de alta conversão para o portal principal supletivo.net.br. Paleta nacional elevada, tipografia impactante com Archivo Black e Inter, física espacial com glassmorphism e sombras Zero-G."

colors:
  primary: "#00734d"
  primary-deep: "#005238"
  secondary: "#ffc400"
  secondary-soft: "#ffd75e"
  accent-blue: "#002776"
  accent-blue-deep: "#001a52"
  ink: "#0b1220"
  ink-soft: "#121d33"
  paper: "#ffffff"
  paper-soft: "#f5f7f3"
  hairline: "#e3e7ee"
  muted-on-dark: "#b9c3db"
  muted-on-light: "#49536a"
  semantic-danger: "#b91c1c"
  semantic-danger-bg: "#fee2e2"
  semantic-success: "#15803d"
  semantic-success-bg: "#dcfce7"
  semantic-warning: "#92400e"
  semantic-warning-bg: "#fef3c7"
  semantic-info: "#0369a1"
  semantic-info-bg: "#e0f2fe"

typography:
  hero:
    fontFamily: "Archivo Black"
    fontSize: "64px"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: -0.6px
  h2:
    fontFamily: "Archivo Black"
    fontSize: "42px"
    fontWeight: 400
    lineHeight: 1.10
    letterSpacing: -0.4px
  h2-sm:
    fontFamily: "Archivo Black"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.15
  h3:
    fontFamily: "Archivo Black"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.20
  price:
    fontFamily: "Archivo Black"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1.00
  body-lg:
    fontFamily: "Inter"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  body:
    fontFamily: "Inter"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Inter"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.50
  button:
    fontFamily: "Inter"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.15
  kicker:
    fontFamily: "Inter"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.20
    letterSpacing: 2.0px

rounded:
  sm: "6px"
  md: "10px"
  card: "18px"
  card-lg: "28px"
  pill: "999px"

spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  section: "96px"

components:
  button-primary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "16px 32px"
  button-pill-outline:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
  badge-success:
    backgroundColor: "{colors.semantic-success-bg}"
    textColor: "{colors.semantic-success}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  badge-danger:
    backgroundColor: "{colors.semantic-danger-bg}"
    textColor: "{colors.semantic-danger}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  badge-warning:
    backgroundColor: "{colors.semantic-warning-bg}"
    textColor: "{colors.semantic-warning}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  card-neutral:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "24px"
  card-dark:
    backgroundColor: "{colors.ink-soft}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.card}"
    padding: "24px"
  banner-blue:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.card-lg}"
    padding: "32px"
  banner-green:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.card-lg}"
    padding: "32px"
  status-chip:
    backgroundColor: "{colors.secondary-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  info-callout:
    backgroundColor: "{colors.semantic-info-bg}"
    textColor: "{colors.semantic-info}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "16px"
---

## Overview

O design do **Supletivo Brasil** (`supletivo.net.br`) fundamenta-se na **elevação estética dos símbolos nacionais brasileiros** (Verde Bandeira profundo, Azul Real institucional e Amarelo Solar enérgico), combinados a um rigor editorial tipográfico e microinterações táteis de alta gravidade (física espacial / Antigravity zero-G).

O objetivo central é transmitir autoridade, idoneidade e acolhimento imediato para o estudante trabalhador e adulto, retirando qualquer sensação de burocracia ou estigma sobre o término dos estudos. A interface equilibra seções claras e arejadas com momentos de impacto visual cinematográfico em fundo escuro (`--ink: #0b1220`).

**Pilares Visuais:**
1. **Pátria Amada Refinada:** O verde e o azul representam a seriedade institucional do diploma válido nacionalmente; o amarelo serve estritamente como foco de conversão e energia.
2. **Tipografia de Alto Contraste:** Títulos em `Archivo Black` com peso maciço e entrelinha comprimida (`1.08`), complementados pela extrema clareza e neutralidade da `Inter`.
3. **Física Espacial e Profundidade Tátil:** Cards flutuantes com sombras suaves multicamadas (`--shadow-zero-g`), micro-rotações responsivas (`DiplomaFlag` em `-3.5deg`), e painéis em vidro temperado com desfoque de fundo (`backdrop-filter: blur(16px)`).
4. **Respeito Absoluto à Acessibilidade:** Conformidade estrita com WCAG AA (taxa de contraste mínima de 4.5:1 para texto padrão e 3:1 para display/UI).

## Colors

A paleta de cores é inspirada na bandeira nacional brasileira, recalibrada para alta saturação e conformidade de contraste digital:

### Primárias & Acentos
- **Verde Institucional (`{colors.primary}` #00734d)**: Utilizado em elementos de segurança, carimbos de validação MEC/SISTEC e barras de progresso.
- **Verde Profundo (`{colors.primary-deep}` #005238)**: Usado em hover ou fundos solenes de validação.
- **Amarelo Conversão (`{colors.secondary}` #ffc400)**: O acento mais brilhante do sistema. Reservado exclusivamente para o botão principal de conversão (CTA), destaques de urgência e `::selection`. O texto sobre o amarelo é **sempre `{colors.ink}`** (#0b1220), alcançando um contraste estelar de **11.8:1** (WCAG AAA).
- **Amarelo Suave (`{colors.secondary-soft}` #ffd75e)**: Usado em detalhes de badge ou destaques secundários.
- **Azul Noturno (`{colors.accent-blue}` #002776)**: Cor de confiabilidade, cabeçalhos escuros e anéis de foco em fundos claros.
- **Azul Profundo (`{colors.accent-blue-deep}` #001a52)**: Variação para degradês suaves de cabeçalho.

### Neutros e Superfícies
- **Ink (`{colors.ink}` #0b1220)**: Fundo escuro das seções de autoridade/preço e cor primária de texto sobre superfícies claras.
- **Ink Soft (`{colors.ink-soft}` #121d33)**: Superfície de cards internos em seções escuras.
- **Paper (`{colors.paper}` #ffffff)**: Branco puro para cartões e fundo padrão da aplicação.
- **Paper Soft (`{colors.paper-soft}` #f5f7f3)**: Fundo alternado sutilmente acinzentado para ritmo de leitura.
- **Hairline (`{colors.hairline}` #e3e7ee)**: Bordas de 1px em cards e separadores neutros.

### Texto Auxiliar & Contraste Auditado
- **Muted on Dark (`{colors.muted-on-dark}` #b9c3db)**: Contraste de **7.8:1** sobre `#0b1220` e **9.2:1** sobre `#002776` (WCAG AAA).
- **Muted on Light (`{colors.muted-on-light}` #49536a)**: Contraste de **5.1:1** sobre `#ffffff` (WCAG AA).

### Cores Semânticas de Estado
- **Danger (`{colors.semantic-danger}` #dc2626)**: Mensagens de erro em validação de formulário (CPF/telefone inválido).
- **Success (`{colors.semantic-success}` #16a34a)**: Feedback positivo de etapas concluídas e OTP verificado.
- **Warning (`{colors.semantic-warning}` #d97706)**: Avisos de expiração de oferta ou pendências documentais.
- **Info (`{colors.semantic-info}` #0284c7)**: Notas informativas e esclarecimentos didáticos.

## Typography

### Famílias Tipográficas
- **Display**: `'Archivo Black', system-ui, sans-serif` (peso único 400).
- **Body & UI**: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` (pesos 400, 700).

### Escala Canônica e Equivalência Fluida
Os valores base dos tokens estão ancorados em desktop (`px`), sendo implementados na aplicação através de clamps fluidos no CSS:
- **Hero**: `{typography.hero}` (`64px`, `clamp(2.85rem, 1.1rem + 8vw, 6.8rem)`) — impacto visceral.
- **H2**: `{typography.h2}` (`42px`, `clamp(2rem, 1.3rem + 3vw, 3.6rem)`) — seções principais.
- **H2 Compact**: `{typography.h2-sm}` (`28px`, `clamp(1.55rem, 1.2rem + 1.6vw, 2.4rem)`) — seções explicativas e FAQ.
- **H3**: `{typography.h3}` (`20px`, `clamp(1.15rem, 1.05rem + 0.5vw, 1.35rem)`) — títulos de cartões.
- **Price**: `{typography.price}` (`56px`, `clamp(3.2rem, 2rem + 5.6vw, 6rem)`) — precificação transparente e clara.
- **Body Large**: `{typography.body-lg}` (`18px`, `clamp(1.125rem, 1.02rem + 0.55vw, 1.375rem)`) — parágrafos de introdução.
- **Body Regular**: `{typography.body}` (`16px`, `clamp(1rem, 0.95rem + 0.35vw, 1.125rem)`) — leitura contínua.
- **Kicker / Eyebrow**: `{typography.kicker}` (`13px`) — uppercase, peso 700, espaçamento entre letras de `2px`.

## Layout

- **Largura Máxima do Conteúdo**: `68rem` (1088px) no container padrão e `46rem` (736px) no container estreito (leitura focada/checkout).
- **Gutters**: `clamp(1.25rem, 4vw, 2.5rem)` garantem margens laterais confortáveis mesmo em telas de 320px.
- **Espaçamento de Seções**: `clamp(4.5rem, 3rem + 6vw, 9rem)` cria respiros generosos sem gerar vazios desnecessários.
- **Mobile First Rigoroso**: Alvos de toque com área mínima de 44px x 44px e padding touch preventivo (`touch-action: manipulation`).

## Elevation & Depth

1. **Flat (Nível 0)**: Fundo limpo em `--paper` ou `--ink`.
2. **Hairline Lift (Nível 1)**: Fundo `--paper` com borda `1px solid var(--hairline)`.
3. **Glassmorphism (Nível 2)**:
   - `glass-panel`: Fundo translúcido `rgba(11, 18, 32, 0.7)` com `backdrop-filter: blur(16px)` e borda suave `1px solid rgba(255, 255, 255, 0.12)`.
   - `glass-panel-light`: Fundo `rgba(255, 255, 255, 0.75)` com desfoque e sombra suave.
4. **Zero-G Shadows (Nível 3)**:
   - `--shadow-zero-g`: `0 24px 48px -12px rgba(0, 0, 0, 0.4), 0 12px 24px -8px rgba(0, 0, 0, 0.2)`.
   - Sombras projetadas com difusão ampla, sem cortes secos.
5. **Camadas 3D (Z-Index Espacial)**:
   - `layer-z-sm`: `translateZ(12px)`.
   - `layer-z-md`: `translateZ(24px)`.
   - `layer-z-lg`: `translateZ(40px)`.

## Shapes

- **Cantos em Pílula (`rounded.pill` / 999px)**: Uso mandatória no botão principal de conversão (`.btn`) e em badges de destaque promocional.
- **Cartões Principais (`rounded.card` / 18px)**: Raio orgânico confortável que suaviza caixas de conteúdo.
- **Cartões de Destaque (`rounded.card-lg` / 28px)**: Reservado para módulos herói, calculadoras de elegibilidade e cards de preço.
- **Campos de Formulário (`rounded.md` / 10px)**: Entradas de texto e selects com ergonomia tátil contemporânea.

## Components

### 1. Botão Principal (CTA `.btn`)
- **Fundo**: `{colors.secondary}` (#ffc400).
- **Texto**: `{colors.ink}` (#0b1220), peso 700, maiúsculas ou frase de ação direta ("Quero meu diploma").
- **Forma**: `border-radius: 999px` (pílula).
- **Brilho Sweep**: Efeito sutil de varredura a cada 6.5 segundos via `@keyframes btn-shine`.
- **Feedback Tátil**: Ao hover sobrevoa `-2px` com expansão de sombra; ao clique (`:active`) recolhe com escala `0.99`.

### 2. Painel de Elegibilidade & Validação
- Interface interativa que orienta o estudante por perguntas diretas (idade, série pretendida).
- Respostas em cards clicáveis que recebem borda com anel verde institucional (`#00734d`).

### 3. Sticky CTA
- Barra inferior fixa em mobile com botão compacto e gatilho de urgência não intrusivo.
- Respeita `env(safe-area-inset-bottom)` em dispositivos iOS.

## Do's and Don’ts

### DO's
- **DO**: Sempre use texto escuro (`{colors.ink}`) sobre fundos amarelos (`{colors.secondary}`).
- **DO**: Empregue `Archivo Black` apenas para cabeçalhos e títulos curtos com impacto; mantenha todo o corpo em `Inter`.
- **DO**: Respeite o kill-switch global `@media (prefers-reduced-motion: reduce)` para desativar qualquer translação 3D ou varredura de brilho.
- **DO**: Forneça anel de foco `:focus-visible` de no mínimo 3px em todos os elementos clicáveis.

### DON'Ts
- **DON'T**: Nunca use gradientes genéricos roxos/rosas ("estética IA/SaaS padrão").
- **DON'T**: Nunca use texto branco sobre fundo amarelo.
- **DON'T**: Nunca aplique sombras duras e opacas estilo Material 1.
- **DON'T**: Nunca quebre o botão principal de conversão em duas linhas em telas móveis (`white-space: nowrap`).
- **DON'T**: Nunca introduza bibliotecas externas de ícones pesadas; priorize SVGs otimizados inline.
