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
- **`app.supletivo.net.br` (Svelte 5 / SvelteKit)**:
  - Plataforma única multi-role orientada a estado (um usuário pode alternar papéis: Aluno, Promotor, Coordenador de Polo).
  - **IMPORTANTE — O aluno NÃO estuda na nossa plataforma**: Nossa plataforma é o motor de captação, pagamento, conferência de documentos e matrícula. Ao matricular e aprovar os documentos, o aluno é **oficialmente redirecionado para o ambiente virtual do parceiro educacional credenciado**.

---

## 3. Governança, Soberania e Versionamento
- **Soberania Exclusiva do Usuário**:
  - Apenas o usuário valida, homologa ou aprova código, layout, arquitetura ou entregas.
  - Linters, testes e builds são obrigações técnicas, jamais validação de entrega. É proibido ao agente autodeclarar trabalho como "validado".
- **Isolamento de Repositório**:
  - Altere apenas o repositório escopo da sessão. Proibido criar, editar ou excluir arquivos em outros diretórios.
- **Versionamento SemVer a Cada Commit**:
  - Toda entrega enviada ao Git DEVE citar a versão incrementada:
    - Padrão: `feat(modulo): [v0.0.0-sandbox.X] descrição em inglês` (ou `fix:`, `refactor:`, `docs:`).
    - `Z` (Patch/Sandbox): O agente incrementa a cada entrega.
    - `Y` (Minor) e transição para `0.0.1beta`: Exclusivo do usuário.
    - `X` (Major): Decisão conjunta prévia.
  - Consulta pública via `version.v7m.live`.

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
