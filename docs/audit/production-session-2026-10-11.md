# Sessão observada em produção — 11/10/2026

Este registro substitui o rascunho anterior. Publicação, teste local, recibo de provedor e homologação humana são evidências diferentes. A plataforma ainda não foi homologada integralmente. Não publicar documentos, identificadores pessoais, OTP, payloads Pix ou secrets em Git/Issues.

## Decisões do proprietário

- Azure para backend e PostgreSQL principais; Cloudflare para frontends/borda, D1 e serviços contratados. `os.v7m.live` abandonado.
- Sem referência válida: Pix1615 ou cartão12×159,90. Com referência válida: Pix999 ou cartão12×99. Frontend recebe valores do backend. Preços novos só afetam novas propostas. Promotor padrão editável no admin, independente do coordenador.
- Promotor100 por matrícula paga e um bônus500 ao atingir cinco no ciclo sexta18h→sexta18h em America/Sao_Paulo. Candidato indica imediatamente e recebe saldo acumulado no próximo fechamento após ativação. Cadastro gratuito; treinamento/LMS adiado.
- Aluno: landing→lead→pagamento confirmado→matrícula→RG/comprovante/escolaridade/selfie ao vivo. Não usar selfie de arquivo nem assinar pelo titular.
- Prova presencial após dois meses calendários desde o pagamento e aprovação da documentação educacional requerida. Histórico anterior é pós-matrícula; certificados anteriores são condicionais.
- Coordenador cadastra no parceiro https://cbi.sistemasiga.net/login, informa Pix/QR das taxas para pagamento/agendamento Asaas e registra credenciais recebidas. Cartão usa InfinitePay.
- Veterano exige novo diploma, novo histórico e foto da entrega física; gera comissão50 do coordenador no fechamento. Estornos cancelam pendências e descontam valores pagos nos futuros repasses. Suspensão no parceiro requer revisão admin e execução pelo coordenador.
- Composição canário atual: Diandra coordenadora/promotora padrão; Victor aluno pela landing. A atribuição administrativa de Diandra não comprova aprovação automática dos documentos.
- O proprietário confirmou Antigravity trabalhando em paralelo. Após essa confirmação, novos deploys/configurações de negócio desta execução ficaram suspensos até coordenação; leitura, reprodução e preparação local continuam. O pagamento inicialmente adiado foi confirmado pelo provedor em11/10 às11:33:14 America/Sao_Paulo; a conferência abaixo foi feita sem marcar pagamento manualmente.

## Artefatos realmente publicados

| Componente | Entrega observada | Identidade | Limite |
|---|---|---|---|
| Backend web/Q | .78, promovido08:18:52UTC | commit `fa8321c332e09fdeab040cc3da32c0571a25159f`; ambos imagem `sha256:acc2b5c590484e27e31be1629f56f121b5dfcf46cf8e5cff4b6f64b4dba50412` | Health de origem: artefato `0b18fbba152a241b76c34b0b7f382ef7aa5ba7ffa36b7fd9ec1991c354088bb2`, build08:18:06UTC, DBtrue/0migrações; não comprova OCR. |
| App aluno/promotor/hub | .80, Worker publicado14:13:13UTC | commit `0ac5c7fbcf8c15bde5ab27fe08fbd95a30191e3e`; Worker `9d8082c1-1922-4593-b854-0fa4a1c5b664` | Correção do Pix por token publicada por outra execução. Após pagamento, login/OTP real levou à matrícula/RG. Fatura pública não paga ainda requer repetição anônima do teste positivo. |
| Landing aluno | .72 | commit `1d31375e2dd0fd5ceb32efed97af3e0595be5793`; Worker `9053be87-8565-407d-b83b-b69ea23170e7` |50testes locais. Landing real semref exibiu1615/12×159,90 e criou proposta pelo CTA. |
| Admin | .75 | commit `b62c529356ee1d28d2ea50c8847ef1fb73afe4bd`; Worker `6c06e212-b543-4659-a6f6-736ecb76a67a` |12testes locais. Login real404; correção do proxy preparada localmente, não publicada por esta execução. |

O estado global do oráculo é .80 na consulta desta conferência, atualizado14:13:50UTC pelo módulo app. Seu campo commit contém o literal `HEAD`; a seção apps propaga .80 a todos os nomes e não comprova publicação de cada componente. Usar os commits/Workers/digests observados por componente. Demais Workers/bindings/bancos/filas/secrets constam na [coleta inicial de06:08–06:21UTC](infra-evidence-2026-10-11.md); não apresentar aqueles achados como correções concluídas.

