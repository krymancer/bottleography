// Everything is synthesized locally. Audio starts on the first gesture, as browsers require.
let ctx = null;
let unlocked = false;
let rain = null, drone = null, music = null;

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
// Pink-ish noise: softer than white, closer to rain on glass than to a dead channel.
function pinkBuffer(seconds) {
  const a = context();
  const buffer = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.099046;
    b1 = 0.963 * b1 + w * 0.2965164;
    b2 = 0.57 * b2 + w * 1.0526913;
    data[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
  }
  return buffer;
}
function play(buffer, { type = "bandpass", freq = 1800, q = 0.7, gain = 1, when = 0, out } = {}) {
  const a = context();
  const source = a.createBufferSource(), filter = a.createBiquadFilter(), g = a.createGain();
  source.buffer = buffer;
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  g.gain.value = gain;
  source.connect(filter).connect(g).connect(out ?? a.destination);
  source.start(a.currentTime + when);
  return source;
}
function thump(t, volume, from = 62, to = 34) {
  const a = context();
  const o = a.createOscillator(), g = a.createGain();
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(to, t + 0.16);
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + 0.25);
}
function bell(t, freq, volume, decay, out) {
  const a = context();
  for (const [ratio, level] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) {
    const o = a.createOscillator(), g = a.createGain();
    o.frequency.value = freq * ratio;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volume * level, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay / ratio);
    o.connect(g).connect(out ?? a.destination);
    o.start(t);
    o.stop(t + decay);
  }
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
    // Dry paper: a soft swish with a few crackles riding on it.
    if (kind === "paper") {
      play(noiseBuffer(0.35, (s) => Math.sin(Math.min(1, s / 0.35) * Math.PI) * 0.5), { freq: 2600, q: 0.5, gain: 0.05 });
      for (let i = 0; i < 7; i++)
        play(noiseBuffer(0.03, (s) => Math.exp(-s * 160)), { type: "highpass", freq: 3000 + Math.random() * 3000, gain: 0.03 + Math.random() * 0.04, when: Math.random() * 0.3 });
      return;
    }
    // A typebar hitting the platen: a sharp click over a short wooden knock.
    if (kind === "key" || kind === "space") {
      const space = kind === "space";
      play(noiseBuffer(0.04, (s) => Math.exp(-s * 140)), { freq: space ? 1400 : 2400 + Math.random() * 600, q: 1.2, gain: space ? 0.08 : 0.16 });
      thump(t, space ? 0.12 : 0.16, space ? 110 : 180, 70);
      return;
    }
    if (kind === "ding") {
      play(noiseBuffer(0.25, (s) => Math.exp(-s * 18)), { type: "lowpass", freq: 700, gain: 0.12 });
      bell(t + 0.12, 2100, 0.07, 1.6);
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

// A slow music box in A minor over a low organ pad, through a long echo. It never quite resolves.
const CHORDS = [
  [45, 57, 60, 64],
  [41, 53, 57, 60],
  [43, 55, 59, 62],
  [40, 52, 56, 59],
];
const MELODY = [76, 72, 69, 71, 72, 71, 68, null, 76, 77, 76, 72, 74, 71, null, null, 69, 72, 71, 69, 68, 69, 71, null, 72, 71, 69, 68, 64, null, null, null];
const hz = (n) => 440 * 2 ** ((n - 69) / 12);
function startMusic() {
  const a = context();
  const master = a.createGain();
  master.gain.setValueAtTime(0.0001, a.currentTime);
  master.gain.exponentialRampToValueAtTime(0.5, a.currentTime + 6);
  master.connect(a.destination);
  const echo = a.createDelay(2), feedback = a.createGain(), wet = a.createGain(), tone = a.createBiquadFilter();
  echo.delayTime.value = 0.62;
  feedback.gain.value = 0.42;
  tone.type = "lowpass";
  tone.frequency.value = 2200;
  wet.gain.value = 0.5;
  echo.connect(tone).connect(feedback).connect(echo);
  tone.connect(wet).connect(master);
  const send = a.createGain();
  send.connect(master);
  send.connect(echo);
  const padFilter = a.createBiquadFilter();
  padFilter.type = "lowpass";
  padFilter.frequency.value = 520;
  padFilter.connect(master);
  const beat = 0.85;
  let step = 0, next = a.currentTime + 0.5, timer = 0;
  function pad(notes, t, length) {
    for (const n of notes) {
      for (const detune of [-6, 6]) {
        const o = a.createOscillator(), g = a.createGain();
        o.type = "triangle";
        o.frequency.value = hz(n);
        o.detune.value = detune;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.018, t + 2.5);
        g.gain.setValueAtTime(0.018, t + length - 2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.5);
        o.connect(g).connect(padFilter);
        o.start(t);
        o.stop(t + length + 0.6);
      }
    }
  }
  function schedule() {
    while (next < a.currentTime + 1.5) {
      if (step % 8 === 0) pad(CHORDS[(step / 8) % CHORDS.length], next, beat * 8);
      const note = MELODY[step % MELODY.length];
      // The box is old: now and then a tooth is missing.
      if (note && Math.random() > 0.08) bell(next, hz(note), 0.045, 2.4, send);
      step++;
      next += beat * (1 + (Math.random() - 0.5) * 0.04);
    }
    timer = setTimeout(schedule, 400);
  }
  schedule();
  return {
    stop() {
      clearTimeout(timer);
      master.gain.cancelScheduledValues(a.currentTime);
      master.gain.setValueAtTime(master.gain.value, a.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 2.5);
      setTimeout(() => master.disconnect(), 2800);
    },
  };
}

// Rain on the glass and the music box, always. At nightfall something that is not weather takes over.
export function ambience(on, { night = false } = {}) {
  if (!unlocked) return;
  try {
    const a = context();
    if (on && !rain) {
      const g = a.createGain();
      g.gain.value = 0.022;
      // The rain swells and eases instead of hissing at one level.
      const lfo = a.createOscillator(), depth = a.createGain();
      lfo.frequency.value = 0.07;
      depth.gain.value = 0.008;
      lfo.connect(depth).connect(g.gain);
      lfo.start();
      g.connect(a.destination);
      const wash = play(pinkBuffer(6), { type: "lowpass", freq: 900, q: 0.2, out: g });
      wash.loop = true;
      const drops = play(noiseBuffer(3, () => (Math.random() > 0.9993 ? 6 : 0)), { freq: 3200, q: 1.5, gain: 0.25, out: g });
      drops.loop = true;
      rain = { stop: () => [wash, drops, lfo].forEach((s) => s.stop()) };
    }
    if (on && !music && !night) music = startMusic();
    if (!on && rain) {
      rain.stop();
      rain = null;
    }
    if ((night || !on) && music) {
      music.stop();
      music = null;
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
