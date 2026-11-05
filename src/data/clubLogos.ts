export interface ClubBadgeInfo {
  name: string;
  short: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  badgeShape: "shield" | "circle" | "stripes" | "oval";
  logoUrl?: string;
}

export const CLUB_DATABASE: Record<string, ClubBadgeInfo> = {
  // --- TÜRKİYE SÜPER LİG & KULÜPLERİ ---
  "Galatasaray": {
    name: "Galatasaray",
    short: "GS",
    primaryColor: "#A32638",
    secondaryColor: "#FFB81C",
    textColor: "#FFFFFF",
    badgeShape: "oval",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Galatasaray_Sports_Club_Logo.svg",
  },
  "Fenerbahçe": {
    name: "Fenerbahçe",
    short: "FB",
    primaryColor: "#002D72",
    secondaryColor: "#FFED00",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/tr/8/86/Fenerbah%C3%A7e_SK.png",
  },
  "Beşiktaş": {
    name: "Beşiktaş",
    short: "BJK",
    primaryColor: "#000000",
    secondaryColor: "#E30613",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Besiktas_JK.svg",
  },
  "Trabzonspor": {
    name: "Trabzonspor",
    short: "TS",
    primaryColor: "#7B1829",
    secondaryColor: "#57A5D6",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/tr/a/ab/TrabzonsporAmblemi.png",
  },
  "Başakşehir": {
    name: "Başakşehir",
    short: "IBFK",
    primaryColor: "#002855",
    secondaryColor: "#F47920",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/tr/8/87/%C4%B0stanbul_Ba%C5%9Fak%C5%9Fehir_FK.png",
  },
  "Bursaspor": {
    name: "Bursaspor",
    short: "BS",
    primaryColor: "#008751",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Adana Demirspor": {
    name: "Adana Demirspor",
    short: "ADS",
    primaryColor: "#0C2340",
    secondaryColor: "#41B6E6",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "Antalyaspor": {
    name: "Antalyaspor",
    short: "ANT",
    primaryColor: "#DA291C",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "Konyaspor": {
    name: "Konyaspor",
    short: "KON",
    primaryColor: "#006A4E",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Sivasspor": {
    name: "Sivasspor",
    short: "SİV",
    primaryColor: "#DA291C",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Samsunspor": {
    name: "Samsunspor",
    short: "SAM",
    primaryColor: "#DA291C",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Kasımpaşa": {
    name: "Kasımpaşa",
    short: "KAS",
    primaryColor: "#00205B",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "Alanyaspor": {
    name: "Alanyaspor",
    short: "ALN",
    primaryColor: "#FF6700",
    secondaryColor: "#008751",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "Altınordu": {
    name: "Altınordu",
    short: "ALTO",
    primaryColor: "#DA291C",
    secondaryColor: "#00205B",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Eskişehirspor": {
    name: "Eskişehirspor",
    short: "ESK",
    primaryColor: "#000000",
    secondaryColor: "#DA291C",
    textColor: "#FFFFFF",
    badgeShape: "stripes",
  },

  // --- İSPANYA (LA LIGA) ---
  "Real Madrid": {
    name: "Real Madrid",
    short: "RM",
    primaryColor: "#FFFFFF",
    secondaryColor: "#EE9A00",
    textColor: "#00205B",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  },
  "Barcelona": {
    name: "Barcelona",
    short: "FCB",
    primaryColor: "#004D98",
    secondaryColor: "#A50044",
    textColor: "#EDBB00",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  },
  "Atlético Madrid": {
    name: "Atlético Madrid",
    short: "ATM",
    primaryColor: "#CB3524",
    secondaryColor: "#272E61",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
  },
  "Sevilla": {
    name: "Sevilla",
    short: "SFC",
    primaryColor: "#D4001F",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg",
  },
  "Valencia": {
    name: "Valencia",
    short: "VCF",
    primaryColor: "#000000",
    secondaryColor: "#FF6700",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Villarreal": {
    name: "Villarreal",
    short: "VIL",
    primaryColor: "#FFE600",
    secondaryColor: "#004B87",
    textColor: "#004B87",
    badgeShape: "shield",
  },

  // --- İNGİLTERE (PREMIER LEAGUE) ---
  "Manchester United": {
    name: "Manchester United",
    short: "MUFC",
    primaryColor: "#DA291C",
    secondaryColor: "#FBE122",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  },
  "Manchester City": {
    name: "Manchester City",
    short: "MCFC",
    primaryColor: "#6CABDD",
    secondaryColor: "#1C2C5B",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  },
  "Arsenal": {
    name: "Arsenal",
    short: "AFC",
    primaryColor: "#EF0107",
    secondaryColor: "#063672",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  },
  "Liverpool": {
    name: "Liverpool",
    short: "LFC",
    primaryColor: "#C8102E",
    secondaryColor: "#00B2A9",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  },
  "Chelsea": {
    name: "Chelsea",
    short: "CFC",
    primaryColor: "#034694",
    secondaryColor: "#DBA111",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  },
  "Tottenham Hotspur": {
    name: "Tottenham Hotspur",
    short: "THFC",
    primaryColor: "#132257",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  },
  "Tottenham": {
    name: "Tottenham",
    short: "THFC",
    primaryColor: "#132257",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
  },
  "Newcastle United": {
    name: "Newcastle United",
    short: "NUFC",
    primaryColor: "#000000",
    secondaryColor: "#41B6E6",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Aston Villa": {
    name: "Aston Villa",
    short: "AVFC",
    primaryColor: "#670E36",
    secondaryColor: "#95BFE5",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "Everton": {
    name: "Everton",
    short: "EVE",
    primaryColor: "#003399",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Leicester City": {
    name: "Leicester City",
    short: "LCFC",
    primaryColor: "#003090",
    secondaryColor: "#FDBE11",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },

  // --- ALMANYA (BUNDESLIGA) ---
  "Bayern Münih": {
    name: "Bayern Münih",
    short: "FCB",
    primaryColor: "#DC052D",
    secondaryColor: "#0066B2",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  },
  "Borussia Dortmund": {
    name: "Borussia Dortmund",
    short: "BVB",
    primaryColor: "#FDE100",
    secondaryColor: "#000000",
    textColor: "#000000",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg",
  },
  "Bayer Leverkusen": {
    name: "Bayer Leverkusen",
    short: "B04",
    primaryColor: "#E32221",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
  },
  "RB Leipzig": {
    name: "RB Leipzig",
    short: "RBL",
    primaryColor: "#ED1C24",
    secondaryColor: "#002F6C",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Eintracht Frankfurt": {
    name: "Eintracht Frankfurt",
    short: "SGE",
    primaryColor: "#E1000F",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "Wolfsburg": {
    name: "Wolfsburg",
    short: "WOB",
    primaryColor: "#65B32E",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "Stuttgart": {
    name: "Stuttgart",
    short: "VFB",
    primaryColor: "#E30613",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Schalke 04": {
    name: "Schalke 04",
    short: "S04",
    primaryColor: "#004D9D",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },

  // --- İTALYA (SERIE A) ---
  "Juventus": {
    name: "Juventus",
    short: "JUV",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg",
  },
  "Inter": {
    name: "Inter",
    short: "IM",
    primaryColor: "#005CAD",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg",
  },
  "Milan": {
    name: "Milan",
    short: "ACM",
    primaryColor: "#FB090B",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "oval",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  },
  "AC Milan": {
    name: "AC Milan",
    short: "ACM",
    primaryColor: "#FB090B",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "oval",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  },
  "Napoli": {
    name: "Napoli",
    short: "NAP",
    primaryColor: "#008FD7",
    secondaryColor: "#002F6C",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/28/S.S.C._Napoli_logo.svg",
  },
  "Roma": {
    name: "Roma",
    short: "ASR",
    primaryColor: "#8E1F2F",
    secondaryColor: "#F0BC42",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg",
  },
  "Lazio": {
    name: "Lazio",
    short: "LAZ",
    primaryColor: "#87D8F7",
    secondaryColor: "#FFFFFF",
    textColor: "#002F6C",
    badgeShape: "shield",
  },
  "Atalanta": {
    name: "Atalanta",
    short: "ATA",
    primaryColor: "#1E71B8",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "oval",
  },
  "Fiorentina": {
    name: "Fiorentina",
    short: "FIO",
    primaryColor: "#4F2D7F",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },

  // --- FRANSA (LIGUE 1) ---
  "Paris Saint-Germain": {
    name: "Paris Saint-Germain",
    short: "PSG",
    primaryColor: "#004170",
    secondaryColor: "#DA291C",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
  },
  "Monaco": {
    name: "Monaco",
    short: "ASM",
    primaryColor: "#DA291C",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Lyon": {
    name: "Lyon",
    short: "OL",
    primaryColor: "#1D428A",
    secondaryColor: "#DA291C",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Marseille": {
    name: "Marseille",
    short: "OM",
    primaryColor: "#00A3E0",
    secondaryColor: "#FFFFFF",
    textColor: "#002F6C",
    badgeShape: "shield",
  },
  "Lille": {
    name: "Lille",
    short: "LOSC",
    primaryColor: "#D12630",
    secondaryColor: "#111836",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },

  // --- HOLLANDA & PORTEKİZ ---
  "Ajax": {
    name: "Ajax",
    short: "AJX",
    primaryColor: "#DA291C",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg",
  },
  "Feyenoord": {
    name: "Feyenoord",
    short: "FEY",
    primaryColor: "#DA291C",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "PSV Eindhoven": {
    name: "PSV Eindhoven",
    short: "PSV",
    primaryColor: "#DA291C",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "oval",
  },
  "Sporting CP": {
    name: "Sporting CP",
    short: "SCP",
    primaryColor: "#008057",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg",
  },
  "Benfica": {
    name: "Benfica",
    short: "SLB",
    primaryColor: "#DA291C",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg",
  },
  "Porto": {
    name: "Porto",
    short: "FCP",
    primaryColor: "#003882",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg",
  },
  "FC Porto": {
    name: "FC Porto",
    short: "FCP",
    primaryColor: "#003882",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg",
  },

  // --- DİĞER DEVLER & DÜNYA ---
  "Al-Nassr": {
    name: "Al-Nassr",
    short: "NAS",
    primaryColor: "#FFCC00",
    secondaryColor: "#003399",
    textColor: "#003399",
    badgeShape: "shield",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/c/c5/Al_Nassr_FC_logo.svg",
  },
  "Al-Hilal": {
    name: "Al-Hilal",
    short: "HIL",
    primaryColor: "#0055A5",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
  "Al-Ittihad": {
    name: "Al-Ittihad",
    short: "ITT",
    primaryColor: "#FFD100",
    secondaryColor: "#000000",
    textColor: "#000000",
    badgeShape: "shield",
  },
  "Inter Miami": {
    name: "Inter Miami",
    short: "MIA",
    primaryColor: "#F7B5CD",
    secondaryColor: "#000000",
    textColor: "#000000",
    badgeShape: "circle",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/5/5c/Inter_Miami_CF_logo.svg",
  },
  "Santos": {
    name: "Santos",
    short: "SAN",
    primaryColor: "#FFFFFF",
    secondaryColor: "#000000",
    textColor: "#000000",
    badgeShape: "shield",
  },
  "Flamengo": {
    name: "Flamengo",
    short: "FLA",
    primaryColor: "#DA291C",
    secondaryColor: "#000000",
    textColor: "#FFFFFF",
    badgeShape: "stripes",
  },
  "Celtic": {
    name: "Celtic",
    short: "CEL",
    primaryColor: "#008057",
    secondaryColor: "#FFFFFF",
    textColor: "#FFFFFF",
    badgeShape: "circle",
  },
  "LA Galaxy": {
    name: "LA Galaxy",
    short: "LAG",
    primaryColor: "#00245D",
    secondaryColor: "#FFD100",
    textColor: "#FFFFFF",
    badgeShape: "shield",
  },
};

// ⚡ O(1) Anında Erişim İçin Ön Bellek (Cache)
const BADGE_CACHE = new Map<string, ClubBadgeInfo>();

// Bilinmeyen veya alt lig kulüpleri için dinamik akıllı renk üretici
export function getClubBadge(clubName: string): ClubBadgeInfo {
  // 1. Önbellekte varsa anında dön (O(1))
  if (BADGE_CACHE.has(clubName)) {
    return BADGE_CACHE.get(clubName)!;
  }

  let result: ClubBadgeInfo;

  // 2. Tam eşleşme kontrolü
  if (CLUB_DATABASE[clubName]) {
    result = CLUB_DATABASE[clubName];
  } else {
    // 3. Kısmi eşleşme kontrolü (örn. "Sporting" -> "Sporting CP", "Porto" -> "FC Porto")
    const clubLower = clubName.toLowerCase();
    const key = Object.keys(CLUB_DATABASE).find(
      (k) =>
        clubLower.includes(k.toLowerCase()) ||
        k.toLowerCase().includes(clubLower)
    );

    if (key && CLUB_DATABASE[key]) {
      result = CLUB_DATABASE[key];
    } else {
      // 4. Kulüp adından dinamik kısaltma
      const words = clubName.split(/[\s-]+/).filter(Boolean);
      let short = "";
      if (words.length === 1) {
        short = words[0].slice(0, 3).toUpperCase();
      } else if (words.length === 2) {
        short = (words[0].slice(0, 2) + words[1].slice(0, 1)).toUpperCase();
      } else {
        short = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
      }

      // İsimden hash üreterek tutarlı şık renk belirleme
      let hash = 0;
      for (let i = 0; i < clubName.length; i++) {
        hash = clubName.charCodeAt(i) + ((hash << 5) - hash);
      }

      const PALETTES = [
        { p: "#1E3A8A", s: "#3B82F6", t: "#FFFFFF" }, // Mavi
        { p: "#991B1B", s: "#EF4444", t: "#FFFFFF" }, // Kırmızı
        { p: "#065F46", s: "#10B981", t: "#FFFFFF" }, // Zümrüt
        { p: "#854D0E", s: "#FACC15", t: "#000000" }, // Altın
        { p: "#581C87", s: "#A855F7", t: "#FFFFFF" }, // Mor
        { p: "#18181B", s: "#71717A", t: "#FFFFFF" }, // Antrasit
        { p: "#0F766E", s: "#14B8A6", t: "#FFFFFF" }, // Teal
        { p: "#9A3412", s: "#FB923C", t: "#FFFFFF" }, // Turuncu
      ];

      const palette = PALETTES[Math.abs(hash) % PALETTES.length];

      result = {
        name: clubName,
        short: short.slice(0, 4),
        primaryColor: palette.p,
        secondaryColor: palette.s,
        textColor: palette.t,
        badgeShape: "shield",
      };
    }
  }

  BADGE_CACHE.set(clubName, result);
  return result;
}

