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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-950/95 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center overflow-hidden ring-1 ring-white/10">
        {/* Üst Şerit - Holografik Parıltı */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            isWon
              ? "bg-gradient-to-r from-emerald-400 via-amber-400 to-teal-400"
              : "bg-gradient-to-r from-slate-600 via-rose-500 to-slate-600"
          }`}
        />

        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Durum Rozeti */}
        <div className="mb-4 pt-1">
          <div
            className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full border mb-2.5 shadow-[0_0_12px_rgba(16,185,129,0.25)] ${
              isWon
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                : "bg-slate-900 text-slate-300 border-slate-700"
            }`}
          >
            <span>{difficulty} MODU</span>
            <span>•</span>
            <span>{isWon ? "✓ DOĞRU TAHMİN" : "HAKLAR BİTTİ"}</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
            {isWon ? "Tebrikler, Bildin!" : "Şansına Küstün!"}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {isWon
              ? `${attemptsUsed}. tahminde süperstarı buldun.`
              : "Gizemli futbolcunun kimliği:"}
          </p>
        </div>

        {/* Futbolcu Kartı & Görseli (FUT Walkout Kartı) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 text-left shadow-lg ring-1 ring-white/5">
          <div className="flex items-center gap-3.5">
            <PlayerAvatar
              player={player}
              size="lg"
              isMystery={false}
              className="shadow-[0_0_20px_rgba(16,185,129,0.3)] ring-2 ring-emerald-400"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-black text-white truncate drop-shadow-sm">
                {player.name}
              </h3>
              <p className="text-xs text-slate-300 truncate mt-0.5 font-medium">
                {player.position} • {player.nationality} {player.flag}
              </p>
              <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1 truncate">
                Kulüp: {player.currentStatus}
              </div>
            </div>
          </div>

          {player.hint && (
            <div className="text-xs text-amber-200 mt-3 pt-3 border-t border-slate-800 leading-relaxed font-medium bg-slate-950/60 p-2.5 rounded-xl border border-amber-500/20">
              💡 {player.hint}
            </div>
          )}
        </div>

        {/* Skor & İstatistik Satırı */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-inner">
            <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Tahmin</div>
            <div className="text-sm font-black text-white mt-0.5 font-mono">
              {attemptsUsed} / {maxAttempts}
            </div>
          </div>

          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <div className="text-[10px] text-emerald-400 uppercase font-mono font-bold">Puan</div>
            <div className="text-sm font-black text-emerald-300 mt-0.5 font-mono">
              +{scoreEarned}
            </div>
          </div>

          <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <div className="text-[10px] text-amber-400 uppercase font-mono font-bold">Seri</div>
            <div className="text-sm font-black text-amber-300 mt-0.5 font-mono flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{streak}</span>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onNextRound}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Sıradaki Futbolcu</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Paylaş</span>
                </>
              )}
            </button>

            {onGoMenu && (
              <button
                onClick={onGoMenu}
                className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700/80 transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
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
