# Infraestrutura observada em produção — 2026-10-11

Este registro separa evidência remota, código local e hipóteses. Não representa homologação do produto. A coleta inicial foi feita entre 06:08 e 06:20 UTC, por HTTP público, API Cloudflare autenticada, Azure CLI e inspeção Docker. Nenhuma credencial é publicada aqui. Nenhum deploy, alteração de configuração ou movimento financeiro foi feito na fase inicial. A consulta final de canal confirmou que o evento `dispatched` de 06:11 correspondia a envio WhatsApp falho; uma notificação posterior de 06:16 apareceu como `sent`, ainda sem provider message ID que permita provar o recibo. Às 06:21:54 UTC foi feita apenas a atualização de status de saúde documentada abaixo, mediante instrução do agente principal.

## Achados que bloqueiam a confiança no lançamento

1. **Existem dois caminhos para dados comerciais.** Django na VM Azure usa PostgreSQL `postgres/supletivo_backend`. O Hyperdrive ativo aponta para `db.v7m.live:5432/backend`; esse hostname resolve para `51.79.77.31`, enquanto a VM Azure tem IP `20.127.0.185`. O Worker `db-edge` consulta diretamente `core_platformsetting`, promotores, usuários e polos. Isso comprova configuração divergente; não comprova que os bancos estejam sincronizados. A presença do binding no app/admin não comprova uso: a análise local do agente principal encontrou helpers sem consumidores. O uso efetivo deve ser mapeado por rota.
2. **Web e executor assíncrono do backend executam imagens diferentes.** Web `version-contract-fix-r2-20261010` versus qcluster `cron-recovery-20261010`. Uma correção do OCR apenas no web pode não chegar ao processo que executa a tarefa.
3. **O oráculo global não identifica os artefatos realmente em execução.** O oráculo anuncia `.64` para todos os apps, mas landing pública exibe `.50`, promotor `.56`, admin `.62`, backend `.62` e app `.64`. O backend retorna `sha: null` e `built_at: null`. Um release global pode agrupar componentes diferentes, mas precisa de um manifesto explícito por componente e digest.
4. **Notificações de borda recusam acesso por falta de configuração de autenticação.** Os bindings live do `notify-edge` não contêm `NOTIFY_API_KEY` nem `NOTIFY_REQUIRE_AUTH`. GET `/mcp` e `/reports/notifications` retornaram 503 com `Notification authentication is not configured`. O middleware local protege também `/notify` e `/v1/send`. A saúde 200 da borda não prova entrega.
5. **O login usa outro caminho de notificações.** Web e qcluster do backend usam `http://notify-web:8000`, com `NOTIFY_API_KEY` presente, timeout normal de 10 segundos e síncrono de 60 segundos. Portanto a falha da borda não é explicação suficiente para o login. A origem registrou OTP enfileirado às 06:11:16, falha WhatsApp `Evolution GO ReadTimeout` às 06:11:22 e evento `notify.dispatched` logo depois. SELECT na origem confirmou que a notificação `ae53c4f0-9dcc-4b22-aeeb-5a8533d2e082` estava com WhatsApp `failed`, e-mail `skipped`, uma tentativa, sem provider message ID. A seguinte `34b6b673-14e4-4cb5-ac0a-f9e68b6dffee`, criada às 06:16:14 UTC, estava `sent`, também sem provider message ID. Evento e status de aceitação não devem ser tratados como prova de recebimento.
6. **Tunnel teve falha real durante a coleta.** A primeira consulta canônica ao health backend retornou 502. A segunda retornou 200. Os logs do cloudflared registram timeout QUIC e cancelamento do health às 06:08:42, e cancelamento de `/api/v1/clients/auth/check` às 06:10:56. Docker web/qcluster estavam `running`, com zero reinícios. Não atribuir o 502 a crash do backend.
7. **GOWA MCP e Evolution GO são dispositivos vinculados à mesma conta WhatsApp, conforme confirmação do usuário.** O conector MCP configurado no Windows é `http://127.0.0.1:3000/mcp`, servido pelo Docker local `go-whatsapp-web-multidevice-whatsapp_go-1`; a VM executa `evoapicloud/evolution-go:latest`. Serem servidores ou implementações distintos não implica números ou contas distintos. O agente principal observou pelo MCP dois OTPs às 06:21:10 UTC: um reenvio do código de 06:16:20 e um código novo; o código antigo foi recusado no login. O histórico MCP pode corroborar a mensagem na conta compartilhada, mas precisa de timestamp e identidade da mensagem para evitar confundir entrega atrasada com envio atual. Às 06:17:26 UTC, notify usava `http://evolution-go:4000`, DB `supletivo_notify` no PostgreSQL interno, e a instância default retornou `Connected: true`, `LoggedIn: true` no GET autenticado `/instance/status`. A row de canal ainda dizia `close`, com `status_checked_at` de 2026-10-09 17:47:31 UTC. Logs mostram KeepAliveTimeout: é preciso distinguir sessão real, status armazenado e entrega.

