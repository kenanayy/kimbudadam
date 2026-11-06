"use client";

import React, { useState, useEffect } from "react";
import {
  getTurkeyDate,
  getDailyStorage,
  getDailyStats,
  formatTimeRemaining,
} from "@/utils/dailyChallenge";
import { DailyGameResult, DailyStats } from "@/types/daily";
import { soundManager } from "@/utils/sound";
import {
  Calendar,
  Sparkles,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Share2,
  Trophy,
} from "lucide-react";

interface DailyChallengeCardProps {
  onStartDaily: () => void;
  onOpenDailyResult: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  onStartDaily,
  onOpenDailyResult,
}) => {
  const [dailyInfo, setDailyInfo] = useState<{
    dateStr: string;
    dayNumber: number;
    formattedDate: string;
    nextMidnightMs: number;
  } | null>(null);

  const [todayResult, setTodayResult] = useState<DailyGameResult | null>(null);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const info = getTurkeyDate();
    setDailyInfo(info);

    const savedResult = getDailyStorage(info.dateStr);
    setTodayResult(savedResult);

    const savedStats = getDailyStats();
    setStats(savedStats);

    const updateTimer = () => {
      const current = getTurkeyDate();
      setTimeRemaining(formatTimeRemaining(current.nextMidnightMs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!dailyInfo) return null;

  const isCompleted = Boolean(todayResult);

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/90 p-4 sm:p-5 shadow-xl shadow-emerald-950/20 text-white group">
      {/* Arka plan ışık efekti */}
      <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-700" />
      <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Holografik süpürme efekti */}
      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Sol Taraf: Rozet, Başlık ve Açıklama */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-xs">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span>GÜNÜN FUTBOLCUSU #{dailyInfo.dayNumber}</span>
            </span>

            <span className="text-[11px] font-mono text-slate-400">
              {dailyInfo.formattedDate}
            </span>

            {stats && stats.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{stats.currentStreak} Gün Seri</span>
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Günün Futbolcusu</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
              GÜNLÜK MOD
            </span>
          </h3>

          <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
            {isCompleted ? (
              todayResult?.isWon ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 inline shrink-0" />
                  Tebrikler! Bugünün futbolcusunu {todayResult.attemptsUsed}/{todayResult.maxAttempts} denemede çözdün.
                </span>
              ) : (
                <span className="text-rose-300 font-bold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-400 inline shrink-0" />
                  Bugünkü 6 hakkın bitti. Yarınki yeni futbolcuyu bekle!
                </span>
              )
            ) : (
              "Her gün tüm dünyada aynı gizemli futbolcu aranıyor. Tek şansın var, kariyer adımlarını çöz ve skorunu paylaş!"
            )}
          </p>
        </div>

        {/* Sağ Taraf: Geri Sayım ve Aksiyon Butonu */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Yenilenmeye:</span>
            <span className="text-emerald-300 font-bold">{timeRemaining}</span>
          </div>

          {isCompleted ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenDailyResult();
              }}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Sonucunu Gör & Paylaş 📋</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onStartDaily();
              }}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 active:brightness-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Günün Futbolcusunu Çöz</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

