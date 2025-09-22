SDK Antifraude para NexShop
Projeto desenvolvido para a disciplina de Defesa Cibernética da FIAP. Trata-se de uma solução de Software Development Kit (SDK) para análise de risco e antifraude, desenhada para ser integrada em plataformas de e-commerce como a NexShop.

🎯 Objetivo
O objetivo principal é validar a identidade de utilizadores em momentos críticos da jornada de compra (como login e checkout) de forma passiva, analisando o comportamento e o ambiente do utilizador para gerar um score de risco, sem gerar fricção na experiência de compra.

✨ Funcionalidades Principais
Coleta Passiva de Dados: Captura de device fingerprint (navegador, resolução, idioma) e dados comportamentais (movimento do rato, cliques, tempo na página).

Motor de Análise de Risco: Um backend em Node.js com um sistema de regras configurável para calcular um score de risco em tempo real.

Decisão Automatizada: Fornece uma resposta padronizada (allow, review, deny) para que a aplicação cliente possa agir de acordo.

Fácil Integração: Desenhado para ser "plug-and-play", com um script leve no frontend e um middleware simples no backend.

🛠️ Tecnologias Utilizadas
Frontend: JavaScript (Vanilla JS), React (para a demo), TailwindCSS.

Backend: Node.js, Express.js.

🚀 Como Executar o Projeto
Siga os passos abaixo para executar a simulação em ambiente local.

Pré-requisitos
Node.js (versão 14 ou superior)

Git

Instalação e Execução
Clone o repositório:

git clone [https://github.com/kaiquecorreia01/nexshop-antifraud-sdk.git](https://github.com/kaiquecorreia01/nexshop-antifraud-sdk.git)
cd nexshop-antifraud-sdk

Configure e inicie o Backend:

cd backend
npm install
node server.js

O servidor de análise estará em  http://localhost:3001.

Inicie o Frontend:
Abra um novo terminal.

cd frontend
npm install -g serve
serve

A aplicação de demonstração estará disponível em http://localhost:3000 (ou na porta indicada pelo serve).

Aceda à aplicação abrindo http://localhost:3000 no seu navegador.

👥 Autores
Kaique Correia do Ramo
Everton Henrique Novais de Oliveira


