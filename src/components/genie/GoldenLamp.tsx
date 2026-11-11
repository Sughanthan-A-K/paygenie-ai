'use client';

import React from 'react';

interface GoldenLampProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function GoldenLamp({ className = '', style = {} }: GoldenLampProps) {
  return (
    <svg
      viewBox="0 0 160 100"
      className={`w-28 h-20 filter drop-shadow-[0_10px_15px_rgba(255,196,57,0.4)] ${className}`}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Rich Golden Gradients */}
        <linearGradient id="lampGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="30%" stopColor="#ffc439" />
          <stop offset="70%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="lampHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffc439" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="lampGemGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="70%" stopColor="#0070ba" />
          <stop offset="100%" stopColor="#001c64" />
        </radialGradient>
      </defs>

      {/* Pedestal Base */}
      <ellipse cx="80" cy="85" rx="32" ry="7" fill="url(#lampGoldGrad)" />
      <ellipse cx="80" cy="83" rx="28" ry="5" fill="#fef08a" />
      <path d="M68 83 C70 76, 74 72, 80 72 C86 72, 90 76, 92 83 Z" fill="url(#lampGoldGrad)" />

      {/* Lamp Pot Body */}
      <path
        d="M50 68 C35 60, 32 46, 50 38 C65 32, 95 32, 110 38 C128 46, 125 60, 110 68 C98 74, 62 74, 50 68 Z"
        fill="url(#lampGoldGrad)"
      />
      {/* Top Body Highlight */}
      <path
        d="M56 42 C68 36, 92 36, 104 42 C92 46, 68 46, 56 42 Z"
        fill="url(#lampHighlight)"
      />

      {/* Long Curved Spout (Left) */}
      <path
        d="M52 46 C34 44, 18 34, 10 20 C18 20, 26 25, 34 26 C42 27, 48 34, 52 46 Z"
        fill="url(#lampGoldGrad)"
      />
      {/* Spout Tip opening */}
      <ellipse cx="10" cy="20" rx="4" ry="2" fill="#78350f" />
      <ellipse cx="10" cy="19" rx="3" ry="1.5" fill="#38bdf8" className="animate-pulse" />

      {/* Royal Handle (Right) */}
      <path
        d="M106 42 C125 32, 148 42, 142 62 C138 72, 120 74, 108 64 C116 68, 128 66, 130 58 C134 46, 118 42, 106 42 Z"
        fill="url(#lampGoldGrad)"
      />

      {/* Lamp Lid / Crown */}
      <path
        d="M70 36 C70 30, 75 26, 80 26 C85 26, 90 30, 90 36 Z"
        fill="url(#lampGoldGrad)"
      />
      {/* Lid Finial Jewel */}
      <circle cx="80" cy="23" r="3.5" fill="url(#lampGemGlow)" />
      <circle cx="80" cy="22" r="1" fill="#ffffff" />

      {/* Center PayPal Ruby Jewel on Lamp Belly */}
      <circle cx="80" cy="54" r="6" fill="#78350f" />
      <circle cx="80" cy="54" r="5" fill="url(#lampGemGlow)" />
      <circle cx="78.5" cy="52.5" r="1.5" fill="#ffffff" />
    </svg>
  );
}
