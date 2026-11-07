import { NextRequest, NextResponse } from "next/server";
import { multiplayerStore } from "@/lib/multiplayerStore";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const playerId = searchParams.get("playerId") || undefined;

  if (!code) {
    return NextResponse.json(
      { error: "Oda kodu gerekli" },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  const room = await multiplayerStore.getRoom(code, playerId);
  if (!room) {
    return NextResponse.json(
      { error: "Oda bulunamadı" },
      { status: 404, headers: NO_CACHE_HEADERS }
    );
  }

  // 🛡️ Hile koruması: İstemciye sadece anonimleştirilmiş güvenli oda nesnesi gönderilir
  return NextResponse.json(
    {
      room: multiplayerStore.sanitizeRoomForClient(room),
      serverTime: Date.now(),
    },
    { headers: NO_CACHE_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { hostName, customCode } = body;
      const res = await multiplayerStore.createRoom(hostName, customCode);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        {
          room: multiplayerStore.sanitizeRoomForClient(res.room),
          playerId: res.playerId,
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "join") {
      const { code, guestName } = body;
      if (!code) {
        return NextResponse.json({ error: "Oda kodu gerekli" }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      const res = await multiplayerStore.joinRoom(code, guestName);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        {
          room: multiplayerStore.sanitizeRoomForClient(res.room),
          playerId: res.playerId,
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "guess") {
      const { code, playerId, guessedPlayerId } = body;
      if (!code || !playerId || !guessedPlayerId) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      const res = await multiplayerStore.submitGuess(code, playerId, guessedPlayerId);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        {
          room: multiplayerStore.sanitizeRoomForClient(res.room),
          isCorrect: res.isCorrect,
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "skip") {
      const { code, playerId } = body;
      if (!code || !playerId) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      const res = await multiplayerStore.skipPass(code, playerId);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        {
          room: multiplayerStore.sanitizeRoomForClient(res.room),
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "forfeit") {
      const { code, playerId } = body;
      if (!code || !playerId) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      const res = await multiplayerStore.forfeitRound(code, playerId);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        {
          room: multiplayerStore.sanitizeRoomForClient(res.room),
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "rematch") {
      const { code, playerId } = body;
      if (!code || !playerId) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      const room = await multiplayerStore.requestRematch(code, playerId);
      if (!room) {
        return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404, headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        {
          room: multiplayerStore.sanitizeRoomForClient(room),
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    if (action === "reaction") {
      const { code, playerId, emoji } = body;
      if (!code || !playerId || !emoji) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      const res = await multiplayerStore.sendReaction(code, playerId, emoji);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400, headers: NO_CACHE_HEADERS });
      }
      return NextResponse.json(
        {
          room: multiplayerStore.sanitizeRoomForClient(res.room),
          serverTime: Date.now(),
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({ error: "Geçersiz eylem" }, { status: 400, headers: NO_CACHE_HEADERS });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
