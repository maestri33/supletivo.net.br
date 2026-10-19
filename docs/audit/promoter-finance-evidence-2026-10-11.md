# Auditoria de promotor, administração e finanças — 2026-10-11

Escopo: código local de `backend.supletivo.net.br`, `app.supletivo.net.br`, `admin.supletivo.net.br` e landings. Os arquivos de orientação foram lidos como instruções; descrições em Markdown não foram usadas como prova de execução. Nenhum deploy, comissão, transferência ou exclusão foi realizado nesta auditoria. A evidência local abaixo não comprova OCR nem pagamentos em produção.

### Atualização local posterior ao diagnóstico

Após o inventário inicial abaixo, foram implementados localmente: último ano/série cursado e concluído do candidato (campos existentes na API, sem presumir série); compartilhamento de indicação por WhatsApp/Facebook, menu nativo e cópia com instruções para Instagram; endpoint autenticado de documentos próprios do promotor, tela de arquivos e item Documentos no dock ativo; arquivo privado baixado com Bearer no proxy de mesma origem, sem token em URL; página Termos reutilizando o wizard real de consentimento/selfie. O polling acompanha o ACK sem manter a tela ocupada por 60 segundos, termina depois de 120 segundos e pode ser retomado por atualização manual/foco. Um comprovante aprovado com endereço incompleto não permite avançar.

Backend: **32 testes passaram em 7.67s**, incluindo três novas regressões de acesso ao arquivo de documentos: ausência de autenticação, isolamento de identidade e recusa de role de aluno. App: quatro testes locais de valores financeiros/escolaridade passaram; `astro check` em 113 arquivos retornou zero erros/avisos. Build, smoke autenticado, OCR real, pagamentos e testes do novo frontend em produção continuam pendentes. A matriz a seguir registra o diagnóstico inicial e deve ser lida junto desta atualização, sem inferir que mudanças locais já estão publicadas.

O guard isolado `/candidate/me` parece restrito à role candidate, mas `api.auth.Principal.has_any` contém alias candidate → promoter. Portanto o promotor canônico pode ser aceito nesse guard; não foi comprovada uma recusa em produção. O novo endpoint próprio do promotor evita depender dessa interpretação para a tela de arquivo.

## Observação pública em produção

Consulta real, sem autenticação, realizada em 2026-10-11:

| Endpoint | Resposta observada |
|---|---|
| `https://backend.supletivo.net.br/api/v1/clients/pricing` | HTTP 200; sem indicação: Pix 1615.00, cartão 12 × 159.90 = 1918.80; promocional: Pix 999.00, cartão 12 × 99.00 = 1188.00; comissão 100.00, bônus 500.00 com 5, coordenador 50.00 |
| `https://supletivo.net.br/api/v1/clients/pricing` | HTTP 404 |
| `https://promotor.supletivo.net.br/api/v1/clients/pricing` | HTTP 404 |

O retorno do backend confirma sua tabela pública atual. Ele não comprova que as landings consomem essa tabela ou que cobranças reais usam o snapshot correto.

## Matriz código → interface → API

| Papel / estado | Código e navegação existentes | API / comportamento encontrado | Lacuna para a jornada solicitada |
|---|---|---|---|
| Candidato | Dock: Cadastro, Chave Pix, Termos, Sair; `PromoterCandidateView.svelte` implementa documento, endereço, Pix, escolaridade, contrato/selfie e link imediato | `/candidate/me`, `/candidate/document`, uploads, classify, address-proof, education, Pix, selfie e consentimento | UI não pergunta última série/ano cursado. `/candidate/pix` renderiza o wizard completo; `/candidate/terms` apresenta botão de assinatura sem handler. Não comprovar onboarding só pela existência dessas rotas |
| Candidato com RG / CNH | Triagem de arquivo/MIME/tamanho + endpoint classify; upload assíncrono; polling de documento e cadastro | Tasks de visão/OCR/extração; documento e perfil persistidos | Dois erros de execução/serialização corrigidos apenas localmente nesta auditoria; revisão manual tinha mais três chamadas inválidas, também corrigidas. Ainda precisa enviar documento real pelo app em produção |
| Promotor ativo | Dock: Painel, Leads, Comissões, Materiais, Sair | `/promoter/me`, `/promoter/summary`, `/promoter/leads`, `/promoter/commissions` | Falta item Documentos e visualização dos documentos enviados. Compartilhamento só copia link; não há ações de Instagram/Facebook/WhatsApp/compartilhamento nativo. Materiais contém quatro botões sem destino/handler |
| Leads do promotor | Tabela nome, WhatsApp, cadastro, situação e link `wa.me` | `PromoterLeadOut` e `promoter.service.list_leads` retornam nome/telefone/status/data | Falta sexo e idade em serviço, schema e UI. Filtro pendente verifica `started`/`checkout`, mas `Lead.Status` real é `pending`, `paid`, `failed` |
| Financeiro do promotor | Lista últimas 200 comissões; soma pendentes/processadas e pagas | API lista valores persistidos; resumo tem semana e próximo fechamento | Copy fixa R$100/R$500 “a cada 5”, em desacordo com bônus uma vez na semana e com regra de dados no backend. UI declara Pix validado sem condicionar o texto ao campo `pix_validated` |
| Administrador | Frontend próprio com Polos, Preços, Financeiro, Documentos, Usuários, Treinamento, Notificações, Auditoria | `/api/v1/staff/platform/config` para preços/comissões; hubs permitem coordenador e polo padrão | Treinamento ainda exposto mesmo com regra v1 sem LMS. Sem configuração canário segregada por identidade. Não há seletor independente de promotor padrão; o fallback usa coordenador do polo padrão |

