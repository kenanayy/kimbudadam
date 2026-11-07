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
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 sm:p-5 shadow-sm text-slate-800 dark:text-slate-100 group hover:border-emerald-300/80 dark:hover:border-emerald-600/60 transition-all duration-300">
      {/* Hafif arka plan renk ışıması */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-500/8 dark:bg-emerald-500/15 blur-3xl pointer-events-none group-hover:bg-emerald-500/15 dark:group-hover:bg-emerald-500/25 transition-all duration-700" />
      <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Holografik süpürme efekti */}
      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-3.5">
        {/* Sol Taraf: Rozet, Başlık ve Açıklama */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60 px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs">
              <Calendar className="w-3 h-3 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
              <span>GÜNÜN FUTBOLCUSU #{dailyInfo.dayNumber}</span>
            </span>

            <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
              {dailyInfo.formattedDate}
            </span>

            {stats && stats.currentStreak > 0 && (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-black bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{stats.currentStreak} Gün Seri</span>
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
            <span>Günün Futbolcusu</span>
            <span className="text-[9px] sm:text-[10px] font-mono font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              GÜNLÜK MOD
            </span>
          </h3>

          <div className="text-xs text-slate-600 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
            {isCompleted ? (
              todayResult?.isWon ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-200 font-bold bg-emerald-50/90 dark:bg-emerald-950/50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline shrink-0 stroke-[2.5]" />
                  <span>Tebrikler! Bugünün futbolcusunu {todayResult.attemptsUsed}/{todayResult.maxAttempts} denemede çözdün.</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs text-rose-800 dark:text-rose-200 font-bold bg-rose-50/90 dark:bg-rose-950/50 px-2.5 sm:px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 shadow-2xs">
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 inline shrink-0 stroke-[2.5]" />
                  <span>Bugünkü 6 hakkın bitti. Yarınki yeni futbolcuyu bekle!</span>
                </div>
              )
            ) : (
              <p className="text-[11px] sm:text-xs">Her gün tüm dünyada aynı gizemli futbolcu aranıyor. Tek şansın var, kariyer adımlarını çöz ve skorunu paylaş!</p>
            )}
          </div>
        </div>

        {/* Sağ Taraf: Geri Sayım ve Aksiyon Butonu */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between sm:justify-start gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>Yenilenmeye:</span>
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 font-black">{timeRemaining}</span>
          </div>

          {isCompleted ? (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onOpenDailyResult();
              }}
              className="w-full sm:w-auto py-2 sm:py-2.5 px-3.5 sm:px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 active:translate-y-0"
            >
              <Share2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
              <span>Sonucunu Gör & Paylaş 📋</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onStartDaily();
              }}
              className="group/btn relative overflow-hidden w-full sm:w-auto py-2.5 sm:py-2.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              {/* Animasyonlu Işık Süpürme */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Günün Futbolcusunu Çöz</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover/btn:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

