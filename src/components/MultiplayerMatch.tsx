"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MultiplayerRoom } from "@/types/multiplayer";
import { Player } from "@/types/player";
import { PLAYERS } from "@/data/players";
import { CareerTimeline } from "@/components/CareerTimeline";
import { PlayerSearch } from "@/components/PlayerSearch";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { soundManager } from "@/utils/sound";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  Trophy,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Brain,
  Eye,
  Zap,
  Swords,
  AlertCircle,
} from "lucide-react";

interface MultiplayerMatchProps {
  initialRoom: MultiplayerRoom;
  myPlayerId: string;
  onLeaveMatch: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  senderName: string;
  isMe: boolean;
  xPercent: number;
}

export const MultiplayerMatch: React.FC<MultiplayerMatchProps> = ({
  initialRoom,
  myPlayerId,
  onLeaveMatch,
  soundEnabled,
  onToggleSound,
}) => {
  const [room, setRoom] = useState<MultiplayerRoom>(initialRoom);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [rematchRequested, setRematchRequested] = useState<boolean>(false);
  const [guessError, setGuessError] = useState<string | null>(null);
  const [opponentGuessFlash, setOpponentGuessFlash] = useState<string | null>(null);
  const lastSeenOpponentGuessIdRef = React.useRef<string | null>(null);

  // Canlı emoji reaksiyonları state ve ref'leri
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const lastSeenReactionIdRef = React.useRef<string | null>(null);
  const [reactionCooldown, setReactionCooldown] = useState<boolean>(false);

  const isHost = room.host.id === myPlayerId;
  const me = isHost ? room.host : room.guest;
  const opponent = isHost ? room.guest : room.host;

  // 🛡️ Hile korumalı: O anki gizemli futbolcunun kariyeri sunucudan anonim olarak gelir
  const currentCareer = useMemo(() => {
    return room.currentCareer || [];
  }, [room.currentCareer]);

  // Tur veya maç bittiğinde açılan resmi futbolcu bilgisi
  const revealedPlayer: Player | null = room.revealedPlayer || null;

  // Aktif oturumu sakla
  useEffect(() => {
    try {
      localStorage.setItem(
        "mp_active_session",
        JSON.stringify({ code: room.code, playerId: myPlayerId })
      );
    } catch {}
  }, [room.code, myPlayerId]);

  // Canlı polling döngüsü (700ms - Odayı sürekli senkronize eder)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/room?code=${room.code}&playerId=${myPlayerId}&_t=${Date.now()}`,
          {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
          if (data.room.status === "PLAYING") {
            setRematchRequested(false);
          }
        }
      } catch {}
    }, 700);

    return () => clearInterval(interval);
  }, [room.code, myPlayerId]);

  // Rakip tahmin yaptığında canlı uyarı göster ve ses çal (Mind Games)
  useEffect(() => {
    if (!room.recentGuesses || room.recentGuesses.length === 0) return;
    const latestOpponentGuess = room.recentGuesses.find(
      (g) => g.playerId !== myPlayerId
    );

    if (
      latestOpponentGuess &&
      latestOpponentGuess.id !== lastSeenOpponentGuessIdRef.current
    ) {
      lastSeenOpponentGuessIdRef.current = latestOpponentGuess.id;
      if (!latestOpponentGuess.isCorrect) {
        soundManager.playOpponentGuess();
        setOpponentGuessFlash(
          `${latestOpponentGuess.playerName}: "${latestOpponentGuess.guessedPlayerName}" dedi ❌`
        );
        const timer = setTimeout(() => {
          setOpponentGuessFlash(null);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [room.recentGuesses, myPlayerId]);

  // Canlı emoji reaksiyonu geldiğinde ekranda uçur ve ses çal
  useEffect(() => {
    if (!room.latestReaction) return;
    if (room.latestReaction.id === lastSeenReactionIdRef.current) return;
    lastSeenReactionIdRef.current = room.latestReaction.id;

    const isMe = room.latestReaction.senderId === myPlayerId;
    const newReaction: FloatingReaction = {
      id: room.latestReaction.id + "_" + Math.random().toString(36).substring(2, 6),
      emoji: room.latestReaction.emoji,
      senderName: room.latestReaction.senderName,
      isMe,
      xPercent: isMe ? 20 + Math.random() * 25 : 55 + Math.random() * 25,
    };

    soundManager.playReaction();
    setFloatingReactions((prev) => [...prev.slice(-8), newReaction]);

    const timer = setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2400);

    return () => clearTimeout(timer);
  }, [room.latestReaction, myPlayerId]);

  // Canlı geri sayım sayacı
  useEffect(() => {
    if (room.status !== "PLAYING") return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - room.roundStartTime) / 1000);
      const remaining = Math.max(0, room.roundDurationSeconds - elapsed);
      setTimeLeft(remaining);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 500);
    return () => clearInterval(timerInterval);
  }, [room.status, room.roundStartTime, room.roundDurationSeconds]);

  // Yeni tur başladığında yerel tahmin listesini temizle
  useEffect(() => {
    setGuesses([]);
  }, [room.currentRoundIndex]);

  // Gol olduğunda veya maç bittiğinde konfeti patlat
  useEffect(() => {
    if (room.status === "ROUND_OVER" && room.roundWinnerId === myPlayerId) {
      soundManager.playCorrect();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#f59e0b", "#fbbf24", "#ffffff"],
      });
    } else if (room.status === "GAME_OVER") {
      soundManager.playGameOver();
      const myScore = me?.score || 0;
      const opScore = opponent?.score || 0;
      if (myScore >= opScore) {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ["#10b981", "#6366f1", "#f59e0b", "#ffffff"],
        });
      }
    }
  }, [room.status, room.roundWinnerId, myPlayerId, me?.score, opponent?.score]);

  // 1. TAHMİN YAP
  const handleGuess = useCallback(
    async (player: Player) => {
      if (room.status !== "PLAYING") return;
      setGuessError(null);

      setGuesses((prev) => [...prev, player.id]);

      try {
        const res = await fetch("/api/room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "guess",
            code: room.code,
            playerId: myPlayerId,
            guessedPlayerId: player.id,
          }),
        });

        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
          if (!data.isCorrect) {
            soundManager.playWrong();
          }
        } else if (data.error) {
          setGuessError(data.error);
          setTimeout(() => setGuessError(null), 3500);
        }
      } catch {
        setGuessError("Bağlantı hatası oluştu, lütfen tekrar deneyin.");
        setTimeout(() => setGuessError(null), 3500);
      }
    },
    [room.code, room.status, myPlayerId]
  );

  // 2. PAS GEÇ (+1 KULÜP AÇ)
  const handleSkip = useCallback(async () => {
    if (room.status !== "PLAYING") return;
    soundManager.playReveal();

    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "skip",
          code: room.code,
          playerId: myPlayerId,
        }),
      });

      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      }
    } catch {}
  }, [room.code, room.status, myPlayerId]);

  // 3. PES ET (TURU RAKİBİNE DEVRET)
  const handleGiveUp = useCallback(async () => {
    if (room.status !== "PLAYING") return;
    const confirm = window.confirm("Bu turdan pes etmek istiyor musun? Gol rakibine yazılacak.");
    if (!confirm) return;

    soundManager.playGameOver();

    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "forfeit",
          code: room.code,
          playerId: myPlayerId,
        }),
      });

      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      } else if (data.error) {
        setGuessError(data.error);
        setTimeout(() => setGuessError(null), 3000);
      }
    } catch {
      setGuessError("Pes etme işlemi gerçekleştirilemedi.");
      setTimeout(() => setGuessError(null), 3000);
    }
  }, [room.code, room.status, myPlayerId]);

  const handleExitMatch = () => {
    try {
      localStorage.removeItem("mp_active_session");
    } catch {}
    onLeaveMatch();
  };

  // 4. RÖVANŞ İSTE
  const handleRematch = async () => {
    setRematchRequested(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rematch",
          code: room.code,
          playerId: myPlayerId,
        }),
      });

      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
        if (data.room.status === "PLAYING") {
          setRematchRequested(false);
        }
      }
    } catch {}
  };

  // 4. CANLI EMOJİ REAKSİYONU GÖNDER
  const handleSendReaction = useCallback(
    async (emoji: string) => {
      if (reactionCooldown) return;
      setReactionCooldown(true);
      setTimeout(() => setReactionCooldown(false), 350);

      // Kendi ekranında anında parçacık uçur
      const localReaction: FloatingReaction = {
        id: "local_" + Math.random().toString(36).substring(2, 8),
        emoji,
        senderName: me?.name || "Sen",
        isMe: true,
        xPercent: 20 + Math.random() * 25,
      };
      soundManager.playReaction();
      setFloatingReactions((prev) => [...prev.slice(-8), localReaction]);
      setTimeout(() => {
        setFloatingReactions((prev) => prev.filter((r) => r.id !== localReaction.id));
      }, 2400);

      try {
        const res = await fetch("/api/room", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reaction",
            code: room.code,
            playerId: myPlayerId,
            emoji,
          }),
        });
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
        }
      } catch {}
    },
    [reactionCooldown, room.code, myPlayerId, me?.name]
  );

  const isRoundWinner = room.roundWinnerId === myPlayerId;
  const isOpponentWinner = room.roundWinnerId && room.roundWinnerId !== myPlayerId;

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-4 space-y-4 font-sans">
      {/* ======================================================== */}
      {/* 🏟️ 1. CANLI TV DERBİ SKORBORDU                            */}
      {/* ======================================================== */}
      <header className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-xl shadow-slate-950/10">
        <div className="flex items-center justify-between gap-2">
          {/* Menüden Ayrıl Butonu */}
          <button
            type="button"
            onClick={handleExitMatch}
            className="flex items-center gap-1 text-xs text-slate-700 hover:text-black py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer font-bold shrink-0"
            title="Maçtan Çık"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
            <span className="hidden sm:inline">Ayrıl</span>
          </button>

          {/* Ortada Canlı Skorbord */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* SEN (Sol Taraf) */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="text-right min-w-0">
                <span className="text-[10px] font-mono text-emerald-600 font-bold block leading-none">
                  (Sen)
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
                  {me?.name || "Sen"}
                </span>
                {me?.lastGuess && (
                  <span
                    className={`text-[10px] font-mono font-bold block truncate max-w-[90px] sm:max-w-[130px] ${
                      me.isCorrect ? "text-emerald-600 font-extrabold" : "text-rose-500"
                    }`}
                    title={me.lastGuess}
                  >
                    {me.isCorrect ? "⚽ " : "❌ "}&ldquo;{me.lastGuess}&rdquo;
                  </span>
                )}
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-md shrink-0">
                {me?.score || 0}
              </div>
            </div>

            {/* ORTA: VS • SÜRE • TUR */}
            <div className="flex flex-col items-center shrink-0">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 font-mono text-[10px] font-black text-slate-700">
                <span>TUR {room.currentRoundIndex + 1}/{room.roundsCount}</span>
                <span>•</span>
                <span className={timeLeft <= 10 ? "text-rose-600 animate-pulse font-extrabold" : "text-emerald-700 font-extrabold"}>
                  ⏱️ {timeLeft}s
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                Oda: {room.code}
              </span>
            </div>

            {/* RAKİP (Sağ Taraf) */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-mono font-black text-lg sm:text-xl flex items-center justify-center shadow-md shrink-0">
                {opponent?.score || 0}
              </div>
              <div className="text-left min-w-0">
                <span className="text-[10px] font-mono text-indigo-600 font-bold block leading-none">
                  (Rakip)
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
                  {opponent?.name || "Rakip Bekleniyor"}
                </span>
                {opponent?.lastGuess && (
                  <span
                    className={`text-[10px] font-mono font-bold block truncate max-w-[90px] sm:max-w-[130px] ${
                      opponent.isCorrect ? "text-emerald-600 font-extrabold" : "text-rose-500 font-extrabold"
                    }`}
                    title={opponent.lastGuess}
                  >
                    {opponent.isCorrect ? "⚽ " : "❌ "}&ldquo;{opponent.lastGuess}&rdquo;
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ses Butonu */}
          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 text-slate-700 hover:text-black rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer shadow-2xs shrink-0"
            title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* Canlı TV Kayan Altyazı Bandı */}
        {room.actionNotice && (
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-inner overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="truncate text-slate-200">
              {room.actionNotice}
            </span>
          </div>
        )}

        {/* Canlı Rakip Yanlış Tahmin Alarmı (Mind Games Flash) */}
        {opponentGuessFlash && (
          <div className="mt-2.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white text-xs font-mono font-bold flex items-center justify-between gap-2 shadow-lg shadow-rose-900/25 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 truncate min-w-0">
              <span className="text-base animate-bounce">👀</span>
              <span className="truncate">
                AKIL OYUNLARI: <span className="underline decoration-white/60">{opponentGuessFlash}</span>
              </span>
            </div>
            <span className="text-[10px] font-sans font-black bg-white text-rose-800 px-2 py-0.5 rounded-full uppercase shrink-0 shadow-xs">
              Fırsat Sende! 🔥
            </span>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 🏟️ 2. ANA OYUN KONSOLU                                     */}
      {/* ======================================================== */}
      <section className="relative bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-950/10 space-y-4">
        {/* Üst Bilgi: Gizemli Futbolcu ve Durum */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <PlayerAvatar
              player={revealedPlayer}
              size="md"
              isMystery={room.status === "PLAYING" || !revealedPlayer}
              className="shadow-md"
            />
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                1v1 CANLI MAÇ
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-950 truncate mt-0.5">
                {room.status === "PLAYING" || !revealedPlayer
                  ? "Gizemli Futbolcu (Kim Bu Adam?)"
                  : revealedPlayer.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                İlk doğru tahmin eden golü atar!
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-400 block">
              Kariyer Rotası
            </span>
            <span className="text-xs sm:text-sm font-black font-mono text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-300">
              Tamamı Açık ({currentCareer.length} Kulüp)
            </span>
          </div>
        </div>

        {/* TRANSFER ROTASI (1v1'DE TÜM KULÜPLER BAŞTAN AÇIK) */}
        <CareerTimeline
          career={currentCareer}
          revealedCount={currentCareer.length}
          isGameOver={room.status !== "PLAYING"}
          showLeague={true}
          embedded={true}
        />

        {/* ======================================================== */}
        {/* DURUM 0: MAÇ BAŞLIYOR (ISINMA / GERİ SAYIM)              */}
        {/* ======================================================== */}
        {room.status === "STARTING" && (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 text-white text-center space-y-3 animate-in zoom-in-95 duration-200 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <Swords className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                RAKİP BAĞLANDI
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                1v1 Canlı Derbi Başlıyor!
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-1">
                {room.actionNotice || "Hazır ol! 1. tur birazdan başlıyor..."}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-black animate-pulse">
              <span>⚡ KULÜPLER AÇILIYOR...</span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DURUM A: TUR SONU (GOL ATILDI VEYA SÜRE DOLDU)           */}
        {/* ======================================================== */}
        {room.status === "ROUND_OVER" && (
          <div className={`p-4 rounded-2xl border text-center space-y-2 animate-in zoom-in-95 duration-200 ${
            isRoundWinner
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : isOpponentWinner
              ? "bg-rose-50 border-rose-300 text-rose-950"
              : "bg-slate-100 border-slate-300 text-slate-800"
          }`}>
            <div className="text-xl sm:text-2xl font-black flex items-center justify-center gap-2">
              {isRoundWinner ? (
                <>
                  <span>⚽</span>
                  <span className="text-emerald-700">HARİKA GOL! GOLÜ SEN ATTIN!</span>
                </>
              ) : isOpponentWinner ? (
                <>
                  <span>⚽</span>
                  <span className="text-rose-700">{opponent?.name || "Rakip"} GOLÜ ATTI!</span>
                </>
              ) : (
                <span>⏱️ SÜRE DOLDU! Bu turda gol çıkmadı.</span>
              )}
            </div>

            {revealedPlayer && (
              <div className="flex items-center justify-center gap-3 pt-1">
                <PlayerAvatar player={revealedPlayer} size="sm" isMystery={false} />
                <div className="text-left">
                  <span className="text-sm font-extrabold block text-slate-900">
                    {revealedPlayer.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {revealedPlayer.position} • {revealedPlayer.nationality} {revealedPlayer.flag} ({revealedPlayer.currentStatus})
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs font-mono font-bold text-slate-400 pt-1">
              Sıradaki tura geçiliyor...
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* DURUM B: MAÇ BİTTİ (KUPA TÖRENİ)                         */}
        {/* ======================================================== */}
        {room.status === "GAME_OVER" && (
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 text-white text-center space-y-3 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/40 shadow-lg">
              <Trophy className="w-7 h-7 fill-amber-400" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block mb-1">
                MAÇ SONA ERDİ
              </span>
              <h3 className="text-2xl font-black tracking-tight text-white">
                {room.actionNotice || "Maç Tamamlandı!"}
              </h3>
              <p className="text-sm font-mono text-slate-300 mt-1">
                Final Skoru: {room.host.name} ({room.host.score}) — ({room.guest?.score || 0}) {room.guest?.name || "Misafir"}
              </p>
            </div>

            {/* Rövanş & Ayrıl Butonları */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRematch}
                disabled={rematchRequested}
                className="py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {rematchRequested
                    ? `Rövanş İsteği Gönderildi (${room.rematchVotes.length}/2)`
                    : "Rövanş İste ⚔️"}
                </span>
              </button>

              <button
                type="button"
                onClick={handleExitMatch}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-all cursor-pointer"
              >
                Menüye Dön
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DURUM C: CANLI OYNANIŞ (ARAMA VE TAHMİN)                 */}
        {/* ======================================================== */}
        {room.status === "PLAYING" && (
          <div className="space-y-3 pt-1">
            {/* 🧠 CANLI TAHMİN AKIŞI & AKIL OYUNLARI */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span>CANLI TAHMİN AKIŞI</span>
                  <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md border border-purple-200">
                    Akıl Oyunları
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  Bu Tur: {room.recentGuesses?.length || 0} deneme
                </span>
              </div>

              {(!room.recentGuesses || room.recentGuesses.length === 0) ? (
                <div className="text-center py-2 text-xs text-slate-600 font-medium italic">
                  ⏳ Bu turda henüz kimse tahminde bulunmadı. Rakibinin yanlışlarını burada canlı göreceksin!
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {room.recentGuesses.map((g) => {
                    const isMe = g.playerId === myPlayerId;
                    return (
                      <div
                        key={g.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all animate-in zoom-in-95 duration-150 ${
                          isMe
                            ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                            : "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs ring-1 ring-indigo-300/40"
                        }`}
                      >
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-black uppercase ${
                            isMe
                              ? "bg-emerald-200/90 text-emerald-800"
                              : "bg-indigo-200/90 text-indigo-800"
                          }`}
                        >
                          {isMe ? "Sen" : g.playerName}
                        </span>
                        <span className="truncate max-w-[130px] sm:max-w-[190px] font-black">
                          &ldquo;{g.guessedPlayerName}&rdquo;
                        </span>
                        <span className="text-xs">
                          {g.isCorrect ? "⚽ Gol!" : "❌"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hata Bildirimi */}
            {guessError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono font-bold text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{guessError}</span>
              </div>
            )}

            <PlayerSearch
              allPlayers={PLAYERS}
              guessedPlayerIds={guesses}
              disabled={room.status !== "PLAYING"}
              onGuess={handleGuess}
              onSkip={handleSkip}
              onGiveUp={handleGiveUp}
              canSkip={false}
              isLastChance={false}
            />

            {/* Bilgi İpucu */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
              <span>⚡ Tüm kulüpler baştan açık!</span>
              <span className="font-bold text-emerald-700">En Hızlı Tahmin Eden Golü Atar</span>
            </div>
          </div>
        )}
        {/* ======================================================== */}
        {/* 💬 CANLI REAKSİYON & EMOJİ FIRLATMA (LIVE REACTIONS)     */}
        {/* ======================================================== */}
        <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Canlı Emoji Fırlat (Goygoy & Reaksiyon):</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-xl max-w-full overflow-x-auto no-scrollbar">
            {[
              { emoji: "😂", label: "Kahkaha" },
              { emoji: "🤫", label: "Sus" },
              { emoji: "🔥", label: "Alev" },
              { emoji: "👀", label: "Gözler" },
              { emoji: "🤦‍♂️", label: "Eyvah" },
              { emoji: "🥶", label: "Buz" },
              { emoji: "⚽", label: "Gol" },
              { emoji: "👏", label: "Alkış" },
            ].map(({ emoji, label }) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSendReaction(emoji)}
                disabled={reactionCooldown}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-white/20 active:scale-135 transition-all flex items-center justify-center text-lg sm:text-xl cursor-pointer hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 select-none shadow-2xs"
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 🎈 UÇAN CANLI EMOJİ PARÇACIKLARI (FLOATING OVERLAY)       */}
      {/* ======================================================== */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingReactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.xPercent}%` }}
            className="absolute bottom-20 flex flex-col items-center animate-emoji-float pointer-events-none"
          >
            <span
              className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap ${
                r.isMe
                  ? "bg-emerald-600 text-white border border-emerald-400"
                  : "bg-indigo-600 text-white border border-indigo-400"
              }`}
            >
              {r.isMe ? "Sen" : r.senderName}
            </span>
            <span className="text-4xl sm:text-5xl drop-shadow-lg select-none filter">
              {r.emoji}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

