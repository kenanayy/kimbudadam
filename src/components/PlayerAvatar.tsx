"use client";

import React, { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { getPlayerImageUrl } from "@/data/playerImages";
import { User, Sparkles, HelpCircle } from "lucide-react";

interface PlayerAvatarProps {
  player?: Player | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isMystery?: boolean;
  className?: string;
  showFlag?: boolean;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  size = "md",
  isMystery = false,
  className = "",
  showFlag = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = player ? (getPlayerImageUrl(player.id) || player.image) : undefined;

  // Oyuncu veya görsel değiştiğinde hata durumunu sıfırla
  useEffect(() => {
    setImgError(false);
  }, [player?.id, imageUrl]);

  // Boyut haritası
  const sizeMap = {
    xs: {
      box: "w-6 h-6 rounded-lg",
      text: "text-[10px]",
      badge: "w-3.5 h-3.5 text-[8px] -bottom-0.5 -right-0.5",
      icon: "w-3 h-3",
    },
    sm: {
      box: "w-8 h-8 rounded-xl",
      text: "text-xs",
      badge: "w-4 h-4 text-[9px] -bottom-0.5 -right-0.5",
      icon: "w-4 h-4",
    },
    md: {
      box: "w-11 h-11 rounded-2xl",
      text: "text-base",
      badge: "w-4.5 h-4.5 text-[10px] -bottom-1 -right-1",
      icon: "w-5 h-5",
    },
    lg: {
      box: "w-16 h-16 rounded-3xl",
      text: "text-2xl",
      badge: "w-6 h-6 text-xs -bottom-1 -right-1",
      icon: "w-7 h-7",
    },
    xl: {
      box: "w-24 h-24 sm:w-28 sm:h-28 rounded-3xl",
      text: "text-4xl",
      badge: "w-8 h-8 text-sm -bottom-1.5 -right-1.5",
      icon: "w-10 h-10",
    },
  };

  const currentSize = sizeMap[size];

  // 1. GİZEMLİ OYUNCU DURUMU (Oyun esnasında kilitli veya oyuncu gizli)
  if (isMystery || !player) {
    return (
      <div className={`relative shrink-0 ${currentSize.box} ${className}`}>
        {/* Ana Kart Gövdesi - Tam yuvarlatılmış ve kırpılmış */}
        <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border-2 border-emerald-400/80 dark:border-emerald-500/70 shadow-md flex items-center justify-center text-emerald-400 overflow-hidden group select-none relative">
          {/* Radyal Stadyum Işık Hüzmesi */}
          <div className="absolute inset-0 bg-radial from-emerald-500/25 via-emerald-500/5 to-transparent pointer-events-none animate-pulse" />

          {/* Arka Planda Hafif Futbolcu Silueti */}
          <User className="absolute inset-0 m-auto w-3/4 h-3/4 text-emerald-400/20 pointer-events-none stroke-[1.5]" />

          {/* Soru İşareti */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className={`font-mono font-black ${currentSize.text} tracking-tight drop-shadow-md bg-gradient-to-b from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent`}>
              ?
            </span>
          </div>
        </div>

        {/* Sağ Alt Köşe: Vektörel Mini Futbol Topu Rozeti (Şeffaf alan taşmasını önler) */}
        {showFlag && (
          <div
            className={`absolute ${currentSize.badge} z-10 rounded-full bg-slate-950 border-1.5 border-emerald-400 shadow-md flex items-center justify-center text-emerald-300 select-none`}
            title="Gizemli Futbolcu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3/4 h-3/4 text-emerald-400">
              <circle cx="12" cy="12" r="9" />
              <polygon points="12,7 15,9.5 14,13.5 10,13.5 9,9.5" fill="currentColor" opacity="0.8" />
              <line x1="12" y1="7" x2="12" y2="3" />
              <line x1="15" y1="9.5" x2="19" y2="8" />
              <line x1="14" y1="13.5" x2="17" y2="17" />
              <line x1="10" y1="13.5" x2="7" y2="17" />
              <line x1="9" y1="9.5" x2="5" y2="8" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Futbolcu baş harfleri
  const initials = player.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Mevki temalı renk geçişleri
  const positionGradients: Record<string, string> = {
    Forvet: "from-rose-600 to-amber-600",
    "Orta Saha": "from-emerald-600 to-teal-700",
    Defans: "from-blue-600 to-indigo-800",
    Kaleci: "from-amber-500 to-orange-700",
  };

  const bgGradient =
    positionGradients[player.position] || "from-slate-700 to-slate-900";

  const hasValidImage = Boolean(imageUrl && !imgError);

  return (
    <div className={`relative shrink-0 ${currentSize.box} ${className}`}>
      <div className="w-full h-full rounded-[inherit] overflow-hidden border border-slate-200/90 dark:border-slate-700 shadow-xs bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={player.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top select-none transition-transform duration-200"
            onError={() => setImgError(true)}
          />
        ) : (
          // Görsel yoksa veya yüklenemediyse: Şık Futbolcu Kartı Avatarı
          <div
            className={`w-full h-full bg-gradient-to-br ${bgGradient} text-white flex flex-col items-center justify-center select-none shadow-inner`}
          >
            <span className={`font-mono font-black leading-none drop-shadow-xs ${currentSize.text}`}>
              {initials}
            </span>
          </div>
        )}
      </div>

      {showFlag && player.flag && (
        <div
          className={`absolute ${currentSize.badge} z-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 shadow-sm flex items-center justify-center leading-none select-none overflow-hidden`}
          title={player.nationality}
        >
          <span>{player.flag}</span>
        </div>
      )}
    </div>
  );
};

