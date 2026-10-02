import React from 'react';

/**
 * Header Component — Identidade FLYRA 🦋
 *
 * Apresenta a marca FLYRA com borboleta minimalista e tecnológica,
 * tagline "Atendimento Inteligente e Acolhedor" e badge de status da API.
 *
 * @param {boolean} props.isApiOnline  - true se a API FastAPI estiver respondendo
 * @param {boolean} props.isChecking   - true durante a verificação inicial
 */
export default function Header({ isApiOnline, isChecking = false }) {
  return (
    <header className="app-header">
      {/* ── Linha decorativa no topo ── */}
      {/* (via ::before no CSS) */}

      {/* ══════════════════════════════════════════
          LADO ESQUERDO — Identidade FLYRA
          ══════════════════════════════════════════ */}
      <div className="app-header__brand">
        {/* Logo borboleta FLYRA — minimalista e tecnológica */}
        <div className="app-header__logo" aria-label="FLYRA — Atendimento Inteligente">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="app-header__logo-svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="flyraWingL" x1="4" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f0e6ff" />
                <stop offset="60%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
              <linearGradient id="flyraWingR" x1="44" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f0e6ff" />
                <stop offset="60%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
              <linearGradient id="flyraWingBL" x1="8" y1="26" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="flyraWingBR" x1="40" y1="26" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>

            {/* Asa superior esquerda — forma geométrica limpa */}
            <path
              d="M24 22C22 17 15 7 8 10C3 13 5 22 14 25C18 26 22 24 24 22Z"
              fill="url(#flyraWingL)"
              opacity="0.95"
            />
            {/* Reflexo asa esquerda */}
            <path
              d="M22 20C20 16 16 10 11 13C8 15 10 21 17 23C19 24 21 22 22 20Z"
              fill="rgba(255,255,255,0.28)"
            />

            {/* Asa superior direita */}
            <path
              d="M24 22C26 17 33 7 40 10C45 13 43 22 34 25C30 26 26 24 24 22Z"
              fill="url(#flyraWingR)"
              opacity="0.95"
            />
            {/* Reflexo asa direita */}
            <path
              d="M26 20C28 16 32 10 37 13C40 15 38 21 31 23C29 24 27 22 26 20Z"
              fill="rgba(255,255,255,0.28)"
            />

            {/* Asa inferior esquerda — menor e mais pontuda */}
            <path
              d="M23 26C19 29 11 34 14 40C16 44 23 39 24 30C24 28 23.5 27 23 26Z"
              fill="url(#flyraWingBL)"
              opacity="0.85"
            />

            {/* Asa inferior direita */}
            <path
              d="M25 26C29 29 37 34 34 40C32 44 25 39 24 30C24 28 24.5 27 25 26Z"
              fill="url(#flyraWingBR)"
              opacity="0.85"
            />

            {/* Corpo — linha elegante */}
            <ellipse cx="24" cy="24" rx="1.5" ry="9.5" fill="rgba(255,255,255,0.95)" />

            {/* Antenas minimalistas */}
            <path d="M23.5 16C22 11 18 9 16 10" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="16" cy="10" r="1.1" fill="rgba(255,255,255,0.9)" />
            <path d="M24.5 16C26 11 30 9 32 10" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round" />
            <circle cx="32" cy="10" r="1.1" fill="rgba(255,255,255,0.9)" />
          </svg>
        </div>

        {/* Textos da marca */}
        <div className="app-header__titles">
          <span className="app-header__brand-name">FLYRA</span>
          <span className="app-header__tagline">Atendimento Inteligente e Acolhedor</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          LADO DIREITO — Badge de Status
          ══════════════════════════════════════════ */}
      <div className="app-header__status" aria-live="polite">
        <span
          className={`app-header__status-dot ${
            isChecking ? 'checking' : isApiOnline ? 'online' : 'offline'
          }`}
          aria-hidden="true"
        />
        <span className="app-header__status-label">
          {isChecking
            ? 'Verificando...'
            : isApiOnline
            ? 'Online'
            : 'Offline'}
        </span>
      </div>
    </header>
  );
}