Backend .70 unificou web/Q e metadados, .73 introduziu isolamento financeiro, .74 preservou atribuições e promotor padrão independente, .76 respeitou revogação dos papéis históricos e .78 completou o link do hub/polo do candidato. App .71 introduziu câmera ao vivo, .77 passou a usar somente a proposta imutável, .79 corrigiu textos do checkout e .80 encerra o caminho público por token antes de consultar lead autenticado. Tentativa .65 sofreu rollback por timeout de readiness; .69 foi bloqueada por referência Docker inválida, corrigida com alias local fixado no digest.

## Infraestrutura

VM Azure `vm-v7m-core`, grupo `rg-v7m-core`, eastus: aumento autorizado de Standard_F1als_v7 (1CPU/2GiB) para Standard_F1ams_v7 (1CPU/8GiB). Azure Succeeded; Linux8123332KiB. Nove containers retomaram execução; PostgreSQL/Stalwart healthy; GOWA conectado/autenticado. O CPU continua1. Não houve teste de carga.

Backups protegidos pré-redimensionamento: negócio298419bytes SHA256 `8a5aec7235e9fac6c38d94197d76defe8187e49ed486cb506f2ce84e3fa82a3d`; notify101622bytes SHA256 `e3756c895b5e1214856fcc494faecf4c750632eb2118378a0def33cd245e1e10`. Restore não ensaiado.

## Divergência encontrada e recuperação

Às07:50UTC a inspeção contradisse o reset anterior: Victor novamente coordenador/promotor, Diandra recriada como lead e tabela global em centavos. A origem exata das alterações não foi demonstrada. A confirmação posterior de outra execução explica a necessidade de coordenação, sem provar qual processo fez cada mudança.

Foi identificada separadamente uma falha reproduzível no seed_defaults, que podia reatribuir o hub à conta staff. A correção preserva coordenador existente. Valores comerciais restaurados por configuração auditada, mantendo snapshots emitidos.

O funil indevido de Diandra estava pendente:21créditos Asaas, hasMore=false, nenhum correlacionado. QR cancelado no provedor, registros arquivados de forma protegida e somente funil não pago removido. Histórico financeiro preservado. Composição autorizada restaurada; papéis operacionais de Victor revogados sem apagar sua identidade administrativa ou comissão manual histórica.

O resolvedor ainda ressuscitava Promotor suspenso pelo objeto histórico. .76 passou a respeitar revogação explícita, mantendo compatibilidade de objetos legados sem revogação. Login real depois mostrou somente Aluno e Admin.

## Canário isolado e evidências

Backend .73, commit `ef932fee41b6ff748bd1af68d5a889be8618ee49`: módulo finance.canary,65testes locais. Migração aditiva finance.0009 após backup301172bytes SHA256 `804f8fc28185ff5dafe28e0149963b8be50a4c3c2ba2b139e556028c8faf4e3a`. Ver [relatório técnico do backend](../../../backend.supletivo.net.br/docs/production-audit/isolated-canary-release-2026-10-11.md).

Configuração staff auditada, duas identidades autorizadas, validade até14/10/2026 07:50:17UTC, máximo cinco propostas. Valores: Pix1,01/cartão1,02 em1parcela, direta0,01/bônus0,10/hub0,05. Snapshot assinado e imutável; exige compra realmente paga, separa grupos/dívidas/bônus comerciais, limita repasse canário a0,40 e barra mistura de fontes/identidades/valores antes do banco. Expiração impede novas propostas; emitidas mantêm valores. A tabela global permanece comercial.

