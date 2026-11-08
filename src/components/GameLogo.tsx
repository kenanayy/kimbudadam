"use client";

import React from "react";

interface GameLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const GameLogo: React.FC<GameLogoProps> = React.memo(({
  size = "md",
  showText = false,
  className = "",
}) => {
  const dimensions = {
    sm: "w-9 h-9 sm:w-10 sm:h-10",
    md: "w-13 h-13",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  }[size];

  const textSize = {
    sm: "text-xs sm:text-sm",
    md: "text-base",
    lg: "text-xl sm:text-2xl",
    xl: "text-3xl",
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* 🟢 YUMUŞAK KÖŞELİ KARE (SQUIRCLE) AMBLEM */}
      <div
        className={`relative shrink-0 ${dimensions} filter drop-shadow-md select-none group-hover:scale-105 transition-transform duration-200`}
      >
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* 1. Stadyum Çimi ve Zümrüt Radyal Degrade */}
            <radialGradient
              id="squircleBg"
              cx="30%"
              cy="25%"
              r="85%"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>

            {/* 2. Dış Çerçeve Degradesi (Altın & Zümrüt Işıltısı) */}
            <linearGradient
              id="squircleBorder"
              x1="0"
              y1="0"
              x2="120"
              y2="120"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="80%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* 3. "ADAM" Kelimesi İçin Canlı Altın Degrade */}
            <linearGradient id="goldAdam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* 4. Soru İşareti İçin Neon Parıltı Degradesi */}
            <linearGradient id="neonQuestion" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            {/* 5. Üst Cam Parlama Degradesi */}
            <linearGradient
              id="topGloss"
              x1="60"
              y1="6"
              x2="60"
              y2="60"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Metin Gölgesi */}
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="1.5"
                floodColor="#022c22"
                floodOpacity="0.8"
              />
            </filter>

            {/* Soru İşareti Işıma Efekti */}
            <filter id="questionGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="2"
                floodColor="#34d399"
                floodOpacity="0.9"
              />
            </filter>
          </defs>

          {/* A. YUMUŞAK KÖŞELİ KARE GÖVDE */}
          <rect
            x="4"
            y="4"
            width="112"
            height="112"
            rx="28"
            ry="28"
            fill="url(#squircleBg)"
            stroke="url(#squircleBorder)"
            strokeWidth="3.2"
          />

          {/* B. SAHA ÇİMİ ÇİZGİLERİ (Hafif Fligran) */}
          <g opacity="0.09">
            <line x1="0" y1="24" x2="120" y2="24" stroke="#ffffff" strokeWidth="9" />
            <line x1="0" y1="46" x2="120" y2="46" stroke="#ffffff" strokeWidth="9" />
            <line x1="0" y1="68" x2="120" y2="68" stroke="#ffffff" strokeWidth="9" />
            <line x1="0" y1="90" x2="120" y2="90" stroke="#ffffff" strokeWidth="9" />
          </g>

          {/* C. ORTA SAHA YUVARLAĞI DESENİ */}
          <circle
            cx="60"
            cy="60"
            r="36"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeOpacity="0.12"
            strokeDasharray="4 4"
          />

          {/* D. İÇ İNCE KENARLIK */}
          <rect
            x="8"
            y="8"
            width="104"
            height="104"
            rx="24"
            ry="24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.25"
          />

          {/* E. ÜST CAM YANSIMASI */}
          <path
            d="M 6 32 C 6 18, 18 6, 32 6 L 88 6 C 102 6, 114 18, 114 32 L 114 44 C 74 50, 36 42, 6 64 Z"
            fill="url(#topGloss)"
          />

          {/* F. "KİM BU" METNİ (Üst Satır) */}
          <text
            x="60"
            y="45"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="18"
            letterSpacing="2.2"
            filter="url(#textShadow)"
          >
            KİM BU
          </text>

          {/* G. "ADAM?" METNİ (Kusursuz Hizalanmış ve Ortalanmış Tek Blok) */}
          <text
            x="60"
            y="76"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            filter="url(#textShadow)"
          >
            <tspan
              fill="url(#goldAdam)"
              fontSize="24"
              letterSpacing="1.2"
            >
              ADAM
            </tspan>
            <tspan
              fill="url(#neonQuestion)"
              fontSize="28"
              dx="4"
              filter="url(#questionGlow)"
            >
              ?
            </tspan>
          </text>

          {/* I. ALT KISIM: MİNİ FUTBOL TOPU VE KANAT ÇİZGİLERİ */}
          <path
            d="M 22 96 L 46 96"
            stroke="#fef08a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <path
            d="M 74 96 L 98 96"
            stroke="#fef08a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />

          {/* Mini Futbol Topu */}
          <g transform="translate(60, 96)">
            <circle cx="0" cy="0" r="7.5" fill="#ffffff" stroke="#064e3b" strokeWidth="1.5" />
            <polygon points="0,-3 2.8,-1 1.7,2.5 -1.7,2.5 -2.8,-1" fill="#064e3b" />
            <line x1="0" y1="-3" x2="0" y2="-7.5" stroke="#064e3b" strokeWidth="1.1" />
            <line x1="2.8" y1="-1" x2="6.8" y2="-2.5" stroke="#064e3b" strokeWidth="1.1" />
            <line x1="1.7" y1="2.5" x2="4.5" y2="6" stroke="#064e3b" strokeWidth="1.1" />
            <line x1="-1.7" y1="2.5" x2="-4.5" y2="6" stroke="#064e3b" strokeWidth="1.1" />
            <line x1="-2.8" y1="-1" x2="-6.8" y2="-2.5" stroke="#064e3b" strokeWidth="1.1" />
          </g>
        </svg>
      </div>

      {/* İsim Tipografisi (Header ve Yan Metin) */}
      {showText && (
        <div className="flex flex-col select-none">
          <div className={`font-black tracking-tight text-slate-950 leading-none ${textSize} flex items-center gap-0.5`}>
            <span>KİM BU ADAM</span>
            <span className="text-emerald-600 font-black">?</span>
          </div>
          <div className="text-[9.5px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>Kariyer & Transfer Bulmaca</span>
          </div>
        </div>
      )}
    </div>
  );
});

GameLogo.displayName = "GameLogo";
