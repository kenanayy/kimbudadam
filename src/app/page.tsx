"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { PLAYERS, SUPER_LIG_PLAYERS, WORLD_PLAYERS } from "@/data/players";
import { DIFFICULTY_CONFIGS } from "@/data/difficulty";
import { Player, GuessResult, Difficulty, Category, GameStats } from "@/types/player";
import { CareerTimeline } from "@/components/CareerTimeline";
import { PlayerSearch } from "@/components/PlayerSearch";
import { HintCard } from "@/components/HintCard";
import { GuessHistory } from "@/components/GuessHistory";
import { ResultModal } from "@/components/ResultModal";
import { MainMenu } from "@/components/MainMenu";
import { FootballPitchBackground } from "@/components/FootballPitchBackground";
import { GameLogo } from "@/components/GameLogo";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { JokerConsole } from "@/components/JokerConsole";
import { DailyGameView } from "@/components/DailyGameView";
import { DailyResultModal } from "@/components/DailyResultModal";
import { DailyGameResult, DailyStats } from "@/types/daily";
import {
  getDailyChallengeInfo,
  getDailyStorage,
  getDailyStats,
} from "@/utils/dailyChallenge";
import { getPlayerJerseyNumber } from "@/data/playerJerseys";
import { soundManager } from "@/utils/sound";
import {
  Volume2,
  VolumeX,
  Flame,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Skull,
  Sun,
  Moon,
} from "lucide-react";

