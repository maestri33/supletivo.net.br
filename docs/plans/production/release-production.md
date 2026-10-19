# Instalação, identidade da entrega e recuperação

Registro de 10/10/2026. Leitura de produção e código, sem deploy, alteração de configuração, pagamentos, reinícios ou envio de mensagens. Horários em São Paulo salvo indicação UTC.

## Respostas públicas observadas

| Serviço | Observação de 10/10 | Limite da evidência |
| --- | --- | --- |
| Landing | HTTP 200, versão visível `.50`, reconferida 12h35 | Publicação existe; não comprova funil real |
| Promotor | HTTP 200, `.56`, 12h35 | Não comprova indicação do candidato |
| App | HTTP 200, `.59`, 12h35 | Página inicial não identifica os controles operacionais publicados |
| Admin | HTTP 200, `.50`, 12h35 | Não comprova edição correta de preços/default |
| Backend canônico | `/api/v1/health/healthz` 200, `.56`, banco true, migrations 0, SHA/build nulos, 12h35 | Saúde básica sem identidade completa da imagem |
| Oráculo | `/api/version` 200, `.60`, 12h35 | Registro global ainda não prova o código servido por cada app |
| Notify de borda | `notify.supletivo.net.br/health` 200, D1 conectado, R2 não vinculado, 12h36 | Aceitação/saúde da borda não comprova entrega |
| Cron | Health 200, origem `api.supletivo.net.br`, 12h35 | Execução financeira e origem correta precisam de prova |

Uma tentativa sobre `notify.v7m.live` falhou sem resposta HTTP; o domínio verificado da borda é `notify.supletivo.net.br`. A governança exige domínios técnicos `*.v7m.live`: qualquer ajuste precisa preservar consumidores, tunnel e callbacks. Uma rota incorreta que retornou 502 antes não demonstra queda do health canônico do backend.

## Instalação Azure efetiva

VM `vm-v7m-core`, grupo `rg-v7m-core`, região `eastus`. Containers observados: backend-web, notify-web, notify-qcluster, PostgreSQL 16, Stalwart, Evolution GO, NATS e cloudflared. Nenhum backend-qcluster foi observado. Backend usa `TASK_BACKEND=threads`; compose local prevê worker e Django-Q, portanto não basta tratá-lo como retrato da instalação.

| Serviço | Digest observado da imagem |
| --- | --- |
| backend-web | `sha256:f493ed67d4244dd40a1b48abdc6e9a5f4c6799cf8c59b0ad8f1ea50627580423` |
| notify-web | `sha256:4b0aba229b6acf77d6abe30df640eafb299b03ab14e7d971bf19778fb0b9bb5c` |
| notify-qcluster | `sha256:9a27a4d070929e9ace79931511ff4d03601d030ec30758f5740bca122005f26b` |

Digests diferentes não demonstram código diferente. O exame de arquivos abaixo é a evidência de conteúdo; ele também não representa comparação de toda a imagem.

### Comparação normalizada de arquivos

SHA-256 após normalizar CRLF para LF. Quatro arquivos coincidiram entre checkout backend e instalação Azure:

| Arquivo | SHA-256 normalizado |
| --- | --- |
| `core/tasks.py` | `bc740769fedf6f814a396a0b4b31816ae2c20afe47fd29644ad6796a0e9560a7` |
| `users/roles/candidate/promotion.py` | `0940b877257fd17edbf9ff27b0343e1ec5c8910fb85ecfc61f8435da87d4d24c` |
| `users/roles/enrollment/fees_events.py` | `511eec330ef4c9ff85b9dd6531bd64b7da5357414cd5477c62780ab95864361b` |
| `core/media_views.py` | `664c0adfbbec81a9ff5acbd48099506b76f72ae85a900b033b4472660da7c6e0` |

Isso localiza na instalação a lógica de ativação com limite de selfies, o vínculo com treinamento, o gate insuficiente da segunda taxa e a execução por threads descritos no blueprint. Não foi provocado nenhum desses efeitos durante a leitura.

Notify-web e notify-qcluster coincidiram nos três arquivos abaixo; o checkout local tem hashes diferentes. `notify/health.py` existe localmente e estava ausente nos dois containers.

| Arquivo | Instalação Azure | Checkout local |
| --- | --- | --- |
| `notify/dispatch.py` | `8b5ecb5ec40cb9957e9228bc6d554a38e427e0bf85e8ec68759f48126ef4f101` | `06ae044b89c8fd3e9a121bd6c892750bfb076d1d4422c3b022d3aa6e45ecdb85` |
| `notify/watchdog.py` | `551fdcac7022f6aceb94c2ff74ec99b3423d938296366bfd0d2c58634cf9cfa3` | `e1248557e693f1e6ad55a909d74d6da248b137e26623acae935ea666b2fd901d` |
| `notify_server/settings.py` | `8228304cea9388bd21a17eea7601f089ee0322a043ea5ea6b3d522f40c331634` | `11f972dbbefc2dd28bfbe3003a07c14aa024a92e35b715455e4522b7043cb647` |

