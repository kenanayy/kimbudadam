"use client";

import React, { useState, useEffect } from "react";
import { X, Users, Copy, Check, ArrowRight, Share2, Sparkles, Trophy, Loader2 } from "lucide-react";
import { MultiplayerRoom } from "@/types/multiplayer";
import { soundManager } from "@/utils/sound";

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (room: MultiplayerRoom, myPlayerId: string) => void;
  initialCode?: string;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
  initialCode = "",
}) => {
  const [activeTab, setActiveTab] = useState<"CREATE" | "JOIN">(
    initialCode ? "JOIN" : "CREATE"
  );
  const [playerName, setPlayerName] = useState<string>("Oyuncu");
  const [joinCode, setJoinCode] = useState<string>(initialCode);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Oluşturulan odanın bekleme durumu
  const [createdRoom, setCreatedRoom] = useState<MultiplayerRoom | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  // LocalStorage'dan oyuncu adını yükle
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("mp_player_name");
      if (savedName) setPlayerName(savedName);
    } catch {}
  }, []);

  // initialCode değişirse JOIN sekmesine geç
  useEffect(() => {
    if (initialCode) {
      setJoinCode(initialCode.toUpperCase());
      setActiveTab("JOIN");
    }
  }, [initialCode]);

  // Oda kurucusu için 2. oyuncuyu bekleme döngüsü (Polling)
  useEffect(() => {
    if (!createdRoom || !myPlayerId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/room?code=${createdRoom.code}&playerId=${myPlayerId}&_t=${Date.now()}`,
          {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.room) {
          // Eğer 2. oyuncu katıldıysa maçı başlat!
          if (data.room.guest && data.room.status !== "WAITING") {
            soundManager.playGameStart();
            onStartMatch(data.room, myPlayerId);
            clearInterval(interval);
          }
        }
      } catch {}
    }, 800);

    return () => clearInterval(interval);
  }, [createdRoom, myPlayerId, onStartMatch]);

  if (!isOpen) return null;

  const savePlayerName = (name: string) => {
    setPlayerName(name);
    try {
      localStorage.setItem("mp_player_name", name);
    } catch {}
  };

  // 1. Oda Oluştur
  const handleCreateRoom = async () => {
    setError(null);
    setLoading(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          hostName: playerName.trim() || "1. Oyuncu",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Oda oluşturulamadı");
        setLoading(false);
        return;
      }

      setCreatedRoom(data.room);
      setMyPlayerId(data.playerId);
      setLoading(false);
    } catch {
      setError("Bağlantı hatası oluştu!");
      setLoading(false);
    }
  };

  // 2. Odaya Katıl
  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setError("Lütfen 4 haneli oda kodunu girin!");
      return;
    }

    setError(null);
    setLoading(true);
    soundManager.playClick();

    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          code: joinCode.trim().toUpperCase(),
          guestName: playerName.trim() || "2. Oyuncu",
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Odaya katılınamadı");
        setLoading(false);
        return;
      }

      soundManager.playGameStart();
      onStartMatch(data.room, data.playerId);
    } catch {
      setError("Odaya bağlanırken hata oluştu!");
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (!createdRoom) return;
    navigator.clipboard.writeText(createdRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyInviteLink = () => {
    if (!createdRoom) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/?oda=${createdRoom.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!createdRoom) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/?oda=${createdRoom.code}`;
    const text = encodeURIComponent(
      `⚽ Kim Bu Adam? 1v1 Canlı Derbi maçına davet edildin!\nOda Kodu: ${createdRoom.code}\nKatılmak için tıkla: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Başlığı */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <Users className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                CANLI MULTIPLAYER
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-950 tracking-tight">
              1v1 Hızlı Derbi
            </h3>
          </div>
        </div>

        {/* Hata Bildirimi */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium animate-in shake duration-150">
            ⚠️ {error}
          </div>
        )}

        {/* ======================================================== */}
        {/* DURUM 1: ODA KURULDU, 2. OYUNCU BEKLENİYOR              */}
        {/* ======================================================== */}
        {createdRoom ? (
          <div className="space-y-4 text-center py-2 animate-in zoom-in-95 duration-200">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-500">
                Oda Kodun
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-emerald-600 select-all">
                {createdRoom.code}
              </div>
              <p className="text-xs text-slate-500">
                Arkadaşına bu kodu ver veya davet linkini paylaş!
              </p>
            </div>

            {/* Paylaşım Butonları */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copyRoomCode}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Kodu Kopyala</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={copyInviteLink}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Link Alındı!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-600" />
                    <span>Linki Kopyala</span>
                  </>
                )}
              </button>
            </div>

            {/* WhatsApp ile Paylaş */}
            <button
              type="button"
              onClick={shareOnWhatsApp}
              className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>WhatsApp ile Arkadaşını Çağır</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Bekleme Animasyonu */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Arkadaşının katılması bekleniyor...</span>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* DURUM 2: LOBİ (ODA KUR VEYA KATIL)                      */
          /* ======================================================== */
          <div className="space-y-4">
            {/* Oyuncu Adı Girişi */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1">
                Oyuncu Adın / Lakabın
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => savePlayerName(e.target.value)}
                placeholder="Örn: Kenan"
                maxLength={18}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-bold text-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Sekme Seçimi: Oda Kur vs Katıl */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold font-mono">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setActiveTab("CREATE");
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === "CREATE"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                🏠 Oda Kur
              </button>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setActiveTab("JOIN");
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === "JOIN"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                🚪 Odaya Katıl
              </button>
            </div>

            {activeTab === "CREATE" ? (
              /* ODA KUR */
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 space-y-1">
                  <div className="font-black flex items-center gap-1.5 text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>5 Turluk Canlı Hızlı Maç</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Futbolcunun tüm kariyer kulüpleri baştan sona tam açık gelir! En hızlı tahmin edip golleri atan maçı kazanır!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-700/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Oda Kuruluyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Odayı Oluştur</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* ODAYA KATIL */
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-slate-600 mb-1">
                    4 Haneli Oda Kodu
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Örn: 1905 veya GOL1"
                    maxLength={6}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-base font-black font-mono tracking-widest text-slate-900 bg-slate-50/50 uppercase text-center"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleJoinRoom}
                  disabled={loading || !joinCode.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-teal-700/20 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Odaya Bağlanılıyor...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Maça Katıl</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

