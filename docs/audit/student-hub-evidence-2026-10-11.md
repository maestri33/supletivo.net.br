# Evidência de jornadas aluno e polo — 2026-10-11

Escopo: código local real em `app.supletivo.net.br` e `backend.supletivo.net.br`, regras declaradas pelo proprietário, execução de funções de domínio e contratos em banco de teste. Não consultei dados reais de pessoas, não efetuei Pix, não implantei e não declarei produção validada. Os repositórios já continham alterações de outras iterações e agentes; este relatório distingue os meus reparos locais de lacunas ainda encontradas. Markdown antigo foi tratado como orientação, não como prova de funcionalidade.

## Regras atuais confirmadas pelo proprietário

- Pagamento confirmado muda aluno de lead para matrícula e gera comissão do promotor.
- A prova só pode SER AGENDADA após **dois meses de calendário** desde o pagamento, não três meses nem a data futura da prova reservada antecipadamente.
- Matrícula recolhe RG, comprovante de endereço, foto para assinatura e escolaridade. Documentos educacionais chegam depois, mas a prova depende da validação deles. Certificados escolares são condicionais à existência.
- Coordenador cadastra aluno no parceiro CBI/SIGA, usa nosso app para solicitar primeira taxa e programar segunda pelo Asaas, registra credenciais e acesso externo.
- Veterano exige diploma novo, histórico novo e foto da entrega física. A comissão do coordenador nasce nessa transição.
- Promotor candidato já pode indicar; cadastro e validações liberam status ativo e repasses, sem cobrança para entrar. Financeiro semanal está sob outra auditoria.

## Encadeamento constatado no código

| Etapa | UI e API | Persistência / processamento | Evidência atual |
|---|---|---|---|
| Lead e pagamento | landing / checkout → hooks de `lead.service.mark_paid` | `Lead`, `Checkout`, `_apply_effects`, matrícula e comissão | Teste offline de confirmação repetida mantém timestamp e uma comissão; pagamentos reais ficam sob orquestrador |
| Identidade da matrícula | `StudentRgEnrollmentView` → `/clients/enrollment/documents/classify`, RG photo, RG GET | documento/RG, fila Django-Q, visão, OCR, extração, biometria e decisão humana | Reparos de reload, RG exclusivo e erro explícito; OCR real precisa documentos reais |
| Endereço | `StudentAddressEnrollmentView` → classify, proof upload, kinship, enrollment/me | `EnrollmentAddressProof`, endereço extraído, vínculo familiar e fila | UI não fabrica número, UF nem aprovação; mostra apenas campos realmente retornados |
| Escolaridade e foto | educação / selfie → endpoints matrícula | escolaridade e selfie assíncrona, liberação coordenador | Não alterei essas telas nesta rodada; há regra legada de revisão presencial após cinco rejeições de selfie |
| Taxas e liberação | `HubOperationsView` → fee/pay, fee/schedule, conclude | `PaymentRequest`, QR decodificado pelo Asaas, worker de pagamentos, credenciais do `Student` | Helpers reparados, tentativa falhada não equivale a programação; teste financeiro real ainda necessário |
| Aluno ativo / documentos | `student/StudentActiveView` → student/me, documents/{type}, blood-type | `StudentDocument`, fila, IA visão/OCR/extração e aprovação/revisão/rejeição | Polling limitado, erros distintos de envio/consulta, arquivos privados; último tipo sanguíneo agora reavalia liberação |
| Prova | active/assessments → exam/schedule → coordenador exam/grade | `StudentExam`, tentativas e resultado passed/failed + notes | Gate de dois meses no servidor e UI; nenhuma nota numérica inventada |
| Emissão / entrega | Hub → diploma/issue e diploma/pickup | `StudentDiploma`, status, role veteran, comissão coordenador numa transação | Histórico obrigatório e entrega bloqueada se faltar diploma/histórico; legado pode reparar histórico sem gerar comissão |
| Veterano | veteran dashboard/diploma/records/assessments → veteran/me | matrícula consolidada, documentos finais e provas | Downloads autenticados e histórico de provas; falta smoke real |
| Financeiro aluno | active/finance e veteran/finance → **API existente** lead/me | snapshot checkout, confirmação, provedor e recibo | Nenhum preço local ou cobrança fictícia; valor retornado pelo backend |

## Reparos locais desta rodada

### Backend

