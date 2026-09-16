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

## 🛡️ Diretriz de Isolamento do Frontend & Gestão via Issues
- **Foco Estrito no Frontend:** Todo desenvolvimento neste repositório deve se concentrar **exclusivamente no frontend da sua respectiva landing page** (UI/UX, componentes, estilização, animações e responsividade).
- **Contratos e Dependências de Backend via Issues:** Toda solicitação de novos endpoints, documentação esperada, modelos de dados ou integrações de borda/mensageria (ex: Evolution API) deve ser registrada previamente como **issue no repositório correspondente** (ex: `backend.supletivo.net.br`). A lógica de backend e infraestrutura será processada lá a partir da issue documentada, preservando o desacoplamento total entre camadas.

## 🌐 Convenções
- Código e APIs: 100% Inglês.
- Interface e Copy: 100% PT-BR.
- URLs públicas: 100% PT-BR.

