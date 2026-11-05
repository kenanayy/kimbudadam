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
  }
> = {
  KOLAY: {
    icon: Shield,
    selectedBorder: "border-emerald-600 ring-2 ring-emerald-500/25",
    selectedBg: "bg-emerald-50/90",
    hoverBorder: "hover:border-emerald-500",
    hoverShadow: "hover:shadow-lg hover:shadow-emerald-500/20",
    hoverGlow: "from-emerald-500/15 via-emerald-400/5 to-transparent",
    badgeSelected: "bg-emerald-200/90 text-emerald-950 font-bold border-emerald-300",
    badgeHover: "group-hover:bg-emerald-100 group-hover:text-emerald-900 group-hover:border-emerald-300",
    iconColor: "text-emerald-600",
    iconAnimation: "group-hover:scale-125 group-hover:rotate-12",
    accentColor: "bg-emerald-600",
    labelColor: "text-emerald-950",
  },
  ORTA: {
    icon: Zap,
    selectedBorder: "border-amber-600 ring-2 ring-amber-500/25",
    selectedBg: "bg-amber-50/90",
    hoverBorder: "hover:border-amber-500",
    hoverShadow: "hover:shadow-lg hover:shadow-amber-500/20",
    hoverGlow: "from-amber-500/15 via-amber-400/5 to-transparent",
    badgeSelected: "bg-amber-200/90 text-amber-950 font-bold border-amber-300",
    badgeHover: "group-hover:bg-amber-100 group-hover:text-amber-900 group-hover:border-amber-300",
    iconColor: "text-amber-600",
    iconAnimation: "group-hover:scale-125 group-hover:-rotate-12",
    accentColor: "bg-amber-600",
    labelColor: "text-amber-950",
  },
  ZOR: {
    icon: Flame,
    selectedBorder: "border-rose-600 ring-2 ring-rose-500/25",
    selectedBg: "bg-rose-50/90",
    hoverBorder: "hover:border-rose-500",
    hoverShadow: "hover:shadow-lg hover:shadow-rose-500/25",
    hoverGlow: "from-rose-500/15 via-rose-400/5 to-transparent",
    badgeSelected: "bg-rose-200/90 text-rose-950 font-bold border-rose-300",
    badgeHover: "group-hover:bg-rose-100 group-hover:text-rose-900 group-hover:border-rose-300",
    iconColor: "text-rose-600",
    iconAnimation: "group-hover:scale-130 group-hover:rotate-6 group-hover:animate-pulse",
    accentColor: "bg-rose-600",
    labelColor: "text-rose-950",
  },
  EFSANE: {
    icon: Skull,
    selectedBorder: "border-purple-600 ring-2 ring-purple-500/25",
    selectedBg: "bg-purple-50/90",
    hoverBorder: "hover:border-purple-500",
    hoverShadow: "hover:shadow-lg hover:shadow-purple-500/25",
    hoverGlow: "from-purple-500/15 via-purple-400/5 to-transparent",
    badgeSelected: "bg-purple-200/90 text-purple-950 font-bold border-purple-300",
    badgeHover: "group-hover:bg-purple-100 group-hover:text-purple-900 group-hover:border-purple-300",
    iconColor: "text-purple-600",
    iconAnimation: "group-hover:scale-130 group-hover:rotate-12",
    accentColor: "bg-purple-600",
    labelColor: "text-purple-950",
  },
};

const CATEGORY_META: Record<
  Category,
  {
    icon: React.ComponentType<{ className?: string }>;
    hoverBorder: string;
    hoverShadow: string;
    hoverGlow: string;
    iconBgSelected: string;
    iconBgUnselected: string;
    iconAnimation: string;
    activeDot: string;
    activeBadge: string;
  }
