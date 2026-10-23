# AI & Engineering Guidelines — `supletivo.net.br`

## 1. Design System Mandatório (`DESIGN.md`)
- **Fonte Canônica de Design**: Toda e qualquer decisão de interface, paleta de cores, tipografia, espaçamento, sombras, elevação e componentes **DEVE seguir estritamente as especificações de [`DESIGN.md`](./DESIGN.md)**.
- **Tokens no Código**: Todos os valores visuais devem usar os tokens definidos em `src/styles/tokens.css` e utilitários de `src/styles/global.css`.
  - **Proibido usar cores hexadecimais soltas ou variáveis ad-hoc no CSS/componentes.**
  - **Paleta Pátria Amada Refinada**: `--green` (`#00734d`), `--blue` (`#002776`), `--yellow` (`#ffc400`), `--ink` (`#0b1220`), `--paper` (`#ffffff`).
  - **Feedback Semântico**: `--danger` (`#b91c1c`), `--success` (`#15803d`), `--warning` (`#92400e`), `--info` (`#0369a1`) e respectivos fundos.
  - **Tipografia**: `Archivo Black` exclusivamente para display/títulos/números de impacto; `Inter` para todo o corpo e formulários. Escala com `clamp()` fluido.
  - **Ergonomia Touch Mobile**: `--input-height: 48px`, `--input-radius: 10px`, `-webkit-tap-highlight-color: transparent`.
  - **Botões `.btn`**: Fundo amarelo, texto escuro `--ink`, formato pílula (`999px`), `white-space: nowrap` e animação `btn-shine` a cada 6.5s.
  - **Física Espacial (Antigravity Zero-G)**: Sombras multicamadas sem corte seco (`--shadow-zero-g`), painéis translúcidos (`glass-panel`) e kill-switch obrigatório para `prefers-reduced-motion` e dispositivos touch.

---

## 2. Modelo de Negócio e Fronteiras da Plataforma
- **`supletivo.net.br` (Repositório Pivô / Astro)**:
  - Landing page B2C para captação de alunos.
  - Foco: quebra de objeções, autoridade de diploma válido MEC, cálculo de elegibilidade e captura rápida de lead (Sofia Omnibar + WhatsApp + CPF) direcionando para matrícula.
- **`promotor.supletivo.net.br`**:
  - Landing page B2B/B2P para captação de afiliados, consultores educacionais e polos.
- **`app.supletivo.net.br` (Svelte 5 / SvelteKit / React Islands)**:
  - Plataforma única multi-role orientada a estado (um usuário pode alternar papéis: Aluno, Promotor, Coordenador de Polo).
  - **Navegação Canônica Adaptativa**: Utiliza obrigatoriamente a arquitetura de Tabs de Status Superiores (`Tabs` / `RoleStatusTabs`) + Dock Adaptativo Inferior (`RoleAdaptiveNavDock` / `FloatingDock`), mapeando dinamicamente papéis e status operacionais com zero colisão de rodapé (especificado em `app.supletivo.net.br/docs/skills/role-status-dock.md`).
  - **IMPORTANTE — O aluno NÃO estuda na nossa plataforma**: Nossa plataforma é o motor de captação, pagamento, conferência de documentos e matrícula. Ao matricular e aprovar os documentos, o aluno é **oficialmente redirecionado para o ambiente virtual do parceiro educacional credenciado**.
- **`*.v7m.live` (Infraestrutura, Ferramentas Públicas e Oráculo de Versão)**:
  - Todo micro-serviço, utilitário de desenvolvedor, dashboard técnico ou serviço de infraestrutura que precisar ser público **DEVE obrigatoriamente utilizar o domínio `*.v7m.live`** (tendo `version.v7m.live` como serviço pioneiro).
  - Os domínios `*.supletivo.net.br` são estritamente reservados aos produtos de negócio e usuário final.

---

