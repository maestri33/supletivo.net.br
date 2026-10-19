# Roteiro de correção e entrada em produção

Data: 10/10/2026. Base: [regras e arquitetura](production-blueprint-2026-10-10.md), decisões do usuário e observações de código/produção. Este é um roteiro para organizar entregas e suas evidências; não executa as correções nem representa homologação.

## Resultado exigido

A operação completa precisa ligar os quatro produtos públicos, o backend, os serviços de borda, os fornecedores e a operação humana do parceiro. Cada entrega deve apresentar o comportamento esperado, o contrato consumido pelos outros apps, o tratamento de falhas e a prova de funcionamento. Tela existente, build verde, tabela vazia e health 200 não encerram uma jornada.

### Arquitetura decidida

| Camada | Destino | Dados e responsabilidade |
| --- | --- | --- |
| Backend e processamento principal | Azure | Regras de negócio, identidade, propostas, matrículas, comissões, tarefas e integrações |
| Bancos principais | PostgreSQL no Azure | Estado canônico de negócio e do notify principal |
| Serviços de borda existentes | Cloudflare Workers | Entrada, proxies e funções técnicas dentro do plano contratado |
| Banco dos serviços de borda | Cloudflare D1, por binding direto | Dados próprios da borda: ingestão, idempotência e estado técnico necessário |
| Documentos e mídia | Persistência existente e R2 contratado | Definir origem recuperável, sincronização e acesso autorizado por recurso |
| Conteúdo e condições nos frontends | Backend | Preços, requisitos, estados, contatos e textos; cache conserva versão/origem |
| Estudos e emissão de documentos | Parceiro externo | Coordenador opera manualmente; automação externa fica para outra versão |

Workers Paid, R2 Paid, Images Stream Basic e Teams Free Base foram confirmados pelo usuário. Conferir consumo e franquias específicas antes de ampliar uso. Não há migração dos bancos principais para D1. Hyperdrive conecta ao PostgreSQL externo e não substitui o banco D1 da borda. `os.v7m.live` está fora do escopo. Treinamento/LMS não participa desta entrega.

Não colocar regras financeiras independentes em SQL de borda. Dados de negócio na borda, quando necessários à leitura, precisam de origem, versão e política de atualização definida. A criação da proposta e a confirmação de efeitos continuam no backend.

## Sequência e dependências

| Entrega | Ordem de preparação | Dependência para publicação integrada |
| --- | --- | --- |
| E1 — configuração, persistência e execução identificadas | Primeiro | Base de todas as demais |
| E2 — conteúdo, preços, proposta e atribuição | Após inventário dos leitores atuais | Backend/admin; depois landings, app e borda |
| E3 — candidato, indicação e ativação | Com contratos E2 definidos | Backend, app e landing de promotor |
| E4 — fechamento, comissões e estornos | Com autoria e estados E3 definidos | Processamento durável E5 e fornecedor autenticado |
| E5 — fornecedores, eventos, jobs e taxas | Recuperação de configuração pode começar em E1 | Contratos E2/E4; um responsável por cada job |
| E6 — polo, aluno, documentos e conclusão | Conferir primeiro o trabalho local já existente | E2/E5 e acesso autenticado de mídia |
| E7 — OTP, notify, sessões e coerência de interfaces | Recuperar evidência de notify desde E1 | Contratos finais de estado e eventos |
| E8 — integração, publicação e recuperação | Preparar ambiente e manifesto em E1 | Todas as anteriores e homologação do usuário |

Preparações independentes podem avançar em conjunto, mas nenhuma publicação parcial deve apresentar uma regra nova com backend antigo incompatível. Não há prazo inventado: estimar cada entrega depois de conferir o trabalho local, as migrations e a integração em ambiente separado.

## E1 — identificar e recuperar a instalação

Repositórios envolvidos na execução futura: backend, notify, ferramentas técnicas e infraestrutura `deploy/azure-stack`. Conferir `docker-compose.yml`, `prepare-runtime.py`, Dockerfiles, configuração do tunnel, bindings e workflows. Preservar mudanças locais de cada checkout.

- [ ] Registrar por serviço: origem, SHA, digest da imagem, versão, configuração efetiva sanitizada, dependências, volumes e responsável operacional.
- [ ] Resolver a autenticação efetiva Asaas que respondeu 401; conferir ambiente, conta e permissões antes de criar cobranças ou transferências.
- [ ] Recuperar acesso de leitura Cloudflare para listar D1/R2, schemas aplicados, ambientes, consumo e histórico de recuperação. O erro de autenticação do Wrangler não impede preparar código/contratos.
- [ ] Conferir a origem canônica do cron: hoje anuncia `api.supletivo.net.br`, que diverge da origem backend nas sondagens feitas. Não usar POST financeiro como teste de rota.
- [ ] Conferir execução durável do backend: produção usa threads e não tem backend-qcluster observado; o compose local prevê Django-Q. Escolher uma execução canônica com persistência e reexecução segura, considerando capacidade da VM.
- [ ] Identificar quais jobs serão acionados pelo cron de borda e quais por scheduler principal. Uma execução lógica por período, com proteção de concorrência mesmo se dois gatilhos chegarem.
- [ ] Conferir volumes: notify-qcluster não possui mídia montada na instalação observada. Verificar se as tarefas precisam desse caminho e integrar o armazenamento correto.
- [ ] Preparar backup externo e restauração em ambiente separado de PostgreSQL, mídia e dados D1. Os dumps encontrados na VM não são prova de recuperação.

**Prova exigida:** inventário efetivo, leitura autenticada dos fornecedores necessária à operação, fila processando tarefa inofensiva e persistida em ambiente de teste, serviços identificados, evidência de restauração isolada. Não publicar credenciais nem dados pessoais no relatório.

## E2 — fonte comercial única e propostas preservadas

Pontos de partida existentes: `users/roles/lead/config.py`, `models.py::lock_pricing/get_pricing_dict`, `service.py::pricing`, `api/clients/routers/lead.py`, `api/staff/routers/config.py`, `api/staff/schemas/config.py`, `core/system_config.py`; no admin, `src/components/interactive/PricingView.svelte` e `src/pages/pricing.astro`. Conferir também `tools/edge-postgres/src/index.ts` e todos os leitores de preço dos três frontends públicos.

- [ ] Definir o contrato comercial do backend com identificação da tabela, preço Pix, quantidade de parcelas, valor da parcela, total do cartão, vigência e condição aplicada. Usar centavos inteiros ou Decimal no domínio; não derivar cartão dividindo Pix.
- [ ] Implementar duas tabelas: regular R$ 1.615 / 12 × R$ 159,90; indicada R$ 999 / 12 × R$ 99. Separar o preço de entrada do aluno de regras antigas de estudo do próprio promotor.
- [ ] Permitir selecionar e editar o promotor padrão no admin. Autoria padrão não habilita desconto. Não escolher arbitrariamente coordenador ou superuser quando faltar configuração.
- [ ] Separar indicação explícita da autoria padrão e conservar o autor desde a proposta. Referência inválida deve ter resposta definida e não inventar promoção.
- [ ] Preservar propostas e cobranças já emitidas. Conferir leitores que chamam `lock_pricing` em releituras; a nova configuração só afeta novas propostas.
- [ ] Preparar migração de dados sem reprecificar históricos; relatório prévio identifica registros sem snapshot e a condição que pode ser recuperada da cobrança existente. Não completar históricos por palpite.
- [ ] Inventariar todo conteúdo exibido e criar/estender o catálogo canônico do backend: textos comerciais, requisitos, contatos, estados, comissões e condições. A implementação detalhada deve definir seu schema e atualização.
- [ ] Fazer HTML inicial, dados estruturados, CTAs, cálculo e checkout consumir a mesma condição. Cache precisa identificar versão e evitar misturar preços de propostas existentes com catálogo novo.
- [ ] Retirar cálculo comercial autônomo do acesso SQL de borda. A borda usa a resposta canônica; D1 conserva apenas dados próprios ou uma cópia de leitura explicitamente versionada quando necessária.

**Prova exigida:** quatro condições de pagamento coincidem na vitrine, na proposta persistida e no fornecedor de teste. Alterar tabela no admin, criar proposta nova e reler/tentar pagar proposta antiga sem mudar seus valores. Candidato válido também precisa habilitar a condição indicada.

## E3 — candidato pode indicar e ativa pelos requisitos

Pontos existentes: `users/roles/candidate/promotion.py`, `capture.py`, `coordinator.py`, `selfie_ai.py`, `address_proof.py`, `models.py`; `users/roles/promoter/service.py`, `api/collaborators/routers/promoter.py`; no app, `PromoterCandidateView.svelte`, `PromoterActiveView.svelte`, `PromoterLeadsView.svelte`, `PromoterCommissionsView.svelte`, `src/lib/roles.ts` e páginas correspondentes.

