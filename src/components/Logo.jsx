import React from 'react';

export function Logo({ size = 'medium', showTagline = false }) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 56 : 42;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0px 4px 10px rgba(2, 132, 199, 0.25))' }}
        >
          <defs>
            <linearGradient id="vivaBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="vivaLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Squircle container */}
          <rect width="100" height="100" rx="24" fill="url(#vivaBgGrad)" />

          {/* Nutrition Leaf */}
          <path
            d="M50 24 C50 16 59 13 67 14 C68 22 65 30 57 30 C53 30 50 27 50 24 Z"
            fill="url(#vivaLeafGrad)"
          />
          <path
            d="M50 25 Q48 20 46 17"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Health Heart Shape */}
          <path
            d="M50 35 
               C46 29 31 28 24 36 
               C16 45 16 59 26 72 
               C34 82 44 88 50 90 
               C56 88 66 82 74 72 
               C84 59 84 45 76 36 
               C69 28 54 29 50 35 Z"
            fill="#ffffff"
          />

          {/* Heartbeat / Vitality Pulse Line */}
          <path
            d="M27 58 L38 58 L43 46 L50 70 L57 51 L62 58 L73 58"
            stroke="#0284c7"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        <div style={{ textAlign: 'left' }}>
          <h1
            style={{
              fontSize: isLarge ? '2.2rem' : '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 60%, #0d9488 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}
          >
            Viva Nutri
          </h1>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#0d9488',
              display: 'block'
            }}
          >
            Saúde & Nutrição
          </span>
        </div>
      </div>

      {showTagline && (
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
          Gestão inteligente para nutricionistas
        </p>
      )}
    </div>
  );
}
