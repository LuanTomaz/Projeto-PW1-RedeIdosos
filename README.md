# Projeto PW1 - Rede de Idosos

Plataforma web para conectar idosos, voluntários e ONGs, com fluxo de cadastro, verificação e gerenciamento de atividades.

**Stack**
- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui + React Query
- Backend: Node.js + Express + TypeScript + MongoDB + Neo4j
- Uploads: Cloudinary

**Principais funcionalidades**
- Cadastro e login por tipo de usuário (idoso, voluntário, ONG)
- Verificação de usuários
- Perfis com localização
- Solicitações e atividades de companhia
- Mapa e relatórios

**Estrutura**
- `frontend/` app web
- `backend/src/` API e serviços

## Requisitos
- Node.js 18+
- MongoDB (Atlas ou local)
- Neo4j
- Conta Cloudinary (para uploads)

## Configuração de ambiente

Crie os arquivos `.env` com base nos exemplos abaixo.

**Backend** (`backend/src/.env`)
```
MONGODB_URI=...
NEO4J_URI=...
NEO4J_USER=...
NEO4J_PASSWORD=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=3000
NODE_ENV=development
JWT_SECRET=...
```

**Frontend** (`frontend/.env`)
```
API_URL=http://localhost:3000
```

## Instalação

**Backend**
```
cd backend/src
npm install
```

**Frontend**
```
cd frontend
npm install
```

## Executando

**Backend**
```
cd backend/src
npm run dev
```

**Frontend**
```
cd frontend
npm run dev
```

## Observações
- O backend roda por padrão em `http://localhost:3000`.
- O frontend consome a API através do `API_URL` no `.env`.
- Rotas e payloads ficam em `backend/src/routes` e `backend/src/controllers`.

---

Se quiser, posso incluir screenshots, badges, documentação de API ou instruções de deploy.