- [ ] Gerar/disponibilizar referência estável no cadastro inicial e aceitar o candidato como autor de indicação no backend e na navegação.
- [ ] Oferecer indicação e acompanhamento ao candidato; mostrar valores acumulados com recebimento retido. Entrar como promotor é gratuito.
- [ ] Centralizar os requisitos de ativação: documentos aprovados, identidade aprovada, cadastro completo. Reutilizar a mesma verificação em callbacks, revisão humana e qualquer rota manual existente.
- [ ] Remover a equivalência entre limite de selfies recusadas e identidade aprovada. Revisão humana pode aprovar uma verificação, mas não contornar os outros requisitos.
- [ ] Remover treinamento como requisito, destino de navegação, notificação ou atribuição automática desta versão. Preservar históricos existentes.
- [ ] Reavaliar ativação quando qualquer última condição chega; transição única, concorrência protegida e instante de ativação registrado.
- [ ] Preservar autoria, comissões e semana de origem na transição candidato → ATIVO. Ativação não dispara Pix imediato.

**Prova exigida:** cadastro inicial → link → proposta indicada → matrícula paga → saldo retido → cadastro completo e verificações aprovadas → ATIVO → recebimento no fechamento aplicável. Ordens diferentes de callbacks, evento repetido, reprovação e revisão não produzem ativação indevida.

## E4 — direitos financeiros por semana e compensações

Pontos existentes: `finance/models.py`, `config.py`, `interface/commissions.py`, `interface/payout.py`, `interface/ledger.py`, `tasks.py`; `users/roles/lead/service.py::mark_refunded`, `hooks.py` e `integrations/bank/asaas/webhooks.py`. Conferir também ações financeiras em `api/staff/routers/finance.py`.

- [ ] Usar períodos sexta 18h → sexta 18h em `America/Sao_Paulo`, com intervalo de origem explícito e desempate determinístico no instante do corte.
- [ ] Créditos: R$ 100 por matrícula paga, um bônus de R$ 500 por semana com pelo menos cinco matrículas válidas, R$ 50 por entrega de diploma. Identificadores únicos por evento/beneficiário e bônus por semana/beneficiário.
- [ ] Separar cálculo dos direitos e liberação do recebimento. Valores do candidato conservam a semana original enquanto retidos. Antes de transferir, aplicar elegibilidade ATIVO e fechamento aplicável.
- [ ] Fazer processamento, retentativas e ações administrativas reutilizarem a política de elegibilidade; uma rota administrativa não pode liberá-la acidentalmente.
- [ ] Fechamento repetido ou concorrente produz um resultado financeiro lógico, com rastreabilidade entre período, créditos, compensações e solicitação de transferência.
- [ ] Estorno cancela pendentes, reavalia bônus da semana original e gera dívida de comissão/bônus já pagos; não usar o principal pago pelo aluno como débito do promotor.
- [ ] Compensar dívida até o limite de novos créditos e carregar o restante. Extrato mostra créditos, ajustes, valor líquido e saldo a compensar.
- [ ] Reconciliar solicitação já enfileirada ou em processamento antes de cancelá-la: timeout não demonstra que o fornecedor deixou de pagar.
- [ ] Abrir revisão operacional no admin para matrícula efetivada após estorno. Coordenador executa no parceiro somente após a decisão aplicável; registrar taxas, acesso e resultado da ação.

**Casos financeiros obrigatórios:** 4, 5 e 10 vendas; 4+1 em semanas diferentes; cinco em duas semanas com saldo retido; ativação depois do corte; estorno 5→4 e 10→9; R$ 600 de dívida com R$ 200 de crédito; créditos maiores que a dívida; estorno durante transferência; webhook repetido e reprocessamento. Comparar cálculo no banco, extrato do app/admin e valor recebido pelo fornecedor de teste.

## E5 — cobranças, webhooks, taxas e jobs recuperáveis

Pontos existentes: `integrations/bank/asaas/`, `integrations/bank/infinitepay/`, `core/tasks.py`, `finance/interface/payout.py`, `finance/management/commands/finance_schedules.py`, `users/roles/enrollment/fees.py`, `fees_events.py`, `coordinator.py`; `tools/cron-trigger/src/index.ts` e `wrangler.jsonc`. Identificar o Worker financeiro efetivamente publicado antes de definir seus arquivos de execução.

