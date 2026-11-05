import { Player, GuessResult } from "@/types/player";

export type RoomStatus =
  | "WAITING"     // 2. oyuncu bekleniyor
  | "STARTING"    // Geri sayım (3.. 2.. 1..)
  | "PLAYING"     // Canlı tahmin turu sürüyor
  | "ROUND_OVER"  // Tur bitti (Biri gol attı veya süre doldu)
  | "GAME_OVER";  // Maç bitti (Kupa töreni)

export interface MultiplayerPlayer {
  id: string;
  name: string;
  score: number;       // Atılan gol sayısı
  lastGuess?: string;  // Son tahmin ettiği oyuncu adı
  isCorrect?: boolean;
  isReady: boolean;
  lastActive: number;
}

export interface MultiplayerGuessEvent {
  id: string;
  playerId: string;
  playerName: string;
  guessedPlayerName: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface MultiplayerRoom {
  code: string;               // 4 haneli oda kodu (Örn: "1905", "GOL1")
  status: RoomStatus;
  host: MultiplayerPlayer;
  guest: MultiplayerPlayer | null;
  roundWinnerId: string | null; // Bu tur golü atan oyuncunun ID'si (veya berabere ise null)
  roundsCount: number;        // Toplam tur sayısı (Örn: 5 tur)
  currentRoundIndex: number;  // 0'dan 4'e
  playerIds: string[];        // Maç boyunca sorulacak 5 futbolcunun ID listesi
  revealedClubCount: number;  // O anki futbolcunun kaç kulübünün açık olduğu
  roundStartTime: number;     // Turun başladığı timestamp
  roundDurationSeconds: number; // Her tur için süre (45 saniye)
  actionNotice?: string;      // Ekranda kayan canlı TV bildirimi ("Kenan golü attı! 1-0")
  recentGuesses: MultiplayerGuessEvent[]; // Canlı tahmin akışı (Mind Games)
  rematchVotes: string[];     // Rövanş isteyen oyuncuların ID'leri
  createdAt: number;
}

