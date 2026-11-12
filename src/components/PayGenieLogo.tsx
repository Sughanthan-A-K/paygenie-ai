"use client";

import React from "react";

interface PayGenieLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
  subtextColor?: string;
}

export function PayGenieLogo({
  className = "",
  size = 36,
  showText = true,
  textColor = "text-white",
  subtextColor = "text-[#80c8f5]",
}: PayGenieLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md rounded-xl select-none"
      >
        <defs>
          <linearGradient id="pgBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#001C64" />
            <stop offset="50%" stopColor="#003087" />
            <stop offset="100%" stopColor="#0070BA" />
          </linearGradient>

          <linearGradient id="pgPPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0079C1" />
            <stop offset="100%" stopColor="#00457C" />
          </linearGradient>

          <linearGradient id="pgPSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00457C" />
            <stop offset="100%" stopColor="#002447" />
          </linearGradient>

          <linearGradient id="pgGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE885" />
            <stop offset="40%" stopColor="#FFC439" />
            <stop offset="100%" stopColor="#FF9E1B" />
          </linearGradient>

          <linearGradient id="pgCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Squircle container */}
        <rect width="512" height="512" rx="128" fill="url(#pgBg)" />
        <rect
          width="504"
          height="504"
          x="4"
          y="4"
          rx="124"
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="8"
        />

        {/* Double PayPal 'P' Monogram */}
        <g transform="translate(68, 70)">
          <path
            d="M 96 48 L 220 48 C 290 48 338 88 322 158 C 308 220 252 258 184 258 L 132 258 L 94 416 L 36 416 L 96 48 Z"
            fill="url(#pgPSecondary)"
            opacity="0.9"
          />
          <path
            d="M 148 102 L 268 102 C 336 102 376 138 360 206 C 344 274 290 310 220 310 L 176 310 L 152 416 L 96 416 L 148 102 Z"
            fill="url(#pgPPrimary)"
          />
          <path
            d="M 176 310 L 220 310 C 274 310 316 284 334 238 C 314 252 284 258 244 258 L 188 258 L 176 310 Z"
            fill="#002447"
            opacity="0.45"
          />
        </g>

        {/* Sparkles */}
        <g transform="translate(366, 78)">
          <path
            d="M 38 0 Q 38 38 76 38 Q 38 38 38 76 Q 38 38 0 38 Q 38 38 38 0 Z"
            fill="url(#pgGold)"
          />
        </g>
        <g transform="translate(398, 250)">
          <path
            d="M 22 0 Q 22 22 44 22 Q 22 22 22 44 Q 22 22 0 22 Q 22 22 22 0 Z"
            fill="url(#pgCyan)"
          />
        </g>
        <g transform="translate(90, 72)">
          <path
            d="M 14 0 Q 14 14 28 14 Q 14 14 14 28 Q 14 14 0 14 Q 14 14 14 0 Z"
            fill="#FFFFFF"
            opacity="0.95"
          />
        </g>
      </svg>

      {/* Typography Brand Block */}
      {showText && (
        <div className="flex flex-col leading-none text-left">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-lg ${textColor}`}>
              PayGenie
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-[#001c64] tracking-wider shadow-sm">
              AI
            </span>
          </div>
          <span className={`text-[10.5px] font-medium tracking-wide mt-0.5 ${subtextColor}`}>
            PayPal Autonomous Settlement
          </span>
        </div>
      )}
    </div>
  );
}
