## Sistema de Quizzes

Sistema web para gerenciamento e execução de quizzes. O sistema oferece duas modalidades de uso: execução assíncrona, em que participantes respondem ao quiz de forma independente pelo navegador, e execução síncrona (ao vivo), em que um host controla a sessão em tempo real enquanto os jogadores participam simultaneamente.
 
## Requisitos
 
- Node.js >= 18
- MongoDB
- Redis
## Instalação
 
Instale as dependências do backend:
 
```bash
cd backend
npm install
```
 
Instale as dependências do frontend:
 
```bash
cd frontend
npm install
```
 
## Configuração
 
Os arquivos de exemplo estão disponíveis na raiz e em cada pacote. Copie-os antes de executar:
 
```bash
cp env.example .env
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```
 
### `.env` (raiz — portas dos contêineres Docker)
 
```env
FRONTEND_PORT=5173
BACKEND_PORT=3000
MONGO_PORT=27017
REDIS_PORT=6379
```
 
### `backend/.env`
 
```env
UPLOADS_DIR=./public
SERVER_PORT=3000
 
MONGO_URL=mongodb://mongo:27017/quizdb
REDIS_URL=redis://redis:6379
 
# Gere um valor seguro: openssl rand -hex 32
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRES_IN=1d
 
REFRESH_JWT_SECRET=sua_chave_refresh_aqui
REFRESH_JWT_EXPIRES_IN=7d
 
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
 
FRONTEND_URL=http://localhost:5173
```
 
### `frontend/.env`
 
```env
VITE_API_URL=http://localhost:3000
VITE_BASE_URL=http://localhost:5173
VITE_DATA_URL=http://localhost:5173/public
 
# https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_FONTS_API=https://www.googleapis.com/webfonts/v1/webfonts
VITE_GOOGLE_FONTS_API_KEY=sua_chave_aqui
```

## Docker
 
Um `docker-compose.yml` é fornecido para rodar toda a aplicação (frontend, backend, MongoDB e Redis) em contêineres.
 
Certifique-se de que os arquivos `.env` estão configurados antes de executar. Em seguida:
 
```bash
docker compose up --build
```
 
As portas são definidas pelo `.env` da raiz. Com os valores padrão, o frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3000`.
 
O backend só sobe após o MongoDB e o Redis passarem no healthcheck. Os arquivos enviados pelos usuários são compartilhados entre os contêineres via volume nomeado (`files_uploads`), montado como somente leitura no Nginx do frontend.
 
## Arquitetura
 
A aplicação é dividida em dois pacotes — `backend` e `frontend` — em um único repositório.
 
O backend é construído com **NestJS** e utiliza dois bancos de dados:
 
- **MongoDB** (via Mongoose) — armazena quizzes, questões, usuários e respostas
- **Redis** (via ioredis) — gerencia o estado das sessões ao vivo e os timers das questões
A comunicação em tempo real é feita por um gateway **Socket.IO** no namespace `/quiz`. A autenticação utiliza JWT com refresh token, suportando login Google OAuth2.
 
O frontend é uma SPA em **React + Vite + TypeScript**. A comunicação com o backend ocorre via HTTP (Axios) e WebSocket (Socket.IO client).
 
## Estrutura do Projeto
 
```
quiz-mostra/
├── backend/
│   └── src/
│       ├── app/                    # Módulo raiz
│       ├── auth/                   # Estratégias JWT, Local e Google OAuth2
│       ├── database/               # Configuração dos bancos de dados
│       └── modules/
│           ├── quizzes/            # CRUD de quizzes e questões
│           ├── sessions/           # Persistência de sessões
│           ├── session/            # Gateway WebSocket das sessões ao vivo
│           ├── response/           # Respostas dos participantes
│           ├── users/              # Gerenciamento de usuários
│           ├── fonts/              # Upload e servimento de fontes
│           └── shared/
│               ├── gateway/        # Gateway WebSocket base
│               ├── storage/        # Serviço de armazenamento de arquivos
│               ├── redis-timer/    # Contagem regressiva das questões via Redis
│               └── file-processing/# Processamento de arquivos ZIP e XLSX
│
└── frontend/
    └── src/
        ├── api/                    # Instância Axios e chamadas por recurso
        ├── contexts/               # Contextos React (Auth, Socket)
        ├── components/             # Componentes reutilizáveis
        ├── hooks/                  # Hooks customizados
        ├── pages/                  # Páginas da aplicação
        └── utils/                  # Utilitários (snackbar, carregamento de fontes)
```
 