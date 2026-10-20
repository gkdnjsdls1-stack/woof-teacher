/**
 * 짧은 효과음 (월월, 박수, 반짝 …).
 * 음원 파일 없이 WebAudio 로 간단히 만듭니다. 나중에 실제 음원으로 교체하려면
 * 이 파일의 play 함수만 바꾸면 됩니다.
 */

export type SoundName = 'bark' | 'eat' | 'water' | 'bubble' | 'sparkle' | 'sleep' | 'clap' | 'honk';

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(value: boolean): void {
  muted = value;
}

function getCtx(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface Blip {
  freq: number;
  to?: number;
  dur: number;
  delay?: number;
  type?: OscillatorType;
  gain?: number;
}

const RECIPES: Record<SoundName, Blip[]> = {
  // "월월" — 짧고 낮게 두 번
  bark: [
    { freq: 420, to: 260, dur: 0.12, type: 'sawtooth', gain: 0.18 },
    { freq: 400, to: 240, dur: 0.12, delay: 0.17, type: 'sawtooth', gain: 0.18 },
  ],
  eat: [
    { freq: 180, to: 120, dur: 0.08, type: 'square', gain: 0.1 },
    { freq: 190, to: 130, dur: 0.08, delay: 0.14, type: 'square', gain: 0.1 },
    { freq: 175, to: 115, dur: 0.08, delay: 0.28, type: 'square', gain: 0.1 },
  ],
  water: [{ freq: 900, to: 1500, dur: 0.22, type: 'sine', gain: 0.1 }],
  bubble: [
    { freq: 700, to: 1200, dur: 0.1, type: 'sine', gain: 0.09 },
    { freq: 800, to: 1400, dur: 0.1, delay: 0.1, type: 'sine', gain: 0.07 },
  ],
  sparkle: [
    { freq: 1200, dur: 0.09, type: 'triangle', gain: 0.09 },
    { freq: 1600, dur: 0.09, delay: 0.09, type: 'triangle', gain: 0.09 },
    { freq: 2100, dur: 0.14, delay: 0.18, type: 'triangle', gain: 0.08 },
  ],
  sleep: [{ freq: 300, to: 160, dur: 0.6, type: 'sine', gain: 0.12 }],
  clap: [
    { freq: 1500, to: 400, dur: 0.06, type: 'square', gain: 0.07 },
    { freq: 1500, to: 400, dur: 0.06, delay: 0.12, type: 'square', gain: 0.07 },
    { freq: 1500, to: 400, dur: 0.06, delay: 0.24, type: 'square', gain: 0.07 },
  ],
  honk: [
    { freq: 330, dur: 0.18, type: 'square', gain: 0.14 },
    { freq: 330, dur: 0.18, delay: 0.24, type: 'square', gain: 0.14 },
  ],
};

export function playSound(name: SoundName): void {
  const audio = getCtx();
  if (!audio) return;
  const now = audio.currentTime;
  for (const blip of RECIPES[name]) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = now + (blip.delay ?? 0);
    const peak = blip.gain ?? 0.12;
    osc.type = blip.type ?? 'sine';
    osc.frequency.setValueAtTime(blip.freq, start);
    if (blip.to) osc.frequency.exponentialRampToValueAtTime(blip.to, start + blip.dur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + blip.dur);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(start + blip.dur + 0.02);
  }
}
