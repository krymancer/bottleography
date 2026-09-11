// Native-resolution Aseprite exports. Story state controls only composition and motion.
const assetNames = ["room", "bar", "stranger", "foreground", "desk", "rain-sheet", "smoke-sheet", "bar-flicker", "parcel-closed", "parcel-open", "stranger-puff-sheet"];

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

export function startScenery(canvas, getScene, getPresence = () => 1) {
  const c = canvas.getContext("2d");
  c.imageSmoothingEnabled = false;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let presence = getPresence();
  let previousFrame = null;
  let smokingTime = 0;
  let tappedAt = -Infinity;
  const images = {};
  const status = document.createElement("span");
  status.className = "art-status";
  status.setAttribute("role", "status");
  status.textContent = "Opening the room…";
  canvas.parentElement.append(status);

  function draw(name, alpha = 1, offsetY = 0) {
    c.globalAlpha = alpha;
    c.drawImage(images[name], 0, offsetY);
    c.globalAlpha = 1;
  }
  function animated(name, frame, alpha) {
    c.globalAlpha = alpha;
    c.drawImage(images[name], frame * 480, 0, 480, 240, 0, 0, 480, 240);
    c.globalAlpha = 1;
  }
  function frame(ms) {
    const reduced = motion.matches;
    const elapsed = previousFrame === null ? 0 : Math.min(100, ms - previousFrame);
    previousFrame = ms;
    const target = getPresence();
    presence = reduced || target === 0 ? target : Math.min(target, presence + elapsed / 2400);
    const phase = reduced ? 0 : Math.floor(ms / 220) % 4;
    c.clearRect(0, 0, 480, 240);
    const scene = getScene();
    smokingTime = scene === "bar" && !reduced && presence >= 1 ? smokingTime + elapsed : 0;
    const puff = smokingFrame(smokingTime);
    if (scene.startsWith("parcel-")) {
      draw(scene);
    } else if (scene === "bar") {
      draw("room");
      animated("rain-sheet", phase, 0.32);
      draw("bar");
      if (puff) animated("stranger-puff-sheet", puff, presence);
      else draw("stranger", presence);
      draw("foreground");
      if (!puff) animated("smoke-sheet", phase, presence * 0.3);
      if (!reduced) draw("bar-flicker", Math.max(lampFlicker(ms), (ms - tappedAt < 1200 ? lampFlicker(ms - tappedAt + 17000) : 0)));
    } else {
      draw("desk");
    }
    canvas.dataset.artReady = "true";
    requestAnimationFrame(frame);
  }
  const ready = Promise.all(assetNames.map((name) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { images[name] = image; resolve(); };
    image.onerror = () => reject(new Error(`Could not load ${name}.png`));
    image.src = new URL(`./assets/${name}.png`, import.meta.url).href;
  })));
  ready.then(() => {
    status.remove();
    requestAnimationFrame(frame);
  }).catch((error) => {
    status.textContent = "The room’s artwork could not load. Refresh to try again.";
    canvas.dataset.artReady = "error";
    console.error(error);
  });
  return {
    tapLamp() {
      const now = performance.now();
      if (getScene() !== "bar" || now - tappedAt < 1200) return false;
      tappedAt = now;
      return true;
    },
  };
}
