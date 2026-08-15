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
          style={{ filter: 'drop-shadow(0px 4px 10px rgba(13, 148, 136, 0.25))' }}
        >
          <defs>
            <linearGradient id="vivaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          
          {/* Main shield/drop shape representing vitality */}
          <path
            d="M50 8C28 24 15 45 15 62C15 81.3 30.7 92 50 92C69.3 92 85 81.3 85 62C85 45 72 24 50 8Z"
            fill="url(#vivaGrad)"
          />
          
          {/* Internal leaf shape representing nutrition & health */}
          <path
            d="M50 25C50 25 65 42 65 58C65 67 58 74 50 74C42 74 35 67 35 58C35 42 50 25 50 25Z"
            fill="#ffffff"
            opacity="0.9"
          />
          
          {/* Leaf vein line */}
          <path
            d="M50 35V65"
            stroke="url(#leafGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          
          <path
            d="M50 46C56 42 60 40 60 40"
            stroke="url(#leafGrad)"
            strokeWidth="3"
            strokeLinecap="round"
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