Não presumir que o patch de recuperação local foi publicado. Revisar seu contrato, migrar quando necessário e exercitar o artefato que será distribuído.

## Fornecedores e execução

- Asaas efetivo aponta para `api.asaas.com`; leitura autenticada de saldo retornou 401 novamente. Chave preenchida e formato não reconhecido por uma checagem estreita de prefixo não demonstram causa do erro. Recuperar autenticação sem expor a chave.
- `INSTITUTION_LOGIN_URL` efetivo coincide com `https://cbi.sistemasiga.net/login/`. Credenciais e URL entregues por matrícula ainda exigem percurso real de teste.
- Evolution GO respondeu 200 às 12h24, com Connected/LoggedIn true para a instância consultada. Não foi enviado conteúdo nem provocada reconexão.
- Health de canais armazenado ainda era de 09/10 às 17h58 UTC. Não interpretar esse registro antigo como estado atual de WhatsApp.
- No agregado de notificações das 48 horas consultadas havia falhas de WhatsApp e registros `sent`; nenhum representa uma mensagem enviada pela auditoria. `sent` não é confirmação de entrega ao destinatário.
- Cron declara fechamento sexta às 21h UTC, correspondente a 18h São Paulo no calendário atual. As rotas financeiras consultadas por GET deram 404 na origem anunciada e 405 com POST permitido no backend. Não foi executado POST; processamento real permanece sem prova.

## Persistência e recuperação

Volumes efetivos: PostgreSQL em `v7m-platform_pg_data`, backend mídia em `v7m-platform_backend_media`, notify-web mídia em `v7m-platform_notify_media`. Notify-qcluster não apresentou mounts. Todos os quatro containers inspecionados usam restart `unless-stopped`.

Encontrados metadados de dumps backend e notify em `/opt/v7m-platform/runtime/backups/20261009T201517Z/`, respectivamente 278.348 e 97.143 bytes. Não foram copiados, abertos ou restaurados. A busca foi limitada a alguns diretórios; não exclui backup em outros locais. A consulta de snapshots do grupo Azure retornou lista vazia; também não exclui outras formas de backup.

Backend está com R2 habilitado e configuração preenchida para `supletivo-media`. O writer tenta espelhar mídia sem propagar falha. Não havia caminho de documento persistido para o ensaio HEAD sobre arquivo existente. HEAD anônimo em caminho privado inexistente retornou 401 no backend e no app; isso não prova download autorizado nem privacidade do bucket. API de buckets retornou 401 e D1 list retornou erro de autenticação. Nenhum recurso foi criado/migrado.

A VM tinha cerca de 1,9 GiB de RAM, 396 MiB disponíveis e 1,4 GiB de swap no inventário anterior desta conversa. Reavaliar capacidade antes de acrescentar workers e exercitar reinícios em ambiente separado. Não inferir necessidade de contratar mais capacidade apenas desse snapshot.

## CI e identidade da publicação

O [contexto de 09/10](audit-context-2026-10-09.md) registra jobs verdes da landing com etapas de publicação/oráculo puladas por falta de token, checkout de SHA não fixado ao CI disparador e nova construção em deploy. Sucesso desse job não é evidência de publicação do artefato testado. Backend tinha CI de 07/10 com pytest falho; pipelines anteriores de outros apps não comprovam o trabalho local atual.

Para a próxima entrega: checks obrigatórios reais, artefato identificado por SHA/digest, publicação desse artefato, manifesto de conjunto, migrations conhecidas, versão global e sondagens do percurso. Não aceitar sincronização de oráculo silenciosamente ignorada. Mudança enviada ao Git segue o incremento global definido no AGENTS; nenhum incremento foi feito por esta documentação local.

## Recuperação a demonstrar antes da operação completa

- Restaurar banco principal, notify e documentos em ambiente isolado; conferir vínculos, estados e proposta original.
- Conferir ambiente/binding/schema e ensaiar recuperação D1 sem gerar reenvio ou duplicação no serviço principal.
- Reiniciar processadores em cada intervalo crítico; conciliar fornecedor antes de repetir efeitos financeiros.
- Ensaiar rollback de código com compatibilidade de schemas e tratamento explícito de eventos já recebidos.
- Observar idade da fila, último fechamento, transferências não conciliadas, comunicação parcial, capacidade e conexões de banco.

Direção e critérios completos: [E1, E5, E7 e E8 do roteiro](production-correction-plan.md). Somente o usuário homologa.
