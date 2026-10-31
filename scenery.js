// Timing curves for the 3D bar: the lamp's voltage dips and the stranger's smoking rhythm.

// Two small voltage dips in a 23-second cycle; darkness never pulses rapidly.
export function lampFlicker(ms) {
  const t = ms % 23000;
  const dip = (start, duration, depth) => {
    const p = (t - start) / duration;
    return p > 0 && p < 1 ? Math.sin(p * Math.PI) * depth : 0;
  };
  return dip(17000, 420, 0.72) + dip(17800, 300, 0.4);
}

// Long resting intervals, then lift / draw / lower / exhale. Frame 0 is the still pose.
export function smokingFrame(ms) {
  const t = ms % 27000;
  if (t < 19000 || t >= 23500) return 0;
  const ends = [19300, 19600, 20000, 20800, 21200, 21700, 22500, 23500];
  return ends.findIndex(end => t < end) + 1;
}