| Etapa | Observação real | Estado |
|---|---|---|
| Landing e OTP | CTA criou proposta; mensagem GOWA08:02:39UTC e código aceito | Observados |
| Proposta/roles |1,01/1,02 em1parcela, vinculada à promotora padrão; Aluno e Admin no navegador | Observados |
| Pix vinculado | QR emitido08:11:18UTC; GOWA `3EB081EA9FF6E53597DF86`,08:11:20UTC. Asaas CREDIT1,01/DONE, efetivado11:33:14SãoPaulo, correlacionado à cobrança original;22créditos, hasMore=false | Pagamento real confirmado |
| Webhook e conversão | PAYMENT_RECEIVED recebido14:33:17UTC, forwarded_ok=true14:33:21UTC; PaymentPAID, Leadpaid, Checkoutis_paid=true/paid_at14:33:17UTC; uma Enrollment no statusrg, mesmo promotor/hub, uma comissão canário0,01pending para a promotora | Trecho pagamento→matrícula→comissão observado, sem duplicação encontrada |
| WhatsApp do aluno | GOWA `3EB0EA6FA05ABEE1D6C1A9`14:33:22UTC confirma matrícula e aponta documentos; `3EB06303B43105D9D71C48`14:33:23UTC contém comprovante1,01 | Mensagens enviadas observadas; não é prova de leitura pelo destinatário |
| UI após pagamento | Novo login/OTP recebido via GOWA14:35:30UTC e aceito; navegador abriu /student/enrollment/rg, tabAlunoMATRÍCULA/AdminATIVO e dockRG/Endereço/Histórico/Selfie | Estado real de matrícula observado; nenhum documento enviado |
| Ledger | Uma transação commission_accrued0,01/completed com débito0,01 e crédito0,01. Consulta de todas as transações desde dois minutos antes do pagamento encontrou somente essa comissão; total global de payment_received=0. Hooks/mark_paid/_apply_effects do container ativo não registram o recebimento no ledger | Comissão contabilizada; receita1,01 ausente do ledger, integração pendente |
| OCR/selfie | RG de Victor identificado; nenhuma submissão neste novo funil antes do pagamento | Pendente; selfie do titular ao vivo |
| Mensagem hub | GOWA `3EB032112915D60C9E945C`,08:01:35UTC, continha literal `{link_painel}` | Produtor corrigido .78, novo recibo ainda necessário |
| Admin real | Proxy404 contra backend405 no mesmo endpoint; domínio antigo reproduziu404 | Correção local não publicada |
| Link Pix autenticado | Backend redireciona para app/pix; QR/copia e cola1,01 | Funcionou nesse contexto |
| Mesmo link anônimo | Defeito loading/lead/me401 reproduzido antes da .80. Agora a API pública200 informa is_paid=true e o link curto302 para recibo oficial; app encaminha ao acesso/documentação | Correção publicada; cenário anônimo com fatura ainda não paga não repetido após .80 |

Causa do link anônimo: PixCheckout.load obtinha a fatura pública por token e depois chamava getLeadMe. O401 era capturado quando data já existia e phase permanecia loading. Além disso, um usuário logado diferente poderia substituir os dados da fatura pelos dados de seu próprio lead. Correção publicada na .80: encerrar o caminho público com phase ready após obter a fatura; acompanhar is_paid pela mesma fonte pública. Esta execução preparou o ajuste, mas não publicou a .80. Não fechar app#16 apenas pelo teste do estado já pago.

As evidências integrais, com identificadores privados de provedor/cobrança/matrícula/comissão e screenshot da matrícula, ficam em arquivos protegidos e ignorados pelo Git. Não copiar o token do link, dados pessoais ou OTP para as Issues. A presença do evento PAYMENT_CREATED com forwarded_ok=false é uma observação separada; não foi classificada como perda de pagamento, pois PAYMENT_RECEIVED foi consumido e os efeitos persistiram.

Pagamentos antigos diretos (Pix0,01; InfinitePay pedido1,01/pago1,07) e comissão manual0,01 paga foram preservados. Não comprovam conversão do novo lead nem foram vinculados artificialmente a ele. Não criar cobranças duplicadas nem alterar is_paid manualmente.

Bônus de cinco vendas: Lead é1:1 com usuário. Apagar fonte paga rompe a correlação da comissão. Implementar arquivo transacional de compras/recebimentos ou outro desenho aprovado antes de repetir compras pagas com a mesma identidade. O limite de cinco propostas não resolve isso.

## Release, rollback e coordenação

1. Reproduzir UI/API/runtime; selecionar arquivos exatos, preservar alterações fora do conjunto.
2. Verificações adequadas e resultado registrado; commit identificado/global patch, Worker/digest real.
3. Backend: base fixada por digest/hashes, instalação revisada, build, preflight Django, migração explícita após backup quando necessária, web/Q juntos. Ambiente/volumes/configuração conferidos; rollback automático de código em falha de promoção.
4. Smoke real no fluxo afetado. Health200 só comprova health. Finanças/OCR exigem fonte, persistência e recibo/veredito; UI exige estados reais.
5. Issues permanecem abertas até cumprir critérios. Proprietário homologa.
6. Com Antigravity em paralelo, eleger responsável por cada deploy, alteração de configuração e limpeza de canário antes de retomar mutações. Esta execução não publicou o proxy admin nem a .80 do app; observou a .80 já publicada.

Rollback backend .78: release hub-notify-20261011-v78, release.py rollback com expected-artifact `0b18fbba152a241b76c34b0b7f382ef7aa5ba7ffa36b7fd9ec1991c354088bb2`; restaura web/Q .76, imagem `sha256:3793099f4cf506ce5bff7972a1d2cc1dc56eef66f70fa5e8e901208aace2ccc2`. Confirmar ambos digests e health depois. Não reverter pagamentos, mensagens ou migrações automaticamente. App .80 tem como anterior .79 Worker `86c65708-270c-4931-9079-242a385af112`; isso reintroduz o defeito anônimo conhecido. Restore/rollback integral e prazo não garantidos.

## Pendências antes de homologação integral

