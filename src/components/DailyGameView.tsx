"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PLAYERS } from "@/data/players";
import { Player, GuessResult } from "@/types/player";
import { DailyGameResult, DailyStats, DailyChallengeInfo } from "@/types/daily";
import {
  getDailyChallengeInfo,
  getDailyStorage,
  saveDailyStorage,
  getDailyStats,
  recordDailyGame,
} from "@/utils/dailyChallenge";
import { CareerTimeline } from "@/components/CareerTimeline";
import { PlayerSearch } from "@/components/PlayerSearch";
import { HintCard } from "@/components/HintCard";
import { GuessHistory } from "@/components/GuessHistory";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { DailyResultModal } from "@/components/DailyResultModal";
import { FootballPitchBackground } from "@/components/FootballPitchBackground";
import { GameLogo } from "@/components/GameLogo";
import { soundManager } from "@/utils/sound";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Flame,
  Calendar,
  Sparkles,
  Trophy,
  Share2,
  Sun,
  Moon,
} from "lucide-react";

interface DailyGameViewProps {
  onBackToMenu: () => void;
  onPlayRegularGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

const DAILY_MAX_ATTEMPTS = 6;

export const DailyGameView: React.FC<DailyGameViewProps> = ({
  onBackToMenu,
  onPlayRegularGame,
  soundEnabled,
  onToggleSound,
  theme = "light",
  onToggleTheme,
}) => {
  const [dailyInfo, setDailyInfo] = useState<DailyChallengeInfo | null>(null);
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [revealedClubCount, setRevealedClubCount] = useState<number>(1);
  const [gameState, setGameState] = useState<"PLAYING" | "WON" | "LOST">("PLAYING");
  const [isResultModalOpen, setIsResultModalOpen] = useState<boolean>(false);
  const [savedResult, setSavedResult] = useState<DailyGameResult | null>(null);
  const [stats, setStats] = useState<DailyStats | null>(null);

  // Günün meydan okumasını ve kayıtlı durumu yükle
  useEffect(() => {
    const info = getDailyChallengeInfo();
    setDailyInfo(info);
    setTargetPlayer(info.player);

    const savedStats = getDailyStats();
    setStats(savedStats);

    const existingResult = getDailyStorage(info.dateStr);
    if (existingResult) {
      setSavedResult(existingResult);
      setGameState(existingResult.isWon ? "WON" : "LOST");
      setRevealedClubCount(info.player.career.length);

      // Geçmiş tahminleri rekonstrükte et
      const reconstructedGuesses: GuessResult[] = existingResult.guesses.map((g) => {
        const found = PLAYERS.find((p) => p.id === g.playerId);
        const playerObj: Player = found || {
          id: g.playerId,
          name: g.playerName,
          nationality: "Bilinmiyor",
          flag: "🏳️",
          position: "Orta Saha",
          birthYear: 2000,
          currentStatus: "Bilinmiyor",
          career: [],
        };
        return {
          player: playerObj,
          isCorrect: g.isCorrect,
          attemptNumber: g.attemptNumber,
        };
      });
      setGuesses(reconstructedGuesses);
      setIsResultModalOpen(true);
    } else {
      setRevealedClubCount(1);
      setGuesses([]);
      setGameState("PLAYING");
    }
  }, []);

  const remainingAttempts = DAILY_MAX_ATTEMPTS - guesses.length;
  const isLastChance = remainingAttempts === 1 && gameState === "PLAYING";

  // Tahmin yapıldığında
  const handleGuess = useCallback(
    (guessedPlayer: Player) => {
      if (!targetPlayer || gameState !== "PLAYING" || !dailyInfo) return;

      const isCorrect = guessedPlayer.id === targetPlayer.id;
      const attemptNumber = guesses.length + 1;

      const newGuess: GuessResult = {
        player: guessedPlayer,
        isCorrect,
        attemptNumber,
      };

      const nextGuesses = [...guesses, newGuess];
      setGuesses(nextGuesses);

      if (isCorrect) {
        soundManager.playCorrect();
        setGameState("WON");
        setRevealedClubCount(targetPlayer.career.length);

        const resultObj: DailyGameResult = {
          dateStr: dailyInfo.dateStr,
          dayNumber: dailyInfo.dayNumber,
          targetPlayerId: targetPlayer.id,
          isWon: true,
          attemptsUsed: attemptNumber,
          maxAttempts: DAILY_MAX_ATTEMPTS,
          guesses: nextGuesses.map((g) => ({
            playerId: g.player.id,
            playerName: g.player.name,
            isCorrect: g.isCorrect,
            attemptNumber: g.attemptNumber,
          })),
          revealedClubCount: targetPlayer.career.length,
          completedAt: Date.now(),
        };

        saveDailyStorage(resultObj);
        const updatedStats = recordDailyGame(true, attemptNumber, dailyInfo.dateStr);
        setSavedResult(resultObj);
        setStats(updatedStats);

        setTimeout(() => setIsResultModalOpen(true), 600);
      } else {
        soundManager.playWrong();
        const nextClubCount = Math.min(
          revealedClubCount + 1,
          targetPlayer.career.length
        );
        setRevealedClubCount(nextClubCount);

        if (attemptNumber >= DAILY_MAX_ATTEMPTS) {
          soundManager.playGameOver();
          setGameState("LOST");
          setRevealedClubCount(targetPlayer.career.length);

          const resultObj: DailyGameResult = {
            dateStr: dailyInfo.dateStr,
            dayNumber: dailyInfo.dayNumber,
            targetPlayerId: targetPlayer.id,
            isWon: false,
            attemptsUsed: attemptNumber,
            maxAttempts: DAILY_MAX_ATTEMPTS,
            guesses: nextGuesses.map((g) => ({
              playerId: g.player.id,
              playerName: g.player.name,
              isCorrect: g.isCorrect,
              attemptNumber: g.attemptNumber,
            })),
            revealedClubCount: targetPlayer.career.length,
            completedAt: Date.now(),
          };

          saveDailyStorage(resultObj);
          const updatedStats = recordDailyGame(false, DAILY_MAX_ATTEMPTS, dailyInfo.dateStr);
          setSavedResult(resultObj);
          setStats(updatedStats);

          setTimeout(() => setIsResultModalOpen(true), 700);
        }
      }
    },
    [targetPlayer, gameState, dailyInfo, guesses, revealedClubCount]
  );

  // Pas / İpucu Aç
  const handleSkip = useCallback(() => {
    if (!targetPlayer || gameState !== "PLAYING" || !dailyInfo) return;

    soundManager.playReveal();
    const attemptNumber = guesses.length + 1;
    const nextClubCount = Math.min(
      revealedClubCount + 1,
      targetPlayer.career.length
    );
    setRevealedClubCount(nextClubCount);

    const dummyPlayer: Player = {
      id: `pas-${attemptNumber}`,
      name: "Pas Geçildi (İpucu Açıldı)",
      nationality: "İpucu",
      flag: "▫️",
      position: "Orta Saha",
      birthYear: 2000,
      currentStatus: "İpucu",
      career: [],
    };

    const nextGuesses: GuessResult[] = [
      ...guesses,
      {
        player: dummyPlayer,
        isCorrect: false,
        attemptNumber,
      },
    ];

    setGuesses(nextGuesses);

    if (attemptNumber >= DAILY_MAX_ATTEMPTS) {
      soundManager.playGameOver();
      setGameState("LOST");
      setRevealedClubCount(targetPlayer.career.length);

      const resultObj: DailyGameResult = {
        dateStr: dailyInfo.dateStr,
        dayNumber: dailyInfo.dayNumber,
        targetPlayerId: targetPlayer.id,
        isWon: false,
        attemptsUsed: attemptNumber,
        maxAttempts: DAILY_MAX_ATTEMPTS,
        guesses: nextGuesses.map((g) => ({
          playerId: g.player.id,
          playerName: g.player.name,
          isCorrect: g.isCorrect,
          attemptNumber: g.attemptNumber,
        })),
        revealedClubCount: targetPlayer.career.length,
        completedAt: Date.now(),
      };

      saveDailyStorage(resultObj);
      const updatedStats = recordDailyGame(false, DAILY_MAX_ATTEMPTS, dailyInfo.dateStr);
      setSavedResult(resultObj);
      setStats(updatedStats);

      setTimeout(() => setIsResultModalOpen(true), 700);
    }
  }, [targetPlayer, gameState, dailyInfo, guesses, revealedClubCount]);

  // Pes Et / Turu Sonlandır & Cevabı Gör
  const handleGiveUp = useCallback(() => {
    if (!targetPlayer || gameState !== "PLAYING" || !dailyInfo) return;

    soundManager.playGameOver();
    setGameState("LOST");
    setRevealedClubCount(targetPlayer.career.length);

    const attemptNumber = guesses.length + 1;
    const dummyPlayer: Player = {
      id: `pes-${attemptNumber}`,
      name: "Pes Edildi",
      nationality: targetPlayer.nationality,
      flag: "🏳️",
      position: targetPlayer.position,
      birthYear: targetPlayer.birthYear,
      currentStatus: "Cevap Açıldı",
      career: [],
    };

    const nextGuesses: GuessResult[] = [
      ...guesses,
      {
        player: dummyPlayer,
        isCorrect: false,
        attemptNumber,
      },
    ];

    setGuesses(nextGuesses);

    const resultObj: DailyGameResult = {
      dateStr: dailyInfo.dateStr,
      dayNumber: dailyInfo.dayNumber,
      targetPlayerId: targetPlayer.id,
      isWon: false,
      attemptsUsed: Math.min(nextGuesses.length, DAILY_MAX_ATTEMPTS),
      maxAttempts: DAILY_MAX_ATTEMPTS,
      guesses: nextGuesses.map((g) => ({
        playerId: g.player.id,
        playerName: g.player.name,
        isCorrect: g.isCorrect,
        attemptNumber: g.attemptNumber,
      })),
      revealedClubCount: targetPlayer.career.length,
      completedAt: Date.now(),
    };

    saveDailyStorage(resultObj);
    const updatedStats = recordDailyGame(false, DAILY_MAX_ATTEMPTS, dailyInfo.dateStr);
    setSavedResult(resultObj);
    setStats(updatedStats);

    setTimeout(() => setIsResultModalOpen(true), 600);
  }, [targetPlayer, gameState, dailyInfo, guesses]);

  if (!dailyInfo || !targetPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-mono text-sm">
        Günün futbolcusu yükleniyor...
      </div>
    );
  }