## Apps e recursos Cloudflare ativos

Conta consultada: `e0814c592e43284a2f6f9984bef32631`. IDs de recurso e versão abaixo foram lidos na API da conta, não inferidos de Markdown.

| Produto / domínio | Worker ativo | Artefato ativo | Versão observada no produto | Dados e bindings live | Rollback anterior existente |
|---|---|---|---|---|---|
| Aluno landing: `supletivo.net.br`, `www.supletivo.net.br` | `landing-supletivo-net-br` | `84c56f22-5d86-4c95-803b-4e572771c3b1`, 2026-09-30 17:05 UTC | `.50` no HTML; local package `.56` | `ASSETS`; nenhum secret binding | `b7eb9987-f9a1-4127-a810-a9d9c59d0d4e` |
| Promotor landing: `promotor.supletivo.net.br` | `landing-promotor-supletivo-net-br` | `d0bca1b8-6827-4d0e-83d8-8fc885c681b1`, 2026-09-30 22:10 UTC | `.56` no HTML e local package | Sem bindings declarados live | `e93b6bbd-4b38-41ea-a8ae-51f87ef47c4e` |
| App aluno/promotor/hub: `app.supletivo.net.br` | `app-supletivo-net-br` | `23a943d8-5d59-4c6c-a2c1-1bf1137c67da`, 2026-10-10 22:32 UTC | `.64` no HTML e local package | `URL_BACKEND`, KV `SESSION`, Hyperdrive compartilhado | `efbd96e0-6d2a-45da-b774-b7676274d63b` |
| Admin separado: `admin.supletivo.net.br` | `admin-supletivo-net-br` | `790012cb-e1a8-4c12-9eac-71f246053840`, 2026-10-10 21:17 UTC | `.62` no HTML e local package | `ASSETS`, KV `SESSION`, Hyperdrive compartilhado | `1239668a-6235-4672-945f-7e1f5da008e5` |
| Notify borda: `notify.supletivo.net.br`, `notify.v7m.live` | `notify-edge` | `a4f98192-e3c0-4562-85f2-d20475d7b022`, 2026-10-10 21:12 UTC | Health sem versão; local package `.56` | D1 `DB`, `AI`, `EMAIL`, Hyperdrive, DO `NotifyAgent`, `NOTIFY_QUEUE`, vars de origem/ambiente; sem R2 `MEDIA`; sem secret de autenticação | `f64a5686-2bb3-4a37-8b37-025ee400457b` |
| Oráculo: `version.v7m.live` | `version-v7m-live` | `66dfc15a-f669-4fbf-a1c8-efbcd73e9486`, 2026-09-29 08:18 UTC | Estado KV `.64`, atualizado 2026-10-10 22:31 UTC; local package `.57` | `ASSETS`, KV `PLATFORM_VERSION_KV` | `0a7441bf-9e54-4b95-b62a-8b6739ef18c4` |
| Cron: `cron.v7m.live` | `supletivo-cron-trigger` | `5696a016-91f0-4a51-beb9-4d66c6df8366`, 2026-10-10 18:04 UTC | Health sem versão | `BACKEND_BASE_URL`, secret `CRON_SERVICE_SECRET` presente | `881904e5-a7c5-437a-94e6-e939a5efbfed` |
| Finance webhooks: `webhooks.v7m.live` | `supletivo-finance-webhooks` | `0b154d96-16a2-4e54-b6c7-d74610b7ad46`, 2026-09-29 17:35 UTC | Health sem versão | D1 `DB`, KV `FINANCE_WEBHOOKS_KV`, `FINANCE_WEBHOOKS_QUEUE`, URLs backend, secret `ASAAS_WEBHOOK_SECRET` presente; `INTERNAL_SERVICE_SECRET` ausente | `9f87cbe4-36b9-4917-989e-bffcd3391fdf` |
| SQL borda: `db-edge.v7m.live` | `supletivo-edge-postgres` | `39cd43fd-ef1a-4c5c-8863-722f55fea358`, 2026-09-30 03:15 UTC | Health sem versão | Hyperdrive compartilhado, `ENVIRONMENT` | `381d4019-7b1d-41c2-8fd5-82fe75cf1d4d` |

