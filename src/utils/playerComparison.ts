import { Player } from "@/types/player";

const CONTINENTS: Record<string, string> = {
  // Güney Amerika
  "Brezilya": "Güney Amerika",
  "Arjantin": "Güney Amerika",
  "Uruguay": "Güney Amerika",
  "Kolombiya": "Güney Amerika",
  "Şili": "Güney Amerika",
  "Paraguay": "Güney Amerika",
  "Ekvador": "Güney Amerika",
  "Peru": "Güney Amerika",
  "Venezuela": "Güney Amerika",

  // Avrupa
  "Türkiye": "Avrupa",
  "Fransa": "Avrupa",
  "İspanya": "Avrupa",
  "Portekiz": "Avrupa",
  "İngiltere": "Avrupa",
  "Almanya": "Avrupa",
  "İtalya": "Avrupa",
  "Hollanda": "Avrupa",
  "Belçika": "Avrupa",
  "Hırvatistan": "Avrupa",
  "Polonya": "Avrupa",
  "Danimarka": "Avrupa",
  "Norveç": "Avrupa",
  "İsveç": "Avrupa",
  "İsviçre": "Avrupa",
  "Avusturya": "Avrupa",
  "Sırbistan": "Avrupa",
  "Bosna-Hersek": "Avrupa",
  "Çekya": "Avrupa",
  "Macaristan": "Avrupa",
  "Ukrayna": "Avrupa",
  "Gürcistan": "Avrupa",
  "Galler": "Avrupa",
  "İskoçya": "Avrupa",
  "Kuzey İrlanda": "Avrupa",
  "İrlanda": "Avrupa",
  "Slovakya": "Avrupa",
  "Romanya": "Avrupa",
  "Yunanistan": "Avrupa",
  "Slovenya": "Avrupa",
  "Arnavutluk": "Avrupa",
  "Kosova": "Avrupa",
  "Karadağ": "Avrupa",
  "Kuzey Makedonya": "Avrupa",
  "İzlanda": "Avrupa",
  "Finlandiya": "Avrupa",

  // Afrika
  "Fas": "Afrika",
  "Nijerya": "Afrika",
  "Fildişi Sahili": "Afrika",
  "Senegal": "Afrika",
  "Mısır": "Afrika",
  "Cezayir": "Afrika",
  "Kamerun": "Afrika",
  "Gana": "Afrika",
  "Mali": "Afrika",
  "Tunus": "Afrika",
  "Kongo DC": "Afrika",
  "Gabon": "Afrika",
  "Gine": "Afrika",
  "Yeşil Burun Adaları": "Afrika",

  // Asya & Okyanusya
  "Japonya": "Asya",
  "Güney Kore": "Asya",
  "Avustralya": "Asya",
  "İran": "Asya",
  "Suudi Arabistan": "Asya",
  "Özbekistan": "Asya",
  "Katar": "Asya",

  // Kuzey & Orta Amerika
  "ABD": "Kuzey Amerika",
  "Kanada": "Kuzey Amerika",
  "Meksika": "Kuzey Amerika",
  "Kosta Rika": "Kuzey Amerika",
  "Jamaika": "Kuzey Amerika",
};

export interface PlayerComparison {
  isPositionMatch: boolean;
  ageDiff: "OLDER" | "YOUNGER" | "EQUAL"; // Hedef futbolcunun yaş durumu
  targetAge: number;
  guessAge: number;
  isCountryMatch: boolean;
  isContinentMatch: boolean;
  guessContinent: string | null;
  commonClub: string | null;
}

/**
 * İki futbolcunun kariyerinde ortak oynadıkları bir kulüp olup olmadığını bulur.
 */
export function getCommonClub(playerA: Player, playerB: Player): string | null {
  if (!playerA?.career || !playerB?.career) return null;

  const clubsA = new Map<string, string>();
  for (const c of playerA.career) {
    const key = c.club.toLowerCase().replace(/^(fc|fk|ac|as|cf|sc)\s+|\s+(fc|fk|ac|as|cf|sc)$/g, "").trim();
    clubsA.set(key, c.club);
  }

  for (const c of playerB.career) {
    const key = c.club.toLowerCase().replace(/^(fc|fk|ac|as|cf|sc)\s+|\s+(fc|fk|ac|as|cf|sc)$/g, "").trim();
    if (clubsA.has(key)) {
      return clubsA.get(key) || c.club;
    }
  }

  return null;
}

/**
 * Tahmin edilen oyuncu ile hedef oyuncuyu karşılaştırır ve sıcak/soğuk ipuçlarını üretir.
 */
export function comparePlayers(target: Player, guess: Player): PlayerComparison {
  const currentYear = 2026;
  const targetAge = currentYear - target.birthYear;
  const guessAge = currentYear - guess.birthYear;

  const isPositionMatch = target.position === guess.position;

  let ageDiff: "OLDER" | "YOUNGER" | "EQUAL" = "EQUAL";
  if (target.birthYear < guess.birthYear) {
    ageDiff = "OLDER"; // Hedef oyuncu daha önce doğmuş = daha yaşlı
  } else if (target.birthYear > guess.birthYear) {
    ageDiff = "YOUNGER"; // Hedef oyuncu daha sonra doğmuş = daha genç
  }

  const isCountryMatch = target.nationality.trim().toLowerCase() === guess.nationality.trim().toLowerCase();

  const targetContinent = CONTINENTS[target.nationality] || null;
  const guessContinent = CONTINENTS[guess.nationality] || null;
  const isContinentMatch = !isCountryMatch && !!targetContinent && targetContinent === guessContinent;

  const commonClub = getCommonClub(target, guess);

  return {
    isPositionMatch,
    ageDiff,
    targetAge,
    guessAge,
    isCountryMatch,
    isContinentMatch,
    guessContinent,
    commonClub,
  };
}

