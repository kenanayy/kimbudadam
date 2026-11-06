import { MultiplayerRoom, MultiplayerPlayer, RoomStatus } from "@/types/multiplayer";
import { PLAYERS } from "@/data/players";

// Next.js dev reloads ve serverless process'lerde kaybolmaması için globalThis kullanımı
declare global {
  // eslint-disable-next-line no-var
  var __multiplayer_rooms: Map<string, MultiplayerRoom> | undefined;
}

if (!globalThis.__multiplayer_rooms) {
  globalThis.__multiplayer_rooms = new Map<string, MultiplayerRoom>();
}

const rooms = globalThis.__multiplayer_rooms;

// Güvenlik & Bellek Sınırları
const MAX_CONCURRENT_ROOMS = 500;
const ALLOWED_EMOJIS = new Set(["🔥", "👏", "😱", "😂", "⚽", "🧤", "🤫", "🎯", "👑", "💪"]);

/**
 * Kullanıcı girdilerini temizler (XSS & UI Bozulma Koruması)
 */
function sanitizeInput(str: unknown, maxLen: number = 20): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/[<>&"'/`]/g, "")
    .trim()
    .slice(0, maxLen);
}

/**
 * 5 adet rastgele futbolcu seçer
 */
function pickRandomPlayerIds(count: number = 5): string[] {
  const shuffled = [...PLAYERS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((p) => p.id);
}

/**
 * Güvenli ve çakışmasız oda kodu üretir (Sonsuz özyineleme/recursion engellendi)
 */
function generateRoomCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";

  for (let attempt = 0; attempt < 30; attempt++) {
    let code = "";
    for (let i = 0; i < 2; i++) {
      code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 2; i++) {
      code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    if (!rooms.has(code)) {
      return code;
    }
  }

  // Aşırı yoğunluk durumunda 6 haneli benzersiz güvenli kod
  return "M" + Math.random().toString(36).substring(2, 7).toUpperCase();
}

/**
 * Eski veya terk edilmiş odaları temizler (Bellek şişme koruması)
 */
function cleanupExpiredRooms() {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    // 1 saatten eski veya 15 dakikadır hareketsiz odaları sil
    const isOld = now - room.createdAt > 60 * 60 * 1000;
    const isInactive = now - (room.host.lastActive || room.createdAt) > 15 * 60 * 1000;
    const isFinished = room.status === "GAME_OVER" && now - room.createdAt > 10 * 60 * 1000;

    if (isOld || isInactive || isFinished) {
      rooms.delete(code);
    }
  }
}

/**
 * 🛡️ HİLE KORUMASI: İstemciye giden oda verisini sansürler
 * Tur devam ederken gizli futbolcu kimliği (ID, İsim, Fotoğraf) asla istemciye gönderilmez!
 * Yalnızca o turun kulüp transfer rotası gönderilir.
 */
export function sanitizeRoomForClient(rawRoom: MultiplayerRoom): MultiplayerRoom {
  const targetId = rawRoom.playerIds?.[rawRoom.currentRoundIndex];
  const targetPlayer = PLAYERS.find((p) => p.id === targetId);

  const isRoundFinished = rawRoom.status === "ROUND_OVER" || rawRoom.status === "GAME_OVER";

  return {
    ...rawRoom,
    // playerIds dizisi ASLA istemciye sızdırılmaz!
    playerIds: isRoundFinished ? [targetId || ""] : [],
    // O anki turun kariyeri (CareerTimeline için anonim liste)
    currentCareer: targetPlayer ? targetPlayer.career : [],
    // Yalnızca tur bittiğinde veya maç tamamlandığında oyuncu bilgisi açılır
    revealedPlayer: isRoundFinished ? targetPlayer || null : null,
  };
}

