// Web Audio API ile sıfır harici dosya yüküyle çalışan profesyonel futbol oyunu ses & stadyum ambiyans motoru
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public musicEnabled: boolean = true; // Stadyum ambiyansı açık/kapalı
  private isUnlocked: boolean = false;

  // 🏟️ Canlı Stadyum & Tribün Ambiyansı Değişkenleri
  private ambienceGainNode: GainNode | null = null;
  private crowdBuffer: AudioBuffer | null = null;
  private crowdSource: AudioBufferSourceNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private swellInterval: ReturnType<typeof setInterval> | null = null;
  private isAmbiencePlaying: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      // Sayfadaki ilk tıklama/dokunmada AudioContext'i anında uyandır ve stadyum atmosferini başlat
      const unlockAudio = () => {
        this.unlock();
      };
      window.addEventListener("pointerdown", unlockAudio, { once: true, passive: true });
      window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
    }
  }

  public unlock() {
    if (this.isUnlocked && this.ctx && this.ctx.state === "running") {
      if (this.enabled && this.musicEnabled && !this.isAmbiencePlaying) {
        this.startAmbience();
      }
      return;
    }
    try {
      const ctx = this.getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().then(() => {
          this.isUnlocked = true;
          if (this.enabled && this.musicEnabled && !this.isAmbiencePlaying) {
            this.startAmbience();
          }
        }).catch(() => {});
      } else if (ctx) {
        this.isUnlocked = true;
        if (this.enabled && this.musicEnabled && !this.isAmbiencePlaying) {
          this.startAmbience();
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

  private getAmbienceGain(ctx: AudioContext): GainNode {
    if (!this.ambienceGainNode) {
      this.ambienceGainNode = ctx.createGain();
      this.ambienceGainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      this.ambienceGainNode.connect(ctx.destination);
    }
    return this.ambienceGainNode;
  }

  /**
   * 🏟️ 8 Saniyelik Dikişsiz (Seamless) Stereo Tribün Pembe Gürültü Tamponu
   */
  private getStadiumCrowdBuffer(ctx: AudioContext): AudioBuffer {
    if (this.crowdBuffer) return this.crowdBuffer;

    const length = ctx.sampleRate * 8; // 8 saniyelik zengin döngü
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Paul Kellet Pink Noise Filtresi (Doğal akustik tribün rezonansı için)
    let b0L = 0, b1L = 0, b2L = 0, b3L = 0, b4L = 0, b5L = 0, b6L = 0;
    let b0R = 0, b1R = 0, b2R = 0, b3R = 0, b4R = 0, b5R = 0, b6R = 0;

    for (let i = 0; i < length; i++) {
      // Sol Kanal
      const whiteL = Math.random() * 2 - 1;
      b0L = 0.99886 * b0L + whiteL * 0.0555179;
      b1L = 0.99332 * b1L + whiteL * 0.0750759;
      b2L = 0.96900 * b2L + whiteL * 0.153852;
      b3L = 0.86650 * b3L + whiteL * 0.3104856;
      b4L = 0.55000 * b4L + whiteL * 0.5329522;
      b5L = -0.7616 * b5L - whiteL * 0.016898;
      left[i] = (b0L + b1L + b2L + b3L + b4L + b5L + b6L + whiteL * 0.5362) * 0.11;
      b6L = whiteL * 0.115926;

      // Sağ Kanal (Geniş stadyum derinliği için bağımsız pembe gürültü)
      const whiteR = Math.random() * 2 - 1;
      b0R = 0.99886 * b0R + whiteR * 0.0555179;
      b1R = 0.99332 * b1R + whiteR * 0.0750759;
      b2R = 0.96900 * b2R + whiteR * 0.153852;
      b3R = 0.86650 * b3R + whiteR * 0.3104856;
      b4R = 0.55000 * b4R + whiteR * 0.5329522;
      b5R = -0.7616 * b5R - whiteR * 0.016898;
      right[i] = (b0R + b1R + b2R + b3R + b4R + b5R + b6R + whiteR * 0.5362) * 0.11;
      b6R = whiteR * 0.115926;
    }

    // Döngü geçiş noktasında (Loop point) tık/pıt sesini önleyen kusursuz çapraz geçiş (Crossfade)
    const fadeSamples = Math.floor(ctx.sampleRate * 0.4);
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      const endIdx = length - fadeSamples + i;

      const blendL = left[i] * t + left[endIdx] * (1 - t);
      left[i] = blendL;
      left[endIdx] = blendL;

      const blendR = right[i] * t + right[endIdx] * (1 - t);
      right[i] = blendR;
      right[endIdx] = blendR;
    }

    this.crowdBuffer = buffer;
    return buffer;
  }

  // =========================================================================
  // 🏟️ CANLI STADYUM & TRİBÜN AMBİYANS MOTORU (CROWD & STADIUM AMBIENCE)
  // =========================================================================

  // Geriye dönük uyumluluk: Kodun geri kalanı startMusic/stopMusic çağırdığında ambiyansı yönetir
  public startMusic() {
    this.startAmbience();
  }

  public stopMusic() {
    this.stopAmbience();
  }

  /**
   * Stadyum ambiyansını başlatır (Tribün uğultusu, maç atmosferi ve dalgalanmalar)
   */
  public startAmbience() {
    if (!this.enabled || !this.musicEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (this.isAmbiencePlaying) return;
    this.isAmbiencePlaying = true;

    try {
      const now = ctx.currentTime;
      const ambienceGain = this.getAmbienceGain(ctx);

      // 1. Dikişsiz sürekli döngü kaynağı (Looping stereo crowd buffer)
      const buffer = this.getStadiumCrowdBuffer(ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      this.crowdSource = source;

      // 2. Akustik Filtreler:
      // a) Derin Stadyum Çanağı Uğultusu (Low-pass ~380 Hz)
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = "lowpass";
      rumbleFilter.frequency.setValueAtTime(380, now);
      rumbleFilter.Q.setValueAtTime(0.8, now);

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.75, now);

      // b) Canlı İnsan Sesleri & Tezahürat Formantı (Band-pass ~720 Hz)
      const voiceFilter = ctx.createBiquadFilter();
      voiceFilter.type = "bandpass";
      voiceFilter.frequency.setValueAtTime(720, now);
      voiceFilter.Q.setValueAtTime(1.5, now);

      const voiceGain = ctx.createGain();
      voiceGain.gain.setValueAtTime(0.55, now);

      // 3. Organik Tribün Nefesi (Slow LFO: 0.08 Hz = her 12 saniyede bir doğal dalgalanma)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.08, now);
      lfoGain.gain.setValueAtTime(120, now); // Frekansı 600 Hz - 840 Hz arasında hafifçe dalgalandırır
      lfo.connect(lfoGain);
      lfoGain.connect(voiceFilter.frequency);
      lfo.start(now);
      this.lfoOsc = lfo;

      // Bağlantılar
      source.connect(rumbleFilter);
      rumbleFilter.connect(rumbleGain);
      rumbleGain.connect(ambienceGain);

      source.connect(voiceFilter);
      voiceFilter.connect(voiceGain);
      voiceGain.connect(ambienceGain);

      source.start(now);

      // Yumuşak geçişle arka plan sesini yükselt (Fade-in: 1.5s, rahatlatıcı ~0.07 seviyesi)
      ambienceGain.gain.cancelScheduledValues(now);
      ambienceGain.gain.setValueAtTime(ambienceGain.gain.value, now);
      ambienceGain.gain.linearRampToValueAtTime(0.07, now + 1.5);

      // 4. Periyodik Tribün Coşkusu & Uzak Heyecan Dalgaları (Her 14-22 saniyede bir)
      if (this.swellInterval) clearInterval(this.swellInterval);
      this.swellInterval = setInterval(() => {
        this.triggerCrowdSwell();
      }, 16000);
    } catch {}
  }

  /**
   * Stadyum ambiyansını yumuşak geçişle durdurur
   */
  public stopAmbience() {
    this.isAmbiencePlaying = false;

    if (this.swellInterval) {
      clearInterval(this.swellInterval);
      this.swellInterval = null;
    }

    if (this.ctx && this.ambienceGainNode) {
      const now = this.ctx.currentTime;
      this.ambienceGainNode.gain.cancelScheduledValues(now);
      this.ambienceGainNode.gain.setValueAtTime(this.ambienceGainNode.gain.value, now);
      this.ambienceGainNode.gain.linearRampToValueAtTime(0.0001, now + 0.5);

      setTimeout(() => {
        if (!this.isAmbiencePlaying) {
          try {
            if (this.crowdSource) {
              this.crowdSource.stop();
              this.crowdSource.disconnect();
              this.crowdSource = null;
            }
            if (this.lfoOsc) {
              this.lfoOsc.stop();
              this.lfoOsc.disconnect();
              this.lfoOsc = null;
            }
          } catch {}
        }
      }, 550);
    }
  }

  /**
   * 🌊 Tribün Dalgalanması & Uzak Maç Heyecanı
   * (Arada bir tribünlerin hücum sırasında hafifçe ayaklanması ve yatışması)
   */
  private triggerCrowdSwell() {
    if (!this.ctx || !this.isAmbiencePlaying || !this.enabled || !this.musicEnabled) return;

    try {
      const now = this.ctx.currentTime;
      const ambienceGain = this.getAmbienceGain(this.ctx);

      // Hafif coşku kabarması (Swell: 2 saniyede yüksel, 3 saniyede eski haline dön)
      const currentGain = 0.07;
      ambienceGain.gain.cancelScheduledValues(now);
      ambienceGain.gain.setValueAtTime(ambienceGain.gain.value, now);
      ambienceGain.gain.linearRampToValueAtTime(currentGain * 1.45, now + 1.8);
      ambienceGain.gain.linearRampToValueAtTime(currentGain, now + 4.2);

      // %35 ihtimalle uzaktan gelen hafif bir hakem düdüğü yankısı
      if (Math.random() < 0.35) {
        setTimeout(() => {
          if (!this.isAmbiencePlaying || !this.ctx) return;
          try {
            const whistleTime = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = "sine";
            osc.frequency.setValueAtTime(2650, whistleTime);
            osc.frequency.linearRampToValueAtTime(2720, whistleTime + 0.12);

            // Uzaklık filtresi (Havadaki ses yutulması)
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(3200, whistleTime);

            gain.gain.setValueAtTime(0.0001, whistleTime);
            gain.gain.linearRampToValueAtTime(0.012, whistleTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, whistleTime + 0.18);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(whistleTime);
            osc.stop(whistleTime + 0.2);
          } catch {}
        }, 1200);
      }
    } catch {}
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
