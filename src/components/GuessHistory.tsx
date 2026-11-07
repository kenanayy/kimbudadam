"use client";

import React from "react";
import { Player, GuessResult, Difficulty } from "@/types/player";
import { Check, X, ArrowUp, ArrowDown, Handshake, Skull } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { comparePlayers } from "@/utils/playerComparison";

interface GuessHistoryProps {
  guesses: GuessResult[];
  maxAttempts: number;
  targetPlayer: Player;
  difficulty?: Difficulty;
}

export const GuessHistory: React.FC<GuessHistoryProps> = React.memo(({
  guesses,
  maxAttempts,
  targetPlayer,
  difficulty,
}) => {
  if (guesses.length === 0) return null;

  return (
    <div className="w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xl shadow-slate-950/10 space-y-3">
      {/* Üst Başlık & İlerleme */}
      <div className="flex items-center justify-between text-slate-700 text-xs font-mono font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="font-sans font-black text-slate-900 text-sm">
            Tahmin Karşılaştırması
          </span>
          <span className="hidden sm:inline text-[10px] font-normal text-slate-400 lowercase">
            (sıcak - soğuk analizi)
          </span>
        </div>
        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
          {guesses.length} / {maxAttempts} deneme
        </span>
      </div>

      {/* Tahmin Kartları Listesi */}
      <div className="space-y-2">
        {guesses.map((guess, idx) => {
          // 1. PAS DURUMU
          if (guess.player.id.startsWith("pas-")) {
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-slate-50/80 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-mono text-[10px] font-bold">
                    —
                  </div>
                  <span className="text-xs text-slate-500 font-medium italic">
                    Pas Geçildi (+1 Kulüp Açıldı)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{guess.attemptNumber}
                </span>
              </div>
            );
          }

          // 1.1 PES ETME DURUMU
          if (guess.player.id.startsWith("pes-")) {
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-rose-200/90 bg-rose-50/70 text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-mono text-[10px] font-bold">
                    🏳️
                  </div>
                  <span className="text-xs text-rose-800 font-semibold italic">
                    Pes Edildi (Cevap Açıldı)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-400">
                  #{guess.attemptNumber}
                </span>
              </div>
            );
          }

          // 2. DOĞRU BİLİNEN TAHMİN
          if (guess.isCorrect) {
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-3 rounded-2xl border border-emerald-400 bg-emerald-50/90 text-emerald-950 font-bold shadow-xs animate-in zoom-in-95 duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <PlayerAvatar player={guess.player} size="xs" isMystery={false} />
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="font-black text-sm truncate text-emerald-950">
                      {guess.player.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-extrabold uppercase">
                      ✓ Doğru Tahmin!
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 shrink-0 ml-2">
                  #{guess.attemptNumber}
                </span>
              </div>
            );
          }

          // 3. YANLIŞ TAHMİN (AKILLI KARŞILAŞTIRMA KARTI)
          const comp = comparePlayers(targetPlayer, guess.player);

          return (
            <div
              key={idx}
              className="p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50/80 transition-all shadow-2xs space-y-2.5"
            >
              {/* Üst Satır: Avatar, İsim ve Deneme Sırası */}
              <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <PlayerAvatar player={guess.player} size="xs" isMystery={false} />
                  <span className="font-extrabold text-slate-900 truncate text-xs sm:text-sm">
                    {guess.player.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    ({comp.guessAge} Yaş)
                  </span>
                </div>

                <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0 ml-2 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  #{guess.attemptNumber}
                </span>
              </div>

              {/* Alt Satır: Sıcak / Soğuk Dedektiflik Rozetleri */}
              {difficulty === "EFSANE" ? (
                <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-purple-700 font-mono font-bold">
                  <Skull className="w-3.5 h-3.5 text-purple-600" />
                  <span>Efsane Mod: Bu seviyede ipucu kapalıdır!</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 text-[11px]">
                  {/* 1. MEVKİ EŞLEŞMESİ */}
                  {comp.isPositionMatch ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3] text-emerald-700" />
                      <span>Mevki: {guess.player.position}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      <X className="w-3 h-3 text-slate-400 stroke-[2]" />
                      <span>Mevki: {guess.player.position}</span>
                    </span>
                  )}

                  {/* 2. YAŞ / DOĞUM YILI EŞLEŞMESİ (▲ YAŞLI / ▼ GENÇ) */}
                  {comp.ageDiff === "EQUAL" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3] text-emerald-700" />
                      <span>Aynı Yaş ({comp.guessAge})</span>
                    </span>
                  ) : comp.ageDiff === "OLDER" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                      <ArrowUp className="w-3 h-3 stroke-[2.5] text-amber-600" />
                      <span>Hedef Daha Yaşlı</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-sky-50 text-sky-900 border border-sky-300 shadow-2xs">
                      <ArrowDown className="w-3 h-3 stroke-[2.5] text-sky-600" />
                      <span>Hedef Daha Genç</span>
                    </span>
                  )}

                  {/* 3. ÜLKE / KITA EŞLEŞMESİ */}
                  {comp.isCountryMatch ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                      <span className="text-xs leading-none">{guess.player.flag}</span>
                      <span>Aynı Ülke ({guess.player.nationality})</span>
                    </span>
                  ) : comp.isContinentMatch ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                      <span className="text-xs leading-none">{guess.player.flag}</span>
                      <span>Aynı Kıta ({comp.guessContinent})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      <span className="text-xs leading-none">{guess.player.flag}</span>
                      <span>{guess.player.nationality}</span>
                    </span>
                  )}

                  {/* 4. ORTAK KULÜP (VARSA) */}
                  {comp.commonClub && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold bg-purple-50 text-purple-900 border border-purple-300 shadow-2xs">
                      <Handshake className="w-3.5 h-3.5 text-purple-600 stroke-[2.5]" />
                      <span>Ortak Kulüp: {comp.commonClub}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

GuessHistory.displayName = "GuessHistory";
