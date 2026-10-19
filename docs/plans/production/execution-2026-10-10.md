# Execução da recuperação de produção — 10/10/2026

## Autorização e escopo

O usuário autorizou executar as correções necessárias no ecossistema Supletivo: “faça o necessário... eu estou aqui também”. Cartão usa InfinitePay; Pix, taxas do parceiro e repasses usam Asaas. Esta fase sucede a auditoria documental; suas constatações não constituem homologação.

Azure mantém os bancos principais. Serviços de borda usam D1 diretamente quando precisam persistir dados na borda. Cloudflare utiliza apenas os produtos já contratados, respeitando franquias e consumo.

Branches de recuperação nos repositórios supletivo, backend, app, admin e notify: `codex/production-recovery-20261010`. Alterações locais anteriores foram preservadas. Nenhum commit ou push foi realizado. O usuário autorizou posteriormente testes financeiros reais com valores pequenos, incluindo Pix de R$0,01 para seu próprio CPF; essa autorização e seus resultados estão registrados abaixo.

## Controle da execução

| Frente | Estado | Evidência / pendência |
| --- | --- | --- |
| Preços, atribuição e admin | Em execução | Valores definidos pelo usuário; preservar proposta e cobrança emitidas |
| Candidato e ativação | Em execução | Indicação imediata, cadastro gratuito, aprovação dos requisitos sem LMS |
| Financeiro | Em execução | Corrigir semana sexta 18h → sexta 18h, retenção de candidato e estornos |
| InfinitePay / Asaas | Três testes reais concluídos | Saída Pix R$0,01 e recebimentos Pix e cartão confirmados; parcela de taxas e jornada de matrícula ainda pendentes |
| Agendamentos e tarefas duráveis | Em execução | Cron aponta ao domínio errado; backend executa tarefas em threads |
| Notify | Em execução | Suite de borda: 56 testes passaram no baseline; fontes locais diferem da produção |
| Matrícula, parceiro e mídia privada | Pendente | Revisar taxas, acesso aos anexos, prova, documentos e entrega |
| Release integrada | Pendente | Testes, restore, manifesto de fontes/imagens e homologação do usuário |

Três agentes foram iniciados para problemas independentes. Todos foram interrompidos por limite de créditos antes de entregar correções; a execução continua sequencialmente no agente principal. O resultado de testes no baseline não implica conclusão das correções.

## Critérios financeiros vinculantes

- Semana em America/Sao_Paulo: sexta às 18h inclusive até a sexta seguinte às 18h exclusive.
- R$100 por matrícula paga e um único bônus de R$500 por semana ao atingir cinco matrículas válidas.
- Candidato acumula; somente ativo no instante do fechamento pode receber. Ativação posterior aguarda o fechamento seguinte.
- Valores e bônus retidos mantêm a semana original.
- Estorno cancela pendências, recalcula o bônus da semana original e desconta valores pagos nos próximos repasses, sem descontar o preço integral do aluno.
- Matrícula já efetivada no parceiro requer revisão do admin antes de suspensão; o coordenador executa as ações no parceiro.
- Pagamento agendado não pode ser enviado antes da data; reconciliação de pagamento já enviado deve continuar.

## Registro técnico

Os comandos e resultados relevantes serão registrados à medida que cada correção atravessar teste que reproduz a falha e teste após a correção. Não há homologação automática.

## Teste real Asaas e correções de autenticação

- A nova credencial de produção fornecida pelo titular foi armazenada em `PlatformSetting`, como segredo. Seu conteúdo não integra documentos, arquivos de código ou logs desta execução.
- Saldo consultado com a chave nova: R$7,99 antes do teste e R$7,98 depois do Pix concluído.
- Uma falha na leitura das configurações dentro de contexto assíncrono fazia o cliente usar a chave antiga do ambiente. Um teste reproduziu o problema e passou após a correção de `core/system_config.py`.
- O webhook de eventos existente `cfcd4363-1a41-440f-b6e5-9022a89bb4fe` foi corrigido para `https://backend.supletivo.net.br/integrations/asaas/webhook/`, habilitado e retomado. Um token novo de 64 caracteres foi configurado no provedor e no backend, sem exposição no registro.
- A validação de saques utiliza a credencial independente `ASAAS_TRANSFER_VALIDATION_SECRET`. O usuário confirmou ter salvo a URL `https://backend.supletivo.net.br/integrations/asaas/transfer-validation/` e seu token no painel Asaas. Solicitação sem token retorna 401; operação desconhecida com token correto retorna `REFUSED`.
- Foram aplicadas correções pontuais em quatro arquivos no contêiner backend, com verificação do conteúdo original, backup, compilação e recarga do Gunicorn. Esses arquivos também foram preservados na fonte de reconstrução do servidor. A imagem derivada foi construída e seus quatro arquivos conferidos por SHA256; não se trata de uma publicação de todas as alterações locais.

