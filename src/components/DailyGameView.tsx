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
} from "lucide-react";

interface DailyGameViewProps {
  onBackToMenu: () => void;
  onPlayRegularGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const DAILY_MAX_ATTEMPTS = 6;

export const DailyGameView: React.FC<DailyGameViewProps> = ({
  onBackToMenu,
  onPlayRegularGame,
  soundEnabled,
  onToggleSound,
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
      <header className="relative z-10 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl sticky top-0 shadow-xs text-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 text-xs text-slate-900 hover:text-black py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer font-bold shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
              <span>Menü</span>
            </button>
            <GameLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Günlük Seri */}
            {stats && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono text-[11px] shadow-2xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
                  Günlük Seri:
                </span>
                <div className="flex items-center gap-1 text-amber-600 font-black">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{stats.currentStreak} Gün</span>
                </div>
              </div>
            )}

            {/* Ses Aç / Kapa */}
            <button
              type="button"
              onClick={onToggleSound}
              className="p-2 text-slate-800 hover:text-black rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer shadow-2xs"
              title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-700" />
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
        <section className="relative z-30 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-950/10 space-y-4">
          {/* 1. Üst Skor Tablosu & Hak Göstergesi */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-3.5 min-w-0">
              <PlayerAvatar
                player={targetPlayer}
                size="lg"
                isMystery={gameState === "PLAYING"}
                className="shadow-md shrink-0"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-2xs">
                    <Calendar className="w-3 h-3 text-emerald-400" />
                    <span>GÜN #{dailyInfo.dayNumber}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    {dailyInfo.formattedDate}
                  </span>
                </div>

                <h2 className="text-base sm:text-xl font-black text-slate-950 tracking-tight truncate mt-0.5">
                  {gameState === "PLAYING"
                    ? "Günün Gizemli Futbolcusu"
                    : targetPlayer.name}
                </h2>

                <p className="text-xs text-slate-600 font-medium truncate">
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

            {/* Hak Kutucukları */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-slate-100/90 px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono font-bold text-slate-600 mr-1 hidden sm:inline">
                  Hak:
                </span>
                {Array.from({ length: DAILY_MAX_ATTEMPTS }).map((_, i) => {
                  const isUsed = i < guesses.length;
                  const isSuccess = isUsed && guesses[i].isCorrect;
                  const isFail = isUsed && !guesses[i].isCorrect;

                  return (
                    <div
                      key={i}
                      className={`h-2.5 rounded-full transition-all duration-200 ${
                        isSuccess
                          ? "w-4 bg-emerald-500 shadow-xs shadow-emerald-500/50"
                          : isFail
                          ? "w-2.5 bg-rose-500"
                          : i === guesses.length
                          ? "w-4 bg-amber-500 shadow-xs shadow-amber-500/50 animate-pulse"
                          : "w-2.5 bg-slate-300"
                      }`}
                    />
                  );
                })}
              </div>

              {gameState !== "PLAYING" && savedResult && (
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(true)}
                  className="py-1 px-2.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-xs font-mono font-black flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3 h-3 text-emerald-700" />
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
          />

          {/* 3. İpucu Kartı (Tahmin sayısına göre ipuçları açılır) */}
          <HintCard
            player={targetPlayer}
            attemptCount={guesses.length}
            isGameOver={gameState !== "PLAYING"}
            difficulty="ORTA"
          />

          {/* 4. Arama Çubuğu veya Oyun Bitti Bildirimi */}
          {gameState === "PLAYING" ? (
            <PlayerSearch
              allPlayers={PLAYERS}
              guessedPlayerIds={guessedPlayerIds}
              disabled={gameState !== "PLAYING"}
              onGuess={handleGuess}
              onSkip={handleSkip}
              onGiveUp={() => {}}
              canSkip={revealedClubCount < targetPlayer.career.length}
              isLastChance={isLastChance}
            />
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-white">
                    {gameState === "WON"
                      ? "Günün Futbolcusu Başarıyla Çözüldü!"
                      : "Günün Futbolcusu Sona Erdi!"}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Yarın saat 00:00&apos;da yeni futbolcu gelecek.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsResultModalOpen(true)}
                  className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Skorunu Paylaş</span>
                </button>
                <button
                  type="button"
                  onClick={onPlayRegularGame}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sınırsız Mod</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. Tahmin Geçmişi */}
          <GuessHistory
            guesses={guesses}
            maxAttempts={DAILY_MAX_ATTEMPTS}
            targetPlayer={targetPlayer}
            difficulty="ORTA"
          />
        </section>
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
