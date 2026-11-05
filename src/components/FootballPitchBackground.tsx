"use client";

import React from "react";

export const FootballPitchBackground: React.FC = React.memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Canlı Stadyum Çimi ve Doğal Biçim Şeritleri */}
      <div className="absolute inset-0 bg-[#14532d] flex flex-col justify-between">
        {/* 12 Adet Avrupa Maçı Çim Şeridi */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 w-full ${
              i % 2 === 0 ? "bg-[#166534]" : "bg-[#14532d]"
            }`}
          />
        ))}
      </div>

      {/* 2. Doğal Stadyum Kenar Gölgelendirmesi (Vignette) */}
      <div className="absolute inset-0 bg-radial from-transparent via-black/15 to-black/45" />

      {/* 3. Vektörel Futbol Sahası Çizgileri - Net Beyaz */}
      <svg
        className="absolute inset-0 w-full h-full text-white pointer-events-none select-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 800 1100"
      >
        {/* Saha Dış Sınır Çizgileri */}
        <rect
          x="50"
          y="40"
          width="700"
          height="1020"
          rx="4"
          strokeOpacity="0.6"
        />

        {/* Orta Saha Çizgisi */}
        <line x1="50" y1="550" x2="750" y2="550" strokeOpacity="0.6" />

        {/* Orta Saha Dairesi & Başlama Noktası */}
        <circle cx="400" cy="550" r="110" strokeOpacity="0.6" />
        <circle cx="400" cy="550" r="4.5" fill="white" fillOpacity="0.75" stroke="none" />

        {/* ÜST YARI SAHA */}
        <rect
          x="220"
          y="40"
          width="360"
          height="170"
          strokeOpacity="0.6"
        />
        <rect
          x="310"
          y="40"
          width="180"
          height="65"
          strokeOpacity="0.6"
        />
        <circle cx="400" cy="150" r="4" fill="white" fillOpacity="0.75" stroke="none" />
        <path
          d="M 335 210 A 80 80 0 0 0 465 210"
          strokeOpacity="0.6"
        />
        <rect
          x="340"
          y="25"
          width="120"
          height="15"
          strokeOpacity="0.4"
          strokeDasharray="4 4"
        />

        {/* ALT YARI SAHA */}
        <rect
          x="220"
          y="890"
          width="360"
          height="170"
          strokeOpacity="0.6"
        />
        <rect
          x="310"
          y="995"
          width="180"
          height="65"
          strokeOpacity="0.6"
        />
        <circle cx="400" cy="950" r="4" fill="white" fillOpacity="0.75" stroke="none" />
        <path
          d="M 335 890 A 80 80 0 0 1 465 890"
          strokeOpacity="0.6"
        />
        <rect
          x="340"
          y="1060"
          width="120"
          height="15"
          strokeOpacity="0.4"
          strokeDasharray="4 4"
        />

        {/* 4 Köşe Bayrağı Yayları */}
        <path d="M 50 60 A 20 20 0 0 0 70 40" strokeOpacity="0.6" />
        <path d="M 750 60 A 20 20 0 0 1 730 40" strokeOpacity="0.6" />
        <path d="M 50 1040 A 20 20 0 0 1 70 1060" strokeOpacity="0.6" />
        <path d="M 750 1040 A 20 20 0 0 0 730 1060" strokeOpacity="0.6" />
      </svg>
    </div>
  );
});

FootballPitchBackground.displayName = "FootballPitchBackground";