- [ ] Conferir a integração atual de cartão separadamente do Asaas: cobrança oficial, parcelas, total, identificação da proposta e confirmação recebida. Não presumir que recuperar Asaas comprova cartão.
- [ ] Persistir recebimento, deduplicação e resultado de eventos. Falha de um efeito crítico não pode virar ACK definitivo sem trabalho recuperável.
- [ ] Diferenciar cobrança emitida, pagamento confirmado, transferência solicitada e transferência paga. Estado do fornecedor deve orientar a conciliação.
- [ ] Retentativa após timeout consulta o fornecedor e reutiliza a chave lógica; não gera pagamento ou transferência nova por desconhecer a resposta anterior.
- [ ] Taxa inicial: QR/Pix válido, solicitação persistida, saldo empresarial e confirmação real antes de concluir a matrícula.
- [ ] Segunda parcela: data válida, estado agendado consistente e execução recuperável. `second is not None` não basta. Definir se o agendamento é registrado remotamente no Asaas ou mantido pelo processador principal, e apresentar essa realidade na API.
- [ ] Reinício, saldo insuficiente, indisponibilidade e QR vencido mantêm pendência visível; operador pode corrigir/reprocessar com histórico.
- [ ] Confirmar cron canônico, autenticação dos gatilhos, proteção de concorrência e indicador de última execução/resultado por job.

**Prova exigida:** fluxo de cobrança e confirmação em ambiente de fornecedor de teste, eventos repetidos/fora de ordem, timeout com resposta perdida e processo reiniciado entre persistência e execução. Taxa falha e agendamento falho impedem concluir matrícula; correção permite retomá-la sem duplicar a primeira taxa.

## E6 — operação real do coordenador e aluno

Pontos existentes no backend: `api/leadership/routers/enrollments.py`, `students.py`, `reviews.py`, serviços de enrollment/student e modelos de diploma. No app: `HubOperationsView.svelte`, `HubReviewView.svelte`, `HubExamsView.svelte`, páginas `/hub/active/operations` e componentes em `src/components/interactive/student/`.

- [ ] Revisar e integrar primeiro os controles locais já criados, inclusive arquivos ainda não rastreados. Não reconstruir a operação com base no relatório antigo de telas faltantes.
- [ ] Conectar dossiê e revisão às permissões e respostas reais, com estado de carregamento, erro, conflito de etapa e atualização após ação.
- [ ] Coordenador cria matrícula no parceiro manualmente, informa taxas no app e registra credenciais depois de satisfazer as condições financeiras.
- [ ] URL enviada e URL mostrada usam a mesma informação da matrícula. Destino atual confirmado: `https://cbi.sistemasiga.net/login`.
- [ ] Prova presencial no polo, resultado registrado pelo coordenador, diploma/histórico emitidos pelo parceiro anexados e entrega física registrada com foto.
- [ ] A entrega produz uma comissão de R$ 50, inclusive diante de clique duplo, retentativa ou webhook repetido.
- [ ] Resolver a leitura de mídia autenticada: links comuns não acrescentam Bearer. Escolher acesso por sessão autorizada, download autenticado ou URL temporária emitida após autorização; não colocar JWT permanente na URL.
- [ ] Conferir permissão por recurso e polo, inclusive atual acesso global de coordenadores; negar usuário alheio e conservar revogação de acesso.
- [ ] Tratar falha de espelhamento R2 e registrar origem recuperável. Provar acesso após perder a cópia local em ambiente separado, com bucket privado quando o recurso for privado.

**Prova exigida:** usuário/coordenador reais de teste percorrem o app publicado de teste, sem mocks de API, até a entrega. Arquivos de teste abrem para o papel permitido e falham para outro usuário/polo conforme a política definida. Nenhum estudo ou emissão própria de diploma é criado no nosso app.

## E7 — autenticação, comunicação e consistência dos produtos

Notify: `notify/dispatch.py`, `watchdog.py`, `health.py`, `notify_server/settings.py`, `edge/src/index.ts`, `edge/schema.sql`, `edge/wrangler.toml` e `docs/notification-production-recovery.md`. App: `src/lib/api.ts`, `session.ts`, middleware e guards. Landings: modais de captura, scripts e Workers. Admin: login, permissões e consumidores de configuração/financeiro.

