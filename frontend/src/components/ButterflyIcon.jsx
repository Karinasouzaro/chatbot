import React from 'react';

/**
 * Ícone e Gráfico Vetorial Estilizado da Borboleta AfesuTech
 * Representa transformação, elegância, tecnologia e evolução.
 */
export function ButterflyIcon({ size = 24, className = '', glow = false }) {
  return (
    <div className={`butterfly-icon-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="butterfly-icon-svg"
        style={{
          filter: glow ? 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.45))' : 'none',
          display: 'inline-block',
          verticalAlign: 'middle'
        }}
      >
        <defs>
          {/* Gradientes das Asas */}
          <linearGradient id="wingGradLeftTop" x1="12" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          <linearGradient id="wingGradRightTop" x1="36" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          <linearGradient id="wingGradLeftBottom" x1="14" y1="24" x2="24" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          <linearGradient id="wingGradRightBottom" x1="34" y1="24" x2="24" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>

          <linearGradient id="bodyGrad" x1="24" y1="8" x2="24" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e9d5ff" />
          </linearGradient>
        </defs>

        {/* Asas Esquerdas */}
        <g className="icon-wing-left">
          <path
            d="M24 22C21 16 13 6 7 11C2 15 5 24 16 26C20 27 23 24 24 22Z"
            fill="url(#wingGradLeftTop)"
            opacity="0.92"
          />
          <path
            d="M22 20C19 15 14 9 9 13C6 16 9 22 17 23C19 24 21 22 22 20Z"
            fill="#ffffff"
            opacity="0.35"
          />
          <path
            d="M23 26C19 28 10 32 13 39C16 44 23 38 24 30C24 28 23.5 27 23 26Z"
            fill="url(#wingGradLeftBottom)"
            opacity="0.88"
          />
        </g>

        {/* Asas Direitas */}
        <g className="icon-wing-right">
          <path
            d="M24 22C27 16 35 6 41 11C46 15 43 24 32 26C28 27 25 24 24 22Z"
            fill="url(#wingGradRightTop)"
            opacity="0.92"
          />
          <path
            d="M26 20C29 15 34 9 39 13C42 16 39 22 31 23C29 24 27 22 26 20Z"
            fill="#ffffff"
            opacity="0.35"
          />
          <path
            d="M25 26C29 28 38 32 35 39C32 44 25 38 24 30C24 28 24.5 27 25 26Z"
            fill="url(#wingGradRightBottom)"
            opacity="0.88"
          />
        </g>

        {/* Corpo Central Elegante */}
        <ellipse cx="24" cy="24" rx="1.8" ry="10" fill="url(#bodyGrad)" />

        {/* Antenas Curvas Delicadas */}
        <path
          d="M23.5 15C22 10 18 8 16 9"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="16" cy="9" r="1.2" fill="#ffffff" />

        <path
          d="M24.5 15C26 10 30 8 32 9"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="32" cy="9" r="1.2" fill="#ffffff" />
      </svg>
    </div>
  );
}

/**
 * Grande Ilustração de Borboleta para o Hero da Tela Inicial
 * Com animação suave de voo, bater de asas, anel orbital dinâmico e brilhos
 */
export function ButterflyHeroGraphic({ size = 180 }) {
  return (
    <div className="hero-butterfly-container" style={{ position: 'relative', width: size, height: size * 0.95, margin: '0 auto' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
        className="hero-butterfly-svg"
      >
        <defs>
          <linearGradient id="heroWingLeftTop" x1="40" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="40%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient id="heroWingRightTop" x1="160" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="40%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient id="heroWingBottom" x1="70" y1="100" x2="100" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>

          <linearGradient id="orbitGrad" x1="20" y1="110" x2="180" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Anel Orbital Traseiro */}
        <path
          className="hero-orbit-ring"
          d="M 25 110 C 25 75, 175 60, 185 85 C 190 98, 160 120, 115 130"
          stroke="url(#orbitGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Brilhos e Estrelas Mágicas */}
        <g className="hero-sparkles-group">
          <path
            className="hero-sparkle-1"
            d="M 165 30 Q 165 40 175 40 Q 165 40 165 50 Q 165 40 155 40 Q 165 40 165 30 Z"
            fill="#c084fc"
          />
          <path
            className="hero-sparkle-2"
            d="M 40 70 Q 40 76 46 76 Q 40 76 40 82 Q 40 76 34 76 Q 40 76 40 70 Z"
            fill="#a855f7"
          />
          <circle cx="180" cy="95" r="2.5" fill="#a855f7" className="hero-sparkle-3" />
          <circle cx="28" cy="115" r="2" fill="#c084fc" className="hero-sparkle-4" />
        </g>

        {/* Grupo da Borboleta Animada em Voo */}
        <g className="hero-butterfly-body-group">
          {/* Asas Esquerdas (com bater de asas) */}
          <g className="hero-wing-left-wrap">
            <path
              d="M 100 90 C 85 60 45 22 25 40 C 5 55 20 95 65 105 C 80 108 95 98 100 90 Z"
              fill="url(#heroWingLeftTop)"
              filter="drop-shadow(0 8px 20px rgba(168, 85, 247, 0.25))"
            />
            <path
              d="M 90 82 C 78 58 50 35 35 48 C 22 59 35 88 68 96 C 79 98 88 90 90 82 Z"
              fill="#ffffff"
              opacity="0.4"
            />
            <path
              d="M 96 102 C 80 112 45 125 55 152 C 66 170 94 148 100 118 C 100 110 98 105 96 102 Z"
              fill="url(#heroWingBottom)"
              opacity="0.9"
            />
          </g>

          {/* Asas Direitas (com bater de asas) */}
          <g className="hero-wing-right-wrap">
            <path
              d="M 100 90 C 115 60 155 22 175 40 C 195 55 180 95 135 105 C 120 108 105 98 100 90 Z"
              fill="url(#heroWingRightTop)"
              filter="drop-shadow(0 8px 20px rgba(168, 85, 247, 0.25))"
            />
            <path
              d="M 110 82 C 122 58 150 35 165 48 C 178 59 165 88 132 96 C 121 98 112 90 110 82 Z"
              fill="#ffffff"
              opacity="0.4"
            />
            <path
              d="M 104 102 C 120 112 155 125 145 152 C 134 170 106 148 100 118 C 100 110 102 105 104 102 Z"
              fill="url(#heroWingBottom)"
              opacity="0.9"
            />
          </g>

          {/* Corpo Central da Borboleta */}
          <ellipse cx="100" cy="98" rx="4.5" ry="24" fill="#ffffff" filter="drop-shadow(0 2px 6px rgba(124, 58, 237, 0.3))" />

          {/* Antenas */}
          <path
            d="M 98 76 C 92 60 80 54 74 58"
            stroke="#7c3aed"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="74" cy="58" r="3" fill="#8b5cf6" />

          <path
            d="M 102 76 C 108 60 120 54 126 58"
            stroke="#7c3aed"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="126" cy="58" r="3" fill="#8b5cf6" />
        </g>

        {/* Anel Orbital Frontal */}
        <path
          className="hero-orbit-ring"
          d="M 115 130 C 70 140, 20 125, 30 110"
          stroke="url(#orbitGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