As rotas e components acima foram lidos diretamente. Não foi realizado login autenticado nem smoke test de UI nesta subauditoria.

## Bloqueios corrigidos localmente

1. `backend.supletivo.net.br/users/roles/candidate/documents.py:198`: `_doc_section_dict` lia `validation_result` do serializer público `documents.service.as_dict`, que omite esse campo. Resultado: `photos`/`extracted` vazios e `next_slot` apontando para frente mesmo quando o documento completo estava aprovado. A seção específica do candidato agora consulta o resultado persistido do subdocumento; não expõe o JSON bruto.
2. `backend.supletivo.net.br/users/roles/candidate/documents_ai.py:295`: `_doc_post_approval` chamava `_advance_documents` sem definição/import no módulo. Corrigido para a fachada `service._advance_documents`, preservando a lógica real de avanço e conclusão cadastral.
3. `backend.supletivo.net.br/users/roles/candidate/documents_decision.py:66`: revisão manual usava `me_dict` e `_apply_doc_extracted` sem definição/import local. As chamadas agora passam pela fachada `service`, tanto na rejeição quanto na aprovação.

Regressões adicionadas em `backend.supletivo.net.br/tests/test_candidate_document_pipeline_contract.py`: serialização HTTP de RG/CNH aprovado, task de frente que oferece verso, extração que persiste identidade e avança para Pix, conclusão cadastral real que cria Promoter ACTIVE, decisões manuais de aprovação/rejeição com resposta canônica.

