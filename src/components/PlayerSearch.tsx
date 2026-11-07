"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Player } from "@/types/player";
import { INDEXED_SEARCH_PLAYERS } from "@/data/players";
import { Search, X, CornerDownLeft, SkipForward, Flag } from "lucide-react";
import { PlayerAvatar } from "@/components/PlayerAvatar";

interface PlayerSearchProps {
  allPlayers: Player[];
  guessedPlayerIds: string[];
  disabled: boolean;
  onGuess: (player: Player) => void;
  onSkip?: () => void;
  canSkip?: boolean;
  onGiveUp?: () => void;
  isLastChance?: boolean;
}

export const PlayerSearch: React.FC<PlayerSearchProps> = ({
  allPlayers,
  guessedPlayerIds,
  disabled,
  onGuess,
  onSkip,
  canSkip = true,
  onGiveUp,
  isLastChance = false,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const guessedSet = useMemo(() => new Set(guessedPlayerIds), [guessedPlayerIds]);

  const filteredPlayers = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    const q = trimmed.toLocaleLowerCase("tr");

    const results: Player[] = [];
    const len = INDEXED_SEARCH_PLAYERS.length;

    for (let i = 0; i < len; i++) {
      const item = INDEXED_SEARCH_PLAYERS[i];
      if (!guessedSet.has(item.player.id) && item.searchKey.includes(q)) {
        results.push(item.player);
        if (results.length >= 6) break; // 🚀 Erken çıkış: 6 oyuncu bulunca döngüyü anında sonlandır
      }
    }

    return results;
  }, [guessedSet, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (player: Player) => {
    onGuess(player);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) =>
        prev < filteredPlayers.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredPlayers.length > 0) {
        const safeIdx =
          selectedIndex >= 0 && selectedIndex < filteredPlayers.length
            ? selectedIndex
            : 0;
        handleSelect(filteredPlayers[safeIdx]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full relative z-40">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-emerald-600" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Tur tamamlandı"
                : isLastChance
                ? "Son tahmininizi yapın..."
                : "Futbolcu ara..."
            }
            className={`w-full pl-10 pr-20 py-2.5 bg-white dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-slate-100 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs transition-all font-medium ${
              isLastChance && !disabled
                ? "border-amber-400 placeholder-amber-700/70 dark:placeholder-amber-400/70 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                : "border-slate-300 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            }`}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5 pointer-events-none">
            {query && !disabled ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="pointer-events-auto p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                <CornerDownLeft className="w-2.5 h-2.5" /> Enter
              </span>
            )}
          </div>
        </div>

        {/* Pas Butonu */}
        {canSkip && !disabled && (
          <button
            type="button"
            onClick={onSkip}
            className="px-3 sm:px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-xs shadow-emerald-700/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="1 hak kullanarak sıradaki kulübü veya ipucunu aç"
          >
            <SkipForward className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Pas</span>
          </button>
        )}

        {/* Pes Et / Cevabı Gör Butonu */}
        {onGiveUp && !disabled && (
          <button
            type="button"
            onClick={onGiveUp}
            className="px-2.5 sm:px-3 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-800 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-800 shadow-2xs hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            title="Turu sonlandır ve gizemli futbolcuyu gör"
          >
            <Flag className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline">Pes Et</span>
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 left-0 right-0 mt-2 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 ring-4 ring-black/5 dark:ring-white/5 animate-in fade-in zoom-in-95 duration-150"
        >
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={player.id}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSelect(player);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(player);
                  }}
                  onClick={() => handleSelect(player)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <PlayerAvatar player={player} size="sm" isMystery={false} />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        <span>{player.name}</span>
                        {player.fullName && player.fullName !== player.name && (
                          <span className="text-[10px] text-slate-400 font-normal truncate">
                            ({player.fullName})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
                        {player.position} • {player.currentStatus}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">
                    Seç
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
              Eşleşen futbolcu bulunamadı
            </div>
          )}
        </div>
      )}
    </div>
  );
};
