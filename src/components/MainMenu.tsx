"use client";

import React, { useState, useMemo } from "react";
import { Difficulty, Category, GameStats } from "@/types/player";
import { DIFFICULTY_CONFIGS } from "@/data/difficulty";
import { POOL_COUNTS } from "@/data/players";
import {
  Play,
  Flame,
  HelpCircle,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  ArrowRight,
  Trophy,
  Check,
  Shield,
  Zap,
  Target,
  Compass,
  Globe,
  Skull,
  Users,
  Swords,
  Crown,
} from "lucide-react";
import { FootballPitchBackground } from "@/components/FootballPitchBackground";
import { GameLogo } from "@/components/GameLogo";
import { soundManager } from "@/utils/sound";

interface MainMenuProps {
  onStartGame: (difficulty: Difficulty, category: Category) => void;
  onOpenMultiplayer: () => void;
  stats: GameStats;
  soundEnabled: boolean;
  onToggleSound: () => void;
  totalPlayersCount: number;
}

const DIFFICULTY_META: Record<
  Difficulty,
  {
    tier: string;
    icon: React.ComponentType<{ className?: string }>;
    selectedBorder: string;
    selectedBg: string;
    hoverBorder: string;
    hoverShadow: string;
    hoverGlow: string;
    badgeSelected: string;
    badgeHover: string;
    iconColor: string;
    iconAnimation: string;
    accentColor: string;
    labelColor: string;
    perk: string;
  }
> = {
  KOLAY: {
    tier: "BRONZ / ÇAYLAK",
    icon: Shield,
    selectedBorder: "border-emerald-500 ring-2 ring-emerald-500/25",
    selectedBg: "bg-emerald-50/95",
    hoverBorder: "hover:border-emerald-500",
    hoverShadow: "hover:shadow-lg hover:shadow-emerald-500/20",
    hoverGlow: "from-emerald-500/15 via-emerald-400/5 to-transparent",
    badgeSelected: "bg-emerald-200/90 text-emerald-950 font-bold border-emerald-300",
    badgeHover: "group-hover:bg-emerald-100 group-hover:text-emerald-900 group-hover:border-emerald-300",
    iconColor: "text-emerald-600",
    iconAnimation: "group-hover:scale-125 group-hover:rotate-12",
    accentColor: "bg-emerald-600",
    labelColor: "text-emerald-950",
    perk: "1x Puan • İpuçları Açık",
  },
  ORTA: {
    tier: "GÜMÜŞ / STANDART",
    icon: Zap,
    selectedBorder: "border-amber-500 ring-2 ring-amber-500/25",
    selectedBg: "bg-amber-50/95",
    hoverBorder: "hover:border-amber-500",
    hoverShadow: "hover:shadow-lg hover:shadow-amber-500/20",
    hoverGlow: "from-amber-500/15 via-amber-400/5 to-transparent",
    badgeSelected: "bg-amber-200/90 text-amber-950 font-bold border-amber-300",
    badgeHover: "group-hover:bg-amber-100 group-hover:text-amber-900 group-hover:border-amber-300",
    iconColor: "text-amber-600",
    iconAnimation: "group-hover:scale-125 group-hover:-rotate-12",
    accentColor: "bg-amber-600",
    labelColor: "text-amber-950",
    perk: "2x Puan • Dengeli Mod",
  },
  ZOR: {
    tier: "ALTIN / USTA",
    icon: Flame,
    selectedBorder: "border-rose-500 ring-2 ring-rose-500/25",
    selectedBg: "bg-rose-50/95",
    hoverBorder: "hover:border-rose-500",
    hoverShadow: "hover:shadow-lg hover:shadow-rose-500/25",
    hoverGlow: "from-rose-500/15 via-rose-400/5 to-transparent",
    badgeSelected: "bg-rose-200/90 text-rose-950 font-bold border-rose-300",
    badgeHover: "group-hover:bg-rose-100 group-hover:text-rose-900 group-hover:border-rose-300",
    iconColor: "text-rose-600",
    iconAnimation: "group-hover:scale-130 group-hover:rotate-6 group-hover:animate-pulse",
    accentColor: "bg-rose-600",
    labelColor: "text-rose-950",
    perk: "3x Puan • 🔒 Lig Gizli",
  },
  EFSANE: {
    tier: "👑 ELİT GURME",
    icon: Crown,
    selectedBorder: "border-purple-400 ring-2 ring-purple-400/30",
    selectedBg: "bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 text-white shadow-xl shadow-purple-950/30",
    hoverBorder: "hover:border-purple-500",
    hoverShadow: "hover:shadow-lg hover:shadow-purple-500/25",
    hoverGlow: "from-purple-500/20 via-purple-400/5 to-transparent",
    badgeSelected: "bg-purple-400/20 text-purple-200 font-bold border-purple-400/40",
    badgeHover: "group-hover:bg-purple-100 group-hover:text-purple-900 group-hover:border-purple-300",
    iconColor: "text-amber-400",
    iconAnimation: "group-hover:scale-130 group-hover:rotate-12",
    accentColor: "bg-purple-500",
    labelColor: "text-purple-200",
    perk: "5x Puan • ⚡ Sıfır İpucu",
  },
};

