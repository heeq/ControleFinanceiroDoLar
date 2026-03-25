# ControleFinanceiroDoLar

Sistema de controle de gastos residenciais

# Instalacao
- Pre-requisito: .NET 8 SDK + Node.js

- Frontend: primeiramente instalar dependencias (via bash no diretorio do repositorio)
  - cd ControleFinanceiroDoLar.Client
  - npm install @vitejs/plugin-basic-ssl @radix-ui/react-alert-dialog @radix-ui/react-icons @radix-ui/themes @radix-ui/colors lucide-react prop-types
  
- Backend: utilizar bash no diretorio do repositorio
  - cd ControleFinanceiroDoLar.Server
  - dotnet run --urls "https://localhost:44331"
  - É essencial que seja executado assim para carregar a API na url correta
  - API disponível em https://localhost:44331
  - (documentação swagger: https://localhost:44331/swagger)
  - O frontend irá abrir automaticamente e estará disponível em https://localhost:5173/ 
  
- Testes de integração
  - cd ControleFinanceiroDoLar.Server.Api.Tests
  - dotnet restore
  - dotnet test

# Uso
- Para facilitar, a conexão não será HTTPS, portanto terá que ir no botão Avançadas -> ir para localhost (não seguro)
- Na tela de dashboard será possível apenas visualização dos gastos e itens
- No menu Transações, é possível criar uma nova pessoa, apagar pessoa, criar categoria (escolhendo entre despesa, receita e ambos)
  O valor da transação pode ser negativo ou positivo em despesas não interferindo no somatório
- Caso deseje zerar o banco basta apagar o arquivo "\ControleFinanceiroDoLar.Server\controlefinanceiro.db"

# Tecnologias

Backend: 
- ASP.NET CORE (.net 8)
- Entity Framework Core
- SqLite
 

Testes:
- xUnit
 
Frontend:
- React + Vite
- Typescript
- Radix + Lucide
