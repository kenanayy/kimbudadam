"use client";

import React, { useEffect, useState } from "react";
import { Player, Difficulty } from "@/types/player";
import confetti from "canvas-confetti";
import { X, ArrowRight, Share2, Check, Flame, Trophy } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface ResultModalProps {
  isOpen: boolean;
  isWon: boolean;
  player: Player;
  attemptsUsed: number;
  maxAttempts: number;
  streak: number;
  difficulty: Difficulty;
  onNextRound: () => void;
  onClose: () => void;
  onGoMenu?: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  isWon,
  player,
  attemptsUsed,
  maxAttempts,
  streak,
  difficulty,
  onNextRound,
  onClose,
  onGoMenu,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && isWon) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#f59e0b", "#fbbf24", "#ffffff"],
      });
    }
  }, [isOpen, isWon]);

  if (!isOpen) return null;

  const multiplier = difficulty === "EFSANE" ? 5 : difficulty === "ZOR" ? 3 : difficulty === "ORTA" ? 2 : 1;
  const scoreEarned = isWon
    ? (maxAttempts - attemptsUsed + 1) * 100 * multiplier
    : 0;

  const handleShare = () => {
    const text = `⚽ Kim Bu Adam? // ${difficulty}\n${
      isWon ? "✓ Doğru Tahmin Ettim!" : "✗ Bilemedim"
    } (${attemptsUsed}/${maxAttempts})\nSeri: ${streak} • Puan: +${scoreEarned}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl shadow-slate-950/20 text-center overflow-y-auto max-h-[92dvh] overscroll-contain ring-1 ring-slate-950/5 my-auto">
        {/* Üst Şerit - Holografik Parıltı */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isWon
              ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"
              : "bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500"
          }`}
        />

        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Durum Rozeti */}
        <div className="mb-3 sm:mb-4 pt-0 sm:pt-1">
          <div
            className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border mb-2 sm:mb-2.5 shadow-2xs ${
              isWon
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700/60"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
            }`}
          >
            <span>{difficulty} MODU</span>
            <span>•</span>
            <span>{isWon ? "✓ DOĞRU TAHMİN" : "HAKLAR BİTTİ"}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white drop-shadow-xs">
            {isWon ? "Tebrikler, Bildin!" : "Şansına Küstün!"}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 sm:mt-1">
            {isWon
              ? `${attemptsUsed}. tahminde süperstarı buldun.`
              : "Gizemli futbolcunun kimliği:"}
          </p>
        </div>

        {/* Futbolcu Kartı & Görseli */}
        <div className="bg-slate-50/90 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 text-left shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="shrink-0 sm:hidden">
              <PlayerAvatar
                player={player}
                size="md"
                isMystery={false}
                className="shadow-md ring-2 ring-emerald-500/30"
              />
            </div>
            <div className="shrink-0 hidden sm:block">
              <PlayerAvatar
                player={player}
                size="lg"
                isMystery={false}
                className="shadow-md ring-2 ring-emerald-500/30"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-black text-slate-950 dark:text-white truncate">
                {player.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                {player.position} • {player.nationality} {player.flag}
              </p>
              <div className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 sm:mt-1 truncate">
                Kulüp: {player.currentStatus}
              </div>
            </div>
          </div>

          {player.hint && (
            <div className="text-xs text-amber-900 dark:text-amber-200 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-slate-200/80 dark:border-slate-800 leading-relaxed font-medium bg-amber-50/80 dark:bg-amber-950/50 p-2 sm:p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/70 shadow-2xs">
              💡 {player.hint}
            </div>
          )}
        </div>

        {/* Skor & İstatistik Satırı */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3.5 sm:mb-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-2 sm:p-2.5 shadow-2xs">
            <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Tahmin</div>
            <div className="text-xs sm:text-sm font-black text-slate-950 dark:text-white mt-0.5 font-mono">
              {attemptsUsed} / {maxAttempts}
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 rounded-xl p-2 sm:p-2.5 shadow-2xs">
            <div className="text-[9px] sm:text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-mono font-bold">Puan</div>
            <div className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
              +{scoreEarned}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 rounded-xl p-2 sm:p-2.5 shadow-2xs">
            <div className="text-[9px] sm:text-[10px] text-amber-800 dark:text-amber-300 uppercase font-mono font-bold">Seri</div>
            <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5 font-mono flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak}</span>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onNextRound}
            className="w-full py-3 sm:py-3.5 px-4 sm:px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Sıradaki Futbolcu</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>Paylaş</span>
                </>
              )}
            </button>

            {onGoMenu && (
              <button
                onClick={onGoMenu}
                className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
              >
                Menüye Dön
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
