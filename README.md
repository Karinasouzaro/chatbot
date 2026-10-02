# AfesuTech Chatbot 🦋

Chatbot Full-Stack com Inteligência Artificial e Voz — AFESU Veleiros / SENAI-SP.

## 🏗️ Arquitetura

```
.
├── backend/          # FastAPI + Groq LLM (Python)
└── frontend/         # React + Vite (deploy na Vercel)
```

## 🔐 Segurança — Variáveis de Ambiente

> **Nunca suba chaves de API para o GitHub.**

- O arquivo `backend/.env` está protegido pelo `.gitignore` e **jamais** vai ao repositório.
- Use `backend/.env.example` como referência para criar seu `.env` local.

### Backend (Railway ou Render)

Configure as variáveis no painel do serviço de hospedagem:

| Variável       | Descrição                                      |
|----------------|------------------------------------------------|
| `GROQ_API_KEY` | Chave da API Groq (console.groq.com/keys)      |
| `GROQ_MODEL`   | Modelo LLM (ex: `llama-3.3-70b-versatile`)    |
| `PORT`         | Porta do servidor (default: `8000`)            |

### Frontend (Vercel)

Configure em **Settings → Environment Variables** na Vercel:

| Variável        | Valor em Produção                         |
|-----------------|-------------------------------------------|
| `VITE_API_URL`  | URL pública do seu backend (Railway/Render) |

## 🚀 Deploy

### Frontend → Vercel

1. Importe o repositório na [Vercel](https://vercel.com/new)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Adicione `VITE_API_URL` em *Environment Variables* com a URL do backend

### Backend → Railway

1. Crie um novo projeto no [Railway](https://railway.app)
2. Conecte este repositório
3. **Root Directory**: `backend`
4. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Adicione as variáveis `GROQ_API_KEY`, `GROQ_MODEL` em *Variables*

## 💻 Desenvolvimento Local

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env         # edite e adicione sua GROQ_API_KEY
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # edite se necessário
npm run dev
```

## 🧪 Testar

```bash
cd backend
python test_backend.py
```
