import { Player, GuessResult } from "@/types/player";

export interface DailyGuessItem {
  playerId: string;
  playerName: string;
  isCorrect: boolean;
  attemptNumber: number;
}

export interface DailyGameResult {
  dateStr: string; // "YYYY-MM-DD"
  dayNumber: number; // e.g. 675
  targetPlayerId: string;
  isWon: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  guesses: DailyGuessItem[];
  revealedClubCount: number;
  completedAt: number;
}

export interface DailyStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string;
  guessDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
  };
}

export interface DailyChallengeInfo {
  dateStr: string;
  dayNumber: number;
  formattedDate: string;
  player: Player;
  nextMidnightMs: number;
}

