"use client";

import React, { useState, useEffect } from "react";
import { getClubBadge } from "@/data/clubLogos";
import { Shield } from "lucide-react";

interface ClubLogoProps {
  clubName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showFallbackText?: boolean;
}

export const ClubLogo: React.FC<ClubLogoProps> = ({
  clubName,
  size = "md",
  className = "",
  showFallbackText = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const badge = getClubBadge(clubName);

  // Kulüp veya logo URL'i değiştiğinde hata durumunu sıfırla
  useEffect(() => {
    setImgError(false);
  }, [clubName, badge.logoUrl]);

  // Boyut eşleşmeleri
  const sizeClasses = {
    xs: "w-5 h-5 text-[8px]",
    sm: "w-7 h-7 text-[9px]",
    md: "w-9 h-9 text-[10px]",
    lg: "w-12 h-12 text-xs",
    xl: "w-14 h-14 text-sm",
    "2xl": "w-18 h-18 text-base",
  };

  const imageSizes = {
    xs: 18,
    sm: 24,
    md: 32,
    lg: 44,
    xl: 52,
    "2xl": 68,
  };

  const hasLogoUrl = Boolean(badge.logoUrl && !imgError);

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-2xs transition-transform duration-150 select-none ${
        sizeClasses[size]
      } ${className}`}
      title={badge.name}
      style={{
        background: hasLogoUrl
          ? "#FFFFFF"
          : `linear-gradient(135deg, ${badge.primaryColor} 0%, ${badge.secondaryColor} 100%)`,
        border: hasLogoUrl ? "1px solid rgba(0,0,0,0.08)" : `1px solid ${badge.secondaryColor}40`,
      }}
    >
      {hasLogoUrl ? (
        // Resmi Logo Görseli (Vektörel / PNG)
        <img
          src={badge.logoUrl}
          alt={badge.name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="object-contain p-0.5 max-w-full max-h-full drop-shadow-2xs"
          onError={() => setImgError(true)}
        />
      ) : (
        // Vektörel Kulüp Rozeti ve Baş Harfleri
        <div className="relative w-full h-full flex flex-col items-center justify-center p-0.5">
          {/* Rozet Şekli Vurgusu */}
          <Shield
            className="absolute inset-0 m-auto opacity-15 stroke-1"
            style={{ color: badge.textColor, width: "80%", height: "80%" }}
          />

          {showFallbackText && (
            <span
              className="font-mono font-black tracking-tighter leading-none relative z-10 drop-shadow-xs"
              style={{ color: badge.textColor }}
            >
              {badge.short}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

