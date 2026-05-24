# Quiz Mostra Profissões - Backend

Este é o backend do projeto "Quiz Mostra Profissões", desenvolvido utilizando NestJS com TypeScript.

## Tecnologias Utilizadas

- NestJS
- TypeScript
- TypeORM
- Socket.IO

## Pré-requisitos

- Node.js
- npm ou yarn

## Instalação

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/quiz-mostra-profissoes.git
    ```

2. Navegue até o diretório do backend:
    ```bash
    cd quiz-mostra-profissoes/backend
    ```
    
3. Instale as dependências:
    ```bash
    npm install
    # ou
    yarn install
    ```

## Executando o Projeto

Para iniciar o servidor de desenvolvimento, execute:
```bash
npm run start:dev
# ou
yarn start:dev
```

O servidor estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

- `src/`: Contém o código-fonte do projeto.
  - `modules/`: Módulos da aplicação.
  - `controllers/`: Controladores que lidam com as requisições.
  - `services/`: Serviços que contêm a lógica de negócios.
  - `entities/`: Entidades do TypeORM.
  - `migrations/`: Arquivos de migração do banco de dados.