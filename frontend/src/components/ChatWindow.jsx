import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Activity, 
  CheckCheck, 
  MessageSquare,
  Zap,
  BookOpen
} from 'lucide-react';
import FormattedMessage from './FormattedMessage';
import VoiceInput from './VoiceInput';
import { ButterflyIcon } from './ButterflyIcon';

const DEFAULT_API_URL = 'http://localhost:8000';

const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

/**
 * ChatWindow — Janela Principal do Chatbot FLYRA 🦋
 * 
 * Gerencia o histórico de conversa, envio via API FastAPI,
 * entrada por voz, feedback, sugestões, métricas e exportação.
 * Identidade visual e textual atualizada para a marca FLYRA.
 */
export default function ChatWindow({ apiUrl = DEFAULT_API_URL, initialPrompt = null }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-01',
      sender: 'bot',
      text: 'Oi! Eu sou a Flyra 🦋\n\nEstou aqui para ajudar você a encontrar respostas, aprender e descobrir novas possibilidades.\n\nPode perguntar o que quiser!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'saudacao',
      feedback: null
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState([
    'Quais cursos estão disponíveis?',
    'Quais oportunidades posso encontrar?',
    'Como posso me preparar para o mercado de trabalho?',
    'Quero saber mais sobre a AFESU'
  ]);
  const [metrics, setMetrics] = useState({
    total_messages: 0,
    csat_score_percentage: 100,
    positive_feedback: 0,
    negative_feedback: 0
  });

  // currentMode armazena o modo técnico internamente, mas exibe texto amigável na UI
  const [currentMode, setCurrentMode] = useState('assistente');
  const [sessionId] = useState(() => generateId('session'));

  const messagesEndRef = useRef(null);
  const initialPromptSentRef = useRef(false);

  // Auto-scroll suave sempre para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Carregar métricas do backend
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/metrics`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        if (data.resolved_by_llm > data.resolved_by_knowledge_base) {
          setCurrentMode('llm');
        } else if (data.resolved_by_knowledge_base > 0) {
          setCurrentMode('rag');
        }
      }
    } catch (err) {
      console.warn('Não foi possível sincronizar métricas com o backend:', err);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Rótulo amigável para o modo de operação (sem termos técnicos na UI)
  const getFriendlyMode = (mode) => {
    if (mode === 'llm') return 'Assistente FLYRA';
    if (mode === 'rag') return 'Assistente FLYRA';
    if (mode === 'offline') return 'Modo Local';
    return 'Assistente FLYRA';
  };

  // Envio de perguntas para POST /api/chat
  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputText).trim();
    if (!text || isLoading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage = {
      id: generateId('user'),
      sender: 'user',
      text,
      timestamp: currentTime
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId
        })
      });

      if (!res.ok) {
        throw new Error(`Erro na API (${res.status})`);
      }

      const data = await res.json();

      const botMessage = {
        id: data.id || generateId('bot'),
        sender: 'bot',
        text: data.reply || 'Desculpe, não consegui obter uma resposta no momento.',
        source: data.source || 'desconhecido',
        confidence: data.confidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: null
      };

      setMessages((prev) => [...prev, botMessage]);

      // Atualiza modo de operação (internamente, sem expor termos técnicos ao usuário)
      if (data.source === 'llm_groq') {
        setCurrentMode('llm');
      } else if (data.source === 'base_conhecimento') {
        setCurrentMode('rag');
      } else if (data.source === 'saudacao') {
        setCurrentMode('assistente');
      }

      // Atualiza chips de sugestões se retornados pela API
      if (Array.isArray(data.suggested_actions) && data.suggested_actions.length > 0) {
        setSuggestedActions(data.suggested_actions);
      }

      fetchMetrics();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      const errorMessage = {
        id: generateId('bot-err'),
        sender: 'bot',
        text: '⚠️ Ops! Não consegui me conectar agora. Tente novamente em instantes — estou aqui quando você precisar! 🦋',
        source: 'erro_conexao',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        feedback: null
      };
      setMessages((prev) => [...prev, errorMessage]);
      setCurrentMode('offline');
    } finally {
      setIsLoading(false);
    }
  };

  // Dispara a pergunta inicial selecionada na tela de boas-vindas (se houver)
  useEffect(() => {
    if (initialPrompt && !initialPromptSentRef.current) {
      initialPromptSentRef.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  // Botões de Feedback (Like / Dislike) → POST /api/feedback
  const handleFeedback = async (messageId, isPositive) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, feedback: isPositive ? 'like' : 'dislike' }
          : msg
      )
    );

    try {
      await fetch(`${apiUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          is_positive: isPositive
        })
      });
      fetchMetrics();
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
    }
  };

  // Exportar histórico do atendimento em arquivo .txt
  const handleExportChat = () => {
    const headerLine = '='.repeat(50);
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    const formattedTime = now.toLocaleTimeString('pt-BR');

    let exportContent = `${headerLine}\n`;
    exportContent += `HISTÓRICO DE CONVERSA — FLYRA 🦋\n`;
    exportContent += `Data: ${formattedDate} às ${formattedTime}\n`;
    exportContent += `Sessão: ${sessionId}\n`;
    exportContent += `Total de Mensagens: ${messages.length}\n`;
    exportContent += `Satisfação Registrada: ${metrics.csat_score_percentage || 100}%\n`;
    exportContent += `${headerLine}\n\n`;

    messages.forEach((msg) => {
      const senderLabel = msg.sender === 'user' ? 'Você' : 'Flyra';
      exportContent += `[${msg.timestamp}] ${senderLabel}:\n`;
      exportContent += `${msg.text}\n\n`;
    });

    exportContent += `${headerLine}\n`;
    exportContent += `Fim da conversa — FLYRA\n`;
    exportContent += `${headerLine}\n`;

    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversa-flyra-${now.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reiniciar conversa
  const handleReset = () => {
    if (window.confirm('Quer começar uma nova conversa? O histórico atual será limpo.')) {
      setMessages([
        {
          id: generateId('welcome'),
          sender: 'bot',
          text: 'Oi! Estou de volta 🦋 Nova conversa iniciada. Como posso te ajudar agora?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'saudacao',
          feedback: null
        }
      ]);
    }
  };

  // Tratamento de tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const totalUserBotMessages = messages.length;
  const csatDisplay = metrics.csat_score_percentage !== undefined
    ? `${metrics.csat_score_percentage}%`
    : '100%';

  const isLlmMode = currentMode === 'llm';

  return (
    <div className="chat-container">
      {/* ═══════════════════════════════════════════════════════════
          HEADER PRINCIPAL — FLYRA com Avatar e Ações
          ═══════════════════════════════════════════════════════════ */}
      <header className="chat-header">
        <div className="header-brand">
          <div className="brand-avatar">
            <ButterflyIcon size={26} glow />
          </div>
          <div className="brand-titles">
            <div className="brand-title-row">
              <span className="brand-name">Flyra</span>
              <span className="brand-divider">·</span>
              <span className="brand-subtitle">Atendimento Inteligente e Acolhedor</span>
            </div>
            <div className="brand-status-line">
              <span className="status-dot online" />
              <span>Pronta para ajudar</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="header-btn"
            onClick={handleExportChat}
            title="Exportar Histórico da Conversa (.txt)"
            aria-label="Exportar Histórico"
          >
            <Download size={17} />
          </button>
          <button
            type="button"
            className="header-btn"
            onClick={handleReset}
            title="Iniciar Nova Conversa"
            aria-label="Reiniciar Chat"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          BARRA DE INFORMAÇÕES — Simplificada e amigável
          ═══════════════════════════════════════════════════════════ */}
      <section className="chat-metrics-bar" aria-label="Informações do Atendimento">
        <div className="metric-item">
          <MessageSquare size={14} className="metric-icon" />
          <span className="metric-label">Mensagens:</span>
          <span className="metric-value">{totalUserBotMessages}</span>
        </div>

        <div className="metric-divider" />

        <div className="metric-item">
          <Sparkles size={14} className="metric-icon" />
          <span className="metric-label">Satisfação:</span>
          <span className="metric-value highlight">{csatDisplay}</span>
        </div>

        <div className="metric-divider" />

        <div className="metric-item mode-badge-container">
          <Activity size={14} className="metric-icon" />
          <span className="metric-label">Modo:</span>
          <span className={`mode-badge ${isLlmMode ? 'mode-llm' : 'mode-rag'}`}>
            {isLlmMode ? <Zap size={11} /> : <BookOpen size={11} />}
            {getFriendlyMode(currentMode)}
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HISTÓRICO DE MENSAGENS COM AUTO-SCROLL
          ═══════════════════════════════════════════════════════════ */}
      <main className="chat-messages" aria-live="polite">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-row ${msg.sender === 'user' ? 'user' : 'bot'}`}
          >
            <div className="message-avatar-wrap">
              {msg.sender === 'user' ? (
                <span style={{ fontSize: '14px' }}>👤</span>
              ) : (
                <ButterflyIcon size={20} />
              )}
            </div>

            <div className="message-bubble">
              {msg.sender === 'bot' ? (
                <FormattedMessage content={msg.text} />
              ) : (
                <p>{msg.text}</p>
              )}

              {/* Metadados do Usuário */}
              {msg.sender === 'user' && (
                <div className="user-meta">
                  <span>{msg.timestamp}</span>
                  <CheckCheck size={14} />
                </div>
              )}

              {/* Metadados e Feedback da Flyra */}
              {msg.sender === 'bot' && (
                <>
                  <div className="bot-meta">
                    <span>{msg.timestamp}</span>
                    {msg.source && msg.source !== 'saudacao' && msg.source !== 'erro_conexao' && (
                      <span className="bot-source-tag">Flyra IA</span>
                    )}
                  </div>

                  {/* Botões de Feedback (Like / Dislike) */}
                  <div className="feedback-actions">
                    <button
                      type="button"
                      className={`btn-feedback ${msg.feedback === 'like' ? 'active-positive' : ''}`}
                      onClick={() => handleFeedback(msg.id, true)}
                      title="Esta resposta foi útil"
                    >
                      <ThumbsUp size={13} /> Útil
                    </button>
                    <button
                      type="button"
                      className={`btn-feedback ${msg.feedback === 'dislike' ? 'active-negative' : ''}`}
                      onClick={() => handleFeedback(msg.id, false)}
                      title="Esta resposta não foi útil"
                    >
                      <ThumbsDown size={13} /> Não ajudou
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Indicador de digitação — "Flyra está digitando..." */}
        {isLoading && (
          <div className="message-row bot loading-state">
            <div className="message-avatar-wrap">
              <ButterflyIcon size={20} />
            </div>
            <div className="message-bubble typing-bubble">
              <div className="typing-label">
                <span>Flyra está digitando</span>
              </div>
              <div className="typing-dots">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ═══════════════════════════════════════════════════════════
          CHIPS DE SUGESTÕES — Perguntas rápidas e naturais
          ═══════════════════════════════════════════════════════════ */}
      {suggestedActions && suggestedActions.length > 0 && (
        <div className="suggestions-container">
          {suggestedActions.map((action, index) => (
            <button
              key={index}
              type="button"
              className="suggestion-chip"
              onClick={() => handleSendMessage(action)}
              disabled={isLoading}
            >
              <span>🦋</span>
              <span>{action}</span>
            </button>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CAMPO DE ENTRADA, VOZ & BOTÃO ENVIAR
          ═══════════════════════════════════════════════════════════ */}
      <footer className="chat-input-area">
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            type="text"
            className="chat-input"
            placeholder="Converse com a Flyra..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            aria-label="Mensagem para a Flyra"
          />

          {/* Integração com VoiceInput para reconhecimento de fala */}
          <VoiceInput
            onTranscript={(transcript) => {
              setInputText((prev) => {
                const updated = prev ? `${prev} ${transcript}` : transcript;
                return updated;
              });
            }}
            disabled={isLoading}
          />

          <button
            type="submit"
            className="btn-icon btn-send"
            disabled={!inputText.trim() || isLoading}
            title="Enviar mensagem"
            aria-label="Enviar"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}

export { ChatWindow };
