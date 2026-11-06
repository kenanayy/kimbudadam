import { PLAYERS } from "@/data/players";
import { Player } from "@/types/player";
import { DailyGameResult, DailyStats, DailyChallengeInfo } from "@/types/daily";

const DAILY_STORAGE_PREFIX = "football_guess_daily_";
const DAILY_STATS_KEY = "football_guess_daily_stats";

// Türkiye saati (UTC+3) ve gün hesaplaması
export function getTurkeyDate(customNow?: Date): {
  dateStr: string;
  dayNumber: number;
  formattedDate: string;
  nextMidnightMs: number;
} {
  const now = customNow || new Date();

  // YYYY-MM-DD biçimi (Türkiye zaman diliminde)
  const trFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateStr = trFormatter.format(now);

  // Gün Sayısı (#675 vb. - Başlangıç 1 Ocak 2025)
  const epoch = new Date("2025-01-01T00:00:00Z");
  const current = new Date(`${dateStr}T00:00:00Z`);
  const dayNumber = Math.max(
    1,
    Math.floor((current.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  // Şık Türkçe tarih formatı (örn: "6 Kasım 2026")
  const formattedDate = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  // Bir sonraki gece yarısına (00:00 TR) kalan milisaniye
  // Türkiye UTC+3 sabit saatindedir (DST yoktur)
  const nowUtc = now.getTime() + now.getTimezoneOffset() * 60000;
  const turkeyNow = new Date(nowUtc + 3 * 3600000);
  const turkeyTomorrow = new Date(turkeyNow);
  turkeyTomorrow.setHours(24, 0, 0, 0);
  const nextMidnightMs = Math.max(0, turkeyTomorrow.getTime() - turkeyNow.getTime());

  return {
    dateStr,
    dayNumber,
    formattedDate,
    nextMidnightMs,
  };
}

// Belirli bir gün için deterministik ve adil futbolcu seçimi
export function getDailyPlayer(dayNumber: number): Player {
  // En az 2 kulübü olan oyuncu havuzundan seç
  const candidates = PLAYERS.filter((p) => p.career && p.career.length >= 2);
  const pool = candidates.length > 0 ? candidates : PLAYERS;

  // Deterministik 32-bit tamsayı karıştırıcı (Knuth LCG + XORshift)
  let h = (dayNumber * 2654435761) ^ (dayNumber * 1597334677);
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h = (h ^ (h >>> 16)) >>> 0;

  const index = h % pool.length;
  return pool[index];
}

// Günün meydan okuması temel bilgilerini getir
export function getDailyChallengeInfo(): DailyChallengeInfo {
  const { dateStr, dayNumber, formattedDate, nextMidnightMs } = getTurkeyDate();
  const player = getDailyPlayer(dayNumber);
  return {
    dateStr,
    dayNumber,
    formattedDate,
    player,
    nextMidnightMs,
  };
}

// Bugünün kayıtlı sonucunu LocalStorage'dan al
export function getDailyStorage(dateStr: string): DailyGameResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${DAILY_STORAGE_PREFIX}${dateStr}`);
    if (!raw) return null;
    return JSON.parse(raw) as DailyGameResult;
  } catch {
    return null;
  }
}

// Bugünün sonucunu LocalStorage'a kaydet
export function saveDailyStorage(result: DailyGameResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${DAILY_STORAGE_PREFIX}${result.dateStr}`,
      JSON.stringify(result)
    );
  } catch {}
}

// Günlük Mod İstatistiklerini getir
export function getDailyStats(): DailyStats {
  const defaultStats: DailyStats = {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedDate: "",
    guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };

  if (typeof window === "undefined") return defaultStats;
  try {
    const raw = localStorage.getItem(DAILY_STATS_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return {
      ...defaultStats,
      ...parsed,
      guessDistribution: {
        ...defaultStats.guessDistribution,
        ...(parsed.guessDistribution || {}),
      },
    };
  } catch {
    return defaultStats;
  }
}

// Günlük Mod İstatistiklerini güncelle ve kaydet
export function recordDailyGame(
  isWon: boolean,
  attemptsUsed: number,
  dateStr: string
): DailyStats {
  const current = getDailyStats();
  if (current.lastPlayedDate === dateStr) {
    // Bugün zaten istatistiğe işlenmiş
    return current;
  }

  const played = current.played + 1;
  const won = isWon ? current.won + 1 : current.won;

  // Seri kontrolü (dün oynandıysa devam eder, oynanmadıysa sıfırlanır)
  let currentStreak = 0;
  if (isWon) {
    if (current.lastPlayedDate) {
      const yesterday = new Date(new Date(`${dateStr}T00:00:00Z`).getTime() - 86400000)
        .toISOString()
        .slice(0, 10);
      if (current.lastPlayedDate === yesterday) {
        currentStreak = current.currentStreak + 1;
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
  } else {
    currentStreak = 0;
  }

  const maxStreak = Math.max(current.maxStreak, currentStreak);

  // Tahmin dağılımı
  const distribution = { ...current.guessDistribution };
  if (isWon && attemptsUsed >= 1 && attemptsUsed <= 6) {
    const key = attemptsUsed as 1 | 2 | 3 | 4 | 5 | 6;
    distribution[key] = (distribution[key] || 0) + 1;
  }

  const updated: DailyStats = {
    played,
    won,
    currentStreak,
    maxStreak,
    lastPlayedDate: dateStr,
    guessDistribution: distribution,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(updated));
    } catch {}
  }

  return updated;
}

// Kalan milisaniyeyi "13s 45dk 20sn" formatına çevir
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "00s 00dk 00sn";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}s ${pad(minutes)}dk ${pad(seconds)}sn`;
}

// 🟩 Spoiler İçermeyen (Wordle Usulü) Paylaşım Metni Oluşturucu
export function generateDailyShareText(
  result: DailyGameResult,
  stats: DailyStats,
  siteUrl: string = typeof window !== "undefined" ? window.location.origin : "https://kimbüadam.com"
): string {
  const statusLine = result.isWon
    ? `🎯 ${result.attemptsUsed}/${result.maxAttempts} Tahminde Bildim!`
    : `❌ ${result.maxAttempts}/${result.maxAttempts} - Bugün Bulamadım!`;

  // Her tahmin için açılan kulüp ve tahmin kutucukları
  const gridRows: string[] = [];
  const maxClubs = Math.max(1, result.revealedClubCount);

  result.guesses.forEach((g, idx) => {
    const revealedAtStep = Math.min(idx + 1, maxClubs);
    if (g.isCorrect) {
      // Doğru bildiği satır: Yeşil kutucuklar
      const greenBoxes = "🟩".repeat(revealedAtStep);
      gridRows.push(`${greenBoxes} ⚽`);
    } else {
      // Yanlış tahmin satırı: Kırmızı kutucuklar
      const redBoxes = "🟥".repeat(revealedAtStep);
      gridRows.push(`${redBoxes} ❌`);
    }
  });

  const gridText = gridRows.join("\n");
  const streakLine = stats.currentStreak > 1 ? `🔥 Günlük Seri: ${stats.currentStreak} Gün\n` : "";

  return `⚽ Kim Bu Adam? // Günün Futbolcusu #${result.dayNumber}
📅 ${result.dateStr}
${statusLine}

${gridText}

${streakLine}👉 Sen de dene: ${siteUrl}`;
}

