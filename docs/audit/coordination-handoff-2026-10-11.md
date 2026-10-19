# Handoff de coordenação — 11/10/2026

O proprietário confirmou Antigravity atuando em paralelo com Codex. Este arquivo registra fatos e propostas de coordenação; não é autorização nova nem prova independente do runtime.

## Estado deixado por esta execução

- Backend publicado `.78`: `fa8321c332e09fdeab040cc3da32c0571a25159f`, imagem web/Q `sha256:acc2b5c590484e27e31be1629f56f121b5dfcf46cf8e5cff4b6f64b4dba50412`.
- App agora publicado `.80` por outra execução: `0ac5c7fbcf8c15bde5ab27fe08fbd95a30191e3e`, Worker `9d8082c1-1922-4593-b854-0fa4a1c5b664`14:13:13UTC. Anterior `.79` Worker `86c65708-270c-4931-9079-242a385af112`.
- Landing publicada `.72`, admin `.75`; global oráculo `.80` na última consulta, atualizado14:13:50UTC. Campo commit literalHEAD e versões propagadas por app não comprovam deploys. Consultar novamente antes da próxima entrega.
- Composição autorizada atual: Diandra coordenação/promotor padrão; Victor aluno, com acesso administrativo retido. Tabela comercial restaurada, canário isolado por snapshot.
- A cobrança Pix1,01 do novo funil foi paga de verdade: AsaasDONE11:33:14SãoPaulo, PAYMENT_RECEIVED14:33:17UTC, matrículaRG e uma comissão0,01pending para a promotora. WhatsApp confirmação/comprovante e login→matrículaRG observados. Não apagar Lead/Checkout pagos nem duplicar ou marcar pagamento manualmente. IDs/dados/payload/arquivos permanecem nos registros protegidos.
- A comissão0,01 tem ledger equilibrado; a receita1,01 não foi lançada no ledger. Consulta global payment_received=0; hooks/mark_paid/_apply_effects do container ativo não fazem o lançamento. Necessária integração contábil com fonte/idempotência preservadas: [backend#21](https://github.com/maestri33/backend.supletivo.net.br/issues/21).
- Após confirmação de concorrência, esta execução suspendeu deploys e alterações de configuração/negócio em produção. As correções abaixo não foram publicadas por esta execução.

## Correções locais concretas para integrar

1. `app.supletivo.net.br/src/components/interactive/PixCheckout.svelte`: correção do caminho público por token já publicada na .80; passa a `ready` e retorna antes de consultar `getLeadMe`. Issue [app#16](https://github.com/maestri33/app.supletivo.net.br/issues/16). Estado já pago/login→matrícula observado; ainda repetir fatura não paga sem login e com outra conta. Não publicar novamente o mesmo ajuste nem fechar por teste parcial.
2. `admin.supletivo.net.br/src/pages/api/[...path].ts`: trocar fallback `api.supletivo.net.br` por `backend.supletivo.net.br`. `wrangler.jsonc` declara URL_BACKEND correto. Issue [admin#2](https://github.com/maestri33/admin.supletivo.net.br/issues/2). Check30arquivos/0erros e build concluídos. Package local `.80` é preparação, sem entrega/oráculo: reconciliar com o patch vigente, não presumir reserva desse número.
3. [backend#20](https://github.com/maestri33/backend.supletivo.net.br/issues/20): Lead OneToOne impede cinco compras reais duráveis repetindo duas identidades; arquivar fonte financeira antes de recriar perfil. Não apagar Lead/Checkout pagos.

## Decisão de IA a integrar, ainda sem comprovação produtiva

O proprietário determinou **Cloudflare Workers AI exclusiva para toda IA**, incluindo texto, visão e OCR/extração. A configuração anterior de provider fake e o endpoint externo indisponível são diagnóstico histórico; restaurar MiniMax ou aguardar login Infisical não é condição de liberação atual.

Integrar a chamada Cloudflare no backend web e qcluster, com credenciais apenas em ambiente protegido no servidor e sem fallback para IA externa/fake. Bancos principais permanecem no Azure; D1 atende a borda. A integração está em execução pelos agentes designados; inferência real, reconhecimento `full`, OCR persistido e promoção continuam pendentes de evidência. Não registrar token disponível, código preparado, health ou teste local como funcionamento produtivo. O guard de release deve recusar provider não Cloudflare/fake, loopback de desenvolvimento, configuração ausente e falha de inferência real. Acompanhamento: [backend#22](https://github.com/maestri33/backend.supletivo.net.br/issues/22) e [app#17](https://github.com/maestri33/app.supletivo.net.br/issues/17). Esta atualização não executou deploy ou alteração de configuração produtiva.

## Como evitar sobrescrita

Eleger um responsável por cada deploy, edição de configuração e reset canário. Antes de promover, comparar HEAD/diff, versão global, Worker/digest live e configurações. Integrar as alterações locais sem reset/checkout destrutivo. Após publicação, observar o mesmo link sem login e com outra conta, login admin/OTP real, valores, provider IDs e estado persistido. Registrar versão/rollback por componente.

Os demais arquivos dirty e relatórios pertencem a trabalho anterior/concorrente; não incluí-los por conveniência em uma entrega. [Sessão completa](production-session-2026-10-11.md) separa fatos, correções, evidências e pendências.

## Atualização posterior — gateway Cloudflare e canário RG

O bloco histórico acima registrava a IA Cloudflare como pendente. Ele foi superado pela execução posterior: `supletivo-ai-gateway.v7m.live` está publicado no Cloudflare Workers com versão `4581b295-7945-4188-8448-4f5e7f817d52`; o backend `.84` está saudável (`db=true`, zero migrações pendentes) e usa URL/token protegidos no servidor. O app `.82` está publicado.

O canário real autorizado `rg_inteiro.jpg` foi classificado como RG completo (`confidence=0.9`), enviado em `rg_full`, processado por OCR/extrator Cloudflare, persistido e aprovado. A tela de produção mostrou “RG aprovado”, “Dados extraídos do RG” e “Continuar matrícula”. A integração Cloudflare e o caminho RG estão comprovados; as pendências de cartão, promotor, hub, parceiro, repasse, notificações e ledger permanecem abertas.


## Etapa documental publicada .88 — 20:19–20:21UTC

AppWorker `68c5c611-d875-4ad0-ae97-aa5fde5d664e`; gateway `a0593d51-3e7f-4204-9357-2483a03734c8`; backend artefato `6fc98d4de15c8c8321c29aff15318ebf223629af2a7b3db3ccb30f5f9819d518`, web/Q na imagem `sha256:795c8047129d79643a26426da28cc7e72649e607d7f538b7189d476ec3e8cfc5`. Health público200, DB disponível, zero migrações. Rollback .87 preservado no controlador do release `/opt/v7m-platform/releases/identity-ocr-20261011-v88/release.py`.

Aluno continua RG; promotor RG/CNH, com captura compartilhada, classificação frente/verso/inteiro e ACK antes de pedir a outra face. JPG/PNG/PDF; PDF conserva composição e até duas páginas. Backend confere nome com tolerância a sobrenomes de casamento, CPF e nascimento; CPF ilegível/ausência incerta ou inválido entra em revisão. RG usa vistas orientadas no Gemma; CNH usa ScoutOCR+JSON, ambos exclusivamenteCloudflare. Reenvio guarda geração/status/caminhos também durante erros e preenchimento tardio; dados esperados não são fornecidos ao leitor. 60testes backend,27app, Astro117arquivos sem erros, build concluído.

O arquivo de RG existente foi preservado e reanalisado pela fila real. Task `73b93bbbcf084a0e8f43d29b92489b3e` concluiu `success`; RGapproved, nome/CPF/nascimento match e campos persistidos conferidos. UI observada com RGaprovado e Continuarmatrícula; confirmação GOWA `3EB02E5E19086DEA831747` às20:21:25UTC. A aprovação .82/.84 agora é apenas histórico, substituída pela evidência mais estrita da .88. Não houve novo upload pelaUI/pagamento/cadastro nessa reanálise. Não alterar os papéis/defaults/financeiro dos canários em paralelo.

Cadastro completo do promotor, selfieao vivo, nova captura por dispositivo/formatos, endereço e demais jornadas permanecem evidências próprias. Não há homologação integral da plataforma. Atualizações em [app#17](https://github.com/maestri33/app.supletivo.net.br/issues/17#issuecomment-6113382692) e [backend#22](https://github.com/maestri33/backend.supletivo.net.br/issues/22#issuecomment-6113382319); ambas abertas.
