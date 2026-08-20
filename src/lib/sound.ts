let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined" || ctx) return ctx;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

export function initSound(): void {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
}

function strike(audio: AudioContext, time: number, peak: number): void {
  const partials = [
    { freq: 880, gain: peak },
    { freq: 2429, gain: peak * 0.45 },
    { freq: 3663, gain: peak * 0.2 },
    { freq: 4520, gain: peak * 0.12 },
  ];
  for (const { freq, gain: g } of partials) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(g, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(time);
    osc.stop(time + 1.6);
  }
}

export function playBell(): void {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const now = audio.currentTime;
  strike(audio, now, 0.25);
  strike(audio, now + 0.4, 0.18);
}