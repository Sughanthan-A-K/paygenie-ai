'use client';

import React, { useEffect, useState } from 'react';
import GoldenLamp from './GoldenLamp';
import GenieCharacterSVG from './GenieCharacterSVG';

export type AnimationState = 'intro' | 'idle' | 'thinking' | 'answering';

interface GenieCharacterProps {
  animationState?: AnimationState;
  isSpeaking?: boolean;
  onIntroComplete?: () => void;
  className?: string;
}

export default function GenieCharacter({
  animationState = 'idle',
  isSpeaking = false,
  onIntroComplete,
  className = '',
}: GenieCharacterProps) {
  // Intro sub-steps:
  // 1 = lamp-falling
  // 2 = lamp-landed
  // 3 = smoke-emerging
  // 4 = genie-rising
  // 5 = lamp-pickup-throw
  // 6 = welcome-speaking
  // 7 = common-position (idle)
  const [introStep, setIntroStep] = useState<number>(animationState === 'intro' ? 1 : 7);
  const [internalSpeaking, setInternalSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (animationState === 'intro') {
      setIntroStep(1);

      // STEP 1: Lamp falls from outside top & bounces near bottom-left
      const t1 = setTimeout(() => {
        setIntroStep(2); // lamp landed with small bounce
      }, 900);

      // STEP 2: Cyan smoke appears from spout
      const t2 = setTimeout(() => {
        setIntroStep(3); // smoke emerging
      }, 1400);

      // STEP 3: Genie gradually emerges & rises
      const t3 = setTimeout(() => {
        setIntroStep(4); // genie rising fully
      }, 2000);

      // STEP 4: Genie bends, picks up lamp, turns right, and throws lamp outside
      const t4 = setTimeout(() => {
        setIntroStep(5); // lamp throw animation
      }, 3400);

      // STEP 5: Turns to viewer, smiles, welcomes and speaks
      const t5 = setTimeout(() => {
        setIntroStep(6); // welcome & speaking
        setInternalSpeaking(true);
      }, 4300);

      // STEP 6: Transitions smoothly into final Common Position (Arms folded)
      const t6 = setTimeout(() => {
        setInternalSpeaking(false);
        setIntroStep(7); // common position hold
        if (onIntroComplete) onIntroComplete();
      }, 6200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        clearTimeout(t5);
        clearTimeout(t6);
      };
    } else {
      setIntroStep(7); // Directly show common position / active state
    }
  }, [animationState, onIntroComplete]);

  // Current active pose
  const activePose =
    introStep < 7
      ? introStep === 6
        ? 'answering'
        : 'idle'
      : animationState;

  const speakingActive = isSpeaking || internalSpeaking;

  return (
    <div
      className={`relative w-full max-w-[440px] h-[580px] sm:h-[640px] flex items-end justify-center select-none overflow-hidden ${className}`}
      style={{ background: 'transparent' }}
    >
      {/* ======================================================== */}
      {/* 1. STEP 1 & 2: FALLING / LANDED / THROWN GOLDEN LAMP     */}
      {/* ======================================================== */}
      {introStep < 6 && (
        <div
          className={`absolute z-30 transition-all duration-700 pointer-events-none ${
            introStep === 1
              ? '-top-32 left-10 scale-90 rotate-[-20deg] opacity-0'
              : introStep === 2 || introStep === 3
              ? 'bottom-8 left-12 scale-100 rotate-0 opacity-100 animate-[bounce_0.6s_ease-out_1]'
              : introStep === 4
              ? 'bottom-8 left-12 scale-100 opacity-100'
              : introStep === 5
              ? 'bottom-40 -left-48 scale-75 rotate-[-90deg] opacity-0 transition-all duration-700 ease-in'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <GoldenLamp />

          {/* Lamp Impact Ring Effect on Landing */}
          {(introStep === 2 || introStep === 3) && (
            <div className="absolute -bottom-1 left-2 w-24 h-4 rounded-full border-2 border-[#ffc439]/60 animate-ping" />
          )}

          {/* Magical Smoke emerging from Lamp Spout */}
          {introStep >= 3 && introStep <= 4 && (
            <div className="absolute -top-16 -left-4 w-28 h-28 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#38bdf8] via-[#0070ba] to-transparent blur-md animate-ping opacity-75" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7dd3fc] to-[#0284c7] blur-lg animate-pulse delay-100 opacity-80 -mt-6 ml-4" />
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. GENIE EMERGENCE & MAIN BODY CONTAINER                */}
      {/* ======================================================== */}
      <div
        className={`relative z-20 w-full h-full flex items-center justify-center transition-all duration-1000 ${
          introStep <= 2
            ? 'translate-y-96 scale-50 opacity-0'
            : introStep === 3
            ? 'translate-y-44 scale-75 opacity-70'
            : introStep === 4
            ? 'translate-y-10 scale-95 opacity-100'
            : introStep === 5
            ? 'translate-y-0 scale-100 -rotate-3 transition-transform duration-500'
            : 'translate-y-0 scale-100 rotate-0 opacity-100 animate-[float_4s_ease-in-out_infinite]'
        }`}
      >
        <GenieCharacterSVG
          pose={activePose}
          isSpeaking={speakingActive}
          className="max-h-[560px]"
        />
      </div>

      {/* ======================================================== */}
      {/* 3. ETHEREAL AMBIENT GLOW (Genuinely Transparent)         */}
      {/* ======================================================== */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full bg-gradient-to-tr from-[#38bdf8]/20 via-[#0070ba]/25 to-transparent blur-2xl pointer-events-none transition-opacity duration-700 ${
          introStep >= 3 ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
