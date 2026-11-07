"use client";

import React, { useEffect, useState } from "react";
import { Player } from "@/types/player";
import { DailyGameResult, DailyStats } from "@/types/daily";
import {
  generateDailyShareText,
  formatTimeRemaining,
  getTurkeyDate,
} from "@/utils/dailyChallenge";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import confetti from "canvas-confetti";
import {
  X,
  Share2,
  Check,
  Flame,
  Trophy,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BarChart3,
  Calendar,
} from "lucide-react";

interface DailyResultModalProps {
  isOpen: boolean;
  result: DailyGameResult;
  stats: DailyStats;
  player: Player;
  onClose: () => void;
  onGoMenu: () => void;
  onPlayRegularGame: () => void;
}

export const DailyResultModal: React.FC<DailyResultModalProps> = ({
  isOpen,
  result,
  stats,
  player,
  onClose,
  onGoMenu,
  onPlayRegularGame,
}) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<string>("");

  // Konfeti efekti
  useEffect(() => {
    if (isOpen && result.isWon) {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.55 },
        colors: ["#10b981", "#34d399", "#f59e0b", "#fbbf24", "#ffffff"],
      });
    }
  }, [isOpen, result.isWon]);

  // Gece yarısına canlı geri sayım
  useEffect(() => {
    if (!isOpen) return;

    const updateCountdown = () => {
      const { nextMidnightMs } = getTurkeyDate();
      setCountdown(formatTimeRemaining(nextMidnightMs));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = async () => {
    const text = generateDailyShareText(result, stats);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Kim Bu Adam? - Günün Futbolcusu",
          text,
        });
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };

  const winRate =
    stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxInDistribution = Math.max(
    1,
    ...Object.values(stats.guessDistribution)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(0,0,0,0.9)] text-center overflow-hidden ring-1 ring-white/10 my-auto animate-in zoom-in-95 duration-200">
        {/* Üst Şerit - Renkli Vurgu */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 ${
            result.isWon
              ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400"
              : "bg-gradient-to-r from-slate-600 via-rose-500 to-slate-600"
          }`}
        />

        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Başlık ve Durum Rozeti */}
        <div className="pt-1 pb-3 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>GÜNÜN FUTBOLCUSU #{result.dayNumber}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            {result.isWon ? "Harika İş, Bildin! 🎯" : "Bugün Olmadı! ⏱️"}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {result.isWon
              ? `${result.attemptsUsed} denemede günün gizemli futbolcusunu çözdün!`
              : "6 hakkın bitti ama yarın yeni bir futbolcu seni bekliyor."}
          </p>
        </div>

        {/* Açığa Çıkan Futbolcu Kartı */}
        <div className="relative p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-3.5 text-left mb-4 shadow-inner">
          <PlayerAvatar player={player} size="lg" isMystery={false} className="shadow-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white truncate">
                {player.name}
              </span>
              <span className="text-sm">{player.flag}</span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
              {player.position} • {player.nationality} ({player.birthYear})
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 font-bold truncate">
              <span>{player.currentStatus}</span>
              <span>•</span>
              <span>{player.career.length} Kulüp</span>
            </div>
          </div>
        </div>

        {/* 📊 GÜNLÜK İSTATİSTİKLER */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 mb-4 text-left">
          <div className="flex items-center justify-between text-xs font-mono font-black text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5 text-slate-300">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>GÜNLÜK KARNEN</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{stats.currentStreak} GÜN SERİ</span>
            </div>
          </div>

          {/* 4'lü Özet İstatistik */}
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <div className="text-lg font-black font-mono text-white">
                {stats.played}
              </div>
              <div className="text-[10px] font-mono text-slate-400">Oynanan</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <div className="text-lg font-black font-mono text-emerald-400">
                %{winRate}
              </div>
              <div className="text-[10px] font-mono text-slate-400">Kazanma</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <div className="text-lg font-black font-mono text-amber-400">
                {stats.currentStreak}
              </div>
              <div className="text-[10px] font-mono text-slate-400">Seri</div>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <div className="text-lg font-black font-mono text-purple-400">
                {stats.maxStreak}
              </div>
              <div className="text-[10px] font-mono text-slate-400">En İyi</div>
            </div>
          </div>

          {/* Tahmin Dağılımı Çubuk Grafiği */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              Tahmin Dağılımı (Hak):
            </div>
            {[1, 2, 3, 4, 5, 6].map((attempt) => {
              const count = stats.guessDistribution[attempt as 1 | 2 | 3 | 4 | 5 | 6] || 0;
              const widthPct = Math.max(8, Math.round((count / maxInDistribution) * 100));
              const isCurrentAttempt = result.isWon && result.attemptsUsed === attempt;

              return (
                <div key={attempt} className="flex items-center gap-2 text-xs font-mono">
                  <span className="w-3 text-slate-400 font-bold text-right text-[11px]">
                    {attempt}
                  </span>
                  <div className="flex-1 bg-slate-950/80 rounded-md overflow-hidden h-5 flex items-center p-0.5 border border-slate-800/60">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className={`h-full rounded flex items-center justify-end px-1.5 text-[10px] font-black transition-all duration-500 ${
                        isCurrentAttempt
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-xs"
                          : count > 0
                          ? "bg-slate-700 text-white"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📋 SKORU PAYLAŞ BUTONU */}
        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 active:brightness-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer mb-3"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-emerald-950 stroke-[3]" />
              <span className="tracking-wide">SKOR PANOMA KOPYALANDI! ✨</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span className="tracking-wide">
                GÜNÜN SKORUNU PAYLAŞ 📋
              </span>
            </>
          )}
        </button>

        {/* ⏱️ YENİ FUTBOLCUYA KALAN SÜRE */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono mb-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Sıradaki Günün Futbolcusu:</span>
          </div>
          <span className="font-black text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-500/30">
            {countdown || "00s 00dk 00sn"}
          </span>
        </div>

        {/* Aksiyon Butonları (Sınırsız Oyna & Menü) */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={onPlayRegularGame}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sınırsız Mod Oyna</span>
          </button>

          <button
            type="button"
            onClick={onGoMenu}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <span>Ana Menüye Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
};