- [ ] Publicar web e qcluster a partir do mesmo artefato identificado; os arquivos relevantes coincidem entre ambos na instalação observada, mas diferem dos patches locais de recuperação.
- [ ] Conferir schema e migrações D1 aplicadas na borda em ambiente separado, acesso por binding, consultas parametrizadas, isolamento por conta e unicidade da idempotência. Recuperação D1 não reenvia mensagens já enviadas pelo gateway.
- [ ] OTP distingue aceitação, envio, falha e expiração. Nenhum UUID, enfileiramento ou health da borda representa entrega ao destinatário.
- [ ] Monitoração usa evidência recente de canais e fila; WhatsApp conectado não comprova email nem entrega de mensagem. Reconciliar observação antiga e executar watchdog sem envios de canário não autorizados.
- [ ] Retentativa de envio parcial conserva o canal já enviado. OTP expirado ou cobrança antiga não é reenviado em massa.
- [ ] Percorrer captura → OTP → sessão → papel/estado → refresh → logout/revogação em todos os produtos; erro de consulta não deve criar cadastro como se a consulta tivesse concluído.
- [ ] Remover dados pessoais desnecessários de query/cookies compartilhados/analytics e conferir respostas antes da prova de identidade. Logs usam IDs técnicos seguros.
- [ ] Harmonizar navegação por papéis e estados conforme AGENTS do app, DESIGN canônico e contratos do backend; treinamento deixa de aparecer no caminho prometido.
- [ ] Confirmar todo conteúdo exibido vindo do backend e percursos de falha, teclado, leitor de tela, mobile e preferência de movimento.

**Prova exigida:** autenticação e cada evento principal observáveis do backend até o canal, com resultado coerente na UI. Testes de driver podem simular falhas; a demonstração final de canal real segue destinatário autorizado e autorização de envio apropriada. Não realizar envios reais como sondagem desta auditoria.

## E8 — publicar o conjunto que foi exercitado

- [ ] Ambiente integrado separado usa PostgreSQL, D1 e R2 próprios; os nomes de bindings não bastam para separar dados. Fornecedores e destinatários de teste definidos.
- [ ] Executar matriz abaixo e os casos de falha de E2–E7. Registrar passos, origem, artefatos, resultado e IDs de teste sem dados pessoais.
- [ ] CI obrigatório verifica o SHA que será publicado e publica o artefato já testado. Ausência de credencial não pode gerar status de deploy concluído sem publicação.
- [ ] Emitir manifesto do conjunto com SHA/digest, schema/migrations, versão global e configuração sanitizada. Health revela `sha` e `built_at`; oráculo e footers apontam a entrega correspondente.
- [ ] Conferir domínios técnicos `*.v7m.live`, incluindo notify/cron/webhooks, preservando callbacks e compatibilidade durante qualquer ajuste de origem.
- [ ] Ensaiar rollback de código e estratégia de dados em ambiente separado. Rollback de Worker/imagem não desfaz pagamento nem alteração no banco; conciliar esses efeitos.
- [ ] Demonstrar restauração, capacidade da VM, conexões PostgreSQL, consumo D1/R2/Workers e processamento após reinício.
- [ ] Apresentar pacote de evidências ao usuário para homologação da operação completa. Somente então conduzir publicação autorizada e operação assistida.

### Matriz mínima de jornadas integradas

| Jornada | Evidência que encerra o percurso |
| --- | --- |
| Aluno sem REF, Pix e cartão | Preço regular exibido/cobrado, promotor padrão atribuído, confirmação única |
| Aluno com REF de candidato e de ativo | Preço indicado, autoria preservada, matrícula e comissão únicas |
| Candidato até ATIVO | Link inicial, saldo retido, requisitos aprovados, ativação única e próximo fechamento correto |
| Promotor e coordenador no fechamento | Semana correta, bônus único, comissão de entrega e repasse líquido conciliado |
| Matrícula externa | Dossiê, taxa inicial confirmada, segunda agendada, credenciais e link corretos |
| Conclusão acadêmica | Prova presencial, resultado, documentos do parceiro, foto e comissão |
| Estorno/chargeback | Ajuste de direitos/dívida, revisão admin e execução pelo coordenador registrada |
| Admin | Tabelas/default editáveis, propostas anteriores preservadas, revisão e extratos operacionais |
| Falha e recuperação | Evento persistido, retomada sem duplicação, comunicação coerente e dados restauráveis |
| Multi-role e privacidade | Navegação/autorização iguais; sessão revogada e mídia inacessível a não autorizado |

## Situação deste planejamento

As regras centrais foram esclarecidas e os pontos de partida foram localizados. Continuam abertas as evidências de fornecedor autenticado, schema/consumo Cloudflare, execução durável, publicação dos controles locais, acesso real a documentos e recuperação completa. Todas as caixas representam trabalho futuro; nenhuma está marcada como homologada.

Arquivos complementares: [funil, segurança e preços](funnel-security-pricing.md), [design e acesso](design-accessibility-seo.md), [instalação e release](release-production.md). Ao iniciar cada entrega, ler o AGENTS do repositório, conferir o checkout e escrever a especificação de implementação correspondente. Esta sessão só altera documentação no repositório pivô.
