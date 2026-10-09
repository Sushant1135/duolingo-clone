// Duolingo sound synthesizer using Web Audio API and Speech Synthesis

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private pendingSpeechTimeout: number | null = null;
  private pendingVoicesHandler: (() => void) | null = null;
  private speechRequest = 0;

  private initContext() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("duo-sound-muted", String(muted));
    }
    if (muted && typeof window !== "undefined" && "speechSynthesis" in window) {
      this.cancelPendingSpeech();
      window.speechSynthesis.cancel();
    }
  }

  public getMuted(): boolean {
    if (typeof window !== "undefined") {
      this.isMuted = window.localStorage.getItem("duo-sound-muted") === "true";
    }
    return this.isMuted;
  }

  public playClick() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext may be restricted by autoplay policy until user gesture
    }
  }

  public playCorrect() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      // Duolingo arpeggiated chime: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        const startTime = ctx.currentTime + idx * 0.08;
        const duration = idx === notes.length - 1 ? 0.35 : 0.12;

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Audio error fallback
    }
  }

  public playIncorrect() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      // Duolingo descending error buzz: F3 (174Hz) -> D3 (146Hz)
      const notes = [174.61, 146.83];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        const startTime = ctx.currentTime + idx * 0.12;
        const duration = 0.22;

        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Audio error fallback
    }
  }

  public playLessonComplete() {
    if (this.isMuted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      // Celebratory victory fanfare
      const notes = [523.25, 659.25, 783.99, 880.0, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const startTime = ctx.currentTime + idx * 0.1;
        const duration = idx === notes.length - 1 ? 0.6 : 0.15;

        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Fallback
    }
  }

  public speak(text: string, lang: string = "de-DE") {
    if (this.isMuted) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      const synthesis = window.speechSynthesis;
      this.cancelPendingSpeech();
      synthesis.cancel();
      const cleanText = text.replace(/["'«»¿¡]/g, "").trim();
      if (!cleanText) return;
      const request = ++this.speechRequest;
      const speakWithAvailableVoices = () => {
        if (request !== this.speechRequest || this.isMuted) return;
        this.cancelPendingSpeech();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = lang;
        utterance.rate = 0.88;
        utterance.pitch = 1;
        utterance.volume = 0.85;
        utterance.voice = this.selectVoice(synthesis.getVoices(), lang) ?? null;
        synthesis.speak(utterance);
      };

      if (synthesis.getVoices().length > 0) {
        speakWithAvailableVoices();
      } else {
        this.pendingVoicesHandler = speakWithAvailableVoices;
        synthesis.addEventListener("voiceschanged", speakWithAvailableVoices, { once: true });
        this.pendingSpeechTimeout = window.setTimeout(speakWithAvailableVoices, 500);
      }
    } catch {
      // Speech fallback
    }
  }

  private selectVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
    const requestedLocale = lang.toLowerCase();
    const requestedLanguage = requestedLocale.split("-")[0];
    const matchingVoices = voices.filter((voice) =>
      voice.lang.toLowerCase().startsWith(requestedLanguage),
    );

    return matchingVoices.sort((left, right) => {
      const score = (voice: SpeechSynthesisVoice) => {
        const voiceLocale = voice.lang.toLowerCase();
        const name = voice.name.toLowerCase();
        return (
          (voiceLocale === requestedLocale ? 100 : 0) +
          (name.includes("natural") ? 40 : 0) +
          (name.includes("neural") ? 35 : 0) +
          (name.includes("online") ? 20 : 0) +
          (name.includes("google") ? 15 : 0)
        );
      };
      return score(right) - score(left);
    })[0];
  }

  private cancelPendingSpeech() {
    if (typeof window !== "undefined" && "speechSynthesis" in window && this.pendingVoicesHandler) {
      window.speechSynthesis.removeEventListener("voiceschanged", this.pendingVoicesHandler);
      this.pendingVoicesHandler = null;
    }
    if (this.pendingSpeechTimeout !== null) {
      window.clearTimeout(this.pendingSpeechTimeout);
      this.pendingSpeechTimeout = null;
    }
    this.speechRequest += 1;
  }
}

export const sound = new SoundManager();