Os IDs anteriores são candidatos técnicos disponíveis. Rollback não foi executado nem homologado; voltar código não restaura DB, filas ou efeitos de pagamentos. Secrets e rotas exigem revisão própria quando mudam entre versões.

Rotas de zona observadas: `app.supletivo.net.br/*`, `admin.supletivo.net.br/*`, `supletivo.net.br/*`, `www.supletivo.net.br/*`, `webhooks.v7m.live/bank/*`. Os demais domínios citados constam como Worker custom domains ativos. Admin possui custom domain e route de zona, condição a registrar no manifesto operacional.

### Recursos de dados e processamento

| Recurso | Identificação live | Evidência / limite da evidência |
|---|---|---|
| PostgreSQL principal | VM Azure, container `v7m-postgres`, `postgres:16-alpine`, DB backend `supletivo_backend`, DB notify `supletivo_notify` | `healthy`; health Django `db: true`, migrations pendentes zero na segunda amostra. Backup e restauração não foram testados. |
| Hyperdrive | `d13fec466a424ac59c25399ee8628d4a`, `supletivo-prod-hyperdrive` | Origem `db.v7m.live:5432/backend`, cache habilitado com stale 300 segundos. Não é o DB Django identificado. |
| KV sessão app | `1500d22e396f41c6b26d9f17e02f678d` | Binding live `SESSION`. |
| KV sessão admin | `4791fb0e1704410e92128e1b4b992421` | Binding live `SESSION`. |
| KV versão | `8c88aa37a99744f5b74f01bbd82117b2` | Binding live do oráculo. |
| KV webhooks | `e6e7396050df469895c6cdd071a360b1` | Binding live; conteúdo não inspecionado. |
| D1 notify | `9f60bd23-8df1-4311-ad1f-7fc296bb0a49`, `notify-db` | SELECT confirmou tabelas `accounts`, `idempotency_keys`, `notifications`. Uma notification `dead_letter`, última em 2026-10-03 15:42 UTC. Isso não inclui necessariamente o caminho interno de login. |
| D1 finance | `c10a46d6-1ab1-4cdd-bdb6-421a8f01d852`, `v7m-webhooks` | SELECT confirmou `webhook_events` e `webhook_dead_letter`; 15 eventos `DELIVERED`, zero dead letters. Não comprova um novo pagamento canário. |
| D1 sandbox | `820be518-9ae9-449d-8c91-751aa65e46f7`, `supletivo-sandbox-db` | Existe na conta; nenhum binding nos Workers auditados. |
| R2 | Bucket `supletivo-media` | Existe na conta. Backend settings possui R2 access key e secret; bucket efetivamente utilizado pelo backend ainda requer conferência. `notify-edge` não possui binding `MEDIA`. |
| Durable Object notify | Namespace `57e4968ffb80487d9a4bc68237ab8f09`, `NotifyAgent` | Binding ativo; estado e recuperação não testados. |
| Django Q backend | ORM `default`, cluster `supletivo-backend`, 1 worker, timeout 240s, retry 300s, max_attempts 3 | Executor live em imagem anterior à web; logs com `httpx.ReadTimeout`. Tarefas OCR reais ainda não executadas nesta auditoria. |

| Queue Cloudflare | Produtor / consumidor live | Retry e retenção |
|---|---|---|
| `finance-webhooks-queue` (`51780ec8572147dfaee52c54412893a9`) | Worker finance em ambos; DLQ `finance-webhooks-dlq` | Batch 10, 5 retries, retenção 24h |
| `finance-webhooks-dlq` (`a7d53b42b4994be2ac870fa4b6e8424c`) | Nenhum consumidor | Retenção 24h; precisa procedimento de investigação/recuperação antes de expirar |
| `notify-events` (`5b92c4380182422fa882c61eef932139`) | `notify-edge` em ambos; DLQ `notify-events-dlq` | Batch 50, 4 retries, atraso 15s, concorrência máxima 5, retenção 4 dias |
| `notify-events-dlq` (`1bd87c1a0b3d42b7b745bc2e8ebacd2c`) | Consumidor `notify-edge` | Batch 10, 3 retries, concorrência máxima 2, retenção 4 dias |

