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
      text: "text-[9px]",
      flag: "text-[10px] -bottom-1 -right-1",
      icon: "w-3 h-3",
    },
    sm: {
      box: "w-8 h-8 rounded-xl",
      text: "text-[11px]",
      flag: "text-xs -bottom-1 -right-1",
      icon: "w-4 h-4",
    },
    md: {
      box: "w-11 h-11 rounded-2xl",
      text: "text-sm",
      flag: "text-sm -bottom-1 -right-1",
      icon: "w-5 h-5",
    },
    lg: {
      box: "w-16 h-16 rounded-3xl",
      text: "text-lg",
      flag: "text-base -bottom-1.5 -right-1.5",
      icon: "w-8 h-8",
    },
    xl: {
      box: "w-24 h-24 sm:w-28 sm:h-28 rounded-3xl",
      text: "text-2xl",
      flag: "text-xl -bottom-2 -right-2",
      icon: "w-12 h-12",
    },
  };

  const currentSize = sizeMap[size];

  // 1. GİZEMLİ OYUNCU DURUMU (Oyun esnasında kilitli veya oyuncu gizli)
  if (isMystery || !player) {
    return (
      <div className={`relative shrink-0 ${currentSize.box} ${className}`}>
        <div className="w-full h-full rounded-[inherit] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 border-2 border-emerald-500/40 shadow-lg flex items-center justify-center text-emerald-400 overflow-hidden group select-none">
          {/* Arka plan ışıması */}
          <div className="absolute inset-0 bg-emerald-500/10 animate-pulse pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className={`font-mono font-black ${currentSize.text} tracking-tight drop-shadow-md`}>
              ?
            </span>
          </div>
        </div>

        {showFlag && (
          <span className={`absolute ${currentSize.flag} z-10 select-none drop-shadow-sm`}>
            ⚽
          </span>
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
      <div className="w-full h-full rounded-[inherit] overflow-hidden border border-slate-200/90 shadow-xs bg-slate-100 flex items-center justify-center">
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
        <span
          className={`absolute ${currentSize.flag} z-10 select-none drop-shadow-xs leading-none`}
          title={player.nationality}
        >
          {player.flag}
        </span>
      )}
    </div>
  );
};

