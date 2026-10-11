# Realidade operacional e plano de recuperação — 11/10/2026

Este documento registra o estado observado durante a recuperação da plataforma Supletivo Brasil. Ele separa publicação, teste automatizado, homologação humana e evidência de produção. Um teste local ou um HTTP 200 isolado não é tratado como validação de negócio.

## Snapshot

| Área | Estado observado | Evidência | Próximo bloqueio |
|---|---|---|---|
| `app.supletivo.net.br` | **PUBLICADO `.64`** | Worker `23a943d8-5d59-4c6c-a2c1-1bf1137c67da`; resposta pública 200 | Homologação autenticada dos fluxos completos |
| `backend.supletivo.net.br` | **PUBLICADO `.62`** | `/api/v1/health/healthz` respondeu 200, banco conectado e sem migrações pendentes | Promoção controlada do backend e teste de OCR real |
| Notify edge | **PUBLICADO** | Rotas `notify.supletivo.net.br` e `notify.v7m.live`; D1 conectado | Provar entrega/reprocessamento de webhook em produção |
| Admin | **EXISTENTE, não homologado integralmente** | Código e rotas operacionais presentes | Conferir preços, documentos, financeiro, estornos e permissões |
| Pagamentos | **CANÁRIOS EXECUTADOS** | Pix Asaas de R$ 0,01 e checkout InfinitePay de R$ 1,01 pagos | Conferir reconciliação, comissão, chargeback e fechamento |
| Infraestrutura | **HÍBRIDA DEFINIDA** | Azure para backend/PostgreSQL; Cloudflare para borda, D1 e R2 | Registrar artefatos, versões, rollback e observabilidade |

## O que foi implementado

### Aplicação multi-role

- Login universal por telefone e OTP, com destino definido pelo estado retornado pelo backend.
- Guards de rota para aluno, promotor e polo, incluindo estados suspenso, candidato, ativo e desconhecido.
- Tabs superiores de status e dock adaptativo inferior, seguindo o Design System canônico.
- Compatibilidade das rotas legadas com redirecionamento para as rotas canônicas.
- Painéis de candidato/promotor com link de indicação imediato, Pix, escolaridade, termo, selfie e acompanhamento de status.

### Documentos do aluno e do candidato-promotor

- Validação inicial no navegador para arquivo vazio, tipo, tamanho e formato.
- Classificação anterior ao upload pelo endpoint do backend.
- Bloqueio de documento incompatível com a etapa selecionada.
- Upload assíncrono sem transformar `pending` em aprovado.
- Polling até estado terminal (`approved`, `rejected`, `review` ou `needs_kinship`).
- Extração de endereço e titular retornada pelo backend quando disponível.
- Persistência de campos extraídos somente nos campos vazios.
- Testes do fluxo de candidato-promotor para documento errado, análise pendente e rejeição.

### Regras comerciais registradas

- Sem referência válida: Pix R$ 1.615 ou 12× R$ 159,90.
- Com referência válida: Pix R$ 999 ou 12× R$ 99.
- Preços exibidos pelo frontend vêm do backend.
- Alterações de preço valem somente para novas propostas; propostas existentes preservam o snapshot.
- Promotor: R$ 100 por matrícula paga e bônus único de R$ 500 ao atingir cinco matrículas no período de sexta 18h a sexta 18h.
- Candidato pode indicar imediatamente; saldo fica acumulado até se tornar ativo.
- Coordenador: R$ 50 pela entrega do diploma, no fechamento semanal.
- Chargeback cancela pendências e desconta valores já pagos nos próximos repasses.

### Pagamentos e parceiro educacional

- InfinitePay é o provedor de cartão.
- Asaas é usado para Pix, taxas do parceiro e repasses.
- O coordenador informa Pix/QR do parceiro; a plataforma paga ou agenda pelo Asaas.
- O parceiro atual é acessado em `https://cbi.sistemasiga.net/login`.
- A matrícula no parceiro ainda é manual; login e senha recebidos são registrados no nosso sistema.
- Prova, resultado, documentos do diploma e foto da entrega continuam sob responsabilidade do polo.

## O que foi realmente testado

- Frontend: `astro check` sem erros, TypeScript sem erros, testes unitários passando.
- Frontend E2E: 14 testes passaram no conjunto de rotas e fluxo de candidato/promotor.
- Backend: 26 testes focados de upload, validação documental e ativação passaram.
- Produção: app público respondeu 200 na versão `.64`; backend respondeu health 200 na versão `.62`.
- Pagamentos: os dois canários do proprietário foram pagos.

Esses resultados não substituem a homologação humana com uma conta autenticada e um documento real. O OCR, a análise visual, a biometria, o webhook e o fechamento financeiro ainda precisam de evidência no ambiente vivo.

## Pendências que impedem declarar a plataforma pronta

1. Promover o backend por um procedimento controlado, com imagem/digest, manifesto de build, smoke test e rollback. O procedimento operacional atual da VM é read-only e o repositório não possui um pipeline versionado de promoção do backend.
2. Executar um fluxo autenticado real de aluno: pagamento, RG/CNH, comprovante, OCR, endereço, selfie, aprovação do polo e liberação.
3. Executar o mesmo fluxo para candidato-promotor, incluindo ativação automática e comissão acumulada.
4. Confirmar que o worker de tarefas consome a análise documental e que uma falha de IA termina em `review`, sem prender o usuário em `pending`.
5. Homologar o painel admin: preço, proposta, fila de documentos, saldo Asaas, comissão, fechamento, estorno e chargeback.
6. Provar os webhooks Asaas e InfinitePay com persistência idempotente, retry e reconciliação visível.
7. Testar a operação do polo até a matrícula no parceiro, taxas, credenciais e entrega do diploma.
8. Publicar monitoramento de erro, fila, worker, banco, webhook e divergência de versão.

## Critério de encerramento

Uma área só pode ser marcada como pronta quando houver:

- versão e artefato identificados;
- teste automatizado correspondente;
- teste autenticado no ambiente vivo;
- evidência persistida do estado final no banco;
- rollback conhecido;
- homologação do usuário.

Até esses critérios serem satisfeitos, o status correto é **em recuperação**, mesmo que a tela carregue e os testes locais passem.

## Issues de acompanhamento

As issues criadas em `app.supletivo.net.br`, `backend.supletivo.net.br`, `notify.supletivo.net.br`, `admin.supletivo.net.br` e neste repositório dividem essas pendências por responsabilidade. Cada issue deve ser encerrada apenas com a evidência descrita no próprio texto.

