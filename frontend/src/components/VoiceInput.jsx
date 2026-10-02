import React, { useState, useEffect, useRef } from 'react';
import { Mic, AlertCircle } from 'lucide-react';

/**
 * Componente de Reconhecimento de Voz (Speech-to-Text) com Web Speech API.
 * Suporta computadores e navegadores móveis (Android/Chrome e iOS/Safari).
 *
 * @param {Object} props
 * @param {Function} props.onTranscript - Callback que recebe o texto transcrito
 * @param {boolean} [props.disabled=false] - Se o botão está desabilitado
 */
export default function VoiceInput({ onTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const recognitionRef = useRef(null);

  // Cleanup ao desmontar componente
  useEffect(() => {

    return () => {
      // Cleanup ao desmontar componente
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignora erros ao encerrar
        }
      }
    };
  }, []);

  const checkSecureContext = () => {
    // Web Speech API em dispositivos móveis exige HTTPS ou localhost
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!window.isSecureContext && !isLocalhost) {
      setErrorMessage(
        'O acesso ao microfone no celular requer conexão segura (HTTPS). Use o link HTTPS fornecido pelo túnel.'
      );
      return false;
    }
    return true;
  };

  const startListening = () => {
    setErrorMessage('');

    if (!isSupported) {
      setErrorMessage(
        'Seu navegador não suporta reconhecimento de voz nativo. Recomendamos usar o Google Chrome ou Safari.'
      );
      return;
    }

    if (!checkSecureContext()) {
      return;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configuração para Português do Brasil e captura contínua de frase única
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          if (transcript && onTranscript) {
            onTranscript(transcript.trim());
          }
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            setErrorMessage(
              'Permissão de microfone negada. Clique no cadeado na barra de endereços para permitir.'
            );
            break;
          case 'no-speech':
            setErrorMessage('Nenhuma fala detectada. Tente falar novamente.');
            break;
          case 'audio-capture':
            setErrorMessage(
              'Nenhum microfone encontrado ou problema na captura de áudio.'
            );
            break;
          case 'network':
            setErrorMessage(
              'Erro de rede no serviço de reconhecimento de voz.'
            );
            break;
          default:
            setErrorMessage(`Erro no reconhecimento de voz (${event.error}).`);
            break;
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Falha ao iniciar SpeechRecognition:', err);
      setIsListening(false);
      setErrorMessage('Não foi possível iniciar o microfone no dispositivo.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignora erro
      }
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (disabled) return;
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Botão de Microfone */}
      <button
        type="button"
        className={`btn-icon btn-mic ${isListening ? 'recording' : ''}`}
        onClick={toggleListening}
        disabled={disabled || !isSupported}
        title={
          !isSupported
            ? 'Reconhecimento de voz não suportado neste navegador'
            : isListening
            ? 'Parar de ouvir'
            : 'Falar com a IA por voz'
        }
        aria-label="Microfone"
      >
        {isListening ? <Mic size={20} /> : <Mic size={20} />}
      </button>

      {/* Indicador Flutuante quando está ouvindo */}
      {isListening && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '0',
            background: '#ffffff',
            color: '#2a1f42',
            border: '1px solid #fca5a5',
            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)',
            borderRadius: '14px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            whiteSpace: 'nowrap',
            fontSize: '0.84rem',
            fontWeight: '600',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 8px #ef4444'
            }}
          />
          🎙️ Ouvindo... Fale agora!
        </div>
      )}

      {/* Alerta de Erro Flutuante */}
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            right: '0',
            background: '#fff5f5',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            whiteSpace: 'normal',
            width: '270px',
            zIndex: 100,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#b91c1c',
              cursor: 'pointer',
              marginLeft: 'auto',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
