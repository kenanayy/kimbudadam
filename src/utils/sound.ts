// Web Audio API ile sıfır harici dosya yüküyle çalışan profesyonel futbol oyunu ses & müzik motoru
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = true;
  private isUnlocked: boolean = false;

  // 🎵 Arka Plan Stadyum Lounge Müziği Değişkenleri
  private musicGainNode: GainNode | null = null;
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private nextBarTime: number = 0;
  private currentBarIndex: number = 0;
  private isMusicPlaying: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  // FIFA / EA FC Stili Rahatlatıcı Maç Odası Akor Dizilimi (88 BPM)
  private readonly bpm = 88;
  private readonly beatDuration = 60 / 88; // ~0.6818s
  private readonly barDuration = (60 / 88) * 4; // ~2.727s

  private readonly chords = [
    // 1. Fmaj9 (Sıcak & İlham Verici)
    {
      root: 87.31, // F2
      bassGroove: [0, (60 / 88) * 2], // Beat 1 ve Beat 3
      notes: [220.0, 261.63, 329.63, 392.0], // A3, C4, E4, G4
    },
    // 2. G6 (Akıcı ve Yükselen)
    {
      root: 98.0, // G2
      bassGroove: [0, (60 / 88) * 2],
      notes: [196.0, 261.63, 293.66, 329.63], // G3, C4, D4, E4
    },
    // 3. Em7 (Rahatlatıcı Derinlik)
    {
      root: 82.41, // E2
      bassGroove: [0, (60 / 88) * 2],
      notes: [196.0, 246.94, 293.66, 392.0], // G3, B3, D4, G4
    },
    // 4. Am9 (Zarif Çözümleme)
    {
      root: 110.0, // A2
      bassGroove: [0, (60 / 88) * 1.5, (60 / 88) * 2.5],
      notes: [220.0, 261.63, 329.63, 392.0], // A3, C4, E4, G4
    },
  ];

  constructor() {
    if (typeof window !== "undefined") {
      // Sayfadaki ilk tıklama/dokunmada AudioContext'i anında uyandır ve müziği başlat
      const unlockAudio = () => {
        this.unlock();
      };
      window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
      window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
    }
  }

  public unlock() {
    if (this.isUnlocked && this.ctx && this.ctx.state === "running") {
      if (this.enabled && this.musicEnabled && !this.isMusicPlaying) {
        this.startMusic();
      }
      return;
    }
    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().then(() => {
          this.isUnlocked = true;
          if (this.enabled && this.musicEnabled && !this.isMusicPlaying) {
            this.startMusic();
          }
        }).catch(() => {});
      } else if (ctx) {
        this.isUnlocked = true;
        if (this.enabled && this.musicEnabled && !this.isMusicPlaying) {
          this.startMusic();
        }
      }
    } catch {}
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  private getMusicGain(ctx: AudioContext): GainNode {
    if (!this.musicGainNode) {
      this.musicGainNode = ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      this.musicGainNode.connect(ctx.destination);
    }
    return this.musicGainNode;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer) return this.noiseBuffer;
    const bufferSize = Math.floor(ctx.sampleRate * 0.5); // 0.5 saniyelik hafif fırça/shaker gürültüsü
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // =========================================================================
  // 🎵 ARKA PLAN MÜZİĞİ MOTORU (CHILL STADIUM LOUNGE)
  // =========================================================================
  public startMusic() {
    if (!this.enabled || !this.musicEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const musicGain = this.getMusicGain(ctx);
    const now = ctx.currentTime;
    // Yumuşak geçişle müziği başlat (Fade-in)
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0.12, now + 1.2);

    this.nextBarTime = now + 0.1;
    this.currentBarIndex = 0;

    // Düzenli aralıklarla önceden akorları planla (Scheduler loop)
    if (this.musicInterval) clearInterval(this.musicInterval);
    this.musicInterval = setInterval(() => {
      this.scheduleMusicBars();
    }, 250);

    this.scheduleMusicBars();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (this.ctx && this.musicGainNode) {
      const now = this.ctx.currentTime;
      this.musicGainNode.gain.cancelScheduledValues(now);
      this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, now);
      this.musicGainNode.gain.linearRampToValueAtTime(0.001, now + 0.4);
    }
  }

  private scheduleMusicBars() {
    if (!this.ctx || !this.isMusicPlaying || !this.enabled || !this.musicEnabled) return;

    const scheduleAheadTime = 1.2; // 1.2 saniye önceden planla
    const musicGain = this.getMusicGain(this.ctx);

    while (this.nextBarTime < this.ctx.currentTime + scheduleAheadTime) {
      const chord = this.chords[this.currentBarIndex];
      const barStart = this.nextBarTime;

      // 1. Yumuşak Rhodes / Elektrik Piyano Akoru
      chord.notes.forEach((freq, idx) => {
        try {
          // Sıcak temel sinüs dalgası
          const osc1 = this.ctx!.createOscillator();
          const osc2 = this.ctx!.createOscillator();
          const filter = this.ctx!.createBiquadFilter();
          const gain = this.ctx!.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(freq, barStart);

          // İnce koro derinliği için çok hafif detune edilmiş üçgen dalga
          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(freq, barStart);
          osc2.detune.setValueAtTime(3 + idx, barStart);

          // Sıcak lo-fi stadyum tınısı (Low-pass)
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(580, barStart);
          filter.Q.setValueAtTime(0.7, barStart);

          // Akor Zarfı (Zarif yumuşak vuruş)
          const noteStart = barStart + idx * 0.02; // İpeksi arpej dokunuşu
          gain.gain.setValueAtTime(0.0001, noteStart);
          gain.gain.linearRampToValueAtTime(0.038, noteStart + 0.12);
          gain.gain.exponentialRampToValueAtTime(0.018, noteStart + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + this.barDuration + 0.1);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(musicGain);

          osc1.start(noteStart);
          osc2.start(noteStart);
          osc1.stop(noteStart + this.barDuration + 0.15);
          osc2.stop(noteStart + this.barDuration + 0.15);
        } catch {}
      });

      // 2. Derin Sub-Bas Notası (Ritmin Temeli)
      chord.bassGroove.forEach((offset) => {
        try {
          const bassTime = barStart + offset;
          const bassOsc = this.ctx!.createOscillator();
          const bassFilter = this.ctx!.createBiquadFilter();
          const bassGain = this.ctx!.createGain();

          bassOsc.type = "sine";
          bassOsc.frequency.setValueAtTime(chord.root, bassTime);

          bassFilter.type = "lowpass";
          bassFilter.frequency.setValueAtTime(140, bassTime);

          bassGain.gain.setValueAtTime(0.0001, bassTime);
          bassGain.gain.linearRampToValueAtTime(0.07, bassTime + 0.04);
          bassGain.gain.exponentialRampToValueAtTime(0.001, bassTime + 0.85);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(musicGain);

          bassOsc.start(bassTime);
          bassOsc.stop(bassTime + 0.9);
        } catch {}
      });

      // 3. Hafif Ritmik Dokunuşlar (Muted Kick & Shaker)
      try {
        // Beat 1: Yumuşak Kick
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = "sine";
        kickOsc.frequency.setValueAtTime(95, barStart);
        kickOsc.frequency.exponentialRampToValueAtTime(35, barStart + 0.08);

        kickGain.gain.setValueAtTime(0.06, barStart);
        kickGain.gain.exponentialRampToValueAtTime(0.001, barStart + 0.09);

        kickOsc.connect(kickGain);
        kickGain.connect(musicGain);
        kickOsc.start(barStart);
        kickOsc.stop(barStart + 0.1);

        // Beat 2 & 4: Hafif Fırça / Shaker
        [this.beatDuration, this.beatDuration * 3].forEach((shakerOffset) => {
          try {
            const shakerTime = barStart + shakerOffset;
            const noise = this.ctx!.createBufferSource();
            noise.buffer = this.getNoiseBuffer(this.ctx!);

            const shakerFilter = this.ctx!.createBiquadFilter();
            shakerFilter.type = "bandpass";
            shakerFilter.frequency.setValueAtTime(3600, shakerTime);
            shakerFilter.Q.setValueAtTime(2.2, shakerTime);

            const shakerGain = this.ctx!.createGain();
            shakerGain.gain.setValueAtTime(0.02, shakerTime);
            shakerGain.gain.exponentialRampToValueAtTime(0.0001, shakerTime + 0.04);

            noise.connect(shakerFilter);
            shakerFilter.connect(shakerGain);
            shakerGain.connect(musicGain);

            noise.start(shakerTime);
            noise.stop(shakerTime + 0.05);
          } catch {}
        });
      } catch {}

      // Sıradaki akora geç
      this.nextBarTime += this.barDuration;
      this.currentBarIndex = (this.currentBarIndex + 1) % this.chords.length;
    }
  }

  // =========================================================================
  // 📢 OYUN İÇİ SES EFEKTLERİ (SFX)
  // =========================================================================

  /**
   * 1. 🔘 HAFİF DOKUNMATİK BUTON & MENÜ SESİ (UI Click / Pop)
   */
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  /**
   * 2. 🔓 KULÜP / İPUCU AÇILMA SESİ (Canlı Yükselen Çan Efekti)
   */
  playReveal() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Ton (Yumuşak Başlangıç)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);

      // 2. Ton (Parlak Zirve - G5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(783.99, now + 0.07); // G5
      gain2.gain.setValueAtTime(0.35, now + 0.07);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.07);
      osc2.stop(now + 0.29);
    } catch {}
  }

  /**
   * 3. 🎉 DOĞRU TAHMİN / ZAFER AKORU (Stadyum Sevinci & Şampiyonlar Melodisi)
   */
  playCorrect() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [
        { freq: 523.25, time: 0.0, dur: 0.15 }, // C5
        { freq: 659.25, time: 0.08, dur: 0.18 }, // E5
        { freq: 783.99, time: 0.16, dur: 0.22 }, // G5
        { freq: 1046.5, time: 0.24, dur: 0.55 }, // C6 (Zafer çanı)
      ];

      const now = ctx.currentTime;

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0.35, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.02);
      });
    } catch {}
  }

  /**
   * 4. ❌ YANLIŞ TAHMİN SESİ (Tok ve Zarif Buzzer)
   */
  playWrong() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.22);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  /**
   * 4.5. ⚡ JOKER AKTİVASYON SESİ (Sihirli Yükselen Güçlenme Arpeji)
   */
  playJoker() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046.5Hz)
      const freqs = [523.25, 659.25, 783.99, 1046.5];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.3);
      });
    } catch {}
  }

  /**
   * 4.6. 🔔 RAKİP TAHMİN / DÜŞÜNCE SESİ (Mind Games Pop)
   */
  playOpponentGuess() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  /**
   * 4.7. 💬 CANLI REAKSİYON / EMOJİ SESİ (Playful Pop / Swoosh)
   */
  playReaction() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /**
   * 5. 📢 HAKEM BAŞLAMA DÜDÜĞÜ (Oyuna Başlarken Çalan Hakiki Düdük)
   */
  playGameStart() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(2850, now);
      osc2.frequency.setValueAtTime(3120, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain.gain.setValueAtTime(0.25, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.33);
      osc2.stop(now + 0.33);
    } catch {}
  }

  /**
   * 6. 🏁 MAÇ SONU DÜDÜĞÜ / KAYBETME SESİ (Üçleme Düdük)
   */
  playGameOver() {
    if (!this.enabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const beeps = [
        { time: 0.0, dur: 0.12, freq: 380 },
        { time: 0.16, dur: 0.12, freq: 320 },
        { time: 0.32, dur: 0.35, freq: 220 },
      ];

      beeps.forEach(({ time, dur, freq }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + time);
        if (freq === 220) {
          osc.frequency.linearRampToValueAtTime(140, now + time + dur);
        }

        gain.gain.setValueAtTime(0.25, now + time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.02);
      });
    } catch {}
  }
}

export const soundManager = new SoundManager();
