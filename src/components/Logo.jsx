import React from 'react';

export function Logo({ size = 'medium', showTagline = false }) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 64 : 48;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Exact Apple Silhouette with 3 Happy Figures & Care Leaves */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0px 6px 14px rgba(249, 115, 22, 0.2))' }}
        >
          <defs>
            {/* Vibrant Orange Gradient for Apple & Side Figures */}
            <linearGradient id="appleOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>

            {/* Fresh Nutrition Green Gradient for Leaf, Center Figure & Hands */}
            <linearGradient id="leafGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="50%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>

            {/* Light Green for Center Stem & Accent */}
            <linearGradient id="stemGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          {/* 1. TOP STEM (Green) */}
          <path
            d="M98 38 C90 28, 80 18, 70 14 C73 19, 82 32, 90 40 Z"
            fill="url(#stemGreenGrad)"
          />

          {/* 2. TOP LEAF (Vibrant Green with center rib) */}
          <path
            d="M95 38 C95 18, 125 8, 140 10 C145 28, 135 48, 105 48 C98 48, 95 44, 95 38 Z"
            fill="url(#leafGreenGrad)"
          />
          <path
            d="M102 38 Q120 28 135 15"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* 3. STYLIZED OPEN APPLE SWOOSH CONTOUR (Vibrant Orange) */}
          <path
            d="M92 40 
               C110 32, 135 34, 145 42 
               C135 45, 115 42, 95 50 
               C70 60, 50 82, 48 112 
               C46 142, 65 172, 95 180 
               C115 185, 132 175, 148 162 
               C135 174, 112 188, 90 182 
               C55 172, 35 138, 38 102 
               C42 68, 65 48, 92 40 Z"
            fill="url(#appleOrangeGrad)"
          />

          {/* Apple Highlight Arc (Inner White Soft Sheen) */}
          <path
            d="M56 85 C52 105, 58 132, 72 150"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* 4. CARE HANDS / LEAVES UNDERNEATH (Green) */}
          {/* Left Supporting Leaf/Hand */}
          <path
            d="M90 155 C70 152, 55 138, 52 120 C62 135, 78 142, 90 142 C92 142, 85 148, 90 155 Z"
            fill="url(#leafGreenGrad)"
          />
          <path
            d="M52 120 C62 126, 80 134, 92 132 C78 130, 65 120, 58 108 C54 112, 52 116, 52 120 Z"
            fill="url(#leafGreenGrad)"
          />

          {/* Right Supporting Leaf/Hand */}
          <path
            d="M95 155 C115 152, 130 138, 133 120 C123 135, 107 142, 95 142 C93 142, 100 148, 95 155 Z"
            fill="url(#leafGreenGrad)"
          />
          <path
            d="M133 120 C123 126, 105 134, 93 132 C107 130, 120 120, 127 108 C131 112, 133 116, 133 120 Z"
            fill="url(#leafGreenGrad)"
          />

          {/* 5. THREE HAPPY PEOPLE SILHOUETTES */}
          {/* Left Figure (Orange) */}
          <circle cx="68" cy="100" r="7" fill="url(#appleOrangeGrad)" />
          <path
            d="M68 110 C62 110, 52 118, 52 126 C62 126, 75 124, 78 116 C76 112, 72 110, 68 110 Z"
            fill="url(#appleOrangeGrad)"
          />
          <path
            d="M74 112 L84 94 C82 92, 80 92, 78 94 L68 110"
            fill="url(#appleOrangeGrad)"
          />

          {/* Right Figure (Orange) */}
          <circle cx="118" cy="100" r="7" fill="url(#appleOrangeGrad)" />
          <path
            d="M118 110 C124 110, 134 118, 134 126 C124 126, 111 124, 108 116 C110 112, 114 110, 118 110 Z"
            fill="url(#appleOrangeGrad)"
          />
          <path
            d="M112 112 L102 94 C104 92, 106 92, 108 94 L118 110"
            fill="url(#appleOrangeGrad)"
          />

          {/* Central Figure (Tall, Green, Victorious with Raised Arms) */}
          <circle cx="93" cy="80" r="9" fill="url(#leafGreenGrad)" />
          <path
            d="M93 92 C88 92, 80 102, 75 116 C85 132, 92 145, 93 150 C94 145, 101 132, 111 116 C106 102, 98 92, 93 92 Z"
            fill="url(#leafGreenGrad)"
          />
          {/* Raised Arms in V pose */}
          <path
            d="M93 94 L72 78 C70 82, 72 86, 76 88 L90 98 Z"
            fill="url(#leafGreenGrad)"
          />
          <path
            d="M93 94 L114 78 C116 82, 114 86, 110 88 L96 98 Z"
            fill="url(#leafGreenGrad)"
          />
        </svg>

        {/* Brand Name & Slogan Typography */}
        <div style={{ textAlign: 'left' }}>
          <h1
            style={{
              fontSize: isLarge ? '2.3rem' : '1.85rem',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #ea580c 0%, #f97316 45%, #16a34a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.05,
              margin: 0
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
