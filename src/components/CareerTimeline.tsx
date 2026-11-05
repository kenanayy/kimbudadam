"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ClubCareer } from "@/types/player";
import { Lock, Sparkles, ArrowRight, Milestone, ChevronLeft, ChevronRight } from "lucide-react";
import { ClubLogo } from "@/components/ClubLogo";

interface CareerTimelineProps {
  career: ClubCareer[];
  revealedCount: number;
  isGameOver: boolean;
  showLeague?: boolean;
  embedded?: boolean;
}

export const CareerTimeline: React.FC<CareerTimelineProps> = ({
  career,
  revealedCount,
  isGameOver,
  showLeague = true,
  embedded = false,
}) => {
  const latestCardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [thumbWidthPct, setThumbWidthPct] = useState(25);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef<{ startX: number; startScrollLeft: number } | null>(null);

  const updateScrollState = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const overflow = maxScroll > 8;

    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft < maxScroll - 8);

    if (overflow && maxScroll > 0) {
      const visibleRatio = clientWidth / scrollWidth;
      const widthPct = Math.max(18, Math.min(75, visibleRatio * 100));
      setThumbWidthPct(widthPct);

      const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll));
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
      setThumbWidthPct(100);
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollState);
      window.addEventListener("resize", updateScrollState);
      return () => {
        el.removeEventListener("scroll", updateScrollState);
        window.removeEventListener("resize", updateScrollState);
      };
    }
  }, [career, updateScrollState]);

  // 1. Yeni futbolcuya geçildiğinde rotayı kesinlikle 1. kulübe sıfırla
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
    updateScrollState();
  }, [career, updateScrollState]);

  // 2. Yeni kulüp açıldığında akıllı odaklanma:
  // Kart zaten görünür alandaysa HİÇBİR ŞEY YAPMAZ (böylece 1. kulüp asla sola kayıp kaybolmaz)
  // Sadece sağ kenardan taşıyorsa, kartı ekrana sokacak kadar kaydırır
  useEffect(() => {
    if (!containerRef.current) return;

    if (revealedCount <= 1) {
      containerRef.current.scrollTo({ left: 0, behavior: "smooth" });
      setTimeout(updateScrollState, 300);
      return;
    }

    if (latestCardRef.current) {
      const container = containerRef.current;
      const card = latestCardRef.current;
      const cRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      // Kart ekranda rahatça görünüyorsa scroll yapma!
      const isCardFullyVisible =
        cardRect.left >= cRect.left + 24 && cardRect.right <= cRect.right - 24;

      if (!isCardFullyVisible) {
        if (cardRect.right > cRect.right - 24) {
          const scrollDistance = cardRect.right - cRect.right + 48;
          container.scrollBy({ left: scrollDistance, behavior: "smooth" });
        } else if (cardRect.left < cRect.left + 24) {
          const scrollDistance = cardRect.left - cRect.left - 48;
          container.scrollBy({ left: scrollDistance, behavior: "smooth" });
        }
      }
      setTimeout(updateScrollState, 350);
    }
  }, [revealedCount, updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      containerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // İzi tıklayarak istediğin noktaya zıpla
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
    containerRef.current.scrollTo({
      left: ratio * maxScroll,
      behavior: "smooth",
    });
  };

  // Thumb fare ile sürükleme
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    if (containerRef.current) {
      dragRef.current = {
        startX: e.clientX,
        startScrollLeft: containerRef.current.scrollLeft,
      };
    }
  };

  // Thumb dokunmatik (mobil) sürükleme
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && containerRef.current) {
      dragRef.current = {
        startX: e.touches[0].clientX,
        startScrollLeft: containerRef.current.scrollLeft,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current || !containerRef.current || !trackRef.current || e.touches.length !== 1) return;
    const trackWidth = trackRef.current.clientWidth;
    if (trackWidth <= 0) return;
    const deltaX = e.touches[0].clientX - dragRef.current.startX;
    const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
    const deltaScroll = (deltaX / trackWidth) * maxScroll;
    containerRef.current.scrollLeft = dragRef.current.startScrollLeft + deltaScroll;
  };

  const handleTouchEnd = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current || !trackRef.current) return;
      const trackWidth = trackRef.current.clientWidth;
      if (trackWidth <= 0) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
      const deltaScroll = (deltaX / trackWidth) * maxScroll;
      containerRef.current.scrollLeft = dragRef.current.startScrollLeft + deltaScroll;
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const totalClubs = career.length;
  const currentOpenClubs = Math.min(revealedCount, totalClubs);
  const thumbLeftPct = scrollProgress * (100 - thumbWidthPct);

  return (
    <div
      className={
        embedded
          ? "w-full bg-slate-50/85 rounded-3xl p-3.5 sm:p-5 border border-slate-200/90 shadow-inner"
          : "w-full bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-950/10"
      }
    >
      {/* 1. ÜST BAŞLIK, İLERLEME SAYACI VE HIZLI GEÇİŞ */}
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-200/80">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-800 border border-emerald-300/70 shadow-2xs">
            <Milestone className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-slate-950 uppercase font-sans">
              Transfer & Kariyer Rotası
            </h2>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              İlk kulüpten günümüze transfer kronolojisi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Kulüp Sayacı Rozeti */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-700 bg-white px-2.5 sm:px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
            <span className="text-emerald-700 font-black text-xs">{currentOpenClubs}</span>
            <span className="text-slate-300">/</span>
            <span>{totalClubs} kulüp açık</span>
          </div>

          {/* Üst Küçük Hızlı Kaydırma Butonları */}
          {totalClubs > 4 && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                title="Sola kaydır"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-950 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                title="Sağa kaydır"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. YATAY TRANSFER ROTASI (ZENGİNLEŞTİRİLMİŞ KULÜP KARTLARI) */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto no-scrollbar py-2.5 px-3 sm:px-6 scroll-smooth select-none"
      >
        <div
          className={`flex items-start py-1 min-w-max ${
            !hasOverflow && totalClubs <= 4 ? "mx-auto justify-center" : "justify-start"
          }`}
          style={{ justifyContent: hasOverflow ? "flex-start" : "safe center" }}
        >
          {career.map((item, index) => {
            const isRevealed = isGameOver || index < revealedCount;
            const isLatest = index === revealedCount - 1 && !isGameOver;
            const isNextUp = index === revealedCount && !isGameOver;

            return (
              <div
                key={index}
                ref={isLatest ? latestCardRef : null}
                className="flex items-start shrink-0"
              >
                {/* Kulüp Kartı Sütunu */}
                <div className="flex flex-col items-center w-24 sm:w-28 md:w-32 group">
                  {/* KULÜP KUTUCUĞU (Özel Kart Tasarımı) */}
                  <div
                    className={`relative w-22 h-22 sm:w-26 sm:h-26 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 flex items-center justify-center transition-all duration-300 select-none ${
                      isRevealed
                        ? isLatest
                          ? "bg-gradient-to-b from-white via-emerald-50/40 to-white border-2 border-emerald-500 ring-4 ring-emerald-500/25 shadow-lg shadow-emerald-500/20 animate-neon-pulse animate-club-reveal scale-[1.03]"
                          : "bg-gradient-to-b from-white via-slate-50/90 to-slate-100/80 border-2 border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 hover:-translate-y-1"
                        : isNextUp
                        ? "bg-gradient-to-b from-emerald-50/40 via-white to-emerald-50/30 border-2 border-dashed border-emerald-500/70 hover:border-emerald-600 shadow-sm hover:shadow-md"
                        : "bg-gradient-to-b from-slate-100 to-slate-200/80 border-2 border-slate-200/80 shadow-inner hover:border-slate-300 [background-image:radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:10px_10px]"
                    }`}
                  >
                    {isRevealed ? (
                      <>
                        {/* Kart Üstü Parlak Cam Yansıması */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/80 via-white/30 to-transparent rounded-t-2xl pointer-events-none" />

                        {/* Logo Podyumu (Logonun net ve parlak görünmesi için iç yuva) */}
                        <div className="w-full h-full rounded-xl sm:rounded-2xl bg-white/95 border border-slate-200/60 flex items-center justify-center shadow-2xs relative z-10 p-1 sm:p-1.5">
                          <ClubLogo
                            clubName={item.club}
                            size="xl"
                            className="w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16 drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>

                        {/* Son Açılan Vurgusu - Üst Taç Rozeti */}
                        {isLatest && (
                          <div className="absolute -top-2.5 inset-x-0 flex justify-center pointer-events-none z-20">
                            <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md border border-emerald-300/60 whitespace-nowrap">
                              <Sparkles className="w-2 h-2 text-amber-300 animate-spin" style={{ animationDuration: "5s" }} />
                              <span>Son Açılan</span>
                            </span>
                          </div>
                        )}

                        {/* Kiralık Rozeti - Sağ Altta Şık Transfer Etiketi */}
                        {item.isLoan && (
                          <div className="absolute -bottom-1.5 -right-1 z-20 pointer-events-none">
                            <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[7px] sm:text-[7.5px] font-black uppercase tracking-wider shadow-xs ring-2 ring-white">
                              Kiralık
                            </span>
                          </div>
                        )}
                      </>
                    ) : isNextUp ? (
                      /* SIRADAKİ KİLİTLİ KULÜP (Özel hedef kartı formatı) */
                      <div className="flex flex-col items-center justify-center text-center relative z-10">
                        {/* Sıradaki Rozeti */}
                        <div className="absolute -top-4 inset-x-0 flex justify-center pointer-events-none">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[7.5px] font-black uppercase tracking-wider flex items-center gap-1 shadow-2xs whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                            <span>Sıradaki</span>
                          </span>
                        </div>

                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100/80 border border-emerald-300/80 flex flex-col items-center justify-center text-emerald-700 shadow-inner mt-1">
                          <Lock className="w-4 h-4 text-emerald-600 animate-pulse stroke-[2.2]" />
                          <span className="font-mono font-black text-sm text-emerald-800 mt-0.5">?</span>
                        </div>
                        <span className="text-[7.5px] font-mono font-bold text-emerald-700 uppercase tracking-widest mt-1">
                          Açılacak
                        </span>
                      </div>
                    ) : (
                      /* DİĞER KİLİTLİ KULÜPLER (Gizemli Kasa & Taktik Görünüm) */
                      <div className="flex flex-col items-center justify-center text-center relative z-10">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/80 border border-slate-300/70 flex flex-col items-center justify-center shadow-2xs backdrop-blur-xs">
                          <Lock className="w-3 h-3 text-slate-400 mb-0.5" />
                          <span className="font-mono font-black text-sm text-slate-500 leading-none">?</span>
                        </div>
                        <span className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Kilitli
                        </span>
                      </div>
                    )}
                  </div>

                  {/* KUTUNUN ALTINDAKİ İSİM VE BİLGİLER */}
                  <div className="mt-2 text-center w-full px-1">
                    {/* Kulüp İsmi veya Kilitli Sırası */}
                    <div
                      className={`text-xs sm:text-sm font-black leading-snug text-center break-words line-clamp-2 min-h-[2.1rem] sm:min-h-[2.4rem] flex items-center justify-center transition-colors ${
                        isRevealed
                          ? "text-slate-950 group-hover:text-emerald-700"
                          : isNextUp
                          ? "text-emerald-800 font-extrabold"
                          : "text-slate-400 font-bold"
                      }`}
                      title={isRevealed ? item.club : `${index + 1}. Kulüp`}
                    >
                      {isRevealed ? item.club : `${index + 1}. Kulüp`}
                    </div>

                    {/* Transfer Yılları */}
                    {isRevealed ? (
                      <div className="text-[10px] sm:text-[11px] font-mono font-black mt-1 px-2.5 py-0.5 rounded-lg inline-flex items-center justify-center whitespace-nowrap bg-emerald-50 text-emerald-950 border border-emerald-300/80 shadow-2xs">
                        {item.years}
                      </div>
                    ) : (
                      <div className="text-[9.5px] font-mono font-bold mt-1 px-2 py-0.5 rounded-md inline-flex items-center justify-center text-slate-400 bg-slate-100/70 border border-slate-200/70">
                        ???? - ????
                      </div>
                    )}

                    {/* Lig Bilgisi (Açıksa) */}
                    {(showLeague || isGameOver) && item.league && isRevealed && (
                      <div className="text-[9.5px] sm:text-[10.5px] font-semibold text-slate-500 mt-0.5 line-clamp-1">
                        {item.league}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. TRANSFER OKU */}
                {index < totalClubs - 1 && (
                  <div className="h-22 sm:h-26 md:h-28 flex items-center justify-center px-1 sm:px-2 shrink-0">
                    <div
                      className={`rounded-full flex items-center justify-center transition-all ${
                        index < revealedCount - 1 || isGameOver
                          ? "w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-2 border-emerald-300 shadow-2xs ring-2 ring-emerald-500/15"
                          : "w-6 h-6 sm:w-7 sm:h-7 bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <ArrowRight
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          index < revealedCount - 1 || isGameOver
                            ? "stroke-[3] text-emerald-700"
                            : "stroke-[2] text-slate-400"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. İNTERAKTİF TRANSFER ROTASI KAYDIRMA BARI (Gezinti & İstediğin Kulübe Bakma) */}
      {(hasOverflow || totalClubs > 4) && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 flex items-center gap-2 sm:gap-3 select-none">
          {/* Sol Kaydır Oku */}
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
            title="Önceki kulüplere dön"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Kaydırma İzi (Track & Draggable Thumb) */}
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="relative flex-1 h-3.5 bg-slate-200/90 hover:bg-slate-300/80 rounded-full cursor-pointer transition-colors p-0.5 overflow-hidden"
            title="İstediğiniz kulübe gitmek için tıklayın veya sürükleyin"
          >
            {/* Arka plan minik kulüp istasyon noktaları */}
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none opacity-40">
              {career.map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full ${
                    i < revealedCount ? "bg-emerald-600" : "bg-slate-400"
                  }`}
                />
              ))}
            </div>

            {/* Draggable Slider Thumb */}
            <div
              style={{
                left: `${thumbLeftPct}%`,
                width: `${thumbWidthPct}%`,
              }}
              onMouseDown={handleThumbMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-sm cursor-grab active:cursor-grabbing hover:brightness-110 flex items-center justify-center transition-[background-color,filter] duration-75 ${
                isDragging ? "cursor-grabbing brightness-110 ring-2 ring-emerald-400/50" : ""
              }`}
            >
              {/* Tutamaç çizgisi */}
              <div className="w-4 h-1 bg-white/90 rounded-full shadow-2xs" />
            </div>
          </div>

          {/* Sağ Kaydır Oku */}
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-black hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
            title="Sonraki kulüplere git"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
