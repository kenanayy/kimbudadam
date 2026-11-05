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
    <div className="w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-950/10">
      <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-sans font-black text-slate-900">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Kademeli İpuçları
        </span>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
          Mod: {difficulty}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Mevki */}
        <div
          className={`p-2.5 rounded-2xl border transition-all duration-200 ${
            showPosition
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs"
              : "bg-slate-50/80 border-slate-200/80 text-slate-400"
          }`}
        >
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider mb-1 text-slate-500">
            Mevki
          </div>
          <div className="text-xs font-black truncate text-slate-950">
            {showPosition ? (
              player.position
            ) : (
              <span className="flex items-center gap-1 text-slate-400 font-normal">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            )}
          </div>
        </div>

        {/* Uyruk */}
        <div
          className={`p-2.5 rounded-2xl border transition-all duration-200 ${
            showNationality
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs"
              : "bg-slate-50/80 border-slate-200/80 text-slate-400"
          }`}
        >
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider mb-1 text-slate-500">
            Uyruk
          </div>
          <div className="text-xs font-black truncate flex items-center gap-1.5 text-slate-950">
            {showNationality ? (
              <>
                <span className="text-sm leading-none">{player.flag}</span>
                <span className="truncate">{player.nationality}</span>
              </>
            ) : (
              <span className="flex items-center gap-1 text-slate-400 font-normal">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            )}
          </div>
        </div>

        {/* Yaş */}
        <div
          className={`p-2.5 rounded-2xl border transition-all duration-200 ${
            showAge
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs"
              : "bg-slate-50/80 border-slate-200/80 text-slate-400"
          }`}
        >
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider mb-1 text-slate-500">
            Yaş
          </div>
          <div className="text-xs font-black font-mono text-slate-950">
            {showAge ? (
              `${playerAge} (${player.birthYear})`
            ) : (
              <span className="flex items-center gap-1 text-slate-400 font-normal">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            )}
          </div>
        </div>

        {/* Son Durum */}
        <div
          className={`p-2.5 rounded-2xl border transition-all duration-200 ${
            showFunHint
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs"
              : "bg-slate-50/80 border-slate-200/80 text-slate-400"
          }`}
        >
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider mb-1 text-slate-500">
            Son Durum
          </div>
          <div className="text-xs font-black truncate text-slate-950">
            {showFunHint ? (
              player.currentStatus
            ) : (
              <span className="flex items-center gap-1 text-slate-400 font-normal">
                <Lock className="w-3 h-3" /> Kilitli
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Efsane Mod Sıfır İpucu Uyarısı */}
      {difficulty === "EFSANE" && !isGameOver && (
        <div className="mt-3 px-3.5 py-2.5 bg-purple-50/90 border border-purple-200 rounded-2xl text-xs text-purple-950 flex items-center gap-2.5 shadow-2xs">
          <Skull className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-bold text-[11px] leading-tight text-purple-900">
            Efsane Modu: Bu seviyede hiçbir ipucu verilmez! Yalnızca saf transfer bilginle çözmelisin.
          </span>
        </div>
      )}

      {/* Ekstra Cümle İpucu */}
      {showFunHint && player.hint && (
        <div className="mt-3 px-3.5 py-2.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-2 shadow-2xs">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed text-xs font-medium">{player.hint}</span>
        </div>
      )}
    </div>
  );
});

HintCard.displayName = "HintCard";