### Única comissão manual do titular — R$0,01

Comissão: `2a6731d6-bc0e-4dbb-b2a1-b32180d2cfd1`. A mesma comissão foi reaproveitada entre tentativas; não foram criadas comissões duplicadas ou processada a fila global de pagamentos.

| Referência | Resultado |
| --- | --- |
| `owner_canary_20261010_cent_commission_01` | Falhou com 401; nenhuma transferência bancária criada |
| `owner_canary_20261010_cent_commission_01_r2` | Asaas aceitou, depois recusou a autorização externa; sem data de efetivação. Consultada no provedor antes da nova tentativa |
| `owner_canary_20261010_cent_commission_01_r3` | Asaas `DONE`, R$0,01, tarifa R$0,00, efetivado em 10/10/2026 às 13:43:36 em São Paulo |

O callback de validação real respondeu 200 às 13:43:32. O evento real `TRANSFER_DONE` chegou às 13:43:38, foi aplicado e deixou o registro Asaas como `PAID`. A reconciliação pontual desse pedido deixou `PaymentRequest` e a comissão como `paid`. Esse passo foi acionado explicitamente nesta execução: o fechamento e o processamento automático semanal ainda precisam de correção e teste próprios.

### Emissão de cobranças de recebimento

- Pix de R$0,01: QR real `V7MEMPRE00000719250512ASA`, referência `owner_canary_20261010_pix_receivable_cent_01`. Reemissão reaproveitou o mesmo registro. Após pagamento pelo titular, o evento real `PAYMENT_RECEIVED` chegou às 13:53:49 em São Paulo e foi aplicado; registro local `PAID`. Consulta do provedor encontrou `pay_gi3lotkqidhx89vm`, `RECEIVED`, valor R$0,01 e líquido R$0,01.
- O Asaas recusou uma descrição maior que 37 caracteres. Dois testes reproduziram a falha; o envio agora limita somente a descrição ao comprimento aceito, preservando valor e referência integral.
- InfinitePay recusou um link com preço de um centavo. O checkout de R$1,01 foi emitido, pedido `bc2af3b2-7e1e-4479-ba89-f26823eb6838`, callback `https://webhooks.v7m.live/bank/infinitepay?order_nsu=bc2af3b2-7e1e-4479-ba89-f26823eb6838`. O titular pagou com cartão e o evento real foi aplicado às 13:51:58. Consulta independente de `payment_check` confirmou `success=true`, `paid=true`, `capture_method=credit_card`, uma parcela, valor base 101 centavos e valor pago 107 centavos. Registro local `PAID`.
- A diferença de R$0,06 no cartão foi apresentada ao titular: o provedor cobrou acima do preço base enviado. O usuário respondeu que encontrou as configurações e instruiu manter como está e prosseguir. Nenhuma configuração de taxas da InfinitePay foi alterada nesta execução. Preço base da proposta e total efetivamente pago devem continuar distinguíveis. O teste de uma parcela não comprova a tabela em 12 parcelas.
- As instruções foram entregues ao usuário em arquivo local de acesso restrito e excluído do Git. Os dois pagamentos foram realizados por ele; os recebimentos foram confirmados por eventos reais e consultas aos provedores. Não foi criado evento financeiro artificial.
- Os testes isolados não alteraram preços comerciais públicos, não matricularam aluno no parceiro e não comprovam o fluxo completo de matrícula.

### Testes locais

Na primeira correção pontual, sessenta testes selecionados passaram: autenticação dos callbacks, configuração assíncrona, emissão e reuso do QR, integração Asaas com adaptadores simulados, regras de comissão e estorno, fechamento semanal, retenção de candidatos e ações financeiras. As regras semanais então permaneciam locais; sua publicação posterior está registrada abaixo. A suite completa do backend ainda não foi executada.

Configuração comercial conferida na produção após os testes: comissão direta R$100, bônus R$500, meta cinco matrículas, fechamento sexta às 18h. A comissão do coordenador estava em R$25 e foi ajustada para R$50 conforme instrução do titular; valores já registrados não foram recalculados.

