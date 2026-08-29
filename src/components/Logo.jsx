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
          style={{ filter: 'drop-shadow(0px 6px 14px rgba(249, 115, 22, 0.25))' }}
        >
          <defs>
            <linearGradient id="vivaBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="vivaLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
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
            stroke="#ea580c"
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
              fontWeight: 900,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 45%, #16a34a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}
          >
            Viva Nutri
          </h1>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#16a34a',
              display: 'block',
              marginTop: '2px'
            }}
          >
            Saúde & Nutrição
          </span>
        </div>
      </div>

      {showTagline && (
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
          Gestão inteligente para nutricionistas
        </p>
      )}
    </div>
  );
}
