import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import WelcomeScreen from './components/WelcomeScreen';
import FloatingButterflies from './components/FloatingButterflies';

// Em produção (Vercel), define VITE_API_URL no painel da Vercel.
// Em desenvolvimento local, usa http://localhost:8000 como fallback.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const HEALTH_CHECK_INTERVAL_MS = 15_000; // verifica a cada 15 segundos

/**
 * App — Raiz da aplicação FLYRA 🦋
 *
 * Responsabilidades:
 *  1. Verificação periódica de saúde da API (health check em /api/metrics)
 *  2. Gerenciar exibição da Tela de Abertura (WelcomeScreen) no primeiro acesso
 *  3. Propagar a opção escolhida para o ChatWindow na transição
 *  4. Renderizar o layout completo: borboletas ambientais + cabeçalho + chatbot
 */
export default function App() {
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState(null);

  /**
   * checkApiHealth — consulta GET /api/metrics para verificar se o backend está ativo.
   */
  const checkApiHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics`, {
        signal: AbortSignal.timeout(5000)
      });
      setIsApiOnline(response.ok);
    } catch {
      setIsApiOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Executa a verificação imediatamente ao montar e em intervalos regulares
  useEffect(() => {
    checkApiHealth();
    const timer = setInterval(checkApiHealth, HEALTH_CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [checkApiHealth]);

  const handleStartFromWelcome = (prompt) => {
    setInitialPrompt(prompt);
    setHasStartedChat(true);
  };

  return (
    <>
      {/* Borboletas animadas no fundo — camada de ambiente visual */}
      <FloatingButterflies />

      {!hasStartedChat ? (
        <WelcomeScreen 
          onSelectOption={handleStartFromWelcome} 
          isApiOnline={isApiOnline}
        />
      ) : (
        <div className="app-layout welcome-chat-appear">
          {/* Cabeçalho FLYRA */}
          <Header isApiOnline={isApiOnline} isChecking={isChecking} />

          {/* Janela principal do chatbot com IA e Voz */}
          <ChatWindow apiUrl={API_BASE_URL} initialPrompt={initialPrompt} />
        </div>
      )}
    </>
  );
}
