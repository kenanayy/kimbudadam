"use client";

import React from "react";
import { Unlock, Shirt, Trophy, Zap, Check } from "lucide-react";
import { Difficulty } from "@/types/player";

interface JokerConsoleProps {
  difficulty: Difficulty;
  disabled: boolean;
  canRevealClub: boolean;
  onUseExtraClub: () => void;
  onUseJerseyNumber: () => void;
  onUseTrophyHint: () => void;
  extraClubUsed: boolean;
  jerseyUsed: boolean;
  trophyUsed: boolean;
  revealedJerseyNumber: number | null;
  revealedTrophyHint: string | null;
}

export const JokerConsole: React.FC<JokerConsoleProps> = React.memo(({
  difficulty,
  disabled,
  canRevealClub,
  onUseExtraClub,
  onUseJerseyNumber,
  onUseTrophyHint,
  extraClubUsed,
  jerseyUsed,
  trophyUsed,
  revealedJerseyNumber,
  revealedTrophyHint,
}) => {
  // Zorluk seviyesine göre joker izinleri:
  // Kolay: 3 joker (Ekstra Kulüp, Forma No, Kupa & Başarı)
  // Orta: 2 joker (Ekstra Kulüp, Forma No)
  // Zor: 1 joker (Yalnızca Forma No)
  // Efsane: 0 joker (page.tsx içinde zaten kilit uyarısı gösterilir)
  const allowExtraClub = difficulty === "KOLAY" || difficulty === "ORTA";
  const allowJersey = difficulty === "KOLAY" || difficulty === "ORTA" || difficulty === "ZOR";
  const allowTrophy = difficulty === "KOLAY";

  const totalAllowed = (allowExtraClub ? 1 : 0) + (allowJersey ? 1 : 0) + (allowTrophy ? 1 : 0);
  if (totalAllowed === 0) return null;

  return (
    <div className="w-full bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 space-y-2.5 transition-all">
      {/* Üst Başlık & Bilgi */}
      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5 font-sans font-black text-slate-900 dark:text-white">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>Taktiksel Jokerler</span>
        </span>
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          {totalAllowed} Joker Mevcut • {difficulty === "KOLAY" ? "Kolay" : difficulty === "ORTA" ? "Orta" : "Zor"} Mod
        </span>
      </div>

      {/* Dinamik Joker Butonları Grid'i */}
      <div
        className={`grid gap-2 ${
          totalAllowed === 3
            ? "grid-cols-3"
            : totalAllowed === 2
            ? "grid-cols-2"
            : "grid-cols-1 sm:max-w-xs sm:mx-auto"
        }`}
      >
        {/* 1. JOKER: Ekstra Kulüp Aç (Kolay ve Orta) */}
        {allowExtraClub && (
          <button
            type="button"
            onClick={onUseExtraClub}
            disabled={disabled || extraClubUsed || !canRevealClub}
            className={`relative group flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              extraClubUsed
                ? "bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : !canRevealClub
                ? "bg-slate-100/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-emerald-50/90 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
            }`}
            title={
              extraClubUsed
                ? "Bu joker kullanıldı"
                : !canRevealClub
                ? "Tüm kulüpler zaten açık"
                : "Hak harcamadan kariyerdeki bir sonraki kulübü aç"
            }
          >
            <div className="flex items-center gap-1 mb-1">
              {extraClubUsed ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-black">
                {extraClubUsed ? "Kulüp Açık" : "+1 Kulüp"}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium hidden sm:block truncate w-full">
              {extraClubUsed ? "Kullanıldı" : "Hak harcamaz"}
            </span>
          </button>
        )}

        {/* 2. JOKER: Forma Numarası (Kolay, Orta ve Zor) */}
        {allowJersey && (
          <button
            type="button"
            onClick={onUseJerseyNumber}
            disabled={disabled || jerseyUsed}
            className={`relative group flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              jerseyUsed
                ? "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 shadow-2xs"
                : "bg-indigo-50/90 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700/60 text-indigo-950 dark:text-indigo-100 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
            }`}
            title={
              jerseyUsed
                ? `İkonik Forma No: #${revealedJerseyNumber}`
                : "Futbolcunun en bilinen sırt numarasını öğren"
            }
          >
            <div className="flex items-center gap-1 mb-1">
              <Shirt className={`w-3.5 h-3.5 ${jerseyUsed ? "text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-900/50" : "text-indigo-600 dark:text-indigo-400 group-hover:scale-110"} transition-transform`} />
              <span className="text-xs font-black">
                {jerseyUsed ? `#${revealedJerseyNumber}` : "Forma No"}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium hidden sm:block truncate w-full">
              {jerseyUsed ? "İkonik Sırt No" : "Numarayı Gör"}
            </span>
          </button>
        )}

        {/* 3. JOKER: Kupa & Başarı (Yalnızca Kolay) */}
        {allowTrophy && (
          <button
            type="button"
            onClick={onUseTrophyHint}
            disabled={disabled || trophyUsed}
            className={`relative group flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              trophyUsed
                ? "bg-amber-50/80 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 shadow-2xs"
                : "bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-300 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:translate-y-0"
            }`}
            title={
              trophyUsed
                ? "Kupa ipucu açıldı"
                : "Kariyerindeki en büyük başarı veya kupa ipucunu aç"
            }
          >
            <div className="flex items-center gap-1 mb-1">
              <Trophy className={`w-3.5 h-3.5 ${trophyUsed ? "text-amber-600 dark:text-amber-400 fill-amber-200 dark:fill-amber-900/50" : "text-amber-600 dark:text-amber-400 group-hover:scale-110"} transition-transform`} />
              <span className="text-xs font-black">
                {trophyUsed ? "Kupa Açık" : "Kupa İpucu"}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium hidden sm:block truncate w-full">
              {trophyUsed ? "Görüntüleniyor" : "Büyük Başarı"}
            </span>
          </button>
        )}
      </div>

      {/* AÇILAN JOKER BİLGİLERİ PANELİ */}
      {((allowJersey && revealedJerseyNumber !== null) || (allowTrophy && revealedTrophyHint !== null)) && (
        <div className="space-y-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Açılan Forma Numarası Rozeti */}
          {allowJersey && revealedJerseyNumber !== null && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/70 text-indigo-950 dark:text-indigo-200 text-xs">
              <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-mono font-black text-[11px] flex items-center justify-center shadow-2xs">
                #{revealedJerseyNumber}
              </span>
              <span className="font-bold text-[11px] text-indigo-900 dark:text-indigo-300">
                İkonik Sırt Numarası:
              </span>
              <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-100">
                #{revealedJerseyNumber}
              </span>
            </div>
          )}

          {/* Açılan Kupa & Kariyer İpucu Kartı */}
          {allowTrophy && revealedTrophyHint !== null && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-amber-950 dark:text-amber-200 text-xs">
              <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 fill-amber-300 dark:fill-amber-600" />
              <div className="min-w-0">
                <span className="font-black text-[10px] uppercase font-mono tracking-wider text-amber-800 dark:text-amber-400 block mb-0.5">
                  Kariyer Zirvesi & Kupa:
                </span>
                <p className="text-xs text-amber-950 dark:text-amber-200 font-medium leading-relaxed">
                  {revealedTrophyHint}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

JokerConsole.displayName = "JokerConsole";