export default function FootballerGuessPage() {
  const [view, setView] = useState<"MENU" | "GAME" | "DAILY">("MENU");
  const [difficulty, setDifficulty] = useState<Difficulty>("ORTA");
  const [category, setCategory] = useState<Category>("ALL");
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null);
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [revealedClubCount, setRevealedClubCount] = useState<number>(1);
  const [gameState, setGameState] = useState<"PLAYING" | "WON" | "LOST">(
    "PLAYING"
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // 🌟 Tema Yükleme ve Değiştirme
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("football_guess_theme") as "light" | "dark" | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          setTheme("dark");
          document.documentElement.classList.add("dark");
        }
      }
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    soundManager.playClick();
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("football_guess_theme", next);
      } catch {}
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  // 🌟 Günün Futbolcusu Modal Durumları
  const [isDailyResultModalOpen, setIsDailyResultModalOpen] = useState<boolean>(false);
  const [dailyModalData, setDailyModalData] = useState<{
    result: DailyGameResult;
    stats: DailyStats;
    player: Player;
  } | null>(null);

  // ⚡ Joker (Can Simidi) Durumları
  const [extraClubUsed, setExtraClubUsed] = useState<boolean>(false);
  const [jerseyUsed, setJerseyUsed] = useState<boolean>(false);
  const [trophyUsed, setTrophyUsed] = useState<boolean>(false);
  const [revealedJersey, setRevealedJersey] = useState<number | null>(null);
  const [revealedTrophy, setRevealedTrophy] = useState<string | null>(null);

  // İstatistikler
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    streak: 0,
    bestStreak: 0,
    totalScore: 0,
  });

  const activeConfig = DIFFICULTY_CONFIGS[difficulty];

  // Local storage'dan verileri yükle
  useEffect(() => {
    try {
      const savedDiff = localStorage.getItem("football_guess_diff") as Difficulty;
      if (savedDiff && DIFFICULTY_CONFIGS[savedDiff]) {
        setDifficulty(savedDiff);
      }
      const savedCat = localStorage.getItem("football_guess_cat") as Category;
      if (savedCat) {
        setCategory(savedCat);
      }
      const savedSound = localStorage.getItem("football_guess_sound");
      if (savedSound !== null) {
        const isEnabled = savedSound === "1";
        setSoundEnabled(isEnabled);
        soundManager.enabled = isEnabled;
      }
      const savedStreak = parseInt(localStorage.getItem("football_guess_streak") || "0", 10);
      const savedBest = parseInt(localStorage.getItem("football_guess_best_streak") || "0", 10);
      const savedScore = parseInt(localStorage.getItem("football_guess_total_score") || "0", 10);
      const savedPlayed = parseInt(localStorage.getItem("football_guess_played") || "0", 10);
      const savedWon = parseInt(localStorage.getItem("football_guess_won") || "0", 10);

      setStats({
        gamesPlayed: savedPlayed,
        gamesWon: savedWon,
        streak: savedStreak,
        bestStreak: savedBest,
        totalScore: savedScore,
      });
    } catch {}
  }, []);

  // ⚡ Önceden filtrelenmiş havuz (O(1) Anında Erişim)
  const getFilteredPool = useCallback((cat: Category) => {
    if (cat === "SUPER_LIG") return SUPER_LIG_PLAYERS;
    if (cat === "WORLD") return WORLD_PLAYERS;
    return PLAYERS;
  }, []);

  // Yeni futbolcu seçimi
  const pickNewPlayer = useCallback(
    (
      currentPlayed: string[],
      diff: Difficulty = difficulty,
      cat: Category = category
    ) => {
      const config = DIFFICULTY_CONFIGS[diff];
      const categoryPool = getFilteredPool(cat);
      let pool = categoryPool.filter((p) => !currentPlayed.includes(p.id));

      if (pool.length === 0) {
        pool = categoryPool;
        currentPlayed = [];
      }
      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosen = pool[randomIndex];

      setTargetPlayer(chosen);
      setPlayedIds([...currentPlayed, chosen.id]);
      setGuesses([]);
      setRevealedClubCount(config.initialRevealedClubs);
      setGameState("PLAYING");
      setIsModalOpen(false);

      // Jokerleri Sıfırla
      setExtraClubUsed(false);
      setJerseyUsed(false);
      setTrophyUsed(false);
      setRevealedJersey(null);
      setRevealedTrophy(null);
    },
    [difficulty, category, getFilteredPool]
  );

  // Ana Menüden Oyunu Başlatma
  const handleStartGame = (diff: Difficulty, cat: Category) => {
    soundManager.unlock();
    soundManager.startMusic();
    soundManager.playGameStart();
    setDifficulty(diff);
    setCategory(cat);
    try {
      localStorage.setItem("football_guess_diff", diff);
      localStorage.setItem("football_guess_cat", cat);
    } catch {}
    pickNewPlayer([], diff, cat);
    setView("GAME");
  };

  const toggleSound = () => {
    soundManager.unlock();
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundManager.enabled = nextVal;
    try {
      localStorage.setItem("football_guess_sound", nextVal ? "1" : "0");
    } catch {}
    if (nextVal) {
      soundManager.startMusic();
      soundManager.playReveal(); // Ses açıldığında anında test sesi çalar
    } else {
      soundManager.stopMusic();
    }
  };

  const handleDifficultyChange = (newDiff: Difficulty) => {
    if (newDiff === difficulty) return;
    setDifficulty(newDiff);
    try {
      localStorage.setItem("football_guess_diff", newDiff);
    } catch {}
    pickNewPlayer(playedIds, newDiff, category);
  };

  const handleGuess = (guessedPlayer: Player) => {
    if (!targetPlayer || gameState !== "PLAYING") return;

    const isCorrect = guessedPlayer.id === targetPlayer.id;
    const newAttemptNumber = guesses.length + 1;

    const newGuess: GuessResult = {
      player: guessedPlayer,
      isCorrect,
      attemptNumber: newAttemptNumber,
    };

    const nextGuesses = [...guesses, newGuess];
    setGuesses(nextGuesses);

    if (isCorrect) {
      soundManager.playCorrect();
      setGameState("WON");

      const earned =
        (activeConfig.maxAttempts - guesses.length) *
        100 *
        activeConfig.scoreMultiplier;
      const newScore = stats.totalScore + earned;
      const newStreak = stats.streak + 1;
      const newBest = Math.max(stats.bestStreak, newStreak);
      const newPlayed = stats.gamesPlayed + 1;
      const newWon = stats.gamesWon + 1;

      const newStats = {
        gamesPlayed: newPlayed,
        gamesWon: newWon,
        streak: newStreak,
        bestStreak: newBest,
        totalScore: newScore,
      };
      setStats(newStats);

      try {
        localStorage.setItem("football_guess_streak", newStreak.toString());
        localStorage.setItem("football_guess_best_streak", newBest.toString());
        localStorage.setItem("football_guess_total_score", newScore.toString());
        localStorage.setItem("football_guess_played", newPlayed.toString());
        localStorage.setItem("football_guess_won", newWon.toString());
      } catch {}

      setRevealedClubCount(targetPlayer.career.length);
      setTimeout(() => setIsModalOpen(true), 500);
    } else {
      soundManager.playWrong();
      setRevealedClubCount((prev) =>
        Math.min(prev + 1, targetPlayer.career.length)
      );

      if (newAttemptNumber >= activeConfig.maxAttempts) {
        soundManager.playGameOver();
        setGameState("LOST");
        const newPlayed = stats.gamesPlayed + 1;
        const newStats = {
          ...stats,
          gamesPlayed: newPlayed,
          streak: 0,
        };
        setStats(newStats);

        try {
          localStorage.setItem("football_guess_streak", "0");
          localStorage.setItem("football_guess_played", newPlayed.toString());
        } catch {}

        setRevealedClubCount(targetPlayer.career.length);
        setTimeout(() => setIsModalOpen(true), 600);
      }
    }
  };

  const handleSkip = () => {
    if (!targetPlayer || gameState !== "PLAYING") return;

    soundManager.playReveal();
    const newAttemptNumber = guesses.length + 1;

    setRevealedClubCount((prev) =>
      Math.min(prev + 1, targetPlayer.career.length)
    );

    const dummyPlayer: Player = {
      id: `pas-${newAttemptNumber}`,
      name: "Pas Geçildi",
      nationality: "İpucu",
      flag: "▫️",
      position: "Orta Saha",
      birthYear: 2000,
      currentStatus: "İpucu",
      career: [],
    };

    const nextGuesses = [
      ...guesses,
      {
        player: dummyPlayer,
        isCorrect: false,
        attemptNumber: newAttemptNumber,
      },
    ];
    setGuesses(nextGuesses);
    // Not: Pas butonuna basıldığında oyun doğrudan bitmez; kullanıcı açılan son ipucuyla
    // son tahmin hakkını kullanabilir. Oyun sadece o tahmin de yanlış olursa sonlanır.
  };

  // Pes Et / Cevabı Göster
  const handleGiveUp = () => {
    if (!targetPlayer || gameState !== "PLAYING") return;

    soundManager.playGameOver();
    setGameState("LOST");
    const newPlayed = stats.gamesPlayed + 1;
    const newStats = {
      ...stats,
      gamesPlayed: newPlayed,
      streak: 0,
    };
    setStats(newStats);

    try {
      localStorage.setItem("football_guess_streak", "0");
      localStorage.setItem("football_guess_played", newPlayed.toString());
    } catch {}

    setRevealedClubCount(targetPlayer.career.length);
    setIsModalOpen(true);
  };

  // ⚡ Joker 1: Ekstra Kulüp Aç (Hak Harcamadan)
  const handleUseExtraClub = () => {
    if (!targetPlayer || gameState !== "PLAYING" || extraClubUsed) return;
    if (revealedClubCount >= targetPlayer.career.length) return;
    soundManager.playJoker();
    setRevealedClubCount((prev) => Math.min(prev + 1, targetPlayer.career.length));
    setExtraClubUsed(true);
  };

  // ⚡ Joker 2: Forma Numarası Öğren
  const handleUseJerseyNumber = () => {
    if (!targetPlayer || gameState !== "PLAYING" || jerseyUsed) return;
    soundManager.playJoker();
    const jerseyNo = getPlayerJerseyNumber(targetPlayer);
    setRevealedJersey(jerseyNo);
    setJerseyUsed(true);
  };

  // ⚡ Joker 3: Kupa & Kariyer İpucu Aç
  const handleUseTrophyHint = () => {
    if (!targetPlayer || gameState !== "PLAYING" || trophyUsed) return;
    soundManager.playJoker();
    const trophyText =
      targetPlayer.hint ||
      `Kariyerinde ${targetPlayer.career.length} farklı kulüpte forma giydi ve ${targetPlayer.nationality} milli takımında oynadı.`;
    setRevealedTrophy(trophyText);
    setTrophyUsed(true);
  };

  const guessedPlayerIds = useMemo(
    () => guesses.map((g) => g.player.id),
    [guesses]
  );

  const remainingAttempts = Math.max(0, activeConfig.maxAttempts - guesses.length);
  const isLastChance = gameState === "PLAYING" && remainingAttempts === 0;

  // 1. ANA MENÜ GÖRÜNÜMÜ
  if (view === "MENU") {
    return (
      <>
        <MainMenu
          onStartGame={handleStartGame}
          onStartDaily={() => {
            soundManager.unlock();
            soundManager.startMusic();
            setView("DAILY");
          }}
          onOpenDailyResult={() => {
            const info = getDailyChallengeInfo();
            const result = getDailyStorage(info.dateStr);
            const dailyStats = getDailyStats();
            if (result) {
              setDailyModalData({ result, stats: dailyStats, player: info.player });
              setIsDailyResultModalOpen(true);
            } else {
              setView("DAILY");
            }
          }}
          stats={stats}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          theme={theme}
          onToggleTheme={toggleTheme}
          totalPlayersCount={PLAYERS.length}
        />
        {dailyModalData && (
          <DailyResultModal
            isOpen={isDailyResultModalOpen}
            result={dailyModalData.result}
            stats={dailyModalData.stats}
            player={dailyModalData.player}
            onClose={() => setIsDailyResultModalOpen(false)}
            onGoMenu={() => {
              setIsDailyResultModalOpen(false);
              setView("MENU");
            }}
            onPlayRegularGame={() => {
              setIsDailyResultModalOpen(false);
              handleStartGame(difficulty, category);
            }}
          />
        )}
      </>
    );
  }

  // 2. GÜNÜN FUTBOLCUSU (DAILY CHALLENGE) GÖRÜNÜMÜ
  if (view === "DAILY") {
    return (
      <DailyGameView
        onBackToMenu={() => setView("MENU")}
        onPlayRegularGame={() => handleStartGame(difficulty, category)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // 2. OYUN GÖRÜNÜMÜ
  if (!targetPlayer) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs">
        yükleniyor...
      </div>
    );
  }

  return (
    <main className="relative min-h-screen text-slate-800 dark:text-slate-100 font-sans overflow-x-hidden pb-12">
      {/* Gerçek Renkleriyle Futbol Sahası (Fixed Arka Plan) */}
      <FootballPitchBackground />

      {/* Canlı Stadyum TV Header */}
      <header className="relative z-10 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl sticky top-0 shadow-xs text-slate-800 dark:text-slate-100">
        <div className="max-w-3xl mx-auto px-4 h-15 flex items-center justify-between">
          {/* Menüye Dön Butonu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("MENU")}
              className="flex items-center gap-1.5 text-xs text-slate-900 dark:text-slate-100 hover:text-black dark:hover:text-white py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer font-bold shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
              <span>Menü</span>
            </button>
            <GameLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Puan & Seri */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-[11px] shadow-2xs">
              <span className="font-extrabold text-slate-950 dark:text-white">{stats.totalScore} p</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{stats.streak}</span>
              </div>
            </div>

            {/* Tema Değiştir (Karanlık / Aydınlık Mod) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
              title={theme === "dark" ? "Aydınlık Moda Geç" : "Karanlık Moda Geç"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleSound}
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

      {/* Main Container */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-5 space-y-4">
        {/* ======================================================== */}
        {/* 🏟️ ANA STADYUM KONSOLU (Buzlu Cam & Canlı TV Stili)      */}
        {/* ======================================================== */}
        <section className="relative z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-950/10 space-y-4">
          {/* 1. ÜST SCOREBOARD / FUTBOLCU & HAK GÖSTERGESİ */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Futbolcu Avatarı: Oyun sürerken gizemli soru işareti, bitince gerçek fotoğraf */}
              <PlayerAvatar
                player={targetPlayer}
                size="lg"
                isMystery={gameState === "PLAYING"}
                className="shadow-md shrink-0"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      difficulty === "EFSANE"
                        ? "text-purple-950 bg-purple-100 border-purple-300 shadow-2xs"
                        : difficulty === "ZOR"
                        ? "text-rose-950 bg-rose-100 border-rose-300 shadow-2xs"
                        : difficulty === "ORTA"
                        ? "text-amber-950 bg-amber-100 border-amber-300 shadow-2xs"
                        : "text-emerald-950 bg-emerald-100 border-emerald-300 shadow-2xs"
                    }`}
                  >
                    {difficulty}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold truncate">
                    {category === "SUPER_LIG"
                      ? "Süper Lig"
                      : category === "WORLD"
                      ? "Dünya & Avrupa"
                      : "Tüm Oyuncular"}
                  </span>
                </div>

                <h2 className="text-base sm:text-xl font-black text-slate-950 dark:text-white tracking-tight truncate mt-0.5">
                  {gameState === "PLAYING" ? "Gizemli Futbolcu" : targetPlayer.name}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                  {gameState === "PLAYING"
                    ? isLastChance
                      ? "🔥 Son tahmin hakkınız!"
                      : `${remainingAttempts} tahmin hakkı kaldı`
                    : gameState === "WON"
                    ? "✓ Tebrikler, Doğru Tahmin!"
                    : "✗ Bu tur tamamlandı"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              {/* Hak Göstergesi */}
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
                  Array.from({ length: activeConfig.maxAttempts }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2.5 rounded-full transition-all duration-200 ${
                        i < remainingAttempts
                          ? "w-3 bg-emerald-500 shadow-2xs"
                          : "w-1.5 bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={`${i + 1}. Hak`}
                    />
                  ))
                )}
              </div>

              <button
                onClick={() => pickNewPlayer(playedIds, difficulty, category)}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shadow-2xs"
                title="Farklı bir gizemli futbolcuya geç"
              >
                <RotateCcw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Yeni Futbolcu</span>
              </button>
            </div>
          </div>

          {/* 2. TRANSFER ROTASI (KONSOL İÇİNDE GÖMÜLÜ) */}
          <CareerTimeline
            career={targetPlayer.career}
            revealedCount={revealedClubCount}
            isGameOver={gameState !== "PLAYING"}
            showLeague={activeConfig.showLeague}
            embedded={true}
          />

          {/* ⚡ JOKER KONSOLU (CAN SİMİTLERİ) */}
          {gameState === "PLAYING" && (
            difficulty === "EFSANE" ? (
              <div className="w-full bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200/90 dark:border-purple-800/70 rounded-2xl p-2.5 text-center text-xs font-mono font-bold text-purple-950 dark:text-purple-200 flex items-center justify-center gap-2 shadow-2xs">
                <Skull className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Efsane Mod: Bu seviyede taktiksel jokerler ve ipuçları kapalıdır!</span>
              </div>
            ) : (
              <JokerConsole
                difficulty={difficulty}
                disabled={gameState !== "PLAYING"}
                canRevealClub={revealedClubCount < targetPlayer.career.length}
                onUseExtraClub={handleUseExtraClub}
                onUseJerseyNumber={handleUseJerseyNumber}
                onUseTrophyHint={handleUseTrophyHint}
                extraClubUsed={extraClubUsed}
                jerseyUsed={jerseyUsed}
                trophyUsed={trophyUsed}
                revealedJerseyNumber={revealedJersey}
                revealedTrophyHint={revealedTrophy}
              />
            )
          )}

          {/* 3. ARAMA VE TAHMİN KONSOLU VEYA TUR SONU BİLDİRİMİ */}
          {gameState !== "PLAYING" ? (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white p-4 rounded-2xl border border-slate-700 shadow-lg flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3.5 min-w-0">
                <PlayerAvatar player={targetPlayer} size="md" isMystery={false} className="shadow-lg shrink-0 ring-2 ring-emerald-400" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-mono font-black tracking-wider text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{gameState === "WON" ? "Doğru Tahmin!" : "Gizemli Futbolcu"}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black truncate text-white drop-shadow-sm">
                    {targetPlayer.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium truncate">
                    {targetPlayer.position} • {targetPlayer.nationality} {targetPlayer.flag} ({targetPlayer.currentStatus})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer hidden sm:flex items-center gap-1"
                  title="Detaylı sonuç kartını aç"
                >
                  <span>Detay</span>
                </button>
                <button
                  onClick={() => pickNewPlayer(playedIds, difficulty, category)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <span>Sıradaki</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          ) : (
            <PlayerSearch
              allPlayers={PLAYERS}
              guessedPlayerIds={guessedPlayerIds}
              disabled={gameState !== "PLAYING"}
              onGuess={handleGuess}
              onSkip={handleSkip}
              onGiveUp={handleGiveUp}
              isLastChance={isLastChance}
              canSkip={
                gameState === "PLAYING" &&
                guesses.length < activeConfig.maxAttempts
              }
            />
          )}
        </section>

        {/* 4. İPUÇLARI & TAHMİN GEÇMİŞİ (ALT PANEL) */}
        <div className="relative z-10 space-y-4">
          <HintCard
            player={targetPlayer}
            attemptCount={guesses.length}
            isGameOver={gameState !== "PLAYING"}
            difficulty={difficulty}
          />

          <GuessHistory
            guesses={guesses}
            maxAttempts={activeConfig.maxAttempts}
            targetPlayer={targetPlayer}
            difficulty={difficulty}
          />
        </div>

        {/* Result Dialog Modal */}
        <ResultModal
          isOpen={isModalOpen}
          isWon={gameState === "WON"}
          player={targetPlayer}
          attemptsUsed={guesses.length}
          maxAttempts={activeConfig.maxAttempts}
          streak={stats.streak}
          difficulty={difficulty}
          onNextRound={() => pickNewPlayer(playedIds, difficulty, category)}
          onClose={() => setIsModalOpen(false)}
          onGoMenu={() => {
            setIsModalOpen(false);
            setView("MENU");
          }}
        />
      </div>
    </main>
  );
}