export const multiplayerStore = {
  sanitizeRoomForClient,

  /**
   * Yeni bir 1v1 oda oluşturur
   */
  createRoom(
    hostName: string,
    customCode?: string
  ): { room: MultiplayerRoom; playerId: string } | { error: string } {
    cleanupExpiredRooms();

    if (rooms.size >= MAX_CONCURRENT_ROOMS) {
      return { error: "Sunucu oda kapasitesi dolu. Lütfen birkaç dakika sonra tekrar deneyin." };
    }

    const cleanHostName = sanitizeInput(hostName, 20) || "1. Oyuncu";
    const cleanCustomCode = customCode
      ? sanitizeInput(customCode, 6).toUpperCase().replace(/[^A-Z0-9]/g, "")
      : "";

    let code = cleanCustomCode;
    if (code) {
      if (rooms.has(code)) {
        return { error: `"${code}" kodlu oda zaten mevcut! Başka bir kod seçin veya boş bırakın.` };
      }
    } else {
      code = generateRoomCode();
    }

    const hostId = "p_" + Math.random().toString(36).substring(2, 9);
    const playerIds = pickRandomPlayerIds(5);

    const host: MultiplayerPlayer = {
      id: hostId,
      name: cleanHostName,
      score: 0,
      isReady: true,
      lastActive: Date.now(),
    };

    const newRoom: MultiplayerRoom = {
      code,
      status: "WAITING",
      host,
      guest: null,
      roundWinnerId: null,
      roundsCount: 5,
      currentRoundIndex: 0,
      playerIds,
      revealedClubCount: 1,
      roundStartTime: Date.now(),
      roundDurationSeconds: 45,
      actionNotice: `Oda kuruldu! Kod: ${code}. 2. Oyuncu bekleniyor...`,
      recentGuesses: [],
      rematchVotes: [],
      createdAt: Date.now(),
    };

    rooms.set(code, newRoom);
    return { room: newRoom, playerId: hostId };
  },

  /**
   * Mevcut bir odaya katılır
   */
  joinRoom(code: string, guestName: string): { room: MultiplayerRoom; playerId: string } | { error: string } {
    const cleanCode = sanitizeInput(code, 6).toUpperCase();
    const cleanGuestName = sanitizeInput(guestName, 20) || "2. Oyuncu";

    const room = rooms.get(cleanCode);

    if (!room) {
      return { error: "Oda bulunamadı! Lütfen kodu kontrol edin." };
    }

    if (room.guest && room.guest.id) {
      return { error: "Bu oda maalesef dolu! (2/2 oyuncu)" };
    }

    const guestId = "p_" + Math.random().toString(36).substring(2, 9);
    const guest: MultiplayerPlayer = {
      id: guestId,
      name: cleanGuestName,
      score: 0,
      isReady: true,
      lastActive: Date.now(),
    };

    room.guest = guest;
    room.status = "STARTING";
    room.actionNotice = `${guest.name} odaya katıldı! Maç birazdan başlıyor...`;
    room.roundStartTime = Date.now();
    room.transitionAt = Date.now() + 2500; // 2.5 saniye sonra PLAYING durumuna geç

    return { room, playerId: guestId };
  },

  /**
   * Serverless Uyumlu Durum Senkronizasyonu:
   * Node süreci (container) dursa bile zaman damgaları (timestamp) ile
   * odayı her sorgulamada otomatik olarak doğru faza ilerletir.
   */
  syncRoomState(room: MultiplayerRoom): MultiplayerRoom {
    const now = Date.now();

    // 1. STARTING -> PLAYING geçişi (Maç başlangıcı sayacı)
    if (room.status === "STARTING") {
      if (room.transitionAt && now >= room.transitionAt) {
        room.status = "PLAYING";
        room.transitionAt = undefined;
        room.roundStartTime = now;
        room.revealedClubCount = 1;
        room.recentGuesses = [];
        room.actionNotice = "1. Tur Başladı! Kim Bu Adam?";
      }
    }

    // 2. PLAYING -> ROUND_OVER geçişi (45 saniyelik sürenin dolması)
    if (room.status === "PLAYING") {
      const elapsedSeconds = Math.floor((now - room.roundStartTime) / 1000);
      if (elapsedSeconds >= room.roundDurationSeconds) {
        room.status = "ROUND_OVER";
        room.roundWinnerId = null;
        room.transitionAt = now + 3500; // 3.5 saniye kutlama / açığa çıkma süresi
        room.actionNotice = "⏱️ Süre Doldu! Bu turda gol çıkmadı.";
      }
    }

    // 3. ROUND_OVER -> Sıradaki Tura (PLAYING) veya Maç Sonuna (GAME_OVER) geçiş
    if (room.status === "ROUND_OVER") {
      if (room.transitionAt && now >= room.transitionAt) {
        const nextRound = room.currentRoundIndex + 1;
        if (nextRound >= room.roundsCount) {
          // MAÇ TAMAMLANDI
          room.status = "GAME_OVER";
          room.transitionAt = undefined;
          const hostScore = room.host.score;
          const guestScore = room.guest?.score || 0;
          if (hostScore > guestScore) {
            room.actionNotice = `🏆 MAÇ SONUCU: ${room.host.name} KAZANDI! (${hostScore} - ${guestScore})`;
          } else if (guestScore > hostScore) {
            room.actionNotice = `🏆 MAÇ SONUCU: ${room.guest?.name || "Misafir"} KAZANDI! (${guestScore} - ${hostScore})`;
          } else {
            room.actionNotice = `🤝 MAÇ SONUCU: DOSTLUK KAZANDI! BERABERE (${hostScore} - ${guestScore})`;
          }
        } else {
          // YENİ TUR BAŞLAT
          room.currentRoundIndex = nextRound;
          room.revealedClubCount = 1;
          room.roundWinnerId = null;
          room.status = "PLAYING";
          room.transitionAt = undefined;
          room.roundStartTime = now;
          room.actionNotice = `${nextRound + 1}. Tur Başladı! Hızlı olan kazanır!`;
          room.recentGuesses = [];
          if (room.host) {
            room.host.lastGuess = undefined;
            room.host.isCorrect = undefined;
          }
          if (room.guest) {
            room.guest.lastGuess = undefined;
            room.guest.isCorrect = undefined;
          }
        }
      }
    }

    return room;
  },

  /**
   * Odanın durumunu sorgular (Heartbeat / Polling)
   */
  getRoom(code: string, playerId?: string): MultiplayerRoom | null {
    const cleanCode = sanitizeInput(code, 6).toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) return null;

    // Oyuncunun aktiflik zamanını güncelle
    if (playerId) {
      if (room.host.id === playerId) room.host.lastActive = Date.now();
      if (room.guest?.id === playerId) room.guest.lastActive = Date.now();
    }

    // Durum senkronizasyonu
    this.syncRoomState(room);

    return room;
  },

  /**
   * Turu bitirir ve sıradaki tura veya maç sonuna hazırlar
   */
  finishRound(code: string, winnerId: string | null, notice: string) {
    const room = rooms.get(code);
    if (!room || room.status !== "PLAYING") return;

    room.status = "ROUND_OVER";
    room.roundWinnerId = winnerId;
    room.transitionAt = Date.now() + 3500; // 3.5 saniye sonra sonraki tura geç
    room.actionNotice = notice;

    if (winnerId) {
      if (room.host.id === winnerId) room.host.score += 1;
      if (room.guest && room.guest.id === winnerId) room.guest.score += 1;
    }
  },

  /**
   * Tahmin yapar
   */
  submitGuess(
    code: string,
    playerId: string,
    guessedPlayerId: string
  ): { room: MultiplayerRoom; isCorrect: boolean } | { error: string } {
    const cleanCode = sanitizeInput(code, 6).toUpperCase();
    const cleanPlayerId = sanitizeInput(playerId, 40);
    const cleanGuessedId = sanitizeInput(guessedPlayerId, 60);

    const room = rooms.get(cleanCode);
    if (!room) return { error: "Oda bulunamadı" };

    // Önce durum senkronizasyonu yap (Süre dolduysa durumu günceller)
    this.syncRoomState(room);

    if (room.status !== "PLAYING") return { error: "Oyun şu anda tahmin kabul etmiyor" };

    const targetPlayerId = room.playerIds[room.currentRoundIndex];
    const targetPlayer = PLAYERS.find((p) => p.id === targetPlayerId);
    const guessedPlayer = PLAYERS.find((p) => p.id === cleanGuessedId);

    const playerName =
      room.host.id === cleanPlayerId ? room.host.name : room.guest?.name || "Rakip";

    // Büyük/küçük harf duyarsız ve boşluksuz ID karşılaştırması
    const isCorrect =
      Boolean(cleanGuessedId && targetPlayerId) &&
      cleanGuessedId.trim().toLowerCase() === targetPlayerId.trim().toLowerCase();

    const guessedPlayerName = guessedPlayer?.name || cleanGuessedId;

    const guessEvent = {
      id: "g_" + Math.random().toString(36).substring(2, 9),
      playerId: cleanPlayerId,
      playerName,
      guessedPlayerName,
      isCorrect,
      timestamp: Date.now(),
    };

    if (!room.recentGuesses) {
      room.recentGuesses = [];
    }
    room.recentGuesses = [guessEvent, ...room.recentGuesses].slice(0, 10);

    if (room.host.id === cleanPlayerId) {
      room.host.lastGuess = guessedPlayerName;
      room.host.isCorrect = isCorrect;
    } else if (room.guest) {
      room.guest.lastGuess = guessedPlayerName;
      room.guest.isCorrect = isCorrect;
    }

    if (isCorrect) {
      // DOĞRU BİLDİ - GOL!
      this.finishRound(
        cleanCode,
        cleanPlayerId,
        `⚽ GOOOOL! ${playerName} doğru bildi: ${targetPlayer?.name || guessedPlayerName}`
      );
      return { room, isCorrect: true };
    } else {
      // YANLIŞ TAHMİN
      room.actionNotice = `${playerName} yanlış tahmin yaptı: "${guessedPlayerName}"`;
      return { room, isCorrect: false };
    }
  },

  /**
   * Pes etme / Turu terk etme
   */
  forfeitRound(code: string, playerId: string): { room: MultiplayerRoom } | { error: string } {
    const cleanCode = sanitizeInput(code, 6).toUpperCase();
    const cleanPlayerId = sanitizeInput(playerId, 40);

    const room = rooms.get(cleanCode);
    if (!room) return { error: "Oda bulunamadı" };

    this.syncRoomState(room);
    if (room.status !== "PLAYING") return { error: "Oyun şu anda aktif değil" };

    const forfeiterName =
      room.host.id === cleanPlayerId ? room.host.name : room.guest?.name || "Oyuncu";
    const opponentId =
      room.host.id === cleanPlayerId ? room.guest?.id || null : room.host.id;
    const opponentName =
      room.host.id === cleanPlayerId ? room.guest?.name || "Rakip" : room.host.name;

    const targetPlayerId = room.playerIds[room.currentRoundIndex];
    const targetPlayer = PLAYERS.find((p) => p.id === targetPlayerId);

    this.finishRound(
      cleanCode,
      opponentId,
      `🏳️ ${forfeiterName} pes etti! Gol ${opponentName}'e yazıldı. Doğru cevap: ${targetPlayer?.name || ""}`
    );

    return { room };
  },

  /**
   * Pas geçildiğinde sıradaki kulübü açar
   */
  skipPass(code: string, playerId: string): { room: MultiplayerRoom } | { error: string } {
    const cleanCode = sanitizeInput(code, 6).toUpperCase();
    const cleanPlayerId = sanitizeInput(playerId, 40);

    const room = rooms.get(cleanCode);
    if (!room) return { error: "Oda bulunamadı" };
    if (room.status !== "PLAYING") return { error: "Şu an pas geçilemez" };

    const targetPlayerId = room.playerIds[room.currentRoundIndex];
    const targetPlayer = PLAYERS.find((p) => p.id === targetPlayerId);
    const maxClubs = targetPlayer?.career.length || 6;

    if (room.revealedClubCount < maxClubs) {
      room.revealedClubCount += 1;
    }

    const playerName =
      room.host.id === cleanPlayerId ? room.host.name : room.guest?.name || "Rakip";

    room.actionNotice = `${playerName} pas geçti (+1 Kulüp Açıldı)`;
    return { room };
  },

  /**
   * Rövanş isteği
   */
  requestRematch(code: string, playerId: string): MultiplayerRoom | null {
    const cleanCode = sanitizeInput(code, 6).toUpperCase();
    const cleanPlayerId = sanitizeInput(playerId, 40);

    const room = rooms.get(cleanCode);
    if (!room) return null;

    if (!room.rematchVotes.includes(cleanPlayerId)) {
      room.rematchVotes.push(cleanPlayerId);
    }

    // Her iki oyuncu da rövanş istediyse maçı sıfırla ve yeniden başlat
    if (room.rematchVotes.length >= 2) {
      room.playerIds = pickRandomPlayerIds(5);
      room.currentRoundIndex = 0;
      room.revealedClubCount = 1;
      room.roundWinnerId = null;
      room.recentGuesses = [];
      room.rematchVotes = [];
      room.host.score = 0;
      room.host.lastGuess = undefined;
      room.host.isCorrect = undefined;
      if (room.guest) {
        room.guest.score = 0;
        room.guest.lastGuess = undefined;
        room.guest.isCorrect = undefined;
      }
      room.status = "PLAYING";
      room.roundStartTime = Date.now();
      room.actionNotice = "🔥 RÖVANŞ BAŞLADI! 1. Tur!";
    } else {
      const who = room.host.id === cleanPlayerId ? room.host.name : room.guest?.name || "Rakip";
      room.actionNotice = `${who} rövanş istiyor! (1/2)`;
    }

    return room;
  },

  /**
   * Canlı emoji reaksiyonu gönderir (Emoji Whitelist korumalı)
   */
  sendReaction(code: string, playerId: string, emoji: string): { room: MultiplayerRoom } | { error: string } {
    const cleanCode = sanitizeInput(code, 6).toUpperCase();
    const cleanPlayerId = sanitizeInput(playerId, 40);
    const safeEmoji = ALLOWED_EMOJIS.has(emoji) ? emoji : "⚽";

    const room = rooms.get(cleanCode);
    if (!room) return { error: "Oda bulunamadı" };

    const senderName =
      room.host.id === cleanPlayerId ? room.host.name : room.guest?.name || "Rakip";

    const reaction = {
      id: "r_" + Math.random().toString(36).substring(2, 9),
      senderId: cleanPlayerId,
      senderName,
      emoji: safeEmoji,
      timestamp: Date.now(),
    };

    room.latestReaction = reaction;
    return { room };
  },
};