const CATEGORY_META: Record<
  Category,
  {
    tag: string;
    stars: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    selectedBorder: string;
    selectedBg: string;
    selectedGlow: string;
    hoverBorder: string;
    hoverShadow: string;
    hoverGlow: string;
    iconBgSelected: string;
    iconBgUnselected: string;
    iconAnimation: string;
    badgeSelected: string;
    badgeUnselected: string;
    accentGlow: string;
  }
> = {
  ALL: {
    tag: "GLOBAL YILDIZLAR",
    stars: "⭐⭐⭐",
    subtitle: "Dünya Çapında Efsaneler",
    icon: Sparkles,
    selectedBorder: "border-emerald-400 ring-2 ring-emerald-400/30",
    selectedBg: "bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-white shadow-xl shadow-emerald-950/25",
    selectedGlow: "from-emerald-500/20 via-emerald-400/5 to-transparent",
    hoverBorder: "hover:border-emerald-400",
    hoverShadow: "hover:shadow-lg hover:shadow-emerald-500/15",
    hoverGlow: "from-emerald-500/10 via-emerald-400/5 to-transparent",
    iconBgSelected: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30",
    iconBgUnselected: "bg-white text-emerald-600 shadow-2xs group-hover:bg-emerald-50",
    iconAnimation: "group-hover:scale-125 group-hover:rotate-12",
    badgeSelected: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
    badgeUnselected: "bg-slate-100 text-slate-600 border-slate-200/90",
    accentGlow: "bg-emerald-400",
  },
  SUPER_LIG: {
    tag: "TÜRKİYE LİGİ",
    stars: "⭐⭐",
    subtitle: "Süper Lig Yıldızları",
    icon: Trophy,
    selectedBorder: "border-rose-400 ring-2 ring-rose-400/30",
    selectedBg: "bg-gradient-to-b from-slate-950 via-slate-900 to-rose-950 text-white shadow-xl shadow-rose-950/25",
    selectedGlow: "from-rose-500/20 via-rose-400/5 to-transparent",
    hoverBorder: "hover:border-rose-400",
    hoverShadow: "hover:shadow-lg hover:shadow-rose-500/15",
    hoverGlow: "from-rose-500/10 via-rose-400/5 to-transparent",
    iconBgSelected: "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30",
    iconBgUnselected: "bg-white text-rose-600 shadow-2xs group-hover:bg-rose-50",
    iconAnimation: "group-hover:scale-125 group-hover:-rotate-12",
    badgeSelected: "bg-rose-400/20 text-rose-300 border-rose-400/40",
    badgeUnselected: "bg-slate-100 text-slate-600 border-slate-200/90",
    accentGlow: "bg-rose-400",
  },
  WORLD: {
    tag: "5 BÜYÜK LİG",
    stars: "⭐⭐⭐",
    subtitle: "Avrupa Devleri & Dünya",
    icon: Globe,
    selectedBorder: "border-sky-400 ring-2 ring-sky-400/30",
    selectedBg: "bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950 text-white shadow-xl shadow-sky-950/25",
    selectedGlow: "from-sky-500/20 via-sky-400/5 to-transparent",
    hoverBorder: "hover:border-sky-400",
    hoverShadow: "hover:shadow-lg hover:shadow-sky-500/15",
    hoverGlow: "from-sky-500/10 via-sky-400/5 to-transparent",
    iconBgSelected: "bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30",
    iconBgUnselected: "bg-white text-sky-600 shadow-2xs group-hover:bg-sky-50",
    iconAnimation: "group-hover:scale-125 group-hover:rotate-45",
    badgeSelected: "bg-sky-400/20 text-sky-300 border-sky-400/40",
    badgeUnselected: "bg-slate-100 text-slate-600 border-slate-200/90",
    accentGlow: "bg-sky-400",
  },
};

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenMultiplayer,
  stats,
  soundEnabled,
  onToggleSound,
  totalPlayersCount,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("ORTA");
  const [selectedCategory, setSelectedCategory] = useState<Category>("ALL");
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const winRate =
    stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  // ⚡ Önceden hesaplanmış havuz sayıları (O(1) Anında Erişim)
  const counts = POOL_COUNTS;

  return (
    <div className="relative min-h-screen text-slate-800 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden font-sans">
      {/* Doğal Futbol Sahası Zemin Çizgileri */}
      <FootballPitchBackground />

      {/* Canlı Stadyum TV Header - Oyun İçi ile Birebir Aynı Tasarım */}
      <header className="relative z-10 border-b border-slate-200/90 bg-white/95 backdrop-blur-xl sticky top-0 shadow-xs text-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-15 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <GameLogo size="sm" showText={true} />
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Nasıl Oynanır? Butonu */}
            <button
              onClick={() => {
                soundManager.playClick();
                setShowHowToPlay(true);
              }}
              className="flex items-center gap-1.5 text-xs text-slate-900 hover:text-black py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer font-bold shadow-2xs"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
              <span className="hidden sm:inline">Nasıl Oynanır?</span>
            </button>

            {/* Puan & Seri */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono text-[11px] shadow-2xs">
              <span className="font-extrabold text-slate-950">{stats.totalScore} p</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-amber-600 font-black">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{stats.streak}</span>
              </div>
            </div>

            {/* Mute Toggle */}
            <button
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

      {/* Ana Gövde */}
      <main className="relative z-10 max-w-3xl w-full mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col justify-center space-y-3.5">
        
        {/* 1. Kategori / Lig Havuzu Seçimi (Futbol Kart Paketleri) */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Lig & Kart Paketi Filtresi
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              {counts[selectedCategory]} oyuncu hazır
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(
              [
                { id: "ALL", label: "Tüm Oyuncular", count: counts.ALL, unit: "Yıldız" },
                { id: "SUPER_LIG", label: "Süper Lig", count: counts.SUPER_LIG, unit: "Oyuncu" },
                { id: "WORLD", label: "Dünya & Avrupa", count: counts.WORLD, unit: "Dev" },
              ] as { id: Category; label: string; count: number; unit: string }[]
            ).map((cat) => {
              const meta = CATEGORY_META[cat.id];
              const Icon = meta.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer relative overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? `${meta.selectedBg} ${meta.selectedBorder}`
                      : `bg-slate-50/90 hover:bg-white border-slate-200/90 text-slate-800 ${meta.hoverBorder} ${meta.hoverShadow}`
                  }`}
                >
                  {/* Holografik Işık / Parıltı Süpürme Efekti */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

                  {/* Arka Plan Renkli Hover Işıması */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      isSelected ? meta.selectedGlow : meta.hoverGlow
                    } opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  {/* Üst Kısım: Tag + Nadirlik Yıldızları + Onay */}
                  <div className="flex items-center justify-between relative z-10 w-full">
                    <span
                      className={`text-[9px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? "bg-white/10 text-white border-white/20"
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {meta.tag}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] tracking-tighter">
                        {meta.stars}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Orta Kısım: İkon + İsim */}
                  <div className="flex items-center gap-2.5 my-2 relative z-10">
                    <div
                      className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-all duration-300 shadow-sm ${
                        isSelected ? meta.iconBgSelected : meta.iconBgUnselected
                      }`}
                    >
                      <div className={`transition-transform duration-300 ${meta.iconAnimation}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3
                        className={`text-sm sm:text-base font-black tracking-tight leading-none truncate transition-colors duration-200 ${
                          isSelected ? "text-white" : "text-slate-900 group-hover:text-black"
                        }`}
                      >
                        {cat.label}
                      </h3>
                      <p
                        className={`text-[10px] font-medium truncate mt-1 ${
                          isSelected ? "text-white/70" : "text-slate-500"
                        }`}
                      >
                        {meta.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Alt Kısım: Rozet */}
                  <div className="relative z-10 pt-1 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition-all ${
                        isSelected ? meta.badgeSelected : meta.badgeUnselected
                      }`}
                    >
                      {cat.count} {cat.unit}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? "text-white/60" : "text-slate-400"
                      }`}
                    >
                      {isSelected ? "Aktif Paket" : "Paketi Seç ➔"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Zorluk Seviyesi (Koleksiyon Kart Kademeleri) */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3.5 sm:p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Zorluk & Kart Kademesi
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-600 font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              {selectedDifficulty === "KOLAY"
                ? "1x Skor"
                : selectedDifficulty === "ORTA"
                ? "2x Skor"
                : selectedDifficulty === "ZOR"
                ? "3x Skor (Lig Gizli)"
                : "5x Skor (Sıfır İpucu)"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            {(["KOLAY", "ORTA", "ZOR", "EFSANE"] as Difficulty[]).map((level) => {
              const cfg = DIFFICULTY_CONFIGS[level];
              const meta = DIFFICULTY_META[level];
              const Icon = meta.icon;
              const isSelected = selectedDifficulty === level;
              const isEfsane = level === "EFSANE";

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedDifficulty(level);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left cursor-pointer relative overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98] flex flex-col justify-between min-h-[135px] ${
                    isSelected
                      ? `${meta.selectedBg} ${meta.selectedBorder} shadow-md`
                      : `bg-slate-50/90 hover:bg-white border-slate-200/90 ${meta.hoverBorder} ${meta.hoverShadow}`
                  }`}
                >
                  {/* Holografik Işık / Parıltı Süpürme Efekti */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

                  {/* Arka Plan Renkli Hover Işıması */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${meta.hoverGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  {/* Seçili İndikatörü */}
                  {isSelected && (
                    <div
                      className={`absolute top-0 right-0 w-6 h-6 ${meta.accentColor} text-white flex items-center justify-center rounded-bl-lg text-[9px] font-bold shadow-2xs animate-in zoom-in-75 duration-150 z-10`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Üst Kısım: Tier Adı */}
                  <div className="relative z-10 flex items-center justify-between w-full">
                    <span
                      className={`text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        isSelected && isEfsane
                          ? "bg-purple-900/80 text-purple-200 border-purple-400/40"
                          : isSelected
                          ? "bg-white/80 text-slate-800 border-slate-200"
                          : "bg-white text-slate-500 border-slate-200"
                      }`}
                    >
                      {meta.tier}
                    </span>
                  </div>

                  {/* Orta Kısım: İkon & Kademe Başlığı */}
                  <div className="flex items-center gap-2 my-2 relative z-10">
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all duration-300 shadow-2xs ${
                        isSelected && isEfsane
                          ? "bg-purple-800/80 text-amber-300"
                          : isSelected
                          ? "bg-white/95"
                          : "bg-white text-slate-700 group-hover:bg-white"
                      } ${meta.iconColor}`}
                    >
                      <div className={`transition-transform duration-300 ${meta.iconAnimation}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`text-sm sm:text-base font-black tracking-tight leading-none truncate transition-colors duration-200 ${
                          isSelected && isEfsane
                            ? "text-white"
                            : isSelected
                            ? meta.labelColor
                            : "text-slate-900 group-hover:text-black"
                        }`}
                      >
                        {cfg.label}
                      </div>
                    </div>
                  </div>

                  {/* İstatistikler: Hak & Joker */}
                  <div className="relative z-10 flex items-center gap-1 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isSelected && isEfsane
                          ? "bg-purple-900/60 text-purple-200 border-purple-400/30"
                          : isSelected
                          ? meta.badgeSelected
                          : `bg-white text-slate-700 border-slate-200 ${meta.badgeHover}`
                      }`}
                    >
                      {cfg.maxAttempts} Hak
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isSelected && isEfsane
                          ? "bg-purple-950 text-amber-300 border-amber-400/30"
                          : isSelected
                          ? "bg-amber-100 text-amber-950 border-amber-300"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {level === "KOLAY"
                        ? "3 Joker"
                        : level === "ORTA"
                        ? "2 Joker"
                        : level === "ZOR"
                        ? "1 Joker"
                        : "0 Joker"}
                    </span>
                  </div>

                  {/* Alt Kısım: Çarpan & Özellik */}
                  <div
                    className={`relative z-10 text-[10px] font-mono mt-2 pt-1 border-t truncate ${
                      isSelected && isEfsane
                        ? "border-purple-800 text-amber-300 font-bold"
                        : isSelected
                        ? "border-slate-200/60 text-slate-700 font-bold"
                        : "border-slate-100 text-slate-500 font-medium"
                    }`}
                  >
                    {meta.perk}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Oyuna Başla & Canlı 1v1 Maç Butonları */}
        <div className="space-y-3">
          {/* TEK KİŞİLİK OYNA BUTONU (Zümrüt Yeşil Stadyum) */}
          <button
            type="button"
            onClick={() => onStartGame(selectedDifficulty, selectedCategory)}
            className="group relative overflow-hidden w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:via-teal-500 hover:to-emerald-500 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-600/35 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
          >
            {/* Animasyonlu Işık Süpürme Efekti */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

            {/* Oynat İkonu */}
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:scale-115 group-hover:rotate-6 transition-all duration-200">
              <Play className="w-4 h-4 fill-white text-white ml-0.5" />
            </div>

            <span className="tracking-wide uppercase font-black">
              TEK KİŞİLİK OYNA
            </span>

            {/* İleri Oku */}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-200 stroke-[2.5]" />
          </button>

          {/* 🌙 GECE DERBİSİ: CANLI 1v1 BUTONU (OBSİDYEN SİYAH & PARLAK ALTIN) */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenMultiplayer();
            }}
            className="group relative overflow-hidden w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-black hover:via-slate-900 hover:to-black text-white font-extrabold text-sm sm:text-base rounded-2xl border-2 border-amber-400/90 hover:border-amber-300 shadow-xl shadow-amber-500/10 hover:shadow-2xl hover:shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
          >
            {/* Holografik Altın Işık Süpürme Efekti */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-amber-300/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />

            {/* Kılıçlar İkon Rozeti */}
            <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm shrink-0">
              <Swords className="w-4 h-4 text-amber-400" />
            </div>

            {/* Metin & Alt Açıklama */}
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2.5">
              <span className="tracking-wide uppercase font-black text-amber-300 group-hover:text-amber-200 transition-colors">
                CANLI 1v1 DERBİ
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-300/90 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                (ARKADAŞINA MEYDAN OKU ⚔️)
              </span>
            </div>
          </button>
        </div>

        {/* 5. Kariyer Karnesi (Skor Şeridi) */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>Kariyer Karnen</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-normal">
              {stats.gamesPlayed} Maç Oynandı
            </span>
          </div>

          <div className="grid grid-cols-4 divide-x divide-slate-100 text-center">
            <div className="px-1 hover:bg-slate-50/80 rounded-lg transition-colors py-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Toplam</div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">
                {stats.totalScore}
              </div>
            </div>

            <div className="px-1 hover:bg-slate-50/80 rounded-lg transition-colors py-1 group">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Seri</div>
              <div className="text-base sm:text-lg font-black text-amber-600 font-mono mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 group-hover:scale-125 transition-transform" />
                <span>{stats.streak}</span>
              </div>
            </div>

            <div className="px-1 hover:bg-slate-50/80 rounded-lg transition-colors py-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase">En İyi</div>
              <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">
                {stats.bestStreak}
              </div>
            </div>

            <div className="px-1 hover:bg-slate-50/80 rounded-lg transition-colors py-1">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Başarı</div>
              <div className="text-base sm:text-lg font-black text-emerald-700 font-mono mt-0.5">
                %{winRate}
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Sade Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-white/80 font-mono">
        Kim Bu Adam? • Transfer ve Kariyer Tahmin Oyunu
      </footer>

      {/* Nasıl Oynanır Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Nasıl Oynanır?
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Oyun başladığında futbolcunun kariyerindeki ilk kulüp açılır.
                  Sonraki kulüpler kilitlidir.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Arama kutusuna futbolcunun adını yazarak tahmin yap.
                  Listeden seçimini onayla.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  Her yanlış tahminde sıradaki kulüp açılır. Ayrıca sırasıyla
                  Mevki, Uyruk ve Yaş ipuçları görünür.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  4
                </span>
                <p>
                  Zor modda lig isimleri gizlidir ve sadece 4 hak verilir ancak
                  kazandığında 3 katı puan kazanırsın!
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  5
                </span>
                <p>
                  <strong>Kademeli Joker Dağılımı:</strong> Kolay modda 3 jokerin hepsi (+1 Kulüp, Forma No, Kupa & Başarı), Orta modda 2 joker (+1 Kulüp, Forma No), Zor modda sadece 1 joker (Forma No) yer alır.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  6
                </span>
                <p>
                  <strong>Efsane (Gurme) Modu:</strong> Sadece 3 hakkın vardır. Ligler, kademeli ipuçları ve jokerler tamamen kapalıdır. Kazanırsan tam <strong>5 katı (5x)</strong> puan kazanırsın!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Anladım
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
