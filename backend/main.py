"""
API REST do Chatbot de Suporte Full-Stack (AfesuTech)
Camada: Camada 3 — API REST & Comunicação Web
Arquivo: backend/main.py
"""

import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from chatbot_engine import ChatbotEngine

# =============================================================================
# INICIALIZAÇÃO DA APLICAÇÃO E ENGINE
# =============================================================================

app = FastAPI(
    title="AfesuTech Chatbot API",
    description="API REST de atendimento inteligente com IA, RAG e processamento de voz.",
    version="1.0.0"
)

# 1. Configuração de CORS liberando todas as origens para conexão com o frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instância única do motor do chatbot
engine = ChatbotEngine()


# =============================================================================
# 2. MODELOS PYDANTIC
# =============================================================================

class MessageRequest(BaseModel):
    """Modelo de entrada para envio de mensagens ao chatbot."""
    message: str = Field(..., min_length=1, description="Mensagem enviada pelo usuário")
    session_id: Optional[str] = Field(default="default", description="Identificador da sessão do usuário")


class FeedbackRequest(BaseModel):
    """Modelo de entrada para registrar avaliação de resposta (Like / Dislike)."""
    message_id: str = Field(..., description="ID único da mensagem avaliada")
    is_positive: bool = Field(..., description="True para Like (positivo) e False para Dislike (negativo)")


class ChatResponse(BaseModel):
    """Modelo de resposta estruturada do chatbot."""
    id: Optional[str] = Field(default=None, description="Identificador único da resposta para feedback")
    reply: str = Field(..., description="Texto da resposta gerada para o usuário")
    source: str = Field(..., description="Origem da resposta (ex: llm_groq, base_conhecimento, saudacao, fallback)")
    confidence: float = Field(..., description="Nível de confiança da resposta (0.0 a 1.0)")
    timestamp: float = Field(..., description="Timestamp Unix do momento da resposta")
    suggested_actions: List[str] = Field(default_factory=list, description="Lista de perguntas rápidas ou ações sugeridas")


# =============================================================================
# 3. ENDPOINTS DA API REST
# =============================================================================

@app.get(
    "/",
    summary="Status da API e Rotas Disponíveis",
    tags=["Status"]
)
def root() -> Dict[str, Any]:
    """Retorna o status de integridade da API e lista os endpoints principais disponíveis."""
    return {
        "status": "online",
        "service": "AfesuTech Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "root": "GET /",
            "chat": "POST /api/chat",
            "knowledge_base": "GET /api/knowledge-base",
            "metrics": "GET /api/metrics",
            "feedback": "POST /api/feedback",
            "docs": "GET /docs",
            "redoc": "GET /redoc"
        }
    }


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    summary="Enviar Mensagem para o Chatbot",
    tags=["Chat"]
)
def chat_endpoint(request: MessageRequest) -> ChatResponse:
    """
    Recebe a mensagem do usuário, processa pelo ChatbotEngine (LLM / RAG / Fallback)
    e retorna a resposta formatada.
    """
    try:
        session_id = request.session_id or "default"
        result = engine.process_message(request.message, session_id=session_id)

        return ChatResponse(
            id=result.get("id"),
            reply=result.get("resposta", ""),
            source=result.get("origem", "desconhecido"),
            confidence=float(result.get("confianca", 0.0)),
            timestamp=time.time(),
            suggested_actions=result.get("faq_sugerido", [])
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao processar mensagem no engine: {str(e)}"
        )


@app.get(
    "/api/knowledge-base",
    summary="Obter Base de Conhecimento",
    tags=["Knowledge Base"]
)
def get_knowledge_base() -> Dict[str, Any]:
    """Retorna toda a base de conhecimento institucional atualmente carregada."""
    return engine.knowledge_base


@app.get(
    "/api/metrics",
    summary="Métricas de Atendimento e Satisfação",
    tags=["Metrics"]
)
def get_metrics() -> Dict[str, Any]:
    """
    Retorna estatísticas consolidadas de atendimentos, origens de resposta
    e a taxa calculada de satisfação CSAT (%).
    """
    return engine.get_metrics()


@app.post(
    "/api/feedback",
    summary="Registrar Feedback da Resposta",
    tags=["Feedback"]
)
def post_feedback(feedback: FeedbackRequest) -> Dict[str, Any]:
    """
    Registra a avaliação de Like (positivo) ou Dislike (negativo)
    para atualizar os índices de qualidade e satisfação do atendimento.
    """
    success = engine.register_feedback(
        message_id=feedback.message_id,
        is_positive=feedback.is_positive
    )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não foi possível registrar o feedback informado."
        )

    return {
        "status": "success",
        "message": "Feedback registrado com sucesso!",
        "message_id": feedback.message_id,
        "is_positive": feedback.is_positive,
        "current_metrics": engine.get_metrics()
    }


# =============================================================================
# 4. BLOCO DE EXECUÇÃO
# =============================================================================

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
