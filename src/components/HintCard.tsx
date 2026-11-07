"use client";

import React from "react";
import { Player, Difficulty } from "@/types/player";
import { Sparkles, Lock, Lightbulb, Skull } from "lucide-react";

interface HintCardProps {
  player: Player;
  attemptCount: number;
  isGameOver: boolean;
  difficulty: Difficulty;
}

export const HintCard: React.FC<HintCardProps> = React.memo(({
  player,
  attemptCount,
  isGameOver,
  difficulty,
}) => {
  let showPosition = isGameOver;
  let showNationality = isGameOver;
  let showAge = isGameOver;
  let showFunHint = isGameOver;

  if (difficulty === "KOLAY") {
    showPosition = true;
    showNationality = true;
    showAge = isGameOver || attemptCount >= 1;
    showFunHint = isGameOver || attemptCount >= 2;
  } else if (difficulty === "ORTA") {
    showPosition = isGameOver || attemptCount >= 1;
    showNationality = isGameOver || attemptCount >= 2;
    showAge = isGameOver || attemptCount >= 3;
    showFunHint = isGameOver || attemptCount >= 3;
  } else if (difficulty === "ZOR") {
    showPosition = isGameOver || attemptCount >= 2;
    showNationality = isGameOver || attemptCount >= 3;
    showAge = isGameOver;
    showFunHint = isGameOver;
  } else if (difficulty === "EFSANE") {
    // ☠️ EFSANE MOD: Oyun bitene kadar HİÇBİR ipucu açılmaz!
    showPosition = isGameOver;
    showNationality = isGameOver;
    showAge = isGameOver;
    showFunHint = isGameOver;
  }

  const currentYear = 2026;
  const playerAge = currentYear - player.birthYear;

  return (
    <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl shadow-slate-950/10">
      <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-sans font-black text-slate-900 dark:text-white">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Kademeli İpuçları
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-700">
          Mod: {difficulty}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
        {/* Mevki */}
        <div
          className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
            showPosition
              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 shadow-2xs"
              : "bg-slate-50/80 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500"
          }`}
        >
          <div className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider mb-0.5 sm:mb-1 text-slate-500 dark:text-slate-400">
            Mevki
          </div>
          <div className="text-xs font-black truncate text-slate-950 dark:text-white">
            {showPosition ? (
              player.position
            ) : (
              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            )}
          </div>
        </div>

        {/* Uyruk */}
        <div
          className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
            showNationality
              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 shadow-2xs"
              : "bg-slate-50/80 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500"
          }`}
        >
          <div className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider mb-0.5 sm:mb-1 text-slate-500 dark:text-slate-400">
            Uyruk
          </div>
          <div className="text-xs font-black truncate flex items-center gap-1.5 text-slate-950 dark:text-white">
            {showNationality ? (
              <>
                <span className="text-sm leading-none">{player.flag}</span>
                <span className="truncate">{player.nationality}</span>
              </>
            ) : (
              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            )}
          </div>
        </div>

        {/* Yaş */}
        <div
          className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
            showAge
              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 shadow-2xs"
              : "bg-slate-50/80 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500"
          }`}
        >
          <div className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider mb-0.5 sm:mb-1 text-slate-500 dark:text-slate-400">
            Yaş
          </div>
          <div className="text-xs font-black font-mono text-slate-950 dark:text-white">
            {showAge ? (
              `${playerAge} (${player.birthYear})`
            ) : (
              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            )}
          </div>
        </div>

        {/* Son Durum */}
        <div
          className={`p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
            showFunHint
              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 shadow-2xs"
              : "bg-slate-50/80 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-500"
          }`}
        >
          <div className="text-[9px] sm:text-[10px] uppercase font-mono font-bold tracking-wider mb-0.5 sm:mb-1 text-slate-500 dark:text-slate-400">
            Son Durum
          </div>
          <div className="text-xs font-black truncate text-slate-950 dark:text-white">
            {showFunHint ? (
              player.currentStatus
            ) : (
              <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-normal">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Efsane Mod Sıfır İpucu Uyarısı */}
      {difficulty === "EFSANE" && !isGameOver && (
        <div className="mt-2 sm:mt-3 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl sm:rounded-2xl text-xs text-purple-950 dark:text-purple-200 flex items-center gap-2 sm:gap-2.5 shadow-2xs">
          <Skull className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="font-bold text-[11px] leading-tight text-purple-900 dark:text-purple-200">
            Efsane Modu: Bu seviyede hiçbir ipucu verilmez! Yalnızca saf transfer bilginle çözmelisin.
          </span>
        </div>
      )}

      {/* Ekstra Cümle İpucu */}
      {showFunHint && player.hint && (
        <div className="mt-3 px-3.5 py-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2 shadow-2xs">
          <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed text-xs font-medium text-amber-950 dark:text-amber-200">{player.hint}</span>
        </div>
      )}
    </div>
  );
});

HintCard.displayName = "HintCard";
