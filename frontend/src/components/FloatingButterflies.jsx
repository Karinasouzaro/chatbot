import React from 'react';

/**
 * Componente de Borboletas Flutuantes e Animadas para o Fundo
 * Cria borboletas delicadas com bater de asas e trajetórias suaves de voo.
 */
export default function FloatingButterflies() {
  const butterflies = [
    { id: 1, top: '10%', left: '5%',  size: 30, delay: '0s',  duration: '20s', flapSpeed: '0.65s', opacity: 0.30, scale: 0.9 },
    { id: 2, top: '20%', right: '7%', size: 24, delay: '4s',  duration: '24s', flapSpeed: '0.55s', opacity: 0.24, scale: 0.78 },
    { id: 3, bottom: '22%', left: '6%', size: 26, delay: '8s', duration: '18s', flapSpeed: '0.70s', opacity: 0.22, scale: 0.82 },
  ];

  return (
    <div className="floating-butterflies-container" aria-hidden="true">
      {butterflies.map((b) => (
        <div
          key={b.id}
          className={`flying-butterfly butterfly-path-${b.id % 3 + 1}`}
          style={{
            top: b.top,
            bottom: b.bottom,
            left: b.left,
            right: b.right,
            animationDelay: b.delay,
            animationDuration: b.duration,
            opacity: b.opacity,
            transform: `scale(${b.scale})`,
            zIndex: 0
          }}
        >
          <div
            className="butterfly-wings-flapper"
            style={{ animationDuration: b.flapSpeed }}
          >
            <svg
              width={b.size}
              height={b.size}
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 4px 10px rgba(168, 85, 247, 0.3))' }}
            >
              <defs>
                <linearGradient id={`floatWingGrad-${b.id}`} x1="12" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#e9d5ff" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#9333ea" />
                </linearGradient>
              </defs>

              {/* Asas Superiores */}
              <path
                d="M24 22C21 16 13 6 7 11C2 15 5 24 16 26C20 27 23 24 24 22Z"
                fill={`url(#floatWingGrad-${b.id})`}
              />
              <path
                d="M24 22C27 16 35 6 41 11C46 15 43 24 32 26C28 27 25 24 24 22Z"
                fill={`url(#floatWingGrad-${b.id})`}
              />

              {/* Asas Inferiores */}
              <path
                d="M23 26C19 28 10 32 13 39C16 44 23 38 24 30C24 28 23.5 27 23 26Z"
                fill={`url(#floatWingGrad-${b.id})`}
              />
              <path
                d="M25 26C29 28 38 32 35 39C32 44 25 38 24 30C24 28 24.5 27 25 26Z"
                fill={`url(#floatWingGrad-${b.id})`}
              />

              {/* Corpo e Brilho */}
              <ellipse cx="24" cy="24" rx="1.6" ry="9" fill="#ffffff" />
            </svg>
          </div>
        </div>
      ))}

      {/* Pequenos Sparkles/Estrelas Cintilantes no Fundo */}
      <div className="background-sparkle sparkle-1" style={{ top: '18%', left: '14%' }}>✦</div>
      <div className="background-sparkle sparkle-2" style={{ top: '35%', right: '15%' }}>✨</div>
      <div className="background-sparkle sparkle-3" style={{ bottom: '22%', left: '16%' }}>✦</div>
      <div className="background-sparkle sparkle-4" style={{ bottom: '38%', right: '8%' }}>✨</div>
    </div>
  );
}