## 3. Governança, Soberania e Versionamento
- **Soberania Exclusiva do Usuário**:
  - Apenas o usuário valida, homologa ou aprova código, layout, arquitetura ou entregas.
  - Linters, testes e builds são obrigações técnicas, jamais validação de entrega. É proibido ao agente autodeclarar trabalho como "validado".
- **Isolamento de Repositório**:
  - Altere apenas o repositório escopo da sessão. Proibido criar, editar ou excluir arquivos em outros diretórios.
- **Oráculo Central e Versionamento SemVer Único da Plataforma**:
  - A versão da plataforma é única (Release Train) e centralizada em `version.v7m.live`.
  - Toda entrega enviada ao Git em qualquer repositório DEVE incrementar a versão global da plataforma:
    - Padrão: `feat(modulo): [v0.0.0-sandbox.X] descrição em inglês` (ou `fix:`, `refactor:`, `docs:`).
    - `Z` (Patch/Sandbox): O agente incrementa a cada entrega consumindo o oráculo.
    - `Y` (Minor) e transição para `0.0.1beta`: Exclusivo do usuário.
    - `X` (Major): Decisão conjunta prévia.
  - Consulta pública e auditoria via `https://version.v7m.live/api/version`.

---

## 4. Marca, Nomenclatura e Rotas
- **Consolidação de Marca**: Use exclusivamente **Supletivo.net.br** / **Supletivo Brasil**.
- **Linguagem**:
  - **Código (100% Inglês)**: Variáveis, funções, schemas, endpoints backend (`/api/v1/...`) e mensagens de commit.
  - **Interface e Rotas (100% PT-BR)**: Textos visíveis, formulários e notificações em português do Brasil. Rotas: `/autenticacao/login`, `/autenticacao/otp`, `/registro/contato`, `/registro/cpf`, `/painel`, `/matricula`, `/documentos`.

---

## 5. Infraestrutura de Borda (Cloudflare-First)
- **Frontend / SPAs / Landing Pages**: Cloudflare Pages / Workers Static Assets.
- **APIs de Borda, Auth e Proxies**: Cloudflare Workers.
- **Dados Relacionais Leves**: Cloudflare D1.
- **Storage / Uploads / Documentos**: Cloudflare R2 (Zero Egress).
- **Filas e Configurações**: Cloudflare Queues e Workers KV.
- **Proteção e IA Leve**: Turnstile, Workers AI e Vectorize.

---

## 6. Arquitetura de Componentes, Seções e Fontes (Padrão AstroWind)
- **Gestão de Fontes Nativa (Astro Fonts API)**:
  - Fontes são gerenciadas nativamente pelo Astro no `astro.config.mjs` usando `fontProviders.fontsource()` para `Inter` (400, 700) e `Archivo Black` (400).
  - Preloading e fallbacks métricos ajustados são injetados pelo componente `<Font cssVariable="..." preload />` de `astro:assets` em `src/layouts/Base.astro`.
  - Zero declarações `@font-face` manuais ou chamadas externas ao Google Fonts.
- **Padrão de Seções e Widgets**:
  - Toda seção deve utilizar o envelope padrão `src/components/ui/WidgetWrapper.astro` para controle de id de âncora, dark/light mode (`isDark`), slot de background (`bg`) e padding responsivo (`py-[clamp(3.5rem,5vw,6.5rem)]`).
  - Títulos de seção utilizam `src/components/ui/Headline.astro` com `tagline` (kicker), `title` (`Archivo Black`) e `subtitle` (`Inter`).
  - Botões utilizam `src/components/ui/Button.astro` ou tokens canônicos do `DESIGN.md`.
  - Contratos de interfaces e tipagem de seções residem em `src/types.d.ts` (`Widget`, `Headline`, `Item`, `CallToAction`).
  - Import path alias padronizado: `~/` aponta para `src/` (ex: `import WidgetWrapper from '~/components/ui/WidgetWrapper.astro'`).
