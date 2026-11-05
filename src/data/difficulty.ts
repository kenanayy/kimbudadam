import { Difficulty, DifficultyConfig } from "@/types/player";

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  KOLAY: {
    name: "KOLAY",
    label: "Kolay",
    maxAttempts: 5,
    initialRevealedClubs: 2,
    showLeague: true,
    scoreMultiplier: 1,
    description: "5 Hak • 3 Joker • İlk 2 Kulüp Açık",
  },
  ORTA: {
    name: "ORTA",
    label: "Orta",
    maxAttempts: 4,
    initialRevealedClubs: 1,
    showLeague: true,
    scoreMultiplier: 2,
    description: "4 Hak • 2 Joker (+1 Kulüp, Forma No) • İlk Kulüp Açık",
  },
  ZOR: {
    name: "ZOR",
    label: "Zor",
    maxAttempts: 4,
    initialRevealedClubs: 1,
    showLeague: false,
    scoreMultiplier: 3,
    description: "4 Hak • 1 Joker (Yalnızca Forma No) • Ligler Gizli",
  },
  EFSANE: {
    name: "EFSANE",
    label: "Efsane",
    maxAttempts: 3,
    initialRevealedClubs: 1,
    showLeague: false,
    scoreMultiplier: 5,
    description: "3 Hak • Sıfır Joker • Sıfır İpucu (Futbol Gurmesi Modu)",
  },
};

