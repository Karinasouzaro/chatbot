import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ButterflyIcon } from './ButterflyIcon';

/**
 * WelcomeScreen — Tela de Abertura FLYRA 🦋
 * 
 * Apresentada na primeira entrada do usuário no chatbot.
 * Oferece uma recepção acolhedora, moderna e interativa com 4 opções
 * de direcionamento rápido e transição suave para a conversa principal.
 */
export default function WelcomeScreen({ onSelectOption, isApiOnline = true }) {
  const [isExiting, setIsExiting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const options = [
    {
      id: 'estudar',
      icon: '📚',
      title: 'Quero estudar',
      description: 'Cursos, capacitações e trilhas para o seu aprendizado',
      prompt: 'Quero saber quais cursos e trilhas de estudo estão disponíveis para mim'
    },
    {
      id: 'duvida',
      icon: '💡',
      title: 'Tenho uma dúvida',
      description: 'Tire suas dúvidas sobre temas de tecnologia e conteúdos',
      prompt: 'Olá Flyra! Tenho uma dúvida e gostaria de sua ajuda para entender melhor'
    },
    {
      id: 'oportunidades',
      icon: '🎯',
      title: 'Quero encontrar oportunidades',
      description: 'Carreira, mercado de trabalho e novos caminhos',
      prompt: 'Quero descobrir oportunidades e como me preparar para o mercado de trabalho'
    },
    {
      id: 'conheca',
      icon: '🦋',
      title: 'Conheça a FLYRA',
      description: 'Descubra como posso te acompanhar e ajudar no dia a dia',
      prompt: 'Quem é a FLYRA e como você pode me ajudar no meu desenvolvimento?'
    }
  ];

  const handleOptionClick = (option) => {
    if (isExiting) return;
    setSelectedId(option.id);
    setIsExiting(true);

    // Aguarda o término da animação suave de saída antes de ativar o chat
    setTimeout(() => {
      onSelectOption(option.prompt);
    }, 380);
  };

  return (
    <div className={`welcome-screen-wrapper ${isExiting ? 'welcome-exiting' : ''}`}>
      <div className="welcome-card">
        {/* Borboleta Minimalista FLYRA com animação delicada de entrada */}
        <div className="welcome-hero-icon-container">
          <div className="welcome-butterfly-glow" />
          <div className="welcome-butterfly-float">
            <ButterflyIcon size={64} glow={true} className="welcome-butterfly-svg" />
          </div>
        </div>

        {/* Título e Subtítulo Principal */}
        <div className="welcome-header-section">
          <div className="welcome-brand-badge">
            <Sparkles size={13} className="welcome-badge-sparkle" />
            <span>Assistente Inteligente</span>
          </div>
          <h1 className="welcome-title">FLYRA</h1>
          <p className="welcome-tagline">
            Sua assistente inteligente para aprender, descobrir e evoluir.
          </p>
        </div>

        {/* Mensagens de Acolhimento */}
        <div className="welcome-greeting-box">
          <p className="welcome-greeting-primary">
            “Olá! Que bom ter você por aqui <span className="welcome-heart">💜</span>”
          </p>
          <p className="welcome-greeting-secondary">
            Estou pronta para ajudar. Por onde começamos?
          </p>
        </div>

        {/* Grid com 4 Opções em Cards/Botões */}
        <div className="welcome-options-grid">
          {options.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                className={`welcome-option-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
                aria-label={option.title}
              >
                <div className="welcome-option-header">
                  <span className="welcome-option-emoji">{option.icon}</span>
                  <div className="welcome-option-arrow">
                    <ArrowRight size={15} />
                  </div>
                </div>
                <div className="welcome-option-text">
                  <strong className="welcome-option-title">{option.title}</strong>
                  <span className="welcome-option-desc">{option.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Frase inferior sutil */}
        <div className="welcome-footer">
          <p className="welcome-footer-phrase">
            “Dê asas à sua curiosidade. 🦋”
          </p>
        </div>
      </div>
    </div>
  );
}
