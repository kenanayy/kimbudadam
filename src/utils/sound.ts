// Web Audio API ile çalışan Lo-Fi Futbol & Odaklanma Müzik Motoru (Study / Deep Focus Lounge)
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = true;
  private isUnlocked: boolean = false;

  // ☕ Lo-Fi Odaklanma Müziği Değişkenleri
  private musicGainNode: GainNode | null = null;
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private nextBarTime: number = 0;
  private currentBarIndex: number = 0;
  private isMusicPlaying: boolean = false;
  private crowdBuffer: AudioBuffer | null = null;
  private crowdSource: AudioBufferSourceNode | null = null;
  private flutterLfo: OscillatorNode | null = null;
  private flutterGain: GainNode | null = null;

  // 72 BPM: Beyin dalgalarını (Alfa seviyesi) rahatlatıp odaklanmayı artıran Lo-Fi temposu
  private readonly bpm = 72;
  private readonly beatDuration = 60 / 72; // ~0.833s
  private readonly barDuration = (60 / 72) * 4; // ~3.333s

  // Neo-Soul & Lo-Fi Chill Akor Dizilimi (Ebmaj9 -> Cm7 -> Abmaj9 -> Bb9sus4)
  private readonly focusChords = [
    // 1. Ebmaj9 (Huzurlu ve sakin zihin)
    {
      root: 77.78, // Eb2
      walkNote: 116.54, // Bb2
      notes: [196.0, 233.08, 293.66, 349.23], // G3, Bb3, D4, F4
    },
    // 2. Cm7 (Derin odaklanma ve tefekkür)
    {
      root: 65.41, // C2
      walkNote: 98.0, // G2
      notes: [196.0, 233.08, 311.13, 392.0], // G3, Bb3, Eb4, G4
    },
    // 3. Abmaj9 (Geniş alan ve analiz)
    {
      root: 51.91, // Ab1
      walkNote: 77.78, // Eb2
      notes: [261.63, 311.13, 392.0, 466.16], // C4, Eb4, G4, Bb4
    },
    // 4. Bb9sus4 (Yumuşak çözümleme ve kararlılık)
    {
      root: 58.27, // Bb1
      walkNote: 87.31, // F2
      notes: [233.08, 261.63, 311.13, 349.23], // Bb3, C4, Eb4, F4
    },
  ];

  constructor() {
    if (typeof window !== "undefined") {
      // Sayfadaki ilk tıklama/dokunmada AudioContext'i uyandır ve odaklanma müziğini başlat
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
      this.musicGainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.musicGainNode.connect(ctx.destination);
    }
    return this.musicGainNode;
  }

  /**
   * 📻 Arka planda derinden gelen yumuşak stadyum & vinil sıcaklığı
   */
  private getStadiumBedBuffer(ctx: AudioContext): AudioBuffer {
    if (this.crowdBuffer) return this.crowdBuffer;

    const length = ctx.sampleRate * 6;
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < length; i++) {
      const wL = Math.random() * 2 - 1;
      const wR = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + wL * 0.05;
      b1 = 0.95 * b1 + wL * 0.15;
      b2 = 0.85 * b2 + wR * 0.25;

      // Hafif vinil çıtırtı dokunuşu
      const crackle = Math.random() < 0.0008 ? (Math.random() - 0.5) * 0.4 : 0;
      left[i] = (b0 + b1) * 0.12 + crackle;
      right[i] = (b0 + b2) * 0.12 + crackle;
    }
    this.crowdBuffer = buffer;
    return buffer;
  }

  // =========================================================================
  // ☕ LO-FI ODAKLANMA & DÜŞÜNME MÜZİĞİ MOTORU (DEEP FOCUS LOUNGE)
  // =========================================================================

  public startMusic() {
    if (!this.enabled || !this.musicEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    try {
      const now = ctx.currentTime;
      const masterGain = this.getMusicGain(ctx);

      // 1. Vintage Kaset / Plak Wow & Flutter LFO (Hafif analog dalgalanma hissi)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.35, now); // Çok yavaş 0.35 Hz
      lfoGain.gain.setValueAtTime(3.5, now); // ±3.5 cent analog perde dalgalanması
      lfo.connect(lfoGain);
      lfo.start(now);
      this.flutterLfo = lfo;
      this.flutterGain = lfoGain;

      // 2. Derinden gelen stadyum & vinil fonu (Sıcak Lo-Fi dokusu)
      const bedBuffer = this.getStadiumBedBuffer(ctx);
      const bedSource = ctx.createBufferSource();
      bedSource.buffer = bedBuffer;
      bedSource.loop = true;

      const bedFilter = ctx.createBiquadFilter();
      bedFilter.type = "lowpass";
      bedFilter.frequency.setValueAtTime(300, now);

      const bedGain = ctx.createGain();
      bedGain.gain.setValueAtTime(0.018, now); // Çok hafif, kulağı yormaz

      bedSource.connect(bedFilter);
      bedFilter.connect(bedGain);
      bedGain.connect(masterGain);
      bedSource.start(now);
      this.crowdSource = bedSource;

      // 3. Akor planlayıcısı
      this.nextBarTime = now + 0.1;
      this.currentBarIndex = 0;

      if (this.musicInterval) clearInterval(this.musicInterval);
      this.musicInterval = setInterval(() => {
        this.scheduleFocusMusicBars();
      }, 350);

      this.scheduleFocusMusicBars();

      // Yumuşak geçişle başlat (Fade-in 1.5s, dinlendirici 0.055 ses seviyesi)
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0.055, now + 1.5);
    } catch {}
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
      this.musicGainNode.gain.linearRampToValueAtTime(0.0001, now + 0.4);

      setTimeout(() => {
        if (!this.isMusicPlaying) {
          try {
            if (this.crowdSource) {
              this.crowdSource.stop();
              this.crowdSource.disconnect();
              this.crowdSource = null;
            }
            if (this.flutterLfo) {
              this.flutterLfo.stop();
              this.flutterLfo.disconnect();
              this.flutterLfo = null;
            }
          } catch {}
        }
      }, 450);
    }
  }

  /**
   * 🎹 72 BPM Lo-Fi Akorları, Sıcak Bas ve Hafif Ritim Planlayıcısı
   */
  private scheduleFocusMusicBars() {
    if (!this.ctx || !this.isMusicPlaying || !this.enabled || !this.musicEnabled) return;

    const scheduleAheadTime = 1.4;
    const masterGain = this.getMusicGain(this.ctx);

    while (this.nextBarTime < this.ctx.currentTime + scheduleAheadTime) {
      const chord = this.focusChords[this.currentBarIndex];
      const barStart = this.nextBarTime;

      // 1. Kadife Lo-Fi Piyano Akoru (Rhodes / Soft Piano)
      chord.notes.forEach((freq, idx) => {
        try {
          // Sıcak temel sinüs ve hafif gövde üçgeni
          const osc1 = this.ctx!.createOscillator();
          const osc2 = this.ctx!.createOscillator();
          const filter = this.ctx!.createBiquadFilter();
          const gain = this.ctx!.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(freq, barStart);

          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(freq, barStart);
          osc2.detune.setValueAtTime(2 + idx, barStart);

          // Analog kaset flütü (Tape wow & flutter) bağla
          if (this.flutterGain) {
            this.flutterGain.connect(osc1.detune);
            this.flutterGain.connect(osc2.detune);
          }

          // Lo-Fi Bant Geçiren Filtre (Karakteristik sıcak kaset tonu)
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(520, barStart);
          filter.Q.setValueAtTime(0.85, barStart);

          // İnsansı yumuşak parmak dokunuşu (24ms arpej kayması)
          const noteStart = barStart + idx * 0.024;
          gain.gain.setValueAtTime(0.0001, noteStart);
          gain.gain.linearRampToValueAtTime(0.026, noteStart + 0.08); // Yumuşak tuşe
          gain.gain.exponentialRampToValueAtTime(0.012, noteStart + 1.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + this.barDuration + 0.1);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc1.start(noteStart);
          osc2.start(noteStart);
          osc1.stop(noteStart + this.barDuration + 0.12);
          osc2.stop(noteStart + this.barDuration + 0.12);
        } catch {}
      });

      // 2. Sıcak Kontrbas / Sub-Bas Notası
      try {
        const bassTime1 = barStart;
        const bassTime2 = barStart + this.beatDuration * 2.5; // Beat 3.5 yumuşak yürüyüş

        [
          { time: bassTime1, freq: chord.root, dur: 1.4, vol: 0.048 },
          { time: bassTime2, freq: chord.walkNote, dur: 0.8, vol: 0.035 },
        ].forEach(({ time, freq, dur, vol }) => {
          const bassOsc = this.ctx!.createOscillator();
          const bassFilter = this.ctx!.createBiquadFilter();
          const bassGain = this.ctx!.createGain();

          bassOsc.type = "sine";
          bassOsc.frequency.setValueAtTime(freq, time);

          bassFilter.type = "lowpass";
          bassFilter.frequency.setValueAtTime(135, time);

          bassGain.gain.setValueAtTime(0.0001, time);
          bassGain.gain.linearRampToValueAtTime(vol, time + 0.05);
          bassGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(masterGain);

          bassOsc.start(time);
          bassOsc.stop(time + dur + 0.05);
        });
      } catch {}

      // 3. Hafif Lo-Fi Vuruşlar (Soft Felt Kick & Rim Click)
      try {
        // Beat 1 & Beat 2.5: Yumuşak bas vuruşu (Heartbeat kick)
        [barStart, barStart + this.beatDuration * 2.5].forEach((kickTime) => {
          const kickOsc = this.ctx!.createOscillator();
          const kickGain = this.ctx!.createGain();
          kickOsc.type = "sine";
          kickOsc.frequency.setValueAtTime(68, kickTime);
          kickOsc.frequency.exponentialRampToValueAtTime(36, kickTime + 0.08);

          kickGain.gain.setValueAtTime(0.032, kickTime);
          kickGain.gain.exponentialRampToValueAtTime(0.0001, kickTime + 0.09);

          kickOsc.connect(kickGain);
          kickGain.connect(masterGain);
          kickOsc.start(kickTime);
          kickOsc.stop(kickTime + 0.1);
        });

        // Beat 2 & Beat 4: Çok yumuşak ahşap baget / fırça tıklaması (Rim Click)
        [barStart + this.beatDuration, barStart + this.beatDuration * 3].forEach((clickTime) => {
          const clickOsc = this.ctx!.createOscillator();
          const clickGain = this.ctx!.createGain();
          clickOsc.type = "triangle";
          clickOsc.frequency.setValueAtTime(2100, clickTime);

          clickGain.gain.setValueAtTime(0.012, clickTime);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, clickTime + 0.035);

          clickOsc.connect(clickGain);
          clickGain.connect(masterGain);
          clickOsc.start(clickTime);
          clickOsc.stop(clickTime + 0.04);
        });
      } catch {}

      // Sıradaki akora geç
      this.nextBarTime += this.barDuration;
      this.currentBarIndex = (this.currentBarIndex + 1) % this.focusChords.length;
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
