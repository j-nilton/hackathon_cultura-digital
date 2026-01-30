# Hackathon Cultura Digital — Planejador Pedagógico com IA (BNCC)

Aplicação web para professores organizarem **disciplinas** e **unidades** e gerarem **conteúdo pedagógico alinhado à BNCC** com auxílio de IA (RAG), salvando tudo no Firebase.

## Principais funcionalidades

- Autenticação e perfil de usuário (Firebase Auth)
- CRUD de disciplinas e unidades (Firestore)
- Gerador IA: cria descrição, objetivos, habilidades BNCC e sequência de aulas
- Geração opcional com RAG usando índice FAISS (dataset BNCC) + OpenAI

## Stack

- Frontend: React + TypeScript + Vite, Tailwind + shadcn-ui, React Router, React Query
- Infra: Firebase (Auth, Firestore, Storage)
- IA (opcional/local): FastAPI + LangChain + FAISS + OpenAI

## Como rodar (Frontend)

### Pré-requisitos

- Node.js 18+ (recomendado 20+)

### Instalação

```bash
npm install
```

### Variáveis de ambiente (obrigatório)

Crie um arquivo `.env.local` na raiz do projeto:

```bash
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

Essas chaves vêm do seu projeto no Firebase Console (Configurações do projeto → Apps).

### Subir a aplicação

```bash
npm run dev
```

O Vite está configurado para rodar em `http://localhost:8080` ([vite.config.ts](file:///c:/Users/nilton/Documents/hackathon_cultura-digital/vite.config.ts)).

## Como rodar (Servidor RAG/IA — opcional)

O frontend chama o endpoint `/rag/generate`. Em desenvolvimento, ele é proxyado para `http://127.0.0.1:8000` ([vite.config.ts](file:///c:/Users/nilton/Documents/hackathon_cultura-digital/vite.config.ts#L8-L20)).

Se você não subir o servidor RAG, o app ainda abre, mas o gerador IA pode retornar um texto de fallback (sem contexto BNCC).

### Pré-requisitos

- Python 3.10+ (recomendado 3.11+)

### Instalação (dependências Python)

Como não há `requirements.txt` no repositório, instale manualmente:

```bash
python -m pip install --upgrade pip
python -m pip install fastapi uvicorn python-dotenv "pydantic>=2" openai langchain-community langchain-openai faiss-cpu
```

### Variáveis de ambiente (RAG)

No seu `.env.local` (ou em variáveis do sistema), adicione:

```bash
OPENAI_API_KEY="..."
OPENAI_CHAT_MODEL="gpt-4o-mini"   # opcional
OPENAI_EMBED_MODEL="text-embedding-3-large" # opcional
RAG_TOP_K="5" # opcional
```

### Subir o servidor

Execute a partir da raiz do projeto (necessário para o índice FAISS ser encontrado):

```bash
python -m uvicorn rag_server:app --reload --port 8000 --app-dir src/infra/services/rag
```

Saúde do serviço:

- `GET http://127.0.0.1:8000/rag/health`

Implementação do servidor: [rag_server.py](file:///c:/Users/nilton/Documents/hackathon_cultura-digital/src/infra/services/rag/rag_server.py)

## Testes e qualidade

```bash
npm run lint
npm test
```

## Deploy

O projeto está preparado para deploy de SPA (ex.: Vercel) com rewrite para `index.html` ([vercel.json](file:///c:/Users/nilton/Documents/hackathon_cultura-digital/vercel.json)).

Observação: o servidor RAG não é incluído no deploy do frontend; ele precisa ser hospedado separadamente (ou executado localmente).
