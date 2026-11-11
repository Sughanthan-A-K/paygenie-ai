'use client';

import React from 'react';

interface GenieCharacterSVGProps {
  pose?: 'intro' | 'idle' | 'thinking' | 'answering';
  isSpeaking?: boolean;
  className?: string;
}

export default function GenieCharacterSVG({
  pose = 'idle',
  isSpeaking = false,
  className = '',
}: GenieCharacterSVGProps) {
  return (
    <svg
      viewBox="0 0 420 620"
      className={`w-full h-full filter drop-shadow-[0_20px_35px_rgba(0,112,186,0.35)] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Cyan Skin Gradients (Dimensional 3D shading) */}
        <linearGradient id="genieSkin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="45%" stopColor="#38bdf8" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="genieSkinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Navy Business Suit Gradients */}
        <linearGradient id="suitNavy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="40%" stopColor="#172554" />
          <stop offset="100%" stopColor="#0a1026" />
        </linearGradient>

        <linearGradient id="suitLapel" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#172554" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>

        {/* Golden Silk Tie */}
        <linearGradient id="goldTie" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="35%" stopColor="#f59e0b" />
          <stop offset="80%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Sunglasses Lenses Gloss */}
        <linearGradient id="sunglassLens" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        <linearGradient id="sunglassShine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>

        {/* Hair Gradient */}
        <linearGradient id="darkHair" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Mystical Tail Gradient */}
        <linearGradient id="magicSmokeTail" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="30%" stopColor="#1e3a8a" />
          <stop offset="65%" stopColor="#0284c7" />
          <stop offset="90%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#ffc439" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ======================================================== */}
      {/* 1. LOWER BODY: MYSTICAL SMOKE TAIL / SUIT LOWER HALF    */}
      {/* ======================================================== */}
      <g id="genieTail">
        {/* Swirling ethereal smoke mist originating from below */}
        <path
          d="M175 420 C145 460, 110 490, 130 535 C145 565, 195 560, 190 585 C185 605, 140 615, 110 610 C90 605, 145 585, 150 560 C155 530, 105 500, 135 450 C150 425, 185 410, 195 410 Z"
          fill="url(#magicSmokeTail)"
          opacity="0.85"
        />
        <path
          d="M235 420 C265 460, 290 500, 260 540 C240 565, 195 565, 205 595 C215 615, 245 618, 260 615 C285 610, 235 590, 230 565 C225 535, 280 500, 265 450 C250 425, 225 410, 215 410 Z"
          fill="url(#magicSmokeTail)"
          opacity="0.9"
        />
        {/* Magic aura rings around lower tail */}
        <ellipse cx="205" cy="530" rx="42" ry="12" fill="#38bdf8" opacity="0.3" className="animate-pulse" />
        <ellipse cx="195" cy="570" rx="30" ry="8" fill="#ffc439" opacity="0.25" />
      </g>

      {/* ======================================================== */}
      {/* 2. SUIT TORSO & SHIRT                                    */}
      {/* ======================================================== */}
      <g id="genieTorso">
        {/* Fitted Navy Suit Jacket Backing */}
        <path
          d="M135 240 C140 220, 175 210, 210 210 C245 210, 280 220, 285 240 L290 420 C255 430, 165 430, 130 420 Z"
          fill="url(#suitNavy)"
        />

        {/* Crisp White Shirt V-Neck */}
        <path
          d="M178 215 L210 320 L242 215 C230 212, 190 212, 178 215 Z"
          fill="#f8fafc"
        />
        {/* Shirt Collar (Left & Right Wings) */}
        <path d="M175 215 L210 260 L202 215 Z" fill="#ffffff" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))" />
        <path d="M245 215 L210 260 L218 215 Z" fill="#e2e8f0" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))" />

        {/* Elegant Golden Silk Tie */}
        <g id="genieTie">
          {/* Tie Knot */}
          <polygon points="204,242 216,242 218,255 202,255" fill="url(#goldTie)" />
          {/* Tie Body */}
          <path
            d="M204 255 L216 255 L222 360 L210 380 L198 360 Z"
            fill="url(#goldTie)"
          />
          {/* Gold Tie Diagonal Sheen */}
          <path d="M207 260 L213 257 L219 355 L213 365 Z" fill="#ffffff" opacity="0.3" />
        </g>

        {/* Suit Lapels (Left & Right) */}
        {/* Left Lapel */}
        <path
          d="M142 225 L182 355 L208 355 L165 220 Z"
          fill="url(#suitLapel)"
          filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.3))"
        />
        {/* Right Lapel */}
        <path
          d="M278 225 L238 355 L212 355 L255 220 Z"
          fill="url(#suitNavy)"
          filter="drop-shadow(-2px 2px 4px rgba(0,0,0,0.3))"
        />

        {/* Golden Lapel Pin / PayPal Sapphire Monogram Pin */}
        <circle cx="164" cy="265" r="4.5" fill="#f59e0b" />
        <circle cx="164" cy="265" r="3.5" fill="#0070ba" />
        <circle cx="163" cy="264" r="1" fill="#ffffff" />

        {/* Suit Buttons */}
        <circle cx="210" cy="370" r="3" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
        <circle cx="210" cy="395" r="3" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
      </g>

      {/* ======================================================== */}
      {/* 3. ARMS & HANDS (STATE-BASED POSING)                     */}
      {/* ======================================================== */}
      {pose === 'thinking' ? (
        /* THINKING POSE: Left arm crossed, Right hand resting on chin */
        <g id="armsThinking" className="transition-all duration-500">
          {/* Left Arm Crossed horizontally holding right elbow */}
          <path
            d="M135 240 C110 270, 115 350, 160 365 C190 375, 250 365, 275 345 L260 320 C235 335, 185 345, 160 335 C140 325, 140 270, 155 245 Z"
            fill="url(#suitNavy)"
          />
          {/* Left Hand fingers tucking under elbow */}
          <path d="M260 325 C272 325, 280 335, 275 345 C270 350, 260 348, 255 340 Z" fill="url(#genieSkin)" />

          {/* Right Arm raised upward toward face */}
          <path
            d="M285 240 C305 275, 290 320, 270 335 C255 320, 248 290, 240 250 L260 235 Z"
            fill="url(#suitNavy)"
          />
          <path
            d="M270 335 C265 315, 240 220, 235 185 L252 185 C260 215, 282 295, 288 325 Z"
            fill="url(#suitNavy)"
          />
          {/* Right Hand on Chin (Thoughtful Pose) */}
          <g transform="translate(224, 168)">
            {/* Thumb on jawline */}
            <path d="M12 18 C10 12, 5 8, 0 6 C-3 10, 4 16, 8 22 Z" fill="url(#genieSkin)" />
            {/* Index finger resting vertically against cheek */}
            <path d="M10 12 C10 4, 8 -4, 4 -8 C1 -8, 2 4, 5 12 Z" fill="url(#genieSkin)" />
            {/* Curled other fingers */}
            <path d="M12 14 C16 12, 18 16, 16 22 C14 26, 8 26, 8 20 Z" fill="url(#genieSkinShadow)" />
          </g>
        </g>
      ) : pose === 'answering' ? (
        /* ANSWERING POSE: Open welcoming expressive hand gestures */
        <g id="armsAnswering" className="transition-all duration-500">
          {/* Left Arm extended welcomingly outward */}
          <path
            d="M135 240 C105 270, 75 300, 60 330 C75 345, 100 325, 125 295 C140 275, 150 255, 155 240 Z"
            fill="url(#suitNavy)"
          />
          {/* Left Hand Open Palm facing viewer */}
          <g transform="translate(45, 325)">
            <ellipse cx="14" cy="14" rx="10" ry="12" fill="url(#genieSkin)" />
            <path d="M4 10 C-4 8, -6 0, -2 -4 C2 -2, 2 6, 6 8 Z" fill="url(#genieSkin)" />
            <path d="M10 2 C10 -6, 14 -10, 18 -8 C18 -2, 16 2, 14 6 Z" fill="url(#genieSkin)" />
            <path d="M16 4 C20 -4, 24 -6, 26 -2 C24 4, 20 8, 18 10 Z" fill="url(#genieSkin)" />
          </g>

          {/* Right Arm slightly raised, gesturing point */}
          <path
            d="M285 240 C315 270, 345 300, 360 330 C345 345, 320 325, 295 295 C280 275, 270 255, 265 240 Z"
            fill="url(#suitNavy)"
          />
          {/* Right Hand expressive gesture */}
          <g transform="translate(345, 325)">
            <ellipse cx="14" cy="14" rx="10" ry="12" fill="url(#genieSkin)" />
            <path d="M18 10 C26 8, 28 0, 24 -4 C20 -2, 20 6, 16 8 Z" fill="url(#genieSkin)" />
            <path d="M12 2 C12 -6, 8 -10, 4 -8 C4 -2, 6 2, 8 6 Z" fill="url(#genieSkin)" />
          </g>
        </g>
      ) : (
        /* COMMON / IDLE POSE: Confident Folded Arms across chest */
        <g id="armsFolded" className="transition-all duration-500">
          {/* Left Arm folded over front */}
          <path
            d="M135 240 C110 270, 115 345, 150 360 C185 375, 250 365, 280 340 L265 315 C240 335, 185 345, 160 330 C140 315, 138 270, 155 245 Z"
            fill="url(#suitNavy)"
          />
          {/* Left Hand tucked casually under right bicep */}
          <path d="M265 320 C278 322, 285 332, 280 342 C275 348, 265 345, 260 335 Z" fill="url(#genieSkin)" />

          {/* Right Arm folded over left */}
          <path
            d="M285 240 C310 270, 305 345, 270 360 C235 375, 170 365, 140 340 L155 315 C180 335, 235 345, 260 330 C280 315, 282 270, 265 245 Z"
            fill="url(#suitNavy)"
          />
          {/* Right Hand resting smoothly over left bicep */}
          <path d="M155 320 C142 322, 135 332, 140 342 C145 348, 155 345, 160 335 Z" fill="url(#genieSkin)" />
        </g>
      )}

      {/* ======================================================== */}
      {/* 4. NECK & HEAD (Handsome Mature Male Genie)              */}
      {/* ======================================================== */}
      <g id="genieHead" className={pose === 'thinking' ? '-rotate-3 origin-[210px_160px] transition-transform duration-500' : 'transition-transform duration-500'}>
        
        {/* Muscular Cyan Neck */}
        <path
          d="M192 180 L190 225 C200 230, 220 230, 230 225 L228 180 Z"
          fill="url(#genieSkinShadow)"
        />
        {/* Neck Adam's Apple highlight */}
        <path d="M206 195 L214 195 L210 203 Z" fill="url(#genieSkin)" opacity="0.6" />

        {/* Head/Jaw Base Shape */}
        <path
          d="M170 120 C165 160, 175 195, 210 205 C245 195, 255 160, 250 120 C248 85, 172 85, 170 120 Z"
          fill="url(#genieSkin)"
        />

        {/* Ears */}
        {/* Left Ear + Gold Hoop Earring */}
        <ellipse cx="166" cy="138" rx="6" ry="12" fill="url(#genieSkinShadow)" />
        <circle cx="164" cy="148" r="4.5" fill="none" stroke="#f59e0b" strokeWidth="2" />
        {/* Right Ear */}
        <ellipse cx="254" cy="138" rx="6" ry="12" fill="url(#genieSkin)" />

        {/* Styled Dark Hair (Modern Pompadour / Executive Grooming) */}
        <g id="genieHair">
          {/* Main Hair Volume */}
          <path
            d="M165 115 C160 70, 185 50, 210 48 C235 50, 260 70, 255 115 C250 95, 245 80, 210 75 C175 80, 170 95, 165 115 Z"
            fill="url(#darkHair)"
          />
          {/* Stylized Hair Wave Strands */}
          <path
            d="M175 85 C190 60, 230 60, 245 85 C230 72, 190 72, 175 85 Z"
            fill="#475569"
            opacity="0.4"
          />
          {/* Sideburns */}
          <path d="M167 110 L169 135 L174 130 L172 110 Z" fill="url(#darkHair)" />
          <path d="M253 110 L251 135 L246 130 L248 110 Z" fill="url(#darkHair)" />
        </g>

        {/* Neatly Maintained Dark Beard & Mustache */}
        <g id="genieBeard">
          {/* Jawline & Chin Beard */}
          <path
            d="M172 145 C174 175, 188 198, 210 204 C232 198, 246 175, 248 145 C244 150, 238 180, 210 185 C182 180, 176 150, 172 145 Z"
            fill="url(#darkHair)"
          />
          {/* Chiseled Mustache */}
          <path
            d="M192 163 C198 160, 206 160, 210 163 C214 160, 222 160, 228 163 C224 168, 216 168, 210 165 C204 168, 196 168, 192 163 Z"
            fill="url(#darkHair)"
          />
          {/* Soul patch under lip */}
          <polygon points="208,172 212,172 210,178" fill="url(#darkHair)" />
        </g>

        {/* Realistic Speech Mouth Transitions */}
        <g id="genieMouth">
          {isSpeaking ? (
            /* Open Talking Mouth (Alternates via CSS / Props) */
            <g className="animate-pulse">
              <path
                d="M198 167 C198 167, 210 165, 222 167 C220 176, 200 176, 198 167 Z"
                fill="#450a0a"
              />
              {/* White Upper Teeth */}
              <rect x="203" y="167" width="14" height="2.5" rx="1" fill="#ffffff" />
              {/* Tongue */}
              <ellipse cx="210" cy="174" rx="4" ry="2" fill="#ef4444" />
            </g>
          ) : (
            /* Charming Confident Closed Smile */
            <path
              d="M199 166 C204 170, 216 170, 221 166"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </g>

        {/* Chiseled Nose */}
        <path
          d="M210 130 L206 152 C208 154, 212 154, 214 152 Z"
          fill="url(#genieSkinShadow)"
        />

        {/* Premium Black Sunglasses (Signature Look from Reference) */}
        <g id="genieSunglasses">
          {/* Left Frame & Dark Lens */}
          <path
            d="M172 124 C172 118, 180 116, 204 116 C206 124, 204 138, 190 140 C178 140, 172 134, 172 124 Z"
            fill="url(#sunglassLens)"
            stroke="#020617"
            strokeWidth="1.5"
          />
          {/* Left Lens Reflective Sheen */}
          <path
            d="M176 120 L198 120 C194 126, 184 130, 178 132 Z"
            fill="url(#sunglassShine)"
          />

          {/* Right Frame & Dark Lens */}
          <path
            d="M248 124 C248 118, 240 116, 216 116 C214 124, 216 138, 230 140 C242 140, 248 134, 248 124 Z"
            fill="url(#sunglassLens)"
            stroke="#020617"
            strokeWidth="1.5"
          />
          {/* Right Lens Reflective Sheen */}
          <path
            d="M244 120 L222 120 C226 126, 236 130, 242 132 Z"
            fill="url(#sunglassShine)"
          />

          {/* Center Bridge connecting frames */}
          <path d="M204 120 L216 120" stroke="#020617" strokeWidth="2.5" />
        </g>

      </g>

    </svg>
  );
}
