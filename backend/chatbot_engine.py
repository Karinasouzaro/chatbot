"""
Motor de Inteligência Artificial & PLN (Chatbot Engine)
Projeto: Chatbot de Suporte Full-Stack (AfesuTech)
Camada: Camada 2 — Inteligência Artificial & PLN (AI Engine)
"""

import os
import sys
import json
import re
import uuid
import unicodedata
from datetime import datetime
from pathlib import Path
import urllib.request
import urllib.error


class ChatbotEngine:
    """
    Motor inteligente do chatbot responsável por:
    - Carregar e processar a base de conhecimento (RAG).
    - Orquestrar a LLM Generativa (Groq / Llama-3) com ancoragem temporal.
    - Processar PLN léxico e similaridade como fallback offline ou local.
    - Gerenciar métricas de atendimento e feedback de usuários.
    """

    # Conjunto de stopwords comuns em português para filtragem léxica
    STOPWORDS_PT = {
        "a", "o", "as", "os", "um", "uma", "uns", "umas", "de", "do", "da", "dos", "das",
        "em", "no", "na", "nos", "nas", "por", "para", "pra", "pro", "com", "sem", "sobre",
        "entre", "e", "ou", "mas", "que", "se", "como", "qual", "quais", "quem", "quando",
        "onde", "porque", "por que", "me", "mim", "meu", "minha", "meus", "minhas",
        "seu", "sua", "seus", "suas", "nosso", "nossa", "nossos", "nossas", "ele", "ela",
        "eles", "elas", "você", "voce", "vocês", "voces", "eu", "nós", "nos", "tem", "temos",
        "têm", "esta", "está", "estao", "estão", "estou", "eh", "é", "são", "sao", "ser",
        "estar", "ter", "fazer", "pode", "podem", "poderia", "gostaria", "queria", "quero"
    }

    # Padrões de saudações comuns em português
    GREETING_PATTERNS = [
        r"\b(ol[aá]|oi|oie|bom\s+dia|boa\s+tarde|boa\s+noite|e\s+a[ií]|fala|sauda[cç][oõ]es|hello|hi)\b"
    ]

    def __init__(self, kb_path: str = None, env_path: str = None):
        """
        Inicializa o motor do chatbot carregando configurações e base de dados.
        """
        self.base_dir = Path(__file__).resolve().parent
        self.kb_path = Path(kb_path) if kb_path else self.base_dir / "base_conhecimento.json"
        
        # Carrega variáveis do arquivo .env se existir
        self._load_env_file(env_path)

        # Configurações da API Groq
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        self.groq_api_url = "https://api.groq.com/openai/v1/chat/completions"

        # Carrega a base de conhecimento
        self.knowledge_base = self._load_knowledge_base()

        # Histórico de conversação multi-turn em memória (por sessão)
        self.sessions_history = {}

        # Dicionário de métricas de atendimento
        self.metrics = {
            "total_messages": 0,
            "resolved_by_knowledge_base": 0,
            "resolved_by_llm": 0,
            "resolved_by_greeting": 0,
            "fallbacks": 0,
            "positive_feedback": 0,
            "negative_feedback": 0
        }

        # Registro de feedbacks por ID de mensagem
        self.feedback_records = {}

    # =========================================================================
    # 1. CARREGAMENTO DE AMBIENTE E BASE DE CONHECIMENTO
    # =========================================================================

    def _load_env_file(self, env_path: str = None):
        """Lê arquivo .env localmente sem exigir bibliotecas externas."""
        possible_paths = [
            Path(env_path) if env_path else None,
            self.base_dir / ".env",
            self.base_dir.parent / ".env"
        ]
        
        for path in possible_paths:
            if path and path.is_file():
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith("#") and "=" in line:
                                key, val = line.split("=", 1)
                                key = key.strip()
                                val = val.strip().strip("'\"")
                                if key not in os.environ:
                                    os.environ[key] = val
                    break
                except Exception as e:
                    print(f"[Aviso] Não foi possível ler o arquivo .env em {path}: {e}")

    def _load_knowledge_base(self) -> dict:
        """Carrega e valida o arquivo JSON da base de conhecimento."""
        if not self.kb_path.is_file():
            print(f"[Erro] Arquivo de base de conhecimento não encontrado: {self.kb_path}")
            return {"empresa": "AfesuTech", "descricao": "", "topicos": [], "faq_rapido": []}

        try:
            with open(self.kb_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data
        except Exception as e:
            print(f"[Erro] Falha ao carregar JSON da base de conhecimento: {e}")
            return {"empresa": "AfesuTech", "descricao": "", "topicos": [], "faq_rapido": []}

    # =========================================================================
    # 2. INTEGRAÇÃO COM LLM GENERATIVA (GROQ API / LLAMA-3)
    # =========================================================================

    def _get_current_date_pt(self) -> str:
        """Gera a data atual formatada por extenso em português."""
        meses = [
            "janeiro", "fevereiro", "março", "abril", "maio", "junho",
            "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        ]
        agora = datetime.now()
        return f"{agora.day} de {meses[agora.month - 1]} de {agora.year}"

    def _build_system_prompt(self) -> str:
        """
        Constrói o System Prompt detalhado com ancoragem temporal e
        injeção do contexto factual da empresa (RAG factual).
        """
        empresa = self.knowledge_base.get("empresa", "AfesuTech Soluções Inteligentes")
        descricao = self.knowledge_base.get("descricao", "")
        data_atual = self._get_current_date_pt()

        # Compila os tópicos da base de conhecimento para o prompt
        topicos_text = []
        for topico in self.knowledge_base.get("topicos", []):
            perguntas = ", ".join(f'"{p}"' for p in topico.get("perguntas_chave", []))
            topicos_text.append(
                f"### Tópico: {topico.get('id')}\n"
                f"- Perguntas frequentes: {perguntas}\n"
                f"- Informação oficial: {topico.get('resposta')}\n"
            )

        contexto_rag = "\n".join(topicos_text)
        faq_rapido = "\n".join(f"- {faq}" for faq in self.knowledge_base.get("faq_rapido", []))

        prompt = (
            f"Você é a assistente virtual inteligente e acolhedora da empresa '{empresa}'.\n"
            f"Hoje é {data_atual}.\n\n"
            f"## Sobre a Empresa:\n{descricao}\n\n"
            f"## Base de Conhecimento Factual Oficial (RAG):\n{contexto_rag}\n\n"
            f"## Perguntas Frequentes Rápidas:\n{faq_rapido}\n\n"
            f"## Diretrizes de Comportamento e Resposta:\n"
            f"1. Responda sempre em Português do Brasil com tom cordial, profissional e prestativo.\n"
            f"2. Use formatação Markdown rica (negrito, listas com marcadores, destaques em código se aplicável) e emojis adequados.\n"
            f"3. Responda estritamente com base nos dados oficiais da empresa acima. Não invente planos, preços ou políticas inexistentes.\n"
            f"4. Se o usuário fizer uma pergunta fora do escopo ou que você não saiba, responda educadamente oferecendo o e-mail de suporte (suporte@afesutech.com) ou sugerindo tópicos conhecidos.\n"
            f"5. Mantenha as respostas concisas, diretas e agradáveis de ler."
        )
        return prompt

    def _call_groq_llm(self, user_message: str, session_id: str = "default") -> str:
        """
        Executa a requisição HTTP para a API da Groq utilizando urllib nativo,
        preservando o histórico conversacional multi-turn.
        """
        if not self.groq_api_key:
            raise ValueError("Chave GROQ_API_KEY não configurada.")

        # Inicializa o histórico da sessão se não existir
        if session_id not in self.sessions_history:
            self.sessions_history[session_id] = []

        system_prompt = self._build_system_prompt()

        # Constrói a lista de mensagens para o modelo (mantendo as últimas 8 mensagens)
        messages = [{"role": "system", "content": system_prompt}]
        for turn in self.sessions_history[session_id][-8:]:
            messages.append(turn)

        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.groq_model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 800
        }

        req = urllib.request.Request(
            self.groq_api_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.groq_api_key}",
                "User-Agent": "AfesuTech-ChatbotEngine/1.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                if response.status == 200:
                    resp_data = json.loads(response.read().decode("utf-8"))
                    answer = resp_data["choices"][0]["message"]["content"].strip()

                    # Atualiza o histórico de conversação multi-turn
                    self.sessions_history[session_id].append({"role": "user", "content": user_message})
                    self.sessions_history[session_id].append({"role": "assistant", "content": answer})

                    return answer
                else:
                    raise RuntimeError(f"Erro HTTP Groq: status {response.status}")
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8") if e.fp else ""
            raise RuntimeError(f"Erro na API Groq ({e.code}): {error_body}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"Erro de conexão com a API Groq: {e.reason}")

    # =========================================================================
    # 3. MOTOR LÉXICO, PLN E FALLBACK OFFLINE
    # =========================================================================

    def _normalize_text(self, text: str) -> str:
        """Remove acentos e caracteres especiais para normalização."""
        text = unicodedata.normalize("NFD", text)
        text = "".join(char for char in text if unicodedata.category(char) != "Mn")
        return text.lower()

    def _preprocess_text(self, text: str) -> set:
        """
        Converte para minúsculas, remove pontuação e filtra stopwords em português.
        Retorna um conjunto (set) de tokens limpos.
        """
        if not text:
            return set()

        text_norm = self._normalize_text(text)
        # Remove qualquer caractere que não seja letra ou número
        cleaned = re.sub(r"[^\w\s]", " ", text_norm)
        tokens = cleaned.split()

        # Filtra stopwords
        filtered_tokens = {
            t for t in tokens 
            if t not in self.STOPWORDS_PT and self._normalize_text(t) not in self.STOPWORDS_PT and len(t) > 1
        }
        return filtered_tokens

    def _is_greeting(self, text: str) -> bool:
        """Verifica se a mensagem do usuário é uma saudação inicial."""
        cleaned = self._normalize_text(text)
        cleaned = re.sub(r"[^\w\s]", " ", cleaned).strip()
        tokens = cleaned.split()
        
        # Se for mensagem curta com palavras de saudação
        greeting_words = {"ola", "oi", "oie", "bom dia", "boa tarde", "boa noite", "e ai", "fala", "saudacoes", "hello", "hi"}
        if cleaned in greeting_words:
            return True
        if tokens and tokens[0] in {"ola", "oi", "oie", "fala", "hello", "hi"} and len(tokens) <= 4:
            return True
        if "bom dia" in cleaned or "boa tarde" in cleaned or "boa noite" in cleaned:
            if len(tokens) <= 5:
                return True

        for pattern in self.GREETING_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                if len(tokens) <= 4:
                    return True
        return False

    def _get_greeting_response(self) -> str:
        """Gera uma saudação acolhedora institucional."""
        empresa = self.knowledge_base.get("empresa", "AfesuTech Soluções Inteligentes")
        return (
            f"👋 **Olá! Seja muito bem-vindo(a) à {empresa}!**\n\n"
            f"Eu sou sua assistente virtual com inteligência artificial. Como posso ajudar você hoje?\n\n"
            f"💡 *Você pode me perguntar sobre nossos planos e preços, suporte técnico, integração de APIs ou segurança dos dados!*"
        )

    def _calculate_similarity(self, query_tokens: set, target_phrase: str) -> float:
        """
        Calcula a similaridade léxica (coeficiente de Jaccard e sobreposição)
        entre os tokens da consulta e uma frase alvo.
        """
        target_tokens = self._preprocess_text(target_phrase)
        if not query_tokens or not target_tokens:
            return 0.0

        intersection = query_tokens.intersection(target_tokens)
        union = query_tokens.union(target_tokens)

        # Similaridade Jaccard ponderada com taxa de sobreposição
        jaccard = len(intersection) / len(union) if union else 0.0
        overlap = len(intersection) / len(query_tokens) if query_tokens else 0.0

        # Média ponderada dando maior peso aos tokens buscados pelo usuário
        return (jaccard * 0.4) + (overlap * 0.6)

    def _find_best_topic(self, user_message: str, threshold: float = 0.22):
        """
        Busca o melhor tópico na base de conhecimento calculando a similaridade
        com as perguntas-chave cadastradas.
        """
        query_tokens = self._preprocess_text(user_message)
        if not query_tokens:
            return None, 0.0

        best_topic = None
        highest_score = 0.0

        for topico in self.knowledge_base.get("topicos", []):
            # Compara com cada pergunta-chave do tópico
            for pergunta in topico.get("perguntas_chave", []):
                score = self._calculate_similarity(query_tokens, pergunta)
                if score > highest_score:
                    highest_score = score
                    best_topic = topico

        if highest_score >= threshold and best_topic:
            return best_topic, highest_score

        return None, highest_score

    def _get_fallback_response(self) -> str:
        """Retorna uma resposta elegante de fallback quando a dúvida não for identificada."""
        empresa = self.knowledge_base.get("empresa", "AfesuTech Soluções Inteligentes")
        return (
            f"🤖 **Desculpe, ainda não tenho uma resposta exata para essa pergunta.**\n\n"
            f"Para que eu possa te ajudar melhor, você poderia reformular sua dúvida ou escolher um dos assuntos abaixo?\n\n"
            f"* 💼 **Planos e Preços:** Conheça nossas opções e teste grátis.\n"
            f"* 🛠️ **Suporte Técnico:** Horários de atendimento e abertura de chamados.\n"
            f"* 🔌 **Integrações & APIs:** Documentação para WhatsApp, CRM e Webhooks.\n"
            f"* 🧠 **IA & Segurança:** Como funciona nossa tecnologia e privacidade.\n\n"
            f"✉️ Se preferir falar com um especialista humano da **{empresa}**, envie um e-mail para `suporte@afesutech.com`."
        )

    # =========================================================================
    # 4. GESTÃO DE MÉTRICAS E FEEDBACK
    # =========================================================================

    def register_feedback(self, message_id: str, is_positive: bool) -> bool:
        """
        Registra a avaliação do usuário (positivo ou negativo) para uma resposta emitida.
        """
        if is_positive:
            self.metrics["positive_feedback"] += 1
        else:
            self.metrics["negative_feedback"] += 1

        self.feedback_records[message_id] = {
            "is_positive": is_positive,
            "timestamp": datetime.now().isoformat()
        }
        return True

    def get_metrics(self) -> dict:
        """Retorna as métricas consolidadas do chatbot."""
        total = self.metrics["total_messages"]
        positive = self.metrics["positive_feedback"]
        negative = self.metrics["negative_feedback"]
        total_feedback = positive + negative

        csat = round((positive / total_feedback) * 100, 1) if total_feedback > 0 else 100.0

        return {
            **self.metrics,
            "total_feedbacks": total_feedback,
            "csat_score_percentage": csat
        }

    # =========================================================================
    # 5. PIPELINE PRINCIPAL DE PROCESSAMENTO DE MENSAGENS
    # =========================================================================

    def process_message(self, user_message: str, session_id: str = "default") -> dict:
        """
        Processa a mensagem do usuário executando a seguinte cascata inteligente:
        1. Validação de mensagem vazia
        2. Detecção de saudações
        3. Tentativa com LLM Generativa (Groq/Llama-3) se a API estiver configurada
        4. Motor de Busca Léxica na Base de Conhecimento (RAG Local)
        5. Resposta de Fallback Seguro
        """
        self.metrics["total_messages"] += 1
        message_id = str(uuid.uuid4())
        user_message_clean = user_message.strip() if user_message else ""

        if not user_message_clean:
            return {
                "id": message_id,
                "resposta": "Por favor, digite sua dúvida ou mensagem para que eu possa ajudar você! 😊",
                "origem": "validacao",
                "confianca": 1.0,
                "faq_sugerido": self.knowledge_base.get("faq_rapido", [])
            }

        # 1. Tratamento de saudações
        if self._is_greeting(user_message_clean):
            self.metrics["resolved_by_greeting"] += 1
            return {
                "id": message_id,
                "resposta": self._get_greeting_response(),
                "origem": "saudacao",
                "confianca": 0.95,
                "faq_sugerido": self.knowledge_base.get("faq_rapido", [])
            }

        # 2. Orquestração com LLM Generativa (Groq API)
        if self.groq_api_key:
            try:
                llm_response = self._call_groq_llm(user_message_clean, session_id=session_id)
                self.metrics["resolved_by_llm"] += 1
                return {
                    "id": message_id,
                    "resposta": llm_response,
                    "origem": "llm_groq",
                    "modelo": self.groq_model,
                    "confianca": 0.92,
                    "faq_sugerido": self.knowledge_base.get("faq_rapido", [])
                }
            except Exception as e:
                print(f"[Aviso] Falha ao consultar Groq LLM ({e}). Acionando fallback léxico local...")

        # 3. Motor Léxico / Busca RAG Local
        best_topic, score = self._find_best_topic(user_message_clean)
        if best_topic:
            self.metrics["resolved_by_knowledge_base"] += 1
            return {
                "id": message_id,
                "topico_id": best_topic.get("id"),
                "resposta": best_topic.get("resposta"),
                "origem": "base_conhecimento",
                "confianca": round(score, 2),
                "faq_sugerido": self.knowledge_base.get("faq_rapido", [])
            }

        # 4. Fallback Seguro
        self.metrics["fallbacks"] += 1
        return {
            "id": message_id,
            "resposta": self._get_fallback_response(),
            "origem": "fallback",
            "confianca": 0.0,
            "faq_sugerido": self.knowledge_base.get("faq_rapido", [])
        }


# =============================================================================
# BLOCO DE TESTE / EXECUÇÃO DIRETA
# =============================================================================
if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("Iniciando teste do ChatbotEngine...")
    engine = ChatbotEngine()

    testes = [
        "Olá, bom dia!",
        "Quais são os planos e preços?",
        "Vocês têm integração com WhatsApp e CRM?",
        "Como funciona a segurança dos dados na IA?",
        "Onde fica a pizzaria mais próxima?"  # Pergunta fora do escopo para testar fallback
    ]

    for pergunta in testes:
        print(f"\n--- Pergunta: {pergunta} ---")
        resultado = engine.process_message(pergunta)
        print(f"Origem: {resultado.get('origem')} | Confiança: {resultado.get('confianca')}")
        print(f"Resposta:\n{resultado.get('resposta')}\n")

    # Teste de registro de feedback
    engine.register_feedback(resultado.get("id"), is_positive=True)

    print("\n--- Métricas Registradas ---")
    print(json.dumps(engine.get_metrics(), indent=2, ensure_ascii=False))
