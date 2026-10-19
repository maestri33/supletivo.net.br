# Funil, dados pessoais, atribuição e preços

Registro consolidado em 10/10/2026. As observações da landing em navegador e testes locais de 09/10 são preservadas em [audit-context](audit-context-2026-10-09.md). As decisões posteriores do usuário prevalecem sobre as dúvidas daquele contexto. Sem alteração de produto ou homologação.

## Contrato que precisa atravessar os apps

| Informação | Autoridade | Consumidores |
| --- | --- | --- |
| Preço e condições atuais | Backend, editado pelo admin | Landings, app e propostas novas |
| Preço de proposta já emitida | Snapshot persistido da proposta/cobrança | Releitura, checkout, suporte e conciliação |
| Autor da indicação | Backend, conservando referência e atribuição | Funil, matrícula, comissões e extrato |
| Candidato/ATIVO e requisitos | Backend | App, permissão de indicação e recebimento |
| Pagamento e transferência | Estado conciliado com fornecedor | App, admin, comissões e operação do polo |
| Conteúdo exibido e requisitos | Catálogo do backend | HTML inicial, componentes, mensagens e SEO aplicável |

Sem REF: Pix R$ 1.615 ou 12 × R$ 159,90, com promotor padrão selecionado no admin. Com REF válido, inclusive de candidato: Pix R$ 999 ou 12 × R$ 99. Atribuição padrão não ativa a promoção. Alterar tabela vale somente para novas propostas.

## Evidências e lacunas

| Ponto | Evidência datada | Consequência e entrega |
| --- | --- | --- |
| Fontes duplicadas de preço | Backend e borda retornaram valores/parcelas diferentes; HTML inicial observado em 09/10 também tinha preço fixo distinto | E2 define resposta única, consumidor único e proposta com condição preservada |
| Formulário do admin | `PricingView.svelte` reúne gravação de condições diferentes | E2 separa tabelas e seleção do padrão |
| Candidato como indicador | `validate_ref` exige promotor ACTIVE e painel exige papel de promotor | E3 mantém referência disponível desde o cadastro inicial |
| Snapshot existente | Lead tem `pricing_snapshot`, `lock_pricing` e `get_pricing_dict` | Reaproveitar o mecanismo, conferir releituras e históricos antes de migrar |
| Falha de captura tratada como ausência | Contexto de 09/10: `checkAuth` pode retornar null em falha | E7 distingue indisponibilidade, não encontrado e sucesso; não avançar silenciosamente |
| Respostas atrasadas e repetição | Contexto de 09/10 registra riscos após fechar modal/editar campos | E7 cancela/desconsidera resposta fora do estado atual e protege ações duplicadas |
| Dados na navegação e analytics | Contexto de 09/10: dados pessoais em cookie JS compartilhado, query OTP e telefone no dataLayer | E7 reduz dados expostos e registra apenas o necessário no ponto autorizado |
| Consulta por CPF antes de OTP | Contrato a conferir; não foram feitas sondagens com CPF real | E7 testa com dados controlados e verifica prova de identidade, limites e resposta permitida |
| Sessão e downloads privados | App armazena tokens no cliente; proxy de mídia não os acrescenta; backend exige Bearer | E6/E7 demonstram download autenticado e revogação, sem token permanente em link |

Os itens de 09/10 são observações e riscos localizados, não afirmações de que uma exploração ocorreu. Reexaminar o checkout ao implementar; a auditoria não publicou correções.

## Percurso exigido

1. Vitrine recebe condição canônica e registra indicação de modo explícito.
2. Captura responde com estado verificável; falha de rede ou fornecedor não vira cadastro concluído.
3. OTP prova acesso e a sessão encaminha para papel/estado real.
4. Proposta conserva preço, condições e autor; configuração futura não altera o registro.
5. Cobrança oficial deriva da proposta. Confirmação do fornecedor aplica matrícula e comissão uma vez.
6. Documentação, taxas e credenciais avançam conforme os fatos persistidos, inclusive em retomada.
7. Estudos externos e conclusão aparecem no app conforme operação do coordenador.
8. Fechamento, bônus, estorno e compensação usam registros de origem e eventos reconciliados.

## Ensaios exigidos para encerrar a correção

- Duas entradas × duas formas de pagamento; mesmas condições em HTML, API, snapshot e fornecedor.
- Alteração administrativa entre emissão e pagamento; proposta anterior preservada.
- REF de candidato, REF de ativo, ausência de REF e referência inválida com resposta definida.
- Captura interrompida, erro de consulta, resposta fora de ordem, clique duplo e retomada em outro dispositivo.
- OTP inválido/expirado, falha de envio, refresh, logout e token revogado; API e navegação conservam as mesmas permissões.
- Documento privado com sessão válida, sem sessão, com usuário alheio e papel de revisão conforme escopo.
- Webhook repetido, pagamento fora de ordem e resposta perdida; nenhuma duplicação de direito financeiro.
- Estorno com revisão administrativa da matrícula e compensação financeira visível no extrato.

Usar testes de regra e contrato para dinheiro/concorrência e percursos integrados sem mock de API. Dados pessoais reais, OTP real e operações financeiras reais não fazem parte de uma sondagem automática desta auditoria.

Fontes locais: `src/components/LeadCaptureModal.astro`, `src/scripts/lead-capture.ts`, `dynamic-pricing.ts`, `main.ts`, `src/worker.ts`, `src/config.ts`; consumidores e serviços indicados em [E2, E3, E6 e E7](production-correction-plan.md). Política de privacidade deve refletir a coleta efetiva após a correção, sem depender de descrição antiga restrita ao app.