### Imagem pontual de recuperação

- Base preservada: `sha256:f493ed67d4244dd40a1b48abdc6e9a5f4c6799cf8c59b0ad8f1ea50627580423`, também etiquetada `v7m-backend:before-asaas-recovery-20261010` para rollback.
- Imagem construída: `v7m-backend:asaas-recovery-20261010`, `sha256:34187ece9096df6a5f8a49b37c35f3294c66c828603fdccee4edeb5030b862da`.
- Contexto restrito: `/opt/v7m-platform/releases/asaas-recovery-20261010`, apenas quatro fontes sobre a imagem anterior, sem configuração secreta. Manifesto e backups do código original preservados nesse diretório.
- Os arquivos de reconstrução em `/opt/v7m-platform/backend.supletivo.net.br` foram corrigidos com verificação do conteúdo anterior. Não foi reconstruído nem publicado o conjunto de alterações preexistentes e independentes do checkout do servidor.
- A fonte antiga de `static_qr.py` ainda fabricava um QR de fallback quando o provedor falhava. Foi preservada a versão efetiva do contêiner, que recusa falhas e respostas incompletas, somada à correção do limite da descrição.
- Somente `backend-web` foi recriado, usando a imagem construída acima. Uma primeira checagem incorreta em `/health`, com User-Agent bloqueado pela Cloudflare, acionou rollback automático; a checagem foi corrigida para `/api/v1/health/healthz` e a implantação repetida.
- A inicialização após a recriação demorou; o servidor apresenta swap em uso e limitações de memória já identificadas. Não se considera essa capacidade suficiente para o lançamento sem a frente de infraestrutura.
- Verificação após inicialização: saúde interna e pública HTTP200, `db=true`, `migrations_pending=0`; consulta Asaas em processo novo com cache frio funcionou e retornou saldo R$7,99; callback autenticado de operação desconhecida retornou `REFUSED`, callback sem token retornou 401. Os registros de saída Pix, comissão, solicitação de repasse, recebimento Pix e checkout de cartão continuaram pagos.
- A imagem é local no servidor; a publicação da versão global, o commit das correções e a release integrada continuam pendentes. O checkout do servidor preserva mudanças anteriores alheias a esta correção, que não foram incluídas na imagem derivada.

## Publicação financeira e ensaio de restauração

- Imagem publicada: `v7m-backend:financial-recovery-20261010`, SHA256 `b081a0246140ed1dfc4b0cb1e9656ffd5ab539ec83a509e3010be4dbe736c969`. Base anterior preservada em `v7m-backend:before-financial-recovery-20261010`.
- Dezoito fontes selecionadas, manifesto e conteúdo anterior preservados em `/opt/v7m-platform/releases/financial-recovery-20261010`. No serviço de leads, apenas a função de estorno foi transplantada para preservar o funil efetivo.
- Migrações `finance.0008_commission_reversals_and_bonus_period` e `users.0042_promoter_activated_at` aplicadas. O campo de ativação conserva default também no PostgreSQL para permitir rollback compatível com inserções da versão anterior.
- Noventa e dois testes financeiros selecionados passaram. Incluem retenção de candidatos, semana original do bônus, compensação de valores pagos, estorno durante envio/reconciliação, falha de repasse, reconciliação Asaas sem reenvio incerto e débito limitado à comissão e ao bônus afetado.
- O pedido é marcado como enviado antes da chamada bancária, protegendo seu valor contra alteração durante o envio. Uma falha entre esse registro e a criação da intenção bancária ainda pode exigir revisão operacional; não autoriza reenvio automático.
- Depois da publicação: saúde HTTP200, banco acessível, nenhuma migração pendente, saldo Asaas R$7,99 e os três testes financeiros anteriores continuam pagos. Simulação do fechamento de 09/10 não encontrou valores a repassar. Não foram disparados pagamentos adicionais.
- Backup PostgreSQL anterior às migrações: 287.698 bytes, SHA256 `b768a6e2bdded76530407fe836036c3860046cdff4f25cb4f667c8a502835997`, arquivo root-only `backup/supletivo_backend-before.dump` no diretório da release.
- Restauração executada em banco temporário isolado: uma comissão, três solicitações de repasse e 113 migrações anteriores recuperadas. O banco temporário foi removido ao concluir. Esse ensaio comprova restauração no mesmo servidor; cópia externa e recuperação após perda do servidor permanecem pendentes.

## Cadastro e automação — verificações em andamento