1. `users/roles/enrollment/fees.py`: import `NotFound`; chamada de estado via facade `service._set_status`; segunda taxa falhada pode ser refeita em `fee_scheduled`, com referência nova; estados não repetíveis exigem consulta ao financeiro.
2. `users/roles/enrollment/fees_events.py`: chamada de estado via facade; `second_scheduled` é true somente com pedido **queued/submitted/paid**, nas consultas individual e em lote. Failed, cancelled, awaiting_balance e awaiting_pix bloqueiam concluir matrícula.
3. `users/roles/enrollment/rg_decision.py`: `_RG_SLOT_FIELD` importado e chamadas de helpers via facade. Aprovação/rejeição humana deixam de provocar `NameError`.
4. `users/roles/enrollment/selfie_ai.py`: acesso coordenador via facade, eliminando helper não importado.
5. `users/roles/lead/models.py:214` e `users/migrations/0043_checkout_paid_at.py`: campo nullable/indexado `Checkout.paid_at`, dependência `0042_promoter_activated_at`. **Migração precisa ser aplicada antes da versão que lê o campo.**
6. `users/roles/lead/service.py:1248`: confirmação atomic com row lock. Timestamp imutável da **confirmação observada pelo backend**, não data bancária exata; usa hora do servidor na primeira confirmação. Duplicatas não alteram. `lead_self_dict` expõe paid_at.
7. `users/roles/student/service.py:716`: cálculo dois meses de calendário no fuso São Paulo, mês curto ajustado ao último dia. Só checkout confirmado/lead pago; legado sem paid_at usa criação imutável da matrícula, registrada no fluxo de confirmação, como evidência conservadora. Nunca usa `updated_at`. Sem confirmação e sem âncora confiável, bloqueia.
8. `users/roles/student/service.py:751`: bloqueia agendar antes do prazo mesmo para prova futura; rejeita data passada; respeita status de documentos e reexame.
9. `users/roles/student/service.py:950`: diploma exige histórico; repair de legado `awaiting_pickup` sem histórico permite reanexar os dois sem graduar. Veteranos já concluídos não mudam.
10. `users/roles/student/service.py:1020`: retirada exige diploma, histórico e foto, antes da transação de status/role/comissão.
11. `users/roles/student/service.py:539` + `users/roles/student/tasks.py:16`: análise guarda path único do upload. Task antiga não aprova arquivo novo; aplicação atomic com row lock. Compatível com jobs antigos de um argumento, que capturam o arquivo realmente analisado.
12. `users/roles/student/service.py:345`: informar tipo sanguíneo por último passa a reavaliar gate, evitando aluno preso com todos documentos aprovados.
13. Schemas `api/clients/schemas.py` e `api/leadership/schemas.py`: preservam paths privados de documentos/diploma/histórico, provas, data/gate de agendamento e paid_at. Antes a API filtrava alguns desses dados já produzidos pelo service.

### App

- `StudentRgEnrollmentView.svelte`: apenas RG; resume slot esperado no servidor; classifica antes de upload; erro de classificador/envio não vira aprovação; previews de mídia exigem Bearer; mostra dados extraídos; próximo link segue status do servidor.
- `StudentAddressEnrollmentView.svelte`: reload consulta estado real; só mostra aprovação com comprovante aprovado e endereço completo. Não cria número “SN”, UF “PR” ou titular fictício; consulta/erros explícitos; parentesco não é aprovação presumida.
- `student/StudentActiveView.svelte`: polling máximo 60s após upload; timeout permanece análise pendente; erro de consulta após ACK informa arquivo recebido; leitura autenticada de arquivos; data e gate de prova reais; tentativas/resultados; accepts de foto compatíveis com implementação atual. A checagem local decodifica imagem; **não é classificação semântica de documento escolar**.
- `student/StudentVeteranView.svelte`: documentos via helper privado `openPrivateMedia` e provas em leitura. Não transforma mídia em pública.
- `student/StudentFinanceView.svelte` novo: usa lead/me existente para snapshot da cobrança e recibo real.
- Routes novas: `student/active/finance.astro`, `student/veteran/finance.astro`, `student/veteran/assessments.astro`. Navegação global integrada pelo orquestrador; não a editei.
- `HubOperationsView.svelte`: mídia privada com Bearer; diploma/histórico obrigatórios; recuperação de histórico faltante; entrega bloqueada sem os dois; provas e resultado do aluno; tentativas de taxas falhadas podem ser refeitas.
- Helper `src/lib/private-media.ts` é trabalho do outro agente; usado sem alterar seus contratos.

## Lacunas que impedem afirmar plataforma completa

