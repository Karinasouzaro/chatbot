import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import FloatingButterflies from './components/FloatingButterflies';

// Em produção (Vercel), define VITE_API_URL no painel da Vercel.
// Em desenvolvimento local, usa http://localhost:8000 como fallback.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const HEALTH_CHECK_INTERVAL_MS = 15_000; // verifica a cada 15 segundos

/**
 * App — Raiz da aplicação AfesuTech IA
 *
 * Responsabilidades:
 *  1. Verificação periódica de saúde da API (health check em /api/metrics)
 *  2. Propagar o estado online/offline para o Header institucional
 *  3. Renderizar o layout completo: borboletas ambientais + cabeçalho + chatbot
 */
export default function App() {
  const [isApiOnline, setIsApiOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  /**
   * checkApiHealth — consulta GET /api/metrics para verificar se o backend está ativo.
   * Usa /api/metrics ao invés de "/" para garantir que o engine do chatbot também
   * está inicializado, não apenas o servidor web.
   */
  const checkApiHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/metrics`, {
        // Timeout implícito pelo AbortController para não bloquear a UI
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

  return (
    <>
      {/* Borboletas animadas no fundo — camada de ambiente visual */}
      <FloatingButterflies />

      {/* Layout principal empilhado verticalmente */}
      <div className="app-layout">
        {/* Cabeçalho institucional AFESU Veleiros / SENAI-SP */}
        <Header isApiOnline={isApiOnline} isChecking={isChecking} />

        {/* Janela principal do chatbot com IA, RAG e Voz */}
        <ChatWindow apiUrl={API_BASE_URL} />
      </div>
    </>
  );
}
