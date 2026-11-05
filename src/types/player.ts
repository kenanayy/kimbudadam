export type Difficulty = "KOLAY" | "ORTA" | "ZOR" | "EFSANE";
export type Category = "ALL" | "SUPER_LIG" | "WORLD";

export interface DifficultyConfig {
  name: Difficulty;
  label: string;
  maxAttempts: number;
  initialRevealedClubs: number;
  showLeague: boolean;
  scoreMultiplier: number;
  description: string;
}

export interface ClubCareer {
  years: string;
  club: string;
  league?: string;
  isLoan?: boolean;
}

export interface Player {
  id: string;
  name: string;
  fullName?: string;
  nationality: string;
  flag: string;
  position: "Kaleci" | "Defans" | "Orta Saha" | "Forvet";
  birthYear: number;
  currentStatus: string; // e.g., "Al-Nassr", "Emekli", "Real Madrid"
  image?: string;
  career: ClubCareer[];
  hint?: string; // Eğlenceli ekstra ipucu
  tier?: "KOLAY" | "ORTA" | "ZOR";
}

export interface GuessResult {
  player: Player;
  isCorrect: boolean;
  attemptNumber: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  streak: number;
  bestStreak: number;
  totalScore: number;
}