Comando executado:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_candidate_document_pipeline_contract.py tests/test_candidate_doc_race.py tests/test_candidate_async_completion.py tests/test_candidate_production_activation.py tests/test_candidate_upload_runtime.py -q
```

Resultado: **29 passed em 5.67s**. Banco de teste e rotas/tarefas/fachadas reais; IA, notificação e biometria externas substituídas na suíte local. Isso verifica as falhas de integração entre módulos; não constitui prova de OCR real, identidade real ou conclusão em produção. Arquivos permanecem locais, sem commit/deploy desta subauditoria.

## Regras financeiras confirmadas no código e riscos concretos

- `Lead.lock_pricing` congela preços no momento da captura (`users/roles/lead/models.py:88`); checkout usa valores do lead. Deve provar em produção que alteração do admin só afeta nova proposta.
- `lead.mark_paid` / `_apply_effects` cria matrícula e comissão do promotor; crédito é idempotente por `(source_type, source_external_id)` no banco (`finance/interface/commissions.py:42`, `finance/models.py:72`).
- `weekly._items` agrupa por semana de origem e cria um bônus flat por pessoa/semana, com fonte determinística. Janela do código é sexta 18h → próxima sexta 18h (`finance/interface/commissions.py:72`).
- `can_receive` exige Promoter ACTIVE com `activated_at <= fechamento`; candidato acumula pendentes (`finance/interface/eligibility.py:5`). Coordenador retorna elegível diretamente, sem examinar status do usuário/polo; revisar os bloqueios desejados antes de afirmar que suspensão também impede pagamentos de coordenador.
- Estorno cancela comissão pendente; já paga gera crédito negativo para próximo repasse. Também revoga bônus se vendas válidas da semana original caem abaixo da meta (`finance/interface/reversals.py`). Não executar estorno canário sem checar os valores reais vinculados.
- `promoter.service.summary:428` conta comissões de lead canceladas para a meta e soma canceladas no valor semanal. `total_received:433` considera só status corrente PAID: quando uma comissão paga é cancelada, o histórico “já recebido” diminui, apesar de ter existido uma transferência real. O extrato de pagamentos/ledger precisa ser a fonte do total efetivamente recebido, com dívida/reversão apresentada separadamente.
- `credit_commission:54` lê o valor global no evento do pagamento, embora o lead guarde campos de comissão no snapshot. O bônus também lê valores globais ao fechar. Isso precisa de resolução por fonte para canários; baixar as configurações globais mudaria operações de outros clientes.
- `candidate.tasks._wrap` captura exceções e só registra log; uma task pode finalizar no sistema de fila sem produzir aprovação. Monitoramento deve verificar efeito persistido, erro da task e tempo de pendência, não só processo vivo/tarefa terminada.

## Canário segregado: proposta para implementação, não funcionalidade existente

**Não alterar preços ou comissões globais para testar.** Não usar scripts que fabricam lead PAID ou bypassam provedores como evidência de pagamento.

1. Criar configuração de canário exclusivamente staff, com `run_id`, intervalo de validade, CPFs/telefones permitidos e valores aprovados: aluno Pix 1.01 / cartão 1.02; comissão direta 0.01; bônus flat 0.10; coordenador 0.05; meta permanece 5. Exibir CPF mascarado no relatório; nenhum segredo ou documento real em Git/issue.
2. Resolver valores pelo perfil real após a identificação no fluxo da landing. Parâmetro de URL arbitrário não deve liberar desconto. O snapshot da proposta deve registrar `canary_run_id`, valores, origem e identidade interna; nova cobrança deriva desse snapshot, com os mesmos provedores e webhooks reais.
3. Fazer crédito direto/coordenador ler a configuração da fonte de origem (lead / matrícula), evitando reduzir comissão de vendas normais do mesmo promotor. Não usar somente CPF do beneficiário, pois o proprietário pode receber comissões legítimas de outros alunos.
4. Separar contagem de meta canário da contagem comercial. Cinco vendas de teste não devem disparar bônus comercial de R$500. Fonte determinística do bônus deve incluir o `run_id`, e o snapshot preservar valor/meta/semana. O fechamento seleciona somente comissões do teste autorizado e o destinatário permitido; não pode misturar saldo histórico num Pix de teste.
5. Registrar trilha de pagamento: checkout local, ID/reference do provedor, webhook autenticado recebido/processado, efeito matrícula/comissão, solicitação de repasse, validação de saque, transferência final, lançamento de ledger, WhatsApp enviado. Reenvio da mesma notificação deve resultar em um único efeito financeiro.
6. Testar retenção de candidato e liberação no fechamento seguinte à ativação. Um fechamento simulado com data futura pode ajudar a verificar cálculo, mas não prova disparo real da agenda de sexta às18h. Para esse requisito, guardar execução real de agenda ou reportar explicitamente que resta a próxima janela operacional.

## Limpeza / recriação sem destruir histórico financeiro

`users.roles.service.purge_funnel_user:138` só permite apagar usuários de funil. Recusa staff/superuser (`:199`), coordenador (`:212`), promotor/indicações e comissões/payouts (`:218`). `Commission.payee` e `PaymentRequest.payee` são FK PROTECT. Forçar exclusão do proprietário/coordenador ou apagar comissões para liberar FK destruiria rastreabilidade.

- Antes de qualquer exclusão, inventariar dependências e identificar operações canário pelo `run_id` + IDs exatos. Nunca selecionar por nome ou apagar todos os registros da identidade.
- Um lead não pago sem registros financeiros pode usar o purge existente e ser recriado pela landing. Pagamentos do aluno precisam manter seus IDs/referências e sua vinculação histórica mesmo que o cadastro do teste seja reiniciado.
- Para teste completo com recomeço após pagamento, implementar arquivamento de ciclo canário: preservar transações/ledger/provedor/resultado e liberar um novo cadastro de teste de maneira controlada. Não redefinir pagamento como não pago ou reenviar cobrança antiga.
- Conta proprietária staff/hub precisa ser preservada enquanto se recomeça o ciclo funcional candidato/promotor. O desenho exato do reset deve ser explícito e auditável; o endpoint atual não oferece esse comportamento.

## Evidências de aceite ainda necessárias

1. Cadastro novo via landing com usuário fornecido; tabela comercial igual ao admin; configuração canário só para identidade autorizada; OTP real e WhatsApp observado.
2. Candidato recebe link imediato; aluno pelo link fica vinculado ao candidato/hub correto; Pix 1.01 e cartão 1.02 no provedor; webhooks únicos promovem lead→matrícula e crédito 0.01 com retenção.
3. RG/CNH, comprovante e selfie reais pelo frontend; triagem, ack assíncrono, OCR preenchendo dados, rejeição com motivo e recuperação/revisão manual; cadastro completo ativa sem LMS.
4. Navbar correspondente ao estado e role; documentos acessíveis; leads com nome/sexo/idade/WhatsApp; compartilhamento funcional; saldo derivado de ledger, incluindo estorno sem apagar recebimento histórico.
5. Cinco matrículas canário geram só bônus0.10 uma vez na semana; payout0.01/0.10 autenticado, confirmado e notificado; candidato ativado após fechamento só recebe no seguinte.
6. Conclusão com diploma + novo histórico + foto de entrega física gera comissão hub0.05 apenas uma vez; taxas reais ao parceiro e dados de acesso comprovados no fluxo do coordenador.
7. Reset/recriação via landing mantém trilha financeira; release identificada, versões de web/worker compatíveis, smoke real e rollback executável documentado.

Até esses passos terem evidência, o estado correto é **trabalho em recuperação, homologação pendente**.
