'use client';

import React from 'react';

interface GenieAvatarProps {
  isThinking?: boolean;
  mood?: 'idle' | 'happy' | 'talking' | 'magic';
}

export default function GenieAvatar({ isThinking = false, mood = 'idle' }: GenieAvatarProps) {
  return (
    <div className="relative flex items-center justify-center select-none">
      
      {/* Outer Magical Glow Aura */}
      <div 
        className={`absolute w-44 h-44 rounded-full transition-all duration-700 pointer-events-none ${
          isThinking 
            ? 'bg-gradient-to-tr from-[#ffc439]/40 via-[#0070ba]/40 to-[#003087]/50 blur-2xl animate-pulse scale-110' 
            : 'bg-gradient-to-tr from-[#0070ba]/25 via-[#003087]/20 to-[#ffc439]/20 blur-xl scale-100'
        }`} 
      />

      {/* Floating Magic Sparks */}
      <div className="absolute -top-3 -right-2 text-xl animate-bounce">✨</div>
      <div className="absolute -bottom-2 -left-3 text-lg animate-pulse delay-300">🪄</div>
      <div className="absolute top-1/2 -right-6 text-sm animate-ping duration-1000">💫</div>

      {/* Main Genie Floating Character Container */}
      <div className="relative flex flex-col items-center animate-[float_4s_ease-in-out_infinite]">
        
        {/* Genie Headgear: Royal Turban with PayPal Blue Ruby Gem */}
        <div className="relative z-20 flex flex-col items-center">
          
          {/* Golden Feather Plume */}
          <div className="w-2.5 h-7 rounded-t-full bg-gradient-to-t from-[#ffc439] to-amber-200 shadow-xs -mb-2 rotate-6" />

          {/* Deep Royal Turban Cap */}
          <div className="relative w-24 h-11 bg-gradient-to-r from-[#001c64] via-[#003087] to-[#0070ba] rounded-t-full shadow-md flex items-center justify-center border-b-2 border-[#ffc439]">
            {/* Center Golden Brooch with Sapphire Jewel */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#ffc439] to-amber-200 p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-[#0070ba] shadow-inner flex items-center justify-center">
                <span className="text-[7px] text-white font-black">P</span>
              </div>
            </div>
          </div>
        </div>

        {/* Genie Face (Friendly, Royal Cyan-Navy Mystical Gradient) */}
        <div className="relative z-10 -mt-2 w-28 h-24 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] rounded-[32px] shadow-lg border-2 border-[#38bdf8] flex flex-col items-center justify-center p-2">
          
          {/* Eyebrows */}
          <div className="flex gap-7 mb-1">
            <div className={`w-4 h-1.5 bg-[#003087] rounded-full transition-transform ${isThinking ? '-rotate-12 translate-y-0.5' : '-rotate-6'}`} />
            <div className={`w-4 h-1.5 bg-[#003087] rounded-full transition-transform ${isThinking ? 'rotate-12 translate-y-0.5' : 'rotate-6'}`} />
          </div>

          {/* Eyes with sparkle reflections */}
          <div className="flex gap-6 items-center">
            <div className="relative w-4 h-4 rounded-full bg-[#001435] flex items-center justify-center shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-0.5 right-0.5" />
            </div>
            <div className="relative w-4 h-4 rounded-full bg-[#001435] flex items-center justify-center shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-0.5 right-0.5" />
            </div>
          </div>

          {/* Rosy Cheeks */}
          <div className="flex justify-between w-20 -mt-0.5 px-1">
            <div className="w-2.5 h-1.5 rounded-full bg-pink-300/60" />
            <div className="w-2.5 h-1.5 rounded-full bg-pink-300/60" />
          </div>

          {/* Genie Smile / Mouth */}
          <div className="mt-1">
            {isThinking ? (
              <div className="w-4 h-1.5 bg-[#003087] rounded-full animate-pulse" />
            ) : mood === 'happy' ? (
              <div className="w-6 h-3 bg-[#003087] rounded-b-full border-t border-slate-300" />
            ) : (
              <div className="w-5 h-2 border-b-2 border-[#003087] rounded-full" />
            )}
          </div>

          {/* Genie Pointy Beard */}
          <div className="w-3 h-3 bg-[#003087] rotate-45 -mb-4 mt-1 rounded-sm shadow-xs" />
        </div>

        {/* Golden Earring */}
        <div className="absolute top-12 -left-2 w-4 h-4 rounded-full border-2 border-[#ffc439] z-0 shadow-xs" />

        {/* Mystical Genie Swirl Smoke Tail (Emerging from magical lamp) */}
        <div className="relative -mt-1 flex flex-col items-center">
          {/* Swirling smoky cloud rings */}
          <div className="w-16 h-8 bg-gradient-to-r from-[#38bdf8]/70 via-[#0070ba]/60 to-[#003087]/70 rounded-full blur-[1px] animate-pulse" />
          <div className="w-10 h-6 bg-gradient-to-r from-[#0070ba]/70 to-[#001c64]/80 rounded-full -mt-2 blur-[1px]" />
          <div className="w-5 h-8 bg-gradient-to-b from-[#003087]/80 to-[#ffc439]/60 rounded-full -mt-2" />
        </div>

      </div>

    </div>
  );
}
