import { NextRequest, NextResponse } from "next/server";
import { multiplayerStore } from "@/lib/multiplayerStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const playerId = searchParams.get("playerId") || undefined;

  if (!code) {
    return NextResponse.json({ error: "Oda kodu gerekli" }, { status: 400 });
  }

  const room = multiplayerStore.getRoom(code, playerId);
  if (!room) {
    return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({ room });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { hostName, customCode } = body;
      const res = multiplayerStore.createRoom(hostName, customCode);
      return NextResponse.json(res);
    }

    if (action === "join") {
      const { code, guestName } = body;
      if (!code) {
        return NextResponse.json({ error: "Oda kodu gerekli" }, { status: 400 });
      }
      const res = multiplayerStore.joinRoom(code, guestName);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    if (action === "guess") {
      const { code, playerId, guessedPlayerId } = body;
      if (!code || !playerId || !guessedPlayerId) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
      }
      const res = multiplayerStore.submitGuess(code, playerId, guessedPlayerId);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    if (action === "skip") {
      const { code, playerId } = body;
      if (!code || !playerId) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
      }
      const res = multiplayerStore.skipPass(code, playerId);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    if (action === "rematch") {
      const { code, playerId } = body;
      if (!code || !playerId) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
      }
      const room = multiplayerStore.requestRematch(code, playerId);
      if (!room) {
        return NextResponse.json({ error: "Oda bulunamadı" }, { status: 404 });
      }
      return NextResponse.json({ room });
    }

    if (action === "reaction") {
      const { code, playerId, emoji } = body;
      if (!code || !playerId || !emoji) {
        return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
      }
      const res = multiplayerStore.sendReaction(code, playerId, emoji);
      if ("error" in res) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Geçersiz eylem" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

