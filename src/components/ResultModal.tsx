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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white/98 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-6 shadow-2xl shadow-slate-950/20 text-center overflow-hidden ring-1 ring-slate-950/5">
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
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Durum Rozeti */}
        <div className="mb-4 pt-1">
          <div
            className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-2.5 shadow-2xs ${
              isWon
                ? "bg-emerald-100 text-emerald-950 border-emerald-300"
                : "bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            <span>{difficulty} MODU</span>
            <span>•</span>
            <span>{isWon ? "✓ DOĞRU TAHMİN" : "HAKLAR BİTTİ"}</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-950 drop-shadow-xs">
            {isWon ? "Tebrikler, Bildin!" : "Şansına Küstün!"}
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {isWon
              ? `${attemptsUsed}. tahminde süperstarı buldun.`
              : "Gizemli futbolcunun kimliği:"}
          </p>
        </div>

        {/* Futbolcu Kartı & Görseli */}
        <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 mb-4 text-left shadow-2xs">
          <div className="flex items-center gap-3.5">
            <PlayerAvatar
              player={player}
              size="lg"
              isMystery={false}
              className="shadow-md ring-2 ring-emerald-500/30"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-black text-slate-950 truncate">
                {player.name}
              </h3>
              <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                {player.position} • {player.nationality} {player.flag}
              </p>
              <div className="text-[11px] font-mono font-bold text-emerald-700 mt-1 truncate">
                Kulüp: {player.currentStatus}
              </div>
            </div>
          </div>

          {player.hint && (
            <div className="text-xs text-amber-900 mt-3 pt-3 border-t border-slate-200/80 leading-relaxed font-medium bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 shadow-2xs">
              💡 {player.hint}
            </div>
          )}
        </div>

        {/* Skor & İstatistik Satırı */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-2xs">
            <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Tahmin</div>
            <div className="text-sm font-black text-slate-950 mt-0.5 font-mono">
              {attemptsUsed} / {maxAttempts}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 shadow-2xs">
            <div className="text-[10px] text-emerald-800 uppercase font-mono font-bold">Puan</div>
            <div className="text-sm font-black text-emerald-700 mt-0.5 font-mono">
              +{scoreEarned}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 shadow-2xs">
            <div className="text-[10px] text-amber-800 uppercase font-mono font-bold">Seri</div>
            <div className="text-sm font-black text-amber-600 mt-0.5 font-mono flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak}</span>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onNextRound}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Sıradaki Futbolcu</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span className="text-emerald-700 font-bold">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Paylaş</span>
                </>
              )}
            </button>

            {onGoMenu && (
              <button
                onClick={onGoMenu}
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-2xs"
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