  // Tahmin edilmiş oyuncu ID'leri
  const guessedPlayerIds = guesses.map((g) => g.player.id);

  return (
    <main className="relative min-h-screen text-slate-800 font-sans overflow-x-hidden pb-12">
      {/* Yeşil Saha Arka Planı */}
      <FootballPitchBackground />

      {/* Üst Header: Günlük Mücadele & Menü */}
      <header className="relative z-10 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sticky top-0 shadow-xs text-slate-800 dark:text-slate-100">
        <div className="max-w-3xl mx-auto px-4 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 text-xs text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-white py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer font-bold shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
              <span>Menü</span>
            </button>
            <GameLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Günlük Seri */}
            {stats && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px] shadow-2xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
                  Günlük Seri:
                </span>
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{stats.currentStreak} Gün</span>
                </div>
              </div>
            )}

            {/* Tema Değiştir */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                title={theme === "dark" ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>
            )}

            {/* Ses Aç / Kapa */}
            <button
              type="button"
              onClick={onToggleSound}
              className="p-2 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
              title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Ana Oyun Gövdesi */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* ======================================================== */}
        {/* 🏟️ GÜNÜN FUTBOLCUSU OYUN KONSOLU                         */}
        {/* ======================================================== */}
        <section className="relative z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-950/10 space-y-4">
          {/* 1. Üst Skor Tablosu & Hak Göstergesi */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="shrink-0 sm:hidden">
                <PlayerAvatar
                  player={targetPlayer}
                  size="md"
                  isMystery={gameState === "PLAYING"}
                  className="shadow-md"
                />
              </div>
              <div className="shrink-0 hidden sm:block">
                <PlayerAvatar
                  player={targetPlayer}
                  size="lg"
                  isMystery={gameState === "PLAYING"}
                  className="shadow-md"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60 shadow-2xs">
                    <Calendar className="w-3 h-3 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
                    <span>GÜN #{dailyInfo.dayNumber}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                    {dailyInfo.formattedDate}
                  </span>
                </div>

                <h2 className="text-base sm:text-xl font-black text-slate-950 dark:text-white tracking-tight truncate mt-0.5">
                  {gameState === "PLAYING"
                    ? "Günün Gizemli Futbolcusu"
                    : targetPlayer.name}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                  {gameState === "PLAYING"
                    ? isLastChance
                      ? "🔥 Dikkat! Son tahmin hakkın!"
                      : `${remainingAttempts} tahmin hakkın kaldı`
                    : gameState === "WON"
                    ? "✓ Tebrikler! Bugünün oyuncusunu bildin."
                    : "✗ Bugünkü hakların tükendi."}
                </p>
              </div>
            </div>

            {/* Hak Kutucukları & Skor Kartı Butonu */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 mr-1 hidden sm:inline">
                  Hak:
                </span>
                {isLastChance ? (
                  <div className="flex items-center gap-1 px-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shadow-2xs" />
                    <span className="text-[10px] font-mono font-black text-amber-700 dark:text-amber-400 tracking-wider">
                      SON HAK
                    </span>
                  </div>
                ) : (
                  Array.from({ length: DAILY_MAX_ATTEMPTS }).map((_, i) => {
                    const isUsed = i < guesses.length;
                    const isSuccess = isUsed && guesses[i].isCorrect;
                    const isFail = isUsed && !guesses[i].isCorrect;
                    const isCurrent = i === guesses.length && gameState === "PLAYING";

                    return (
                      <div
                        key={i}
                        className={`h-2.5 rounded-full transition-all duration-200 ${
                          isSuccess
                            ? "w-4 bg-emerald-500 shadow-xs shadow-emerald-500/50"
                            : isFail
                            ? "w-2.5 bg-rose-500"
                            : isCurrent
                            ? "w-4 bg-amber-500 shadow-xs shadow-amber-500/50 animate-pulse"
                            : "w-2 bg-slate-300 dark:bg-slate-700"
                        }`}
                        title={`${i + 1}. Hak`}
                      />
                    );
                  })
                )}
              </div>

              {gameState !== "PLAYING" && savedResult && (
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(true)}
                  className="py-1 px-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60 text-xs font-mono font-black flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Share2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                  <span>Skor Kartı</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. Kariyer Zaman Çizelgesi */}
          <CareerTimeline
            career={targetPlayer.career}
            revealedCount={revealedClubCount}
            isGameOver={gameState !== "PLAYING"}
            showLeague={true}
            embedded={true}
          />

          {/* 3. Arama Çubuğu veya Oyun Bitti Bildirimi (Kariyerin hemen altında - klasik mod ergonomisi) */}
          {gameState === "PLAYING" ? (
            <PlayerSearch
              allPlayers={PLAYERS}
              guessedPlayerIds={guessedPlayerIds}
              disabled={gameState !== "PLAYING"}
              onGuess={handleGuess}
              onSkip={handleSkip}
              onGiveUp={handleGiveUp}
              canSkip={revealedClubCount < targetPlayer.career.length}
              isLastChance={isLastChance}
            />
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3.5 shadow-xl">
              <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                <PlayerAvatar player={targetPlayer} size="md" isMystery={false} className="shadow-lg shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        gameState === "WON"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {gameState === "WON" ? "✓ Doğru Tahmin!" : "✗ Haklar Tükendi"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {targetPlayer.career.length} Kulüp
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                    {targetPlayer.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium truncate">
                    {targetPlayer.position} • {targetPlayer.nationality} {targetPlayer.flag} ({targetPlayer.currentStatus})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Skorunu Paylaş</span>
                </button>
                <button
                  type="button"
                  onClick={onPlayRegularGame}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Sınırsız Mod</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 4. İpuçları & Tahmin Geçmişi (Alt Panel - Klasik mod ile tam uyumlu) */}
        <div className="relative z-10 space-y-4">
          <HintCard
            player={targetPlayer}
            attemptCount={guesses.length}
            isGameOver={gameState !== "PLAYING"}
            difficulty="ORTA"
          />

          <GuessHistory
            guesses={guesses}
            maxAttempts={DAILY_MAX_ATTEMPTS}
            targetPlayer={targetPlayer}
            difficulty="ORTA"
          />
        </div>
      </div>

      {/* Günlük Sonuç Modalı */}
      {savedResult && stats && (
        <DailyResultModal
          isOpen={isResultModalOpen}
          result={savedResult}
          stats={stats}
          player={targetPlayer}
          onClose={() => setIsResultModalOpen(false)}
          onGoMenu={onBackToMenu}
          onPlayRegularGame={onPlayRegularGame}
        />
      )}
    </main>
  );
};