| Prioridade | Evidência e arquivo | Trabalho restante |
|---|---|---|
| P0 | Publicação não realizada por este agente | Implantar web E worker com mesma versão, migrar banco, observar processamento das filas e smoke real. Unit pass não prova OCR/WhatsApp/Asaas em produção |
| P0 | `users/roles/student/config.py:18`: certificate obrigatório para todos, RG/endereço duplicados, certidão; `_maybe_release_exam` exige tipo sanguíneo e militar masculino | Conciliar gates com proprietário, certificado “se tiver” e reaproveitamento de documentação já validada na matrícula. Sem decisão factual, mantive gates existentes |
| P0 | `users/roles/enrollment/profile_address.py:37`: endereço completo avança independentemente do status do comprovante; `rg.py` `_advance_rg` também permite avançar com foto+número | Garantir conclusão/release bloqueada por validações reais e pendências; revisão de cada gate completa ainda necessária |
| P1 | `integrations/ai/service.py:479`: classificador reconhece só identidade/residência; triage do app lê metadados | Criar triagem visual escolar mínima usando pixels reais, mantendo extração/decisão backend assíncrona. Não chamar metadados de verificação do documento |
| P1 | `student.service._save_photo` / `_ai_validate`: MIME desconhecido vira jpg; PDF escolar não renderizado, imagem webp tratada como jpeg no MIME de visão | Validação real do conteúdo no backend, limites, renderização segura de PDF para visão/OCR e MIME correto. UI limitada a JPG/PNG/WebP até suportar PDF |
| P1 | `api/leadership/routers/promoters.py:16` e schemas/list_for_hub | Rede do Hub ainda não reúne candidato/ativo/suspenso + telefone + totais pagos e saldo do ciclo num contrato/UI completo |
| P1 | `lead.service.lead_to_dict`, `api/leadership/routers/leads.py:16` | Leads da rede têm promotor/link/telefone, mas faltam sexo/idade exigidos e tela Hub completa. Não preencher idade/sexo sem fonte |
| P1 | `StudentExam` e exam/grade | Resultado é booleano passed/failed + observações; nota numérica não existe. Definir escala e regra com proprietário antes de criar nota/limite |
| P1 | Bolsista sem Checkout pago | Novo gate não inventa data de pagamento gratuita. Confirmar qual âncora de prazo deve valer para benefício já existente |
| P1 | Endereço aprovado incompleto | UI agora mostra pendência real; falta interface de correção dos campos faltantes para usuário/coordenador |
| P1 | Aula não tem modelo/API de agendamento constatado | Proprietário confirmou prazo para prova; não criar agendamento de aula fictício |

## Testes e limites da evidência

Comando executado na venv do backend com DJANGO_SETTINGS_MODULE=core.settings:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_student_hub_release_rules.py tests/test_student_api_contract.py tests/test_student_happy_path_e2e.py tests/test_hub_student_review_schema.py tests/test_production_financial_rules.py -q --disable-warnings --maxfail=2
```

Resultado final: **79 passed em 10,05s**, sendo 28 cenários novos de release e 51 regressões existentes. Os novos cenários exercitam helpers reais e persistência DB: mês curto/leap; reserva antecipada bloqueada; boundary; legado; pagamento ausente; imutabilidade timestamp e comissão única; histórico obrigatório; veterano/comissão após arquivos+foto; stale upload; última pendência sangue; segunda taxa falhada/sem saldo/cancelada bloqueada; retry pedido novo.

Chamadas externas de provedor/QR, fila, notify, biometria e R2 foram isoladas em unit. Datas são cenários de unidade, não mudança em produção. Estes testes não validam checkout real, webhook real, documento real, Pix liquidado nem envio de WhatsApp.

Compilador Svelte local compilou os seis componentes desta rodada com **zero erros e zero warnings**. Check/build completo fica com orquestrador após integração concorrente. Não testei navegador autenticado nem mobile real nesta rodada.

## Canários reais possíveis sem fabricar evidência

1. Excluir/recriar só contas autorizadas sem apagar comissão/saldo/transferência paga nem perder comprovantes. Cadastro deve partir da landing e preço mostrado deve corresponder ao snapshot/configuração backend.
2. Receber pagamentos autorizados de R$1,01 Pix e R$1,02 cartão; observar webhook, status lead→matrícula, paid_at persistido e comissão R$0,01. Repetição do mesmo evento não cria outra comissão.
3. Usar documentos reais fornecidos pelo proprietário; provar reject de foto que não é documento e accept/OCR de RG/endereço reais; só observar status e campos que o servidor confirma; erros não aprovam.
4. Primeira e segunda taxa precisam QR reais do parceiro com valor/due date confirmados. Não gerar débito nem programar instituição inventada para “passar” o teste. Provar worker/webhook de pagamento e credenciais CBI reais registradas.
5. Canário novo só prova **bloqueio** de reserva antes dos dois meses; agendamento positivo precisa matrícula real que já cumpriu prazo e documentação aprovada. Não retroagir paid_at nem datas reais para simular conclusão.
6. Emissão/entrega positiva precisa diploma e histórico autênticos emitidos pelo parceiro e foto de entrega física. Não anexar diploma fictício nem marcar entrega para fabricar comissão R$0,05.
7. Navegador deve abrir cada documento privado via sessão e recusar usuário de outro polo; testar navbar por status, inclusive recarregar e alternar roles.
8. Verificar notificações reais no WhatsApp autorizado e registrar somente ids/evidência redigida, sem PII/OTP em relatório.

## Regra de publicação / rollback para estas mudanças

- Build identificado, migrações conferidas e aplicadas; web e worker devem usar mesma imagem/código para novos jobs.
- Smoke inclui autenticação, role routing, student/me com novo gate, document polling e acesso autenticado a mídia.
- Rollback pode retornar web e worker para imagem anterior, conservando coluna additive paid_at. Não remover coluna/dados em emergência. Não desfazer nem repetir transferências financeiras como rollback de software.
- Não declarar pronto enquanto lacunas P0 e canários relevantes permanecem sem evidência.