- Correção de candidato preparada em onze fontes sobre a imagem financeira. Link imediato, indicação com desconto, polo do candidato e comissões retidas cobertos por testes. Ativação exige cadastro completo, Pix do titular, consentimento, identidade, documento e comprovante aprovados. Cinco rejeições de selfie encaminham revisão humana e não concedem aprovação.
- Treinamento fica desabilitado nesta versão por configuração, preservando registros históricos. Os testes do fluxo assíncrono e de cadastro passaram; os 22 testes de papéis canônicos e ativação também passaram. O teste no navegador do link imediato passou após corrigir um seletor ambíguo do próprio teste.
- App compilou e a checagem Astro anterior terminou sem erros. A suite ampla de navegador encontrou fixtures antigas sem estados canônicos e chamadas para backend local ausente. Também revelou uma recuperação de contato que devolvia sucesso local com backend indisponível; essa rota precisa recusar a falha antes da publicação integrada do app.
- Cinco novos testes reproduziram falhas no despacho: fallback síncrono ao falhar a fila, descarte da data original do cron, falta de envio após fechamento, segredo dinâmico ignorado e aceitação de data futura/sem fuso. Após as correções, os 14 testes de cron e fachada de tarefas passaram. As correções de automação ainda não foram publicadas neste registro.
- A primeira tentativa de publicação do candidato acionou rollback porque o script exigia uma mensagem de `manage.py check` no stdout; o comando pode escrevê-la no stderr. O script passou a utilizar o exit code. A segunda tentativa está em acompanhamento; não se registra conclusão antecipada.

### Correção do painel do Promotor — 10/10/2026

- A reprodução autenticada com o usuário titular confirmou o defeito relatado: `GET /api/v1/collaborators/promoter/me` respondia HTTP 500, enquanto `whoami`, resumo, leads e comissões respondiam normalmente.
- O log do backend identificou `NameError: name 'settings' is not defined` em `users/roles/training/service.py:is_locked`. A causa foi a imagem cron publicada sem o import/guard da versão de treinamento desabilitada.
- Foram aprovados 32 testes locais nos contratos de promotor, ativação de candidato e resolução de papéis canônicos.
- Hotfix restrito publicado sobre a imagem anterior: `v7m-backend:promoter-panel-fix-20261010`, imagem `sha256:96516e398e44f791409e5d5403c55b2238bc4f863deede93a85bc9d6deca7996`; rollback `v7m-backend:before-promoter-panel-fix-20261010` preservado. Apenas `users/roles/training/service.py` foi sobreposto, com manifesto e cópias anteriores em `/opt/v7m-platform/releases/promoter-panel-fix-20261010`.
- Após a troca: saúde pública HTTP 200, `db=true`, zero migrações pendentes, `manage.py check` sem erro e a mesma chamada autenticada `/api/v1/collaborators/promoter/me` respondeu HTTP 200 com `status=active`. O usuário ainda precisa repetir o clique no próprio navegador para homologar a experiência.

### Verificação após o acesso real e capacidade Azure

- O titular confirmou no navegador que o acesso ao painel do Promotor passou a funcionar após o hotfix. Os fluxos Playwright de promotor, roteamento de papéis e aluno passaram: 20/20 testes.
- A checagem Astro do app terminou com 110 arquivos, zero erros, zero avisos e zero hints. O repositório não possui Vitest instalado; nenhuma dependência foi adicionada para mascarar essa ausência.
- A VM `vm-v7m-core` está em `Standard_F1als_v7`, região `eastus`, com 1 vCPU e aproximadamente 1,9 GiB de RAM. Nas últimas três horas o Azure reportou CPU média entre 6,9% e 14,5%, máximo observado 27,82%.
- A leitura da VM mostra somente 349 MiB disponíveis e 1,2 GiB de swap usados de 2 GiB. O maior contêiner é `v7m-evolution-go` (~422 MiB); o backend e o worker persistente estão baixos após o aquecimento. A capacidade de memória continua o risco operacional principal; não foi feito resize automático nem mudança de custo.
- Saúde pública atual de backend e app: HTTP 200, banco acessível e zero migrações pendentes. O backend expunha `0.0.0-sandbox.56` enquanto os artefatos frontend carregavam versões próprias; a sincronização posterior está registrada abaixo.

### App publicado em produção

