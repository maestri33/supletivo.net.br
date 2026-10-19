# Evidências para o plano de produção — 09/10/2026

Este documento registra observações da análise nesta conversa. Não é uma homologação nem uma instrução de execução. O trabalho atual consiste em planejar; não alterar o produto, publicar, incrementar versão ou enviar commits.

## Escopo e regras

- Repositório: `C:\rep\supletivo.net.br`, GitHub `maestri33/supletivo.net.br`.
- Respeitar `AGENTS.md` e `DESIGN.md`. Código e commits em inglês; experiência e rotas PT-BR.
- Alterações futuras no app, backend, preços e oráculo são dependências externas. Não editar outros repositórios.
- Somente o usuário homologa. Testes, lint e build constituem evidências técnicas.
- Não enviar OTP, leads, pagamentos ou dados pessoais em testes de produção.
- Relatórios de planejamento podem ser escritos exclusivamente em `docs/plans/production/` neste repositório.

## GitHub e publicação

- Checkout limpo antes dos relatórios, `main`, SHA `ec2006367140973d6e289d9541815e0d9766a20a`.
- `package.json`: versão `0.0.0-sandbox.56`.
- GitHub estava no mesmo SHA; consulta de PRs retornou lista vazia.
- CI 36748610674 e deploy 36749616445 reportaram sucesso.
- Nos jobs de deploy consultados, a etapa Cloudflare e a sincronização do oráculo foram puladas por ausência de `CLOUDFLARE_API_TOKEN`; o aviso não reprova o job.
- `deploy.yml` faz checkout sem fixar o SHA do workflow CI disparador e reconstrói o site, em vez de publicar o artefato testado.
- Atualização do oráculo é posterior ao deploy e usa `curl ... || true`, tolerando falha.
- Worker: `landing-supletivo-net-br`, assets `dist`, `run_worker_first`, rotas apex e www.

## Produção observada

- Apex HTTP 200, footer `0.0.0-sandbox.50`, inclusive em consulta com cache-buster.
- HTML inicial contém Pix R$ 1.800; depois do carregamento o navegador usa preço edge de 12x R$ 137,50 / Pix R$ 1.650.
- App HTTP 200 na tela de login, footer `.59`.
- Oráculo público `/api/version`: `.59`, última atualização 06/10/2026. Essa resposta não demonstrou o SHA realmente servido pela landing.
- API backend sem ref: Pix R$ 1.615, 12x R$ 134,58, total informado R$ 1.615.
- API db-edge sem ref: Pix R$ 1.650, 12x R$ 137,50, total R$ 1.650.
- APIs retornam campos promocionais mesmo quando `has_discount` é falso.
- Ref exemplo `84be099b-502e-4b38-8b47-83fc94aedfdc` foi redirecionado e renderizou promoção 12x R$ 99 / Pix R$ 999. Isso demonstra apenas esse percurso observado.
- Os preços canônicos e a autoridade da promoção precisam de decisão/contrato. Não escolher automaticamente entre as fontes.
- Valores parcelados exigem tolerância de arredondamento: 12 × 134,58 = 1.614,96.

## Verificações técnicas já executadas

- 47 testes unitários passaram; build Astro gerou 8 rotas; `tsc --noEmit` passou.
- 33 testes E2E passaram com CI=1 e porta 4322; primeira tentativa usou servidor alheio em 4321 devido a `reuseExistingServer`.
- `astro check` não efetua a verificação real porque `@astrojs/check` está ausente, embora o script/workflow possa terminar verde.
- Esses resultados não demonstram disponibilidade do funil real, autenticação, matrícula ou pagamentos em produção.

## Pontos a confirmar nos arquivos

- `LeadCaptureModal.astro`: PII em cookie JS `supletivo.session` compartilhado nos subdomínios, sem Secure; PII em query OTP; telefone em dataLayer.
- Falhas de `checkAuth` retornam null e podem seguir como cadastro novo/sucesso; há risco de respostas atrasadas após fechar/editar e de envio automático de email incompleto.
- Ausência de trap/restauração de foco e controle do fundo no modal.
- CPF pode revelar nome/email antes de prova por OTP; confirmar contrato e limites no backend, sem probes com CPF real.
- Política de privacidade descreve coleta apenas no app e não cobre todos os cookies/fluxos atuais da landing.
- Preços duplicados em build e runtime; ref arbitrário pode habilitar fallback promocional; schema/meta/CTA podem não acompanhar preço exibido.
- Eventos de CTA duplicados entre `main.ts` e `lead-capture.ts`.
- Fallback de rota desconhecida pode virar ref; cobertura usa mock 404 de assets e requer teste Worker real.
- Cookie de atribuição: limites/sanitização/domínio e comportamento Set-Cookie + cache a investigar.
- Cores fora dos tokens, loops CSS em touch, sitemap com páginas noindex e lastmod gerado a cada build.

## Relatórios esperados

1. `funnel-security-pricing.md`: funil, dados pessoais, atribuição, preços, estados e contratos externos.
2. `design-accessibility-seo.md`: design, mobile, acessibilidade, SEO e conteúdo.
3. `release-production.md`: CI, GitHub, Cloudflare, versionamento, identidade da entrega, smoke e rollback.
4. `production-correction-plan.md`: consolidação pelo coordenador, dependências, ondas e critérios de conclusão.