Schedules live: notify `*/15 * * * *`; finance webhooks `*/5 * * * *`; cron backend `*/10 * * * *` para aging de selfies, `0 * * * *` para payouts e `0 21 * * 5` para fechamento semanal (sexta 18h em São Paulo). Presença do schedule não prova execução concluída: é necessário ID do run e resultado do backend.

## Azure: containers em execução

VM `vm-v7m-core`, resource group `rg-v7m-core`, região `eastus`, subscription `17472659-0f27-4a6b-9aec-39a53b3a2348`, estado `running`. Coleta Docker às 06:12:01 UTC. Todos abaixo estavam `running`, com zero reinícios no contador atual.

| Container | Imagem configurada | Digest da imagem executada | Saúde Docker |
|---|---|---|---|
| `v7m-backend-web` | `v7m-backend:version-contract-fix-r2-20261010` | `sha256:fcc2a19c3a83f6449ce1bd3c1c12725fb002b71b9050833692665ae383c277fc` | Sem healthcheck |
| `v7m-backend-qcluster` | `v7m-backend:cron-recovery-20261010` | `sha256:2feccd22d0b9e7b5ff9a854ed0c1a1319a897e9aa785e8f26fb336703acc5e5b` | Sem healthcheck |
| `v7m-notify-web` | `v7m-platform-notify-web` | `sha256:4b0aba229b6acf77d6abe30df640eafb299b03ab14e7d971bf19778fb0b9bb5c` | Sem healthcheck |
| `v7m-notify-qcluster` | `v7m-platform-notify-qcluster` | `sha256:9a27a4d070929e9ace79931511ff4d03601d030ec30758f5740bca122005f26b` | Sem healthcheck |
| `v7m-postgres` | `postgres:16-alpine` | `sha256:721873c34ceb9f8d8fc265984940dc982404c105f19ad51be9fdc5970a6080ea` | `healthy` |
| `v7m-stalwart` | `stalwartlabs/stalwart:latest` | `sha256:ec011be228596e37e65f41aab17deed573859614430472f7eeb42178c50d87b7` | `healthy` |
| `v7m-cloudflared` | `cloudflare/cloudflared:latest` | `sha256:072c067d25ccbe61d46e18f0d0723255f2bb5304f7317caa95b27031520ff92c` | Sem healthcheck; erros QUIC |
| `v7m-evolution-go` | `evoapicloud/evolution-go:latest` | `sha256:6fa601464bd76d3d19ece4c48d8bb5373d025d95d45b939ae4bf0c77b03f5aaa` | Sem healthcheck de sessão WhatsApp |
| `v7m-nats` | `nats:2.10-alpine` | `sha256:b83efabe3e7def1e0a4a31ec6e078999bb17c80363f881df35edc70fcb6bb927` | Sem healthcheck |

Os ports do backend/notify/Postgres aparecem apenas na rede Docker, sem HostPort público. Cloudflared encaminha o hostname backend para `http://backend-web:8000`. Tags `latest` ou tags mutáveis, desacompanhadas de digest no manifesto, não garantem reconstrução exata.

Imagens de rollback backend observadas no daemon incluem `before-promoter-panel-fix-20261010` (image ID `2feccd22d0b9`), `before-cron-recovery-20261010` (`0c227821f32f`) e `before-candidate-recovery-20261010` (`b081a0246140`). O rollback exato da imagem web atual deve ser conferido antes de qualquer nova promoção; imagem disponível não equivale a procedimento executado.

## Segurança e configuração: presença, sem valores

