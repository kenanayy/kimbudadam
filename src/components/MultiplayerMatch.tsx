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
} from "lucide-react";

interface MultiplayerMatchProps {
  initialRoom: MultiplayerRoom;
  myPlayerId: string;
  onLeaveMatch: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
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

  const isHost = room.host.id === myPlayerId;
  const me = isHost ? room.host : room.guest;
  const opponent = isHost ? room.guest : room.host;

  // O anki gizemli futbolcuyu bul
  const targetPlayerId = room.playerIds[room.currentRoundIndex];
  const targetPlayer: Player | undefined = useMemo(() => {
    return PLAYERS.find((p) => p.id === targetPlayerId) || PLAYERS[0];
  }, [targetPlayerId]);

  // Canlı polling döngüsü (700ms - Odayı sürekli senkronize eder)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/room?code=${room.code}&playerId=${myPlayerId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
        }
      } catch {}
    }, 700);

    return () => clearInterval(interval);
  }, [room.code, myPlayerId]);

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
        }
      } catch {}
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

  // 3. RÖVANŞ İSTE
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
            onClick={onLeaveMatch}
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
      </header>

      {/* ======================================================== */}
      {/* 🏟️ 2. ANA OYUN KONSOLU                                     */}
      {/* ======================================================== */}
      <section className="relative bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-950/10 space-y-4">
        {/* Üst Bilgi: Gizemli Futbolcu ve Durum */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <PlayerAvatar
              player={targetPlayer}
              size="md"
              isMystery={room.status === "PLAYING"}
              className="shadow-md"
            />
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                1v1 CANLI MAÇ
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-950 truncate mt-0.5">
                {room.status === "PLAYING"
                  ? "Gizemli Futbolcu (Kim Bu Adam?)"
                  : targetPlayer.name}
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
              Tamamı Açık ({targetPlayer.career.length} Kulüp)
            </span>
          </div>
        </div>

        {/* TRANSFER ROTASI (1v1'DE TÜM KULÜPLER BAŞTAN AÇIK) */}
        <CareerTimeline
          career={targetPlayer.career}
          revealedCount={targetPlayer.career.length}
          isGameOver={room.status !== "PLAYING"}
          showLeague={true}
          embedded={true}
        />

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

            <div className="flex items-center justify-center gap-3 pt-1">
              <PlayerAvatar player={targetPlayer} size="sm" isMystery={false} />
              <div className="text-left">
                <span className="text-sm font-extrabold block text-slate-900">
                  {targetPlayer.name}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {targetPlayer.position} • {targetPlayer.nationality} {targetPlayer.flag} ({targetPlayer.currentStatus})
                </span>
              </div>
            </div>

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
                onClick={onLeaveMatch}
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
            <PlayerSearch
              allPlayers={PLAYERS}
              guessedPlayerIds={guesses}
              disabled={room.status !== "PLAYING"}
              onGuess={handleGuess}
              onSkip={handleSkip}
              onGiveUp={() => {}}
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
      </section>
    </div>
  );
};