- `app.supletivo.net.br` está no Worker `app-supletivo-net-br`, versão `559567bb-1e8b-4386-9452-27f6613c9505`; a versão anterior `1123af55-03c6-42d1-9a46-d9a3741c2a9b` permanece como referência imediata de rollback.
- O build foi publicado pelo manifesto gerado em `dist/server/wrangler.json`, preservando as bindings existentes de KV, Hyperdrive e assets. Não foi criado banco novo na borda.
- A raiz pública e `/api/v1/health/healthz` respondem HTTP 200; login OTP real e entrada no painel do Promotor foram confirmados pelo titular.

### Contrato de preços e editor administrativo — 10/10/2026

- A auditoria encontrou uma divergência real na produção: a tabela sem indicação estava sendo exposta como R$999 no Pix e 12x de R$99. A regra confirmada pelo titular é R$1.615 no Pix ou 12x de R$159,90 sem `/ref`, e R$999 no Pix ou 12x de R$99 com `/ref` válido.
- A release `pricing-contract-fix-20261010` foi publicada sobre `v7m-backend:promoter-panel-fix-20261010`. Imagem efetiva: `sha256:69039202820b1e091033be4a110c885939a4b19d418c78410b6933d79183022b`; rollback preservado em `v7m-backend:before-pricing-contract-fix-20261010`.
- A consulta pública pós-release retornou, sem indicação, Pix `1615.00` e cartão de 12 parcelas de `159.90`, total `1918.80`; com o `/ref` do titular retornou Pix `999.00` e cartão de 12 parcelas de `99.00`, total `1188.00`. O campo de cartão sem indicação continua cheio mesmo quando há indicação, para o frontend aplicar a tabela promocional explicitamente.
- Os valores de configuração foram atualizados no PostgreSQL principal. Propostas existentes preservam seus snapshots: o lead de ensaio do titular continuou em Pix R$999 e cartão R$1188 após a alteração, conforme a regra de não reprecificar cobranças emitidas.
- O editor `PricingView.svelte` do admin agora lê e grava os quatro valores separadamente (`price_*` e `promo_price_*`), mostra as duas tabelas e calcula as parcelas correspondentes. O `astro check` terminou com 30 arquivos, zero erros, avisos ou hints; o build SSR terminou com sucesso.
- Admin publicado no Worker `admin-supletivo-net-br`, versão `790012cb-e1a8-4c12-9eac-71f246053840`; `1239668a-6235-4672-945f-7e1f5da008e5` permanece como rollback imediato. `https://admin.supletivo.net.br/` responde 302 para `/login` e o novo asset de preços responde HTTP 200.
- O bump autenticado no oráculo `version.v7m.live` registrou `0.0.0-sandbox.62` para `notify.v7m.live`; a sincronização posterior do backend está registrada na seção seguinte.

### Sincronização do backend com o release train — 10/10/2026

- A imagem `v7m-backend:version-contract-fix-r2-20261010`, SHA256 `sha256:fcc2a19c3a83f6449ce1bd3c1c12725fb002b71b9050833692665ae383c277fc`, foi construída sobre `v7m-backend:version-contract-fix-20261010`; rollback `v7m-backend:before-version-contract-fix-r2-20261010` preservado.
- A alteração foi limitada ao `APP_VERSION` efetivo. O backend voltou com saúde pública HTTP 200, `db=true`, `migrations_pending=0`, preços comerciais inalterados e `APP_VERSION=0.0.0-sandbox.62`.
- O container `v7m-backend-web` está usando a imagem nova e `manage.py check` concluiu sem erros fatais. Os quatro avisos já conhecidos (chaves opcionais Gemini/Vision, Infisical e Sentry) permanecem registrados para a frente de observabilidade/segredos.
- Oráculo, backend, app e admin agora respondem/exibem `0.0.0-sandbox.62`. App publicado com Worker version ID `559567bb-1e8b-4386-9452-27f6613c9505`; admin publicado com Worker version ID `790012cb-e1a8-4c12-9eac-71f246053840`.

### Alias técnico do notify — 10/10/2026

- O Worker `notify-edge` recebeu a rota customizada `notify.v7m.live`, mantendo `notify.supletivo.net.br` compatível para consumidores existentes. A versão publicada é `a4f98192-e3c0-4562-85f2-d20475d7b022`.
- Os dois domínios respondem HTTP 200 em `/health`, com `d1=connected`, `workers_ai=ready` e `r2=not_bound`. O armazenamento R2 permanece deliberadamente não vinculado porque o fluxo atual não o utiliza.
- O oráculo registrou `0.0.0-sandbox.62` para `notify.v7m.live` após a publicação.