- Backend web e qcluster: `NOTIFY_API_KEY`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_SECRET`, `INFINITEPAY_HANDLE`, `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY` presentes nos settings. Isso não comprova credencial ativa, permissionamento ou limites financeiros.
- Notify edge: secret de autenticação ausente; nenhum bypass foi habilitado.
- Finance edge: `ASAAS_WEBHOOK_SECRET` presente, `INTERNAL_SERVICE_SECRET` ausente. No código local a rota de drenagem manual depende desse último; a revisão do artefato live deve confirmar o comportamento antes de corrigir.
- Cron edge: `CRON_SERVICE_SECRET` presente no Worker. Correspondência com o segredo de serviço do backend não foi provada por executar uma operação de negócio nesta fase.
- Notify origem registrou `DisallowedHost` para `notify.v7m.live`; revisar Host encaminhado pelo proxy e `ALLOWED_HOSTS` com autenticação preservada.
- Código local contém defaults/DSN de credenciais em arquivos de configuração. Não reproduzir valores em relatório ou issue; remover e rotacionar após configurar o gerenciador protegido. Isso é achado de código, não comprovação de que todo default esteja sendo usado live.

## Próximas verificações necessárias

1. Fechar a causa da demora no login e do canal WhatsApp com request ID, notification ID, status da sessão Azure e recibo real. Evitar mais tentativas de OTP sem nova evidência.
2. Unificar fonte dos preços e referrals na API canônica Azure; registrar e retirar consumidores do DB legado depois de mapear cada chamada.
3. Promover backend web e qcluster a partir do mesmo digest; incluir versão, commit real e built_at no health/manifesto. Não promover a partir de diretório dirty sem registrar a árvore exata.
4. Configurar a autenticação de borda notify com segredo estabelecido, confirmar 401 sem chave e acesso autenticado esperado; corrigir Host da origem. Preservar auth, sem `NOTIFY_REQUIRE_AUTH=false`.
5. Executar canários reais de cadastro, OTP, preços, Pix/cartão, OCR, ativação, taxas de parceiro, comissões e entrega do diploma. Cada etapa deve ter evidência de UI + API + persistência + provedor/recibo; nenhum health isolado substitui isso.
6. Documentar backup, restauração, DLQ e rollback do release com um ensaio controlado. Manter ledger de pagamentos mesmo ao apagar/recriar usuários canário; definir a identificação e o escopo da limpeza.

## Intervenção limitada: atualização do status WhatsApp

Às **06:21:54 UTC**, o agente principal autorizou atualizar o cache de conexão pelo serviço de saúde já existente. Foi executado `notify.watchdog._check_go(heal=False)`, que leu `/license/status` e `/instance/status`, ambos HTTP 200, com a instância default conectada e autenticada. O resultado foi `ok: true`, `logadas: default`, nenhuma instância sem sessão.

O serviço persistiu apenas o estado de saúde correspondente: `connection_status` passou de `close` para `open` e `status_checked_at` passou de 2026-10-09 17:47:31 UTC para 2026-10-11 06:21:54 UTC. Não foi feita reconexão, recuperação de licença, alteração de provedor, mudança de segredo ou deploy. O watchdog também pode limpar seu marcador de tentativa anterior após um probe saudável, conforme a implementação existente. O próximo teste de login deve ser único e acompanhado de status do canal; a atualização do cache não comprova que ele funcionará.

Comparação do runtime de notify web com o código local:

| Arquivo / comportamento | Evidência |
|---|---|
| `whatsapp/evolution_go.py` | SHA-256 runtime e local idênticos: `c32407d2bb0d8ab41f220a08f6385b68bf637383e757d8ca38e89666e6cac793`; o código contém o resolver BR `resolve_br_number`. |
| `whatsapp/factory.py` | Runtime `17593ee48f7665999740f90e5df34a9dbd2045efe2eff5ae54fe4f5d54e746da`; local `9ca66a994c3a5d4a0225a2675565ed8fa11c14472ffea13d452b9eee244fcd10`. Há drift real de código; revisar antes de promover. |
| Timeout do driver OTP live | Connect 2 segundos, read/write/pool 3 segundos. O timeout síncrono da chamada backend→notify continua sendo 60 segundos; são camadas diferentes. |

## Limites da coleta

O Azure RunCommand truncou a coleta ampla em aproximadamente 4 KB; ela foi descartada como evidência incompleta e substituída por consultas compactas. Nenhum segredo foi adicionado nesta auditoria. Documentos reais, prova, pagamentos de teste e homologação de UI/UX ainda dependem das etapas seguintes do trabalho principal. `os.v7m.live` foi excluído do escopo por decisão explícita do usuário.
