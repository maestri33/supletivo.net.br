# supletivo.net.br — Diretrizes do Projeto (Landing Page de Aquisição)

Este projeto é a Landing Page oficial de captação, vendas e registro público da plataforma **Supletivo.net.br** (**Supletivo Brasil**).

## 🏷️ Marca & Identidade
- Marca Oficial: **Supletivo.net.br** / **Supletivo Brasil**.
- Descontinuação: Não utilizar identificadores, domínios antigos ou marcas legadas em interfaces, layouts, estilos ou textos públicos.

## 🧭 Escopo & Responsabilidades da Landing Page (`supletivo.net.br`)
- **Captura & Registro Público (100% Exclusivo da LP)**:
  - Todo o fluxo de cadastro e pré-cadastro público de novos alunos pertence a este projeto.
  - Etapas:
    - Entrada de contato / WhatsApp (`/registro/contato` ou componente de alta conversão na LP).
    - Validação de CPF (`/registro/cpf` ou fluxo inline).
- **Regras de Negócio de Cadastro**:
  - Se CPF já cadastrado com outro contato: alertar amigavelmente que o cadastro já existe com outro número, disparar OTP para o número já cadastrado e encaminhar para `https://app.supletivo.net.br/autenticacao/otp`.
  - Se CPF não encontrado: validar formato, enriquecer via API externa, repassar o parâmetro de afiliado/promotor (`?ref=`), criar o lead/aluno, disparar OTP e redirecionar para `https://app.supletivo.net.br/autenticacao/otp`.
- **Fronteira com o App (`app.supletivo.net.br`)**:
  - Esta landing page NÃO gerencia painel do aluno, aulas ou provas.
  - Assim que o pré-cadastro é validado e o OTP é disparado, o usuário é transferido para `app.supletivo.net.br/autenticacao/otp` para validação e login.

## 🛡️ Diretriz Mandatória de Isolamento entre Repositórios, Gestão por Issues e Ciclo de Vida
- **1. Regra de Ouro: Isolamento Absoluto de Repositório ("Não mexa no repositório alheio")**:
  - Assim como nenhum outro projeto mexe no repositório `supletivo.net.br`, este agente **NUNCA deve alterar, editar, criar ou deletar arquivos em outro repositório/diretório**.
  - O trabalho de cada agente/sessão fica **estritamente confinado ao repositório de atuação**.
  - O desacoplamento é absoluto: frontend não toca em backend, backend não toca em frontend, e uma aplicação não altera os arquivos de outra.
- **2. Avaliação Obrigatória de Dependências Cruzadas ao Final de Cada Ação & Criação de Issues**:
  - Ao final de **CADA AÇÃO, TAREFA OU ENTREGA**, o agente **DEVE OBRIGATORIAMENTE AVALIAR** se a funcionalidade implementada exige alguma adequação, novo endpoint, contrato de dados, ajuste de schema, webhook ou serviço externo que envolva outro diretório/repositório.
  - Se for identificada qualquer necessidade externa: **CRIE IMEDIATAMENTE UMA ISSUE NO RESPECTIVO REPOSITÓRIO** (ex: `backend.supletivo.net.br`, `app.supletivo.net.br`, etc.) com a especificação técnica completa, para garantir o alinhamento e não nos perdermos.
- **3. Versionamento Obrigatório a Cada Atualização (SemVer)**:
  - A cada atualização, entrega de código, refatoração ou nova funcionalidade, **DEVE-SE ATUALIZAR JUNTO A VERSÃO DO PROJETO** no `package.json` (`patch` para correções/ajustes, `minor` para novas features, `major` para grandes quebras).
- **4. Momento da Documentação Oficial (Apenas na Subida para Produção)**:
  - **Documentação oficial do app/projeto SÓ DEVE SER CRIADA quando o app de fato for subir para produção**.
  - **O usuário dirá explicitamente o momento exato** de redigir e consolidar a documentação final de produção.
  - É terminantemente proibido criar documentações prematuras, changelogs burocráticos ou issues de documentação final antes da autorização explícita do usuário para entrada em produção.

## 🌐 Convenções
- Código e APIs: 100% Inglês.
- Interface e Copy: 100% PT-BR.
- URLs públicas: 100% PT-BR.
