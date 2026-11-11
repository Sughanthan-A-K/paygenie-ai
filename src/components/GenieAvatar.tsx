'use client';

import React from 'react';

interface GenieAvatarProps {
  isThinking?: boolean;
  mood?: 'idle' | 'happy' | 'talking' | 'magic';
}

export default function GenieAvatar({ isThinking = false, mood = 'idle' }: GenieAvatarProps) {
  return (
    <div className="relative flex items-center justify-center select-none scale-110 sm:scale-125 transition-transform">
      
      {/* Outer Powerful Magical Glow Aura */}
      <div 
        className={`absolute w-64 h-64 rounded-full transition-all duration-700 pointer-events-none ${
          isThinking 
            ? 'bg-gradient-to-tr from-[#ffc439]/50 via-[#0070ba]/60 to-[#003087]/70 blur-3xl animate-pulse scale-125' 
            : 'bg-gradient-to-tr from-[#0070ba]/35 via-[#003087]/30 to-[#ffc439]/30 blur-2xl scale-105'
        }`} 
      />

      {/* Floating Magic Sparks Orbiting */}
      <div className="absolute -top-6 -right-4 text-2xl animate-bounce">✨</div>
      <div className="absolute -bottom-4 -left-6 text-xl animate-pulse delay-300">🪄</div>
      <div className="absolute top-1/3 -right-10 text-lg animate-ping duration-1000">💫</div>

      {/* Main Genie Floating Character Container */}
      <div className="relative flex flex-col items-center animate-[float_4s_ease-in-out_infinite]">
        
        {/* Genie Headgear: Royal Turban with PayPal Blue Ruby Gem */}
        <div className="relative z-20 flex flex-col items-center">
          
          {/* Golden Feather Plume */}
          <div className="w-3 h-9 rounded-t-full bg-gradient-to-t from-[#ffc439] to-amber-200 shadow-xs -mb-2 rotate-6" />

          {/* Deep Royal Turban Cap */}
          <div className="relative w-32 h-14 bg-gradient-to-r from-[#001c64] via-[#003087] to-[#0070ba] rounded-t-full shadow-lg flex items-center justify-center border-b-2 border-[#ffc439]">
            {/* Center Golden Brooch with Sapphire Jewel */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ffc439] to-amber-200 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-[#0070ba] shadow-inner flex items-center justify-center">
                <span className="text-[9px] text-white font-black">P</span>
              </div>
            </div>
          </div>
        </div>

        {/* Genie Face (Friendly, Royal Cyan-Navy Mystical Gradient) */}
        <div className="relative z-10 -mt-2 w-36 h-30 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] rounded-[40px] shadow-2xl border-2 border-[#38bdf8] flex flex-col items-center justify-center p-3">
          
          {/* Eyebrows with emotion */}
          <div className="flex gap-9 mb-1.5">
            <div className={`w-5 h-2 bg-[#003087] rounded-full transition-transform ${isThinking ? '-rotate-12 translate-y-0.5' : '-rotate-6'}`} />
            <div className={`w-5 h-2 bg-[#003087] rounded-full transition-transform ${isThinking ? 'rotate-12 translate-y-0.5' : 'rotate-6'}`} />
          </div>

          {/* Eyes with sparkle reflections */}
          <div className="flex gap-8 items-center">
            <div className="relative w-5 h-5 rounded-full bg-[#001435] flex items-center justify-center shadow-xs">
              <div className="w-2 h-2 rounded-full bg-white absolute top-0.5 right-0.5" />
            </div>
            <div className="relative w-5 h-5 rounded-full bg-[#001435] flex items-center justify-center shadow-xs">
              <div className="w-2 h-2 rounded-full bg-white absolute top-0.5 right-0.5" />
            </div>
          </div>

          {/* Rosy Cheeks */}
          <div className="flex justify-between w-28 -mt-0.5 px-2">
            <div className="w-3.5 h-2 rounded-full bg-pink-400/50" />
            <div className="w-3.5 h-2 rounded-full bg-pink-400/50" />
          </div>

          {/* Genie Smile / Mouth */}
          <div className="mt-1.5">
            {isThinking ? (
              <div className="w-6 h-2 bg-[#003087] rounded-full animate-pulse" />
            ) : mood === 'talking' ? (
              <div className="w-7 h-4 bg-[#003087] rounded-full animate-bounce" />
            ) : (
              <div className="w-8 h-4 bg-[#003087] rounded-b-full border-t border-slate-300 shadow-inner" />
            )}
          </div>

          {/* Genie Pointy Beard */}
          <div className="w-4 h-4 bg-[#003087] rotate-45 -mb-5 mt-1.5 rounded-sm shadow-xs" />
        </div>

        {/* Golden Earrings */}
        <div className="absolute top-16 -left-3 w-5 h-5 rounded-full border-2 border-[#ffc439] z-0 shadow-xs" />
        <div className="absolute top-16 -right-3 w-5 h-5 rounded-full border-2 border-[#ffc439] z-0 shadow-xs" />

        {/* Mystical Genie Swirl Smoke Tail (Emerging from magical lamp) */}
        <div className="relative -mt-1 flex flex-col items-center">
          <div className="w-24 h-10 bg-gradient-to-r from-[#38bdf8]/80 via-[#0070ba]/70 to-[#003087]/80 rounded-full blur-[1px] animate-pulse" />
          <div className="w-16 h-8 bg-gradient-to-r from-[#0070ba]/80 to-[#001c64]/90 rounded-full -mt-3 blur-[1px]" />
          <div className="w-8 h-10 bg-gradient-to-b from-[#003087] to-[#ffc439]/70 rounded-full -mt-2" />
        </div>

      </div>

    </div>
  );
}
