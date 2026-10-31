// Everything is synthesized locally. Audio starts on the first gesture, as browsers require.
let ctx = null;
let unlocked = false;
let rain = null, drone = null;

function context() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}
function noiseBuffer(seconds, shape) {
  const a = context();
  const buffer = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * shape(i / a.sampleRate);
  return buffer;
}
function play(buffer, { type = "bandpass", freq = 1800, q = 0.7, gain = 1 } = {}) {
  const a = context();
  const source = a.createBufferSource(), filter = a.createBiquadFilter(), g = a.createGain();
  source.buffer = buffer;
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  g.gain.value = gain;
  source.connect(filter).connect(g).connect(a.destination);
  source.start();
  return source;
}
function thump(t, volume) {
  const a = context();
  const o = a.createOscillator(), g = a.createGain();
  o.frequency.setValueAtTime(62, t);
  o.frequency.exponentialRampToValueAtTime(34, t + 0.16);
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 0.25);
}

export function unlock() {
  if (unlocked) return;
  unlocked = true;
  sfx("lighter");
  ambience(true);
}
export function sfx(kind) {
  if (!unlocked) return;
  try {
    const a = context();
    const t = a.currentTime;
    if (kind === "spark") {
      play(noiseBuffer(0.65, (s) => Math.exp(-s * 28) + (s > 0.32 ? Math.exp(-(s - 0.32) * 35) * 0.6 : 0)), { gain: 0.16 });
      return;
    }
    if (kind === "glitch") {
      play(noiseBuffer(0.4, (s) => (Math.sin(s * 90) > 0 ? 1 : 0.1) * Math.exp(-s * 6)), { type: "highpass", freq: 900, gain: 0.07 });
      return;
    }
    if (kind === "heartbeat") {
      thump(t, 0.5);
      thump(t + 0.24, 0.32);
      return;
    }
    const presets = {
      tick: [135, 0.018, 0.025],
      glass: [1700, 0.45, 0.06],
      lighter: [85, 0.13, 0.08],
      pin: [430, 0.16, 0.09],
      dice: [260, 0.05, 0.05],
    };
    const [freq, duration, volume] = presets[kind] || presets.tick;
    const o = a.createOscillator(), g = a.createGain();
    o.type = kind === "tick" || kind === "lighter" || kind === "dice" ? "square" : "sine";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * 0.48), t + duration);
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + duration);
  } catch {
    // Audio support must not block the story.
  }
}
// Rain on the glass, always. Under it, at nightfall, something that is not weather.
export function ambience(on, { night = false } = {}) {
  if (!unlocked) return;
  try {
    const a = context();
    if (on && !rain) {
      rain = play(noiseBuffer(4, () => 0.6), { type: "lowpass", freq: 1100, q: 0.3, gain: 0.05 });
      rain.loop = true;
    }
    if (!on && rain) {
      rain.stop();
      rain = null;
    }
    if (night && !drone) {
      const g = a.createGain();
      g.gain.setValueAtTime(0.0001, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.09, a.currentTime + 3);
      const filter = a.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 240;
      const oscs = [41, 41.6, 61.7].map((f) => {
        const o = a.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = f;
        o.connect(filter);
        o.start();
        return o;
      });
      filter.connect(g).connect(a.destination);
      drone = { g, oscs };
    }
    if (!night && drone) {
      drone.g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 1.5);
      const old = drone;
      setTimeout(() => old.oscs.forEach((o) => o.stop()), 1600);
      drone = null;
    }
  } catch {
    // Ambience is optional.
  }
}