> = {
  ALL: {
    icon: Sparkles,
    hoverBorder: "hover:border-emerald-400",
    hoverShadow: "hover:shadow-md hover:shadow-emerald-500/15",
    hoverGlow: "from-emerald-500/10 via-emerald-400/5 to-transparent",
    iconBgSelected: "bg-emerald-500/20 text-emerald-300",
    iconBgUnselected: "bg-white text-emerald-600 shadow-2xs group-hover:bg-emerald-50",
    iconAnimation: "group-hover:scale-125 group-hover:rotate-12",
    activeDot: "bg-emerald-400",
    activeBadge: "text-emerald-400",
  },
  SUPER_LIG: {
    icon: Trophy,
    hoverBorder: "hover:border-amber-400",
    hoverShadow: "hover:shadow-md hover:shadow-amber-500/15",
    hoverGlow: "from-amber-500/10 via-amber-400/5 to-transparent",
    iconBgSelected: "bg-amber-500/20 text-amber-300",
    iconBgUnselected: "bg-white text-amber-600 shadow-2xs group-hover:bg-amber-50",
    iconAnimation: "group-hover:scale-125 group-hover:-rotate-12",
    activeDot: "bg-amber-400",
    activeBadge: "text-amber-300",
  },
  WORLD: {
    icon: Globe,
    hoverBorder: "hover:border-sky-400",
    hoverShadow: "hover:shadow-md hover:shadow-sky-500/15",
    hoverGlow: "from-sky-500/10 via-sky-400/5 to-transparent",
    iconBgSelected: "bg-sky-500/20 text-sky-300",
    iconBgUnselected: "bg-white text-sky-600 shadow-2xs group-hover:bg-sky-50",
    iconAnimation: "group-hover:scale-125 group-hover:rotate-45",
    activeDot: "bg-sky-400",
    activeBadge: "text-sky-300",
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
      <main className="relative z-10 max-w-3xl w-full mx-auto px-4 py-4 flex-1 flex flex-col justify-center space-y-4">
        
        {/* 1. VİTRİN: Başlık ve 3D Animasyonlu Gizemli Futbolcu Kartı */}
        <div className="relative bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xl shadow-slate-950/15 overflow-hidden">
          {/* Üst Zarif Yeşil Şerit */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
            {/* Sol Taraf: Tanıtım ve Vurgular (Örnek kısmı kaldırıldı) */}
            <div className="space-y-3.5 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>{totalPlayersCount} Efsane Futbolcu</span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                  Transfer İpuçlarını Çöz, Futbolcuyu Bul!
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  İlk kulüpten başlayarak kariyer rotasını takip et. Bakalım kaçıncı denemede doğru futbolcuyu çıkaracaksın?
                </p>
              </div>

              {/* Sade Özellik Rozetleri */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  Kariyer Çizelgesi
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Kademeli İpuçları
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/80">
                  <Target className="w-3 h-3 text-emerald-600" />
                  Anlık Arama
                </span>
              </div>
            </div>

            {/* Sağ Taraf: 3D Animasyonlu & Etkileşimli Gizem Kartı */}
            <div className="relative shrink-0 group perspective-1000">
              <div className="animate-float-card w-36 h-52 sm:w-42 sm:h-56 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4 flex flex-col justify-between text-white shadow-2xl border-2 border-emerald-500/40 group-hover:border-emerald-400 group-hover:scale-105 group-hover:-rotate-2 transition-all duration-300 relative overflow-hidden cursor-pointer">
                
                {/* Holografik Işık Parıltısı Efekti */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                {/* Kart Üstü Başlığı */}
                <div className="flex justify-between items-center text-xs relative z-10">
                  <span className="font-mono text-[9px] text-emerald-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
                    ÖZEL KART
                  </span>
                  <span className="text-amber-400 text-xs">⭐⭐⭐</span>
                </div>

                {/* Kart Ortası: Büyüyen Logo & Işıma */}
                <div className="flex flex-col items-center justify-center my-auto relative z-10">
                  <div className="relative group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                    <GameLogo size="lg" />
                  </div>
                </div>

                {/* Kart Altı: Gizemli Soru İşareti */}
                <div className="text-center pt-2 border-t border-white/15 relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-300 font-bold">
                    Kariyeri Çöz
                  </span>
                  <span className="text-xs text-white/80 group-hover:translate-x-1 transition-transform">
                    ➔
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Kategori / Lig Havuzu Seçimi */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Lig & Havuz Filtresi
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-600 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              {counts[selectedCategory]} oyuncu hazır
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "ALL", label: "Tüm Oyuncular", desc: `${counts.ALL} Yıldız` },
                { id: "SUPER_LIG", label: "Süper Lig", desc: `${counts.SUPER_LIG} Oyuncu` },
                { id: "WORLD", label: "Dünya & Avrupa", desc: `${counts.WORLD} Dev` },
              ] as { id: Category; label: string; desc: string }[]
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
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left cursor-pointer relative overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] ${
                    isSelected
                      ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-950/20"
                      : `bg-slate-50/90 hover:bg-white border-slate-200/90 text-slate-800 ${meta.hoverBorder} ${meta.hoverShadow}`
                  }`}
                >
                  {/* Holografik Işık / Parıltı Süpürme Efekti */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

                  {/* Arka Plan Renkli Hover Işıması */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${meta.hoverGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  {/* Üst Satır: İkon + İsim + Seçili Nabız Noktası */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Animasyonlu İkon Rozeti */}
                      <div
                        className={`w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-all duration-300 ${
                          isSelected ? meta.iconBgSelected : meta.iconBgUnselected
                        }`}
                      >
                        <div
                          className={`transition-transform duration-300 ${meta.iconAnimation}`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold leading-tight truncate transition-colors duration-200 ${
                          isSelected
                            ? "text-white"
                            : "text-slate-900 group-hover:text-black"
                        }`}
                      >
                        {cat.label}
                      </span>
                    </div>

                    {/* Seçili Nabız İndikatörü */}
                    {isSelected && (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${meta.activeDot} opacity-75`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${meta.activeDot}`}
                        />
                      </span>
                    )}
                  </div>

                  {/* Alt Satır: Oyuncu Sayısı Rozeti */}
                  <div
                    className={`text-[10px] font-mono mt-1.5 relative z-10 transition-colors duration-200 ${
                      isSelected
                        ? meta.activeBadge
                        : "text-slate-500 group-hover:text-slate-700 font-medium"
                    }`}
                  >
                    {cat.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Zorluk Seviyesi (Animasyonlu Kartlar) */}
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                Zorluk Seviyesi
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-600 font-semibold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              {selectedDifficulty === "KOLAY"
                ? "1x Skor"
                : selectedDifficulty === "ORTA"
                ? "2x Skor"
                : selectedDifficulty === "ZOR"
                ? "3x Skor (Lig Gizli)"
                : "5x Skor (Sıfır İpucu)"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["KOLAY", "ORTA", "ZOR", "EFSANE"] as Difficulty[]).map((level) => {
              const cfg = DIFFICULTY_CONFIGS[level];
              const meta = DIFFICULTY_META[level];
              const Icon = meta.icon;
              const isSelected = selectedDifficulty === level;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedDifficulty(level);
                  }}
                  className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left cursor-pointer relative overflow-hidden group transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.03] active:translate-y-0 active:scale-[0.98] ${
                    isSelected
                      ? `${meta.selectedBg} ${meta.selectedBorder} shadow-sm`
                      : `bg-slate-50/90 hover:bg-white border-slate-200/90 ${meta.hoverBorder} ${meta.hoverShadow}`
                  }`}
                >
                  {/* Hover Anında Holografik Işık / Parıltı Süpürme Efekti */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none" />

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

                  {/* Başlık Satırı & Hareketli İkon (İkon başlığın solunda, köşedeki tik ile asla çakışmaz) */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* Animasyonlu İkon Rozeti */}
                      <div
                        className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center transition-all duration-300 ${
                          isSelected
                            ? "bg-white/90 shadow-2xs"
                            : "bg-white/80 group-hover:bg-white shadow-2xs"
                        } ${meta.iconColor}`}
                      >
                        <div
                          className={`transition-transform duration-300 ${meta.iconAnimation}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div
                        className={`text-xs sm:text-sm font-black tracking-tight truncate transition-colors duration-200 ${
                          isSelected
                            ? meta.labelColor
                            : "text-slate-900 group-hover:text-black"
                        }`}
                      >
                        {cfg.label}
                      </div>
                    </div>
                  </div>

                  {/* Tahmin & Joker Rozetleri */}
                  <div className="relative z-10 mt-1.5 flex items-center gap-1 flex-wrap">
                    <div
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all duration-200 border ${
                        isSelected
                          ? meta.badgeSelected
                          : `bg-white text-slate-600 border-slate-200 ${meta.badgeHover}`
                      }`}
                    >
                      {cfg.maxAttempts} Hak
                    </div>
                    <div
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all duration-200 border ${
                        isSelected
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
                    </div>
                  </div>

                  {/* Skor Çarpanı & Ek Açıklama */}
                  <div className="relative z-10 text-[10px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                    <span className="font-semibold group-hover:text-slate-800 transition-colors">
                      {cfg.scoreMultiplier}x Çarpan
                    </span>
                    {level === "ZOR" && (
                      <span className="text-[9px] text-rose-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Lig Gizli!
                      </span>
                    )}
                    {level === "EFSANE" && (
                      <span className="text-[9px] text-purple-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Sıfır İpucu!
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Oyuna Başla & Canlı 1v1 Maç Butonları */}
        <div className="space-y-2.5">
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

          {/* ⚡ CANLI 1v1 DERBİ BUTONU */}
          <button
            type="button"
            onClick={() => {
              soundManager.playClick();
              onOpenMultiplayer();
            }}
            className="group relative overflow-hidden w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-indigo-700/25 hover:shadow-xl hover:shadow-indigo-600/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer border border-indigo-400/30"
          >
            <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-wide uppercase font-black">
              ⚡ CANLI 1v1 DERBİ (ARKADAŞINLA OYNA)
            </span>
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
