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

/**
 * 5 adet rastgele futbolcu seçer
 */
function pickRandomPlayerIds(count: number = 5): string[] {
  const shuffled = [...PLAYERS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((p) => p.id);
}

/**
 * Kolay okunabilir 4 haneli rastgele oda kodu üretir
 */
function generateRoomCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  let code = "";
  for (let i = 0; i < 2; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 2; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  // Eğer bu kod zaten varsa yeniden dene
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

/**
 * Odayı temizleme (2 saatten eski odaları siler)
 */
function cleanupExpiredRooms() {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > 2 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}

export const multiplayerStore = {
  /**
   * Yeni bir 1v1 oda oluşturur
   */
  createRoom(hostName: string, customCode?: string): { room: MultiplayerRoom; playerId: string } {
    cleanupExpiredRooms();

    const code = (customCode?.trim().toUpperCase() || generateRoomCode()).replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const hostId = "p_" + Math.random().toString(36).substring(2, 9);
    const playerIds = pickRandomPlayerIds(5);

    const host: MultiplayerPlayer = {
      id: hostId,
      name: hostName.trim() || "1. Oyuncu",
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
    const cleanCode = code.trim().toUpperCase();
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
      name: guestName.trim() || "2. Oyuncu",
      score: 0,
      isReady: true,
      lastActive: Date.now(),
    };

    room.guest = guest;
    room.status = "STARTING";
    room.actionNotice = `${guest.name} odaya katıldı! Maç birazdan başlıyor...`;
    room.roundStartTime = Date.now();

    // 2 saniye sonra maçı başlat
    setTimeout(() => {
      const current = rooms.get(cleanCode);
      if (current && current.status === "STARTING") {
        current.status = "PLAYING";
        current.roundStartTime = Date.now();
        current.revealedClubCount = 1;
        current.recentGuesses = [];
        current.actionNotice = "1. Tur Başladı! Kim Bu Adam?";
      }
    }, 2500);

    return { room, playerId: guestId };
  },

  /**
   * Odanın durumunu sorgular (Heartbeat / Polling)
   */
  getRoom(code: string, playerId?: string): MultiplayerRoom | null {
    const cleanCode = code.trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) return null;

    // Oyuncunun aktiflik zamanını güncelle
    if (playerId) {
      if (room.host.id === playerId) room.host.lastActive = Date.now();
      if (room.guest?.id === playerId) room.guest.lastActive = Date.now();
    }

    // Eğer oyun oynanıyorsa ve süre dolmuşsa turu bitir
    if (room.status === "PLAYING") {
      const elapsedSeconds = Math.floor((Date.now() - room.roundStartTime) / 1000);
      if (elapsedSeconds >= room.roundDurationSeconds) {
        // Süre doldu
        this.finishRound(cleanCode, null, "Süre Doldu! Bu turda gol çıkmadı.");
      }
    }

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
    room.actionNotice = notice;

    if (winnerId) {
      if (room.host.id === winnerId) room.host.score += 1;
      if (room.guest && room.guest.id === winnerId) room.guest.score += 1;
    }

    // 3 saniye sonra sıradaki tura geç veya maçı bitir
    setTimeout(() => {
      const current = rooms.get(code);
      if (!current) return;

      const nextRound = current.currentRoundIndex + 1;
      if (nextRound >= current.roundsCount) {
        // MAÇ BİTTİ
        current.status = "GAME_OVER";
        const hostScore = current.host.score;
        const guestScore = current.guest?.score || 0;
        if (hostScore > guestScore) {
          current.actionNotice = `🏆 MAÇ SONUCU: ${current.host.name} KAZANDI! (${hostScore} - ${guestScore})`;
        } else if (guestScore > hostScore) {
          current.actionNotice = `🏆 MAÇ SONUCU: ${current.guest?.name || "Misafir"} KAZANDI! (${guestScore} - ${hostScore})`;
        } else {
          current.actionNotice = `🤝 MAÇ SONUCU: DOSTLUK KAZANDI! BERABERE (${hostScore} - ${guestScore})`;
        }
      } else {
        // SIRADAKİ TUR
        current.currentRoundIndex = nextRound;
        current.revealedClubCount = 1;
        current.roundWinnerId = null;
        current.status = "PLAYING";
        current.roundStartTime = Date.now();
        current.actionNotice = `${nextRound + 1}. Tur Başladı! Hızlı olan kazanır!`;
        current.recentGuesses = [];
        if (current.host) {
          current.host.lastGuess = undefined;
          current.host.isCorrect = undefined;
        }
        if (current.guest) {
          current.guest.lastGuess = undefined;
          current.guest.isCorrect = undefined;
        }
      }
    }, 3200);
  },

  /**
   * Tahmin yapar
   */
  submitGuess(code: string, playerId: string, guessedPlayerId: string): { room: MultiplayerRoom; isCorrect: boolean } | { error: string } {
    const cleanCode = code.trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) return { error: "Oda bulunamadı" };
    if (room.status !== "PLAYING") return { error: "Oyun şu anda tahmin kabul etmiyor" };

    const targetPlayerId = room.playerIds[room.currentRoundIndex];
    const targetPlayer = PLAYERS.find((p) => p.id === targetPlayerId);
    const guessedPlayer = PLAYERS.find((p) => p.id === guessedPlayerId);

    const playerName =
      room.host.id === playerId ? room.host.name : room.guest?.name || "Rakip";

    const isCorrect = guessedPlayerId === targetPlayerId;
    const guessedPlayerName = guessedPlayer?.name || "Bilinmeyen";

    const guessEvent = {
      id: "g_" + Math.random().toString(36).substring(2, 9),
      playerId,
      playerName,
      guessedPlayerName,
      isCorrect,
      timestamp: Date.now(),
    };

    if (!room.recentGuesses) {
      room.recentGuesses = [];
    }
    room.recentGuesses = [guessEvent, ...room.recentGuesses].slice(0, 10);

    if (room.host.id === playerId) {
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
        playerId,
        `⚽ GOOOOL! ${playerName} doğru bildi: ${targetPlayer?.name || ""}`
      );
      return { room, isCorrect: true };
    } else {
      // YANLIŞ TAHMİN
      room.actionNotice = `${playerName} yanlış tahmin yaptı: "${guessedPlayerName}"`;
      return { room, isCorrect: false };
    }
  },

  /**
   * Pas geçildiğinde sıradaki kulübü açar
   */
  skipPass(code: string, playerId: string): { room: MultiplayerRoom } | { error: string } {
    const cleanCode = code.trim().toUpperCase();
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
      room.host.id === playerId ? room.host.name : room.guest?.name || "Rakip";

    room.actionNotice = `${playerName} pas geçti (+1 Kulüp Açıldı)`;
    return { room };
  },

  /**
   * Rövanş isteği
   */
  requestRematch(code: string, playerId: string): MultiplayerRoom | null {
    const cleanCode = code.trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) return null;

    if (!room.rematchVotes.includes(playerId)) {
      room.rematchVotes.push(playerId);
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
      const who = room.host.id === playerId ? room.host.name : room.guest?.name || "Rakip";
      room.actionNotice = `${who} rövanş istiyor! (1/2)`;
    }

    return room;
  },
};

