# Design, acessibilidade, conteúdo e SEO

Registro de 10/10/2026. Esta etapa consolida governança e observações do contexto de 09/10; não houve nova auditoria visual completa, alteração de layout ou homologação. Ler [DESIGN.md](../../../DESIGN.md) e o AGENTS de cada app antes da implementação.

## Contrato visual e de conteúdo

Tokens, cores, fontes, componentes e comportamento de movimento vêm do DESIGN canônico. Todo conteúdo exibido deve vir do backend conforme a decisão do usuário: o inventário inclui textos comerciais, preços, condições, requisitos, estados, contatos e comissões. Não confundir tokens visuais com conteúdo de negócio.

No app, seguir a navegação conforme papel e estado descrita no AGENTS local. O código atual é Astro com Svelte/React; não planejar correções a partir da referência antiga a SvelteKit. As instruções locais mais recentes do app usam rotas em inglês; verificar redirects de rotas legadas. A experiência continua em PT-BR.

## O que conferir em cada produto

| Produto | Percursos e evidências necessárias |
| --- | --- |
| Landing de aluno | Conteúdo/pricing inicial e após hidratação, captura, OTP, erros, elegibilidade e continuidade para matrícula |
| Landing de promotor | Entrada gratuita, link/indicação inicial, comissão/bônus e ausência de requisito de treinamento adiado |
| App candidato/promotor | Papéis/estados, indicação, cadastro/verificações, saldo retido, extrato e recebimento |
| App aluno | Documentos, cobrança, acesso externo, pendências, prova e documentos finais |
| App polo | Dossiê, revisões, taxas, credenciais, resultado, anexos e entrega com foto |
| Admin | Tabelas distintas, padrão selecionável, revisão de estorno e supervisão financeira; erros persistem visíveis |

`HubOperationsView.svelte` e `StudentActiveView.svelte` já existem no checkout local. Conferir seu comportamento antes de propor outras telas; arquivos locais não demonstram sua presença na entrega publicada.

## Pontos do contexto de 09/10 a reexaminar

- Modal: trap de foco, foco inicial/restaurado, teclado, fundo bloqueado, descrição de erro e interrupção de requisições.
- Mobile: alvos de toque, teclado virtual, safe-area, dock sem colisão e ausência de loops de animação em touch.
- Estilo: valores fora dos tokens e preferência por movimento reduzido respeitada.
- Preços: HTML inicial, cálculo dinâmico, schema, metadados e CTA devem acompanhar a condição efetiva do backend.
- SEO: páginas noindex não devem ser promovidas no sitemap; lastmod deve refletir alteração real, não somente horário de build.
- Analytics: eventos de CTA duplicados entre scripts e dados pessoais indevidos exigem revisão conjunta com o funil.
- Referências a treinamento, estudo na nossa plataforma ou condição antiga devem acompanhar o escopo confirmado.

Não publicar afirmação de credenciamento, validade, prazo ou condição sem sua fonte institucional cadastrada e conferida. O endereço SIGA fornecido identifica o acesso operacional; não fornece sozinho a razão social ou os documentos do parceiro.

## Prova visual e funcional exigida

| Ensaio | Resultado esperado |
| --- | --- |
| 360 px, desktop, zoom e teclado virtual | Formulários e controles utilizáveis, sem corte de conteúdo ou colisão do dock |
| Teclado e leitor de tela | Ordem de foco, labels, erros, status e modal compreensíveis |
| Contraste e movimento reduzido | Tokens canônicos, contraste exigido pelo DESIGN e animações desativáveis |
| API lenta/indisponível | Estado correto; nenhum preço ou sucesso inventado para preencher a tela |
| Papel e estado alterados | API e navegação permitem o mesmo conjunto de ações, inclusive em acesso direto por URL |
| HTML inicial e página carregada | Conteúdo/preços/metadados coerentes; nenhum salto para condição divergente |
| Links privados e parceiro | Arquivo autorizado realmente abre; link externo correto deriva da matrícula |

Executar nos percursos integrados de E6/E7 e registrar telas e resultados necessários à homologação do usuário. Uma checagem automatizada não substitui os ensaios de interação. Ver [roteiro](production-correction-plan.md) e [funil](funnel-security-pricing.md) para contratos e falhas financeiras.