- Coordenar Antigravity, repetir fatura não paga sem login e com outra conta após .80, publicar/testar proxy admin; repetir UI real.
- Pix/matrícula/comissão/notificações do aluno observados neste canário; testar cartão no funil preservando todas as fontes. Conteúdo das novas mensagens em áudio de coordenação/promotor ainda não conferido.
- Upload real e pré-validação, OCR/extração/persistência, rejeição/revisão, captura/aceite pelo titular; documentos próprios de Diandra ainda não identificados para candidato.
- Candidato→ativo automático, saldo retido/referral/sharing/financeiro/leads/arquivo em cada status.
- Hub: rede, taxas1/2 e idempotência, credenciais, educação anterior, prova/nota/reagendamento, novo diploma/histórico/foto/comissão.
- Admin: preços/default promotor/snapshots, documentos, financeiro, estorno/suspensão, permissões.
- Hyperdrive legado, autenticação notify-edge, drift imagens notify, DLQ/retry/expiração, cron durável; achados iniciais ainda não encerrados.
- Integrar recebimento do aluno ao ledger de receita com fonte/idempotência e valores bruto/líquido/taxa definidos ([backend#21](https://github.com/maestri33/backend.supletivo.net.br/issues/21)); conciliar o canário pago sem duplicar efeitos. Cinco fontes duráveis, estorno/chargeback/repasse ainda pendentes. Sexta e dois meses não observados: não adulterar datas e chamar de teste real.
- Ensaio de restore/rollback e monitoramento de falhas/latência do negócio.

## Atualização de evidência — Cloudflare AI e RG, 11/10/2026

Após a publicação do app `.82` e do backend `.84`, o gateway `supletivo-ai-gateway.v7m.live` recebeu a inferência exclusivamente por Cloudflare Workers AI. O arquivo real autorizado `rg_inteiro.jpg` foi reconhecido como `rg/full` (`confidence=0.9`), enviado em um único slot, submetido a OCR/extrator assíncrono e persistido com `validation_status=approved`. A tela real mostrou “RG aprovado”, “Dados extraídos do RG” e “Continuar matrícula”.

Esta atualização supersede somente as linhas anteriores que diziam que OCR Cloudflare e o canário documental estavam pendentes. As pendências de frente isolada, verso isolado, promotor, hub, parceiro educacional, repasses, ledger completo, notificações e homologação integral permanecem sem evidência suficiente.


## Etapa documental publicada .88 — 20:19–20:21UTC

AppWorker `68c5c611-d875-4ad0-ae97-aa5fde5d664e`; gateway `a0593d51-3e7f-4204-9357-2483a03734c8`; backend artefato `6fc98d4de15c8c8321c29aff15318ebf223629af2a7b3db3ccb30f5f9819d518`, web/Q na imagem `sha256:795c8047129d79643a26426da28cc7e72649e607d7f538b7189d476ec3e8cfc5`. Health público200, DB disponível, zero migrações. Rollback .87 preservado no controlador do release `/opt/v7m-platform/releases/identity-ocr-20261011-v88/release.py`.

Aluno continua RG; promotor RG/CNH, com captura compartilhada, classificação frente/verso/inteiro e ACK antes de pedir a outra face. JPG/PNG/PDF; PDF conserva composição e até duas páginas. Backend confere nome com tolerância a sobrenomes de casamento, CPF e nascimento; CPF ilegível/ausência incerta ou inválido entra em revisão. RG usa vistas orientadas no Gemma; CNH usa ScoutOCR+JSON, ambos exclusivamenteCloudflare. Reenvio guarda geração/status/caminhos também durante erros e preenchimento tardio; dados esperados não são fornecidos ao leitor. 60testes backend,27app, Astro117arquivos sem erros, build concluído.

O arquivo de RG existente foi preservado e reanalisado pela fila real. Task `73b93bbbcf084a0e8f43d29b92489b3e` concluiu `success`; RGapproved, nome/CPF/nascimento match e campos persistidos conferidos. UI observada com RGaprovado e Continuarmatrícula; confirmação GOWA `3EB02E5E19086DEA831747` às20:21:25UTC. A aprovação .82/.84 agora é apenas histórico, substituída pela evidência mais estrita da .88. Não houve novo upload pelaUI/pagamento/cadastro nessa reanálise. Não alterar os papéis/defaults/financeiro dos canários em paralelo.

Cadastro completo do promotor, selfieao vivo, nova captura por dispositivo/formatos, endereço e demais jornadas permanecem evidências próprias. Não há homologação integral da plataforma. Atualizações em [app#17](https://github.com/maestri33/app.supletivo.net.br/issues/17#issuecomment-6113382692) e [backend#22](https://github.com/maestri33/backend.supletivo.net.br/issues/22#issuecomment-6113382319); ambas abertas.
