// The Last Light and the writer's study, built from primitives and painted in post.
// Story code drives it through shots, mood and cues; nothing here knows the plot.
import * as THREE from "three";
import { lampFlicker, smokingFrame } from "./scenery.js";

const DESK = new THREE.Vector3(40, 0, 0);
const SHOTS = {
  "desk-parcel": { pos: [40.9, 1.75, 1.15], look: [40, 0.78, -0.5], fov: 34 },
  desk: { pos: [42.6, 2.7, 2.7], look: [40, 0.95, -0.4], fov: 32 },
  shelf: { pos: [41.6, 1.9, 1.4], look: [40.2, 2.1, -1.9], fov: 38 },
  bar: { pos: [6.2, 6.2, 7.4], look: [0.2, 0.9, -0.8], fov: 30 },
  table: { pos: [1.9, 2.15, 2.8], look: [-0.1, 1.05, -0.7], fov: 34 },
  prey: { pos: [3.1, 1.62, -3.7], look: [0.3, 1.7, 0.9], fov: 38 },
  exit: { pos: [5.5, 3.6, 6.5], look: [1.5, 0.9, 0.5], fov: 34 },
};

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}
const rand = rng(1683);
function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...extra });
}
function mesh(geometry, material, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  parent?.add(m);
  return m;
}
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt, rb, h, seg = 10, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open);
function canvasTexture(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  return t;
}
const planks = (tone) =>
  canvasTexture(256, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 32)
      for (let x = (y / 32) % 2 ? -64 : 0; x < w; x += 128) {
        const v = 0.75 + rand() * 0.4;
        g.fillStyle = `rgb(${tone[0] * v},${tone[1] * v},${tone[2] * v})`;
        g.fillRect(x, y, 128, 32);
        g.fillStyle = "rgba(0,0,0,.55)";
        g.fillRect(x, y, 2, 32);
        for (let i = 0; i < 6; i++) {
          g.fillStyle = `rgba(0,0,0,${rand() * 0.12})`;
          g.fillRect(x, y + rand() * 32, 128, 1);
        }
      }
    g.fillStyle = "rgba(0,0,0,.6)";
    for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 2);
  }, [4, 4]);
const wallpaper = canvasTexture(128, 128, (g, w, h) => {
  g.fillStyle = "#1d2a24";
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) {
    g.fillStyle = "#24342c";
    g.fillRect(x, 0, 12, h);
    g.fillStyle = "#3a3524";
    for (let y = 8; y < h; y += 32) g.fillRect(x + 20, y, 5, 9);
  }
  for (let i = 0; i < 400; i++) {
    g.fillStyle = `rgba(0,0,0,${rand() * 0.25})`;
    g.fillRect(rand() * w, rand() * h, 3, 3);
  }
}, [6, 2]);

// One coat, one body. The stranger and the writer are cut from the same pattern.
// hat: the wide brim the immortal wears. Under it the face stays in its own shadow; only the hands catch the lamp.
function makeFigure({ coat = 0x23262b, skin = 0xc2ad99, hair = 0x1a1512, seated = true, apron = false, hat = false }) {
  const g = new THREE.Group();
  const coatM = mat(coat), skinM = mat(skin, { roughness: 0.7 }), legM = mat(0x16171a), shoeM = mat(0x0b0b0c);
  const faceM = hat ? mat(0x1c1715, { roughness: 1 }) : skinM;
  const hip = seated ? 0.5 : 0.95;
  for (const side of [-1, 1]) {
    if (seated) {
      mesh(box(0.17, 0.16, 0.48), legM, side * 0.11, hip, 0.2, g);
      mesh(box(0.14, 0.46, 0.14), legM, side * 0.11, hip - 0.25, 0.42, g);
      mesh(box(0.12, 0.08, 0.24), shoeM, side * 0.11, 0.04, 0.48, g);
    } else {
      mesh(box(0.15, 0.9, 0.16), legM, side * 0.11, 0.47, 0, g);
      mesh(box(0.12, 0.08, 0.26), shoeM, side * 0.11, 0.04, 0.05, g);
    }
  }
  const torso = mesh(cyl(0.25, 0.2, 0.66, 8), coatM, 0, hip + 0.34, 0, g);
  torso.scale.z = 0.68;
  if (seated) mesh(box(0.44, 0.34, 0.1), coatM, 0, hip - 0.04, -0.16, g);
  else mesh(cyl(0.22, 0.29, 0.55, 8, true), coatM, 0, hip - 0.18, 0, g).material.side = THREE.DoubleSide;
  if (apron) mesh(box(0.36, 0.7, 0.05), mat(0x8c826f), 0, hip + 0.05, 0.15, g);
  mesh(cyl(0.11, 0.17, 0.17, 8, true), coatM, 0, hip + 0.72, 0, g).material.side = THREE.DoubleSide;
  const head = new THREE.Group();
  head.position.set(0, hip + 0.88, 0);
  g.add(head);
  mesh(new THREE.SphereGeometry(0.115, 8, 6), faceM, 0, 0, 0, head).scale.set(0.9, 1.14, 1);
  if (hat) {
    const felt = mat(0x111214, { side: THREE.DoubleSide });
    const brim = mesh(cyl(0.27, 0.29, 0.018, 14), felt, 0, 0.085, 0.02, head);
    brim.rotation.x = 0.16;
    mesh(cyl(0.115, 0.13, 0.15, 10), felt, 0, 0.16, 0, head).rotation.x = 0.1;
    mesh(cyl(0.132, 0.132, 0.03, 10, true), mat(0x050505, { side: THREE.DoubleSide }), 0, 0.11, 0.003, head);
    mesh(cyl(0.13, 0.2, 0.2, 9, true), coatM, 0, -0.16, -0.01, head).material.side = THREE.DoubleSide;
  } else mesh(new THREE.SphereGeometry(0.122, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2.7), mat(hair), 0, 0.05, -0.015, head);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xff2a1a });
  const eyes = [-1, 1].map((s) => mesh(new THREE.SphereGeometry(0.016, 6, 4), eyeM, s * 0.04, 0.01, 0.1, head));
  eyes.forEach((e) => (e.visible = false));
  const arms = [-1, 1].map((side) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.27, hip + 0.6, 0);
    g.add(shoulder);
    mesh(new THREE.CapsuleGeometry(0.058, 0.24, 3, 6), coatM, 0, -0.15, 0, shoulder);
    const elbow = new THREE.Group();
    elbow.position.y = -0.31;
    shoulder.add(elbow);
    mesh(new THREE.CapsuleGeometry(0.052, 0.22, 3, 6), coatM, 0, -0.13, 0, elbow);
    const hand = mesh(new THREE.SphereGeometry(0.05, 6, 5), skinM, 0, -0.29, 0, elbow);
    return { shoulder, elbow, hand };
  });
  return { group: g, head, arms, eyes };
}

// The writer, when the room is empty enough. Too tall, too thin, wrapped and patient.
function makeMonster() {
  const g = new THREE.Group();
  const rag = mat(0x14110f, { side: THREE.DoubleSide });
  const skin = mat(0x6e6660, { roughness: 0.5 });
  for (const s of [-1, 1]) mesh(box(0.1, 1.3, 0.12), mat(0x0c0b0b), s * 0.13, 0.65, 0, g);
  const skirtGeo = new THREE.CylinderGeometry(0.2, 0.5, 1.55, 11, 5, true);
  const p = skirtGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const low = 1 - (p.getY(i) + 0.775) / 1.55;
    p.setXYZ(i, p.getX(i) * (1 + (rand() - 0.5) * 0.3 * low), p.getY(i) - rand() * 0.25 * low * low, p.getZ(i) * (1 + (rand() - 0.5) * 0.3 * low));
  }
  skirtGeo.computeVertexNormals();
  mesh(skirtGeo, rag, 0, 1.05, 0, g);
  const spine = new THREE.Group();
  spine.position.y = 1.7;
  spine.rotation.x = 0.5;
  g.add(spine);
  mesh(cyl(0.3, 0.17, 0.85, 8), rag, 0, 0.4, 0, spine).scale.z = 0.6;
  const head = new THREE.Group();
  head.position.set(0, 0.95, 0.08);
  spine.add(head);
  mesh(new THREE.ConeGeometry(0.22, 0.62, 7, 1, true), rag, 0, 0.12, -0.04, head).rotation.x = -0.25;
  mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, -0.05, 0.04, head);
  const eyeM = new THREE.MeshBasicMaterial({ color: 0xff2414 });
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.022, 6, 4), eyeM, s * 0.055, -0.03, 0.15, head);
  const glow = new THREE.PointLight(0xff1a0a, 0, 2.5, 2);
  glow.position.set(0, -0.03, 0.25);
  head.add(glow);
  const arms = [-1, 1].map((side) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.3, 0.72, 0);
    spine.add(shoulder);
    mesh(new THREE.CapsuleGeometry(0.05, 0.55, 3, 6), rag, 0, -0.3, 0, shoulder);
    const elbow = new THREE.Group();
    elbow.position.y = -0.62;
    shoulder.add(elbow);
    mesh(new THREE.CapsuleGeometry(0.04, 0.6, 3, 6), skin, 0, -0.32, 0, elbow);
    for (let f = 0; f < 4; f++) {
      const claw = mesh(new THREE.ConeGeometry(0.014, 0.26, 4), skin, (f - 1.5) * 0.028, -0.78, 0.02, elbow);
      claw.rotation.x = Math.PI + (f - 1.5) * 0.08;
    }
    return { shoulder, elbow };
  });
  return { group: g, head, arms, glow, spine };
}

function makeBottleGeometry() {
  const pts = [[0, 0], [0.07, 0], [0.076, 0.02], [0.076, 0.2], [0.06, 0.245], [0.026, 0.285], [0.022, 0.37], [0.027, 0.375], [0, 0.375]];
  return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 8);
}

const paintVert = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
// Kuwahara turns the low-res render into blotted oil. Hunger and nightfall grade toward blood.
const paintFrag = `
uniform sampler2D tScene; uniform vec2 texel; uniform float time, hunger, night, glitch;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 uv = vUv;
  if (glitch > 0.0) {
    float row = floor(uv.y * 48.0);
    float h = hash(vec2(row, floor(time * 24.0)));
    if (h > 1.0 - glitch * 0.6) uv.x += (hash(vec2(row, time)) - 0.5) * 0.1 * glitch;
  }
  vec3 mean[4]; vec3 sq[4];
  for (int q = 0; q < 4; q++) { mean[q] = vec3(0.0); sq[q] = vec3(0.0); }
  for (int j = 0; j <= 2; j++) for (int i = 0; i <= 2; i++) {
    vec3 a = texture2D(tScene, uv + vec2(-i, -j) * texel).rgb;
    vec3 b = texture2D(tScene, uv + vec2( i, -j) * texel).rgb;
    vec3 c = texture2D(tScene, uv + vec2(-i,  j) * texel).rgb;
    vec3 d = texture2D(tScene, uv + vec2( i,  j) * texel).rgb;
    mean[0] += a; sq[0] += a * a; mean[1] += b; sq[1] += b * b;
    mean[2] += c; sq[2] += c * c; mean[3] += d; sq[3] += d * d;
  }
  vec3 col = vec3(0.0); float best = 1e9;
  for (int q = 0; q < 4; q++) {
    vec3 m = mean[q] / 9.0; vec3 v = abs(sq[q] / 9.0 - m * m);
    float s = v.r + v.g + v.b;
    if (s < best) { best = s; col = m; }
  }
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, col * vec3(0.78, 1.0, 0.92) + vec3(0.004, 0.009, 0.01), smoothstep(0.25, 0.0, lum));
  vec3 blood = vec3(lum * 1.5, lum * 0.18, lum * 0.2);
  col = mix(col, blood, clamp(hunger * 0.32 * (1.0 - lum) + night * 0.75, 0.0, 1.0));
  col *= 1.0 - night * 0.35;
  gl_FragColor = vec4(col, 1.0);
}`;
const screenFrag = `
uniform sampler2D tPaint; uniform vec2 resolution; uniform float time, hunger, beat, fade, night;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main(){
  vec2 d = (vUv - 0.5);
  float ab = hunger * 0.0025 + beat * 0.006;
  vec3 col = vec3(texture2D(tPaint, vUv + d * ab).r, texture2D(tPaint, vUv).g, texture2D(tPaint, vUv - d * ab).b);
  col = aces(col * 1.35);
  float v = smoothstep(0.95, 0.25, length(d * vec2(1.25, 1.0)) * (1.0 + beat * 0.35 + night * 0.25));
  col *= mix(0.25, 1.0, v);
  gl_FragColor = vec4(col * (1.0 - fade), 1.0);
  #include <colorspace_fragment>
  float g = hash(vUv * resolution + fract(time) * 91.0) - 0.5;
  gl_FragColor.rgb += g * 0.05;
}`;

export function startWorld(canvas, { reduced = false, hotspotLabel = () => null, onPick = () => {}, onHover = () => {} } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x040506);
  scene.fog = new THREE.FogExp2(0x050607, 0.05);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);
  const hotspots = {};
  const tag = (name, object) => {
    object.traverse((m) => {
      if (m.isMesh) {
        m.userData.hotspot = name;
        (hotspots[name] ??= []).push(m);
      }
    });
    return object;
  };

  scene.add(new THREE.HemisphereLight(0x4a5566, 0x120c08, 2.4));

  // ——— The Last Light ———
  const bar = new THREE.Group();
  scene.add(bar);
  const floor = mesh(new THREE.PlaneGeometry(14, 12), mat(0xffffff, { map: planks([92, 62, 40]), flatShading: false }), 0, 0, 0, bar);
  floor.rotation.x = -Math.PI / 2;
  const wallM = mat(0xffffff, { map: wallpaper, flatShading: false });
  mesh(new THREE.PlaneGeometry(14, 5), wallM, 0, 2.5, -4.6, bar);
  const left = mesh(new THREE.PlaneGeometry(12, 5), wallM, -6.6, 2.5, 0, bar);
  left.rotation.y = Math.PI / 2;
  const trimM = mat(0x2a1c13);
  mesh(box(14, 1.1, 0.08), trimM, 0, 0.55, -4.55, bar);
  mesh(box(0.08, 1.1, 12), trimM, -6.55, 0.55, 0, bar);
  const rainMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, night: { value: 0 } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `uniform float time, night; varying vec2 vUv;
      float h(float n){ return fract(sin(n) * 43758.5453); }
      void main(){
        vec3 col = mix(vec3(0.015, 0.02, 0.045), vec3(0.09, 0.13, 0.22), vUv.y);
        float cols = 60.0; float c = floor(vUv.x * cols);
        float y = fract(vUv.y * 1.3 + time * (0.5 + h(c) * 0.6) + h(c * 7.1));
        float s = smoothstep(0.0, 0.1, y) * smoothstep(0.3, 0.1, y) * step(0.5, h(c * 3.3)) * smoothstep(0.5, 0.05, abs(fract(vUv.x * cols) - 0.5));
        col += s * vec3(0.22, 0.28, 0.36);
        col += vec3(0.5, 0.35, 0.15) * smoothstep(0.08, 0.0, length(vUv - vec2(0.3, 0.25))) * 0.4;
        gl_FragColor = vec4(col * (1.0 - night), 1.0);
      }`,
  });
  for (const z of [-1.8, 1.4]) {
    const win = mesh(new THREE.PlaneGeometry(1.6, 2.1), rainMat, -6.55, 2.2, z, bar);
    win.rotation.y = Math.PI / 2;
    mesh(box(0.12, 2.3, 0.1), trimM, -6.5, 2.2, z, bar);
    mesh(box(0.12, 0.1, 1.8), trimM, -6.5, 2.2, z, bar);
    mesh(box(0.2, 0.1, 1.9), trimM, -6.48, 1.12, z, bar);
  }
  const windowLight = new THREE.SpotLight(0x4f6c9e, 70, 16, 0.7, 0.8, 1.6);
  windowLight.position.set(-8.5, 3.4, 0);
  windowLight.target.position.set(-2, 0, 0);
  bar.add(windowLight, windowLight.target);

  // The counter, the back bar and its bottles.
  const wood = mat(0x3b2416), darkWood = mat(0x22150d);
  mesh(box(6.4, 1.08, 0.75), wood, 2.2, 0.54, -3.25, bar);
  mesh(box(6.6, 0.07, 0.95), darkWood, 2.2, 1.11, -3.25, bar);
  mesh(cyl(0.025, 0.025, 6.4, 6), mat(0xb08a4a, { metalness: 0.8, roughness: 0.35 }), 2.2, 0.18, -2.8, bar).rotation.z = Math.PI / 2;
  mesh(box(6.4, 2.6, 0.06), mat(0x1a2226, { metalness: 0.9, roughness: 0.18 }), 2.2, 2.35, -4.52, bar);
  const bottleGeo = makeBottleGeometry();
  const glassColors = [0x2f5b33, 0x6b3a14, 0x8a6a2a, 0x3c4d55, 0x5a1a1e, 0x9aa38f];
  const shelfYs = [1.45, 2.05, 2.65];
  const bottles = new THREE.InstancedMesh(bottleGeo, new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.1, emissive: 0x0a0604 }), shelfYs.length * 26);
  const dummy = new THREE.Object3D();
  let n = 0;
  for (const y of shelfYs) {
    mesh(box(6.4, 0.05, 0.3), darkWood, 2.2, y - 0.03, -4.38, bar);
    for (let i = 0; i < 26; i++) {
      dummy.position.set(-0.9 + i * 0.24 + rand() * 0.05, y, -4.38);
      const s = 0.8 + rand() * 0.5;
      dummy.scale.set(s * 0.9, s, s * 0.9);
      dummy.updateMatrix();
      bottles.setMatrixAt(n, dummy.matrix);
      bottles.setColorAt(n++, new THREE.Color(glassColors[Math.floor(rand() * glassColors.length)]));
    }
  }
  bar.add(bottles);
  const neon = mesh(
    new THREE.PlaneGeometry(2.2, 0.5),
    new THREE.MeshBasicMaterial({
      transparent: true,
      map: canvasTexture(512, 116, (g, w, h) => {
        g.font = "bold 70px Georgia, serif";
        g.textAlign = "center";
        g.shadowColor = "#ff3b2f";
        g.shadowBlur = 18;
        g.fillStyle = "#ffb0a0";
        g.fillText("THE LAST LIGHT", w / 2, 82);
      }),
    }),
    2.2, 3.95, -4.5, bar,
  );
  const neonLight = new THREE.PointLight(0xff3424, 7, 5, 2);
  neonLight.position.set(2.2, 3.6, -4);
  bar.add(neonLight);
  const pendants = [0.6, 2.2, 3.8].map((x) => {
    mesh(cyl(0.005, 0.005, 1.6, 4), mat(0x111111), x, 3.7, -3.2, bar);
    mesh(new THREE.ConeGeometry(0.2, 0.18, 8, 1, true), mat(0x2d3a2d, { side: THREE.DoubleSide }), x, 2.85, -3.2, bar);
    const light = new THREE.PointLight(0xff9548, 9, 5, 2);
    light.position.set(x, 2.7, -3.2);
    bar.add(light);
    return light;
  });
  const barkeep = makeFigure({ seated: false, coat: 0x3f3226, skin: 0xd0aa8c, hair: 0x5a5148, apron: true });
  barkeep.group.position.set(3.1, 0, -3.95);
  barkeep.arms[1].shoulder.rotation.x = -0.9;
  barkeep.arms[1].elbow.rotation.x = -1.4;
  barkeep.arms[0].shoulder.rotation.x = -0.6;
  barkeep.arms[0].elbow.rotation.x = -1.6;
  bar.add(barkeep.group);
  const glassM = new THREE.MeshStandardMaterial({ color: 0xc8d8d0, transparent: true, opacity: 0.35, roughness: 0.1 });
  mesh(cyl(0.04, 0.035, 0.1, 8), glassM, 0, -0.3, 0.05, barkeep.arms[1].elbow);

  // Tables and chairs. Closing time: chairs up on the far tables.
  function chair(parent, x, z, rot, upside = false) {
    const c = new THREE.Group();
    mesh(box(0.44, 0.05, 0.42), darkWood, 0, 0.47, 0, c);
    mesh(box(0.44, 0.5, 0.05), darkWood, 0, 0.74, -0.2, c);
    for (const [a, b] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) mesh(box(0.04, 0.47, 0.04), darkWood, a, 0.235, b, c);
    c.position.set(x, 0, z);
    c.rotation.y = rot;
    if (upside) {
      c.rotation.x = Math.PI;
      c.position.y = 1.72;
    }
    parent.add(c);
    return c;
  }
  function table(parent, x, z) {
    mesh(cyl(0.7, 0.7, 0.06, 18), wood, x, 0.75, z, parent);
    mesh(cyl(0.06, 0.08, 0.72, 8), darkWood, x, 0.37, z, parent);
    mesh(cyl(0.3, 0.34, 0.04, 10), darkWood, x, 0.02, z, parent);
  }
  table(bar, 0, 0);
  chair(bar, 0, -0.85, 0);
  const writerChair = chair(bar, 0, 0.85, Math.PI);
  for (const [x, z] of [[-3.6, -1.6], [-3.2, 2.4], [3.4, 2.2]]) {
    table(bar, x, z);
    chair(bar, x - 0.3, z, Math.PI / 2, true);
    chair(bar, x + 0.3, z, -Math.PI / 2, true);
  }
  const stranger = makeFigure({ hat: true, skin: 0xb9ab9e });
  stranger.group.position.set(0, 0, -0.85);
  bar.add(stranger.group);
  const writer = makeFigure({ hat: true, skin: 0xb9ab9e });
  writer.group.position.set(0, 0, 0.85);
  writer.group.rotation.y = Math.PI;
  bar.add(writer.group);
  for (const f of [stranger, writer])
    for (const a of f.arms) {
      a.shoulder.rotation.x = -0.45;
      a.elbow.rotation.x = -1.15;
      a.shoulder.rotation.z = a.shoulder.position.x > 0 ? 0.25 : -0.25;
    }
  const strangerMats = [];
  stranger.group.traverse((m) => {
    if (m.isMesh) {
      m.material = m.material.clone();
      strangerMats.push(m.material);
    }
  });
  const cigarette = mesh(cyl(0.008, 0.008, 0.09, 5), mat(0xe8e2d0), 0.02, -0.31, 0.05, stranger.arms[1].elbow);
  cigarette.rotation.x = Math.PI / 2;
  const ember = mesh(new THREE.SphereGeometry(0.012, 5, 4), new THREE.MeshBasicMaterial({ color: 0xff6a20 }), 0, 0.05, 0, cigarette);
  const emberLight = new THREE.PointLight(0xff6a2a, 0.5, 1.4, 2);
  ember.add(emberLight);
  const standing = makeFigure({ seated: false, hat: true, skin: 0xb9ab9e });
  standing.group.position.set(-0.8, 0, 0.75);
  standing.group.rotation.y = Math.PI * 0.7;
  standing.group.visible = false;
  bar.add(standing.group);
  const monster = makeMonster();
  monster.group.position.set(0.5, 0, 0.9);
  monster.group.rotation.y = Math.PI * 0.82;
  monster.group.visible = false;
  bar.add(monster.group);
  // Only the outline survives the dark: a thin red light from behind, toward the bar.
  const rim = new THREE.SpotLight(0xff2a1a, 0, 9, 0.6, 0.5, 1.4);
  rim.position.set(-1.5, 3.4, 2.8);
  rim.target = monster.group;
  bar.add(rim);

  // Table props: two glasses, one ashtray, the journal.
  const tableTop = 0.78;
  mesh(cyl(0.045, 0.04, 0.11, 10), glassM, 0.22, tableTop + 0.055, -0.25, bar);
  mesh(cyl(0.04, 0.036, 0.06, 10), mat(0x8a4a10, { roughness: 0.2 }), 0.22, tableTop + 0.03, -0.25, bar);
  mesh(cyl(0.045, 0.04, 0.11, 10), glassM, -0.25, tableTop + 0.055, 0.3, bar);
  mesh(cyl(0.08, 0.07, 0.03, 10), mat(0x3a3f44, { metalness: 0.6, roughness: 0.4 }), -0.25, tableTop + 0.015, -0.2, bar);
  const barJournal = tag("journal", new THREE.Group());
  mesh(box(0.26, 0.04, 0.34), mat(0x4a2a18), 0, 0, 0, barJournal);
  mesh(box(0.24, 0.03, 0.32), mat(0xd8cdb4), 0.01, 0.012, 0, barJournal);
  barJournal.position.set(0.08, tableTop + 0.02, 0.28);
  barJournal.rotation.y = 0.3;
  bar.add(barJournal);

  const lampShade = mesh(new THREE.ConeGeometry(0.32, 0.26, 10, 1, true), mat(0x2b3a2e, { side: THREE.DoubleSide }), 0, 2.45, 0, bar);
  tag("lamp", lampShade);
  mesh(cyl(0.006, 0.006, 2.2, 4), mat(0x111111), 0, 3.65, 0, bar);
  const bulb = mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd6a0 }), 0, 2.34, 0, bar);
  // The cone is cut to the tabletop: hands, glasses, the journal. Faces sit just above it.
  const lamp = new THREE.SpotLight(0xffaa66, 60, 9, 0.5, 0.45, 1.7);
  lamp.position.set(0, 2.35, 0);
  lamp.target.position.set(0, 0, 0);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(1024, 1024);
  lamp.shadow.bias = -0.0015;
  bar.add(lamp, lamp.target);

  // Dust turning in the lamp cone.
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(160 * 3);
  for (let i = 0; i < 160; i++) {
    const r = Math.sqrt(rand()) * 0.9, a = rand() * Math.PI * 2;
    dustPos.set([Math.cos(a) * r, 0.8 + rand() * 1.5, Math.sin(a) * r], i * 3);
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xffd8a8, size: 0.012, transparent: true, opacity: 0.6 }));
  bar.add(dust);

  // Smoke from his cigarette.
  const smokeTex = canvasTexture(64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(200,200,200,.5)");
    grad.addColorStop(1, "rgba(200,200,200,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  });
  const smoke = Array.from({ length: 10 }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 }));
    s.userData.age = i / 10;
    bar.add(s);
    return s;
  });

  // ——— The study, three nights earlier and the night after ———
  const study = new THREE.Group();
  study.position.copy(DESK);
  scene.add(study);
  const sFloor = mesh(new THREE.PlaneGeometry(6, 6), mat(0xffffff, { map: planks([70, 50, 36]), flatShading: false }), 0, 0, 0, study);
  sFloor.rotation.x = -Math.PI / 2;
  const studyWall = mat(0x2a2620);
  mesh(new THREE.PlaneGeometry(6, 4), studyWall, 0, 2, -2.1, study);
  const sLeft = mesh(new THREE.PlaneGeometry(6, 4), studyWall, -2.4, 2, 0, study);
  sLeft.rotation.y = Math.PI / 2;
  const sWin = mesh(new THREE.PlaneGeometry(1.1, 1.4), rainMat, -2.38, 1.8, -0.4, study);
  sWin.rotation.y = Math.PI / 2;
  mesh(box(0.1, 0.08, 1.2), trimM, -2.35, 1.1, -0.4, study);
  const studyWindow = new THREE.SpotLight(0x506d9c, 14, 8, 0.8, 0.8, 1.6);
  studyWindow.position.set(-3.6, 2.4, -0.4);
  studyWindow.target.position.set(0, 0.5, -0.4);
  study.add(studyWindow, studyWindow.target);
  mesh(box(1.7, 0.06, 0.85), wood, 0, 0.74, -0.75, study);
  for (const [a, b] of [[-0.78, -1.1], [0.78, -1.1], [-0.78, -0.4], [0.78, -0.4]]) mesh(box(0.06, 0.72, 0.06), darkWood, a, 0.36, b, study);
  chair(study, 0, 0.12, Math.PI);
  const deskWriter = makeFigure({ hat: true, skin: 0xb9ab9e });
  deskWriter.group.position.set(0, 0, 0.12);
  deskWriter.group.rotation.y = Math.PI;
  for (const a of deskWriter.arms) {
    a.shoulder.rotation.x = -0.6;
    a.elbow.rotation.x = -1.0;
  }
  deskWriter.group.visible = false;
  study.add(deskWriter.group);
  const typewriter = tag("manuscript", new THREE.Group());
  mesh(box(0.42, 0.1, 0.32), mat(0x161718, { roughness: 0.4 }), 0, 0.05, 0, typewriter);
  mesh(box(0.36, 0.08, 0.12), mat(0x161718, { roughness: 0.4 }), 0, 0.13, -0.1, typewriter);
  mesh(cyl(0.025, 0.025, 0.46, 8), mat(0x0d0d0d), 0, 0.17, -0.14, typewriter).rotation.z = Math.PI / 2;
  const sheet = mesh(box(0.24, 0.3, 0.004), mat(0xe9e2cf), 0, 0.3, -0.16, typewriter);
  sheet.rotation.x = -0.15;
  typewriter.position.set(-0.15, 0.77, -0.75);
  study.add(typewriter);
  // The parcel opens in three movements: the string snaps, the lid comes off, the diary and letter rise.
  const parcel = new THREE.Group();
  const kraft = mat(0x9b7b55), twine = mat(0xd9ccb0);
  const parcelBox = tag("parcel", new THREE.Group());
  mesh(box(0.36, 0.11, 0.28), kraft, 0, 0.055, 0, parcelBox);
  mesh(box(0.34, 0.002, 0.26), mat(0x3a2c1e), 0, 0.111, 0, parcelBox);
  const lid = tag("parcel", new THREE.Group());
  mesh(box(0.375, 0.035, 0.295), kraft, 0, 0, 0, lid);
  const strings = [mesh(box(0.38, 0.14, 0.012), twine, 0, -0.045, 0), mesh(box(0.012, 0.14, 0.3), twine, 0, -0.045, 0)];
  for (const st of strings) lid.add(st);
  mesh(box(0.05, 0.02, 0.05), twine, 0, 0.02, 0, lid);
  const diary = tag("journal", new THREE.Group());
  mesh(box(0.22, 0.04, 0.3), mat(0x4a2a18), 0, 0, 0, diary);
  mesh(box(0.2, 0.032, 0.285), mat(0xd8cdb4), 0.012, 0, 0, diary);
  const letter = tag("journal", mesh(box(0.2, 0.004, 0.26), mat(0xe8e0cc)));
  parcel.add(parcelBox, lid, diary, letter);
  parcel.position.set(0.42, 0.77, -0.62);
  study.add(parcel);
  const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);
  let parcelOpenedAt = null;
  function poseParcel(now) {
    const t = parcelOpenedAt === null ? 0 : reduced ? 9 : (now - parcelOpenedAt) / 1000;
    // String: a tug, then it slackens and falls away.
    const snap = smooth(0.25, 0.55, t);
    strings.forEach((st, i) => {
      st.scale.set(1 + Math.sin(Math.min(t, 0.25) * 40) * 0.02, 1, 1);
      st.position.y = -0.045 - snap * 0.03;
      st.rotation.z = i ? 0 : snap * 0.5;
      st.rotation.x = i ? snap * 0.5 : 0;
      st.visible = snap < 1;
    });
    // Lid: up, tipped back, set down behind the box.
    const rise = smooth(0.45, 1.05, t), away = smooth(0.9, 1.7, t);
    lid.position.set(away * 0.1, 0.128 + rise * 0.22 - away * 0.33, -away * 0.27);
    lid.rotation.set(-rise * 0.5 + away * 0.5, away * 0.3, 0);
    // Diary rises out of the box and lies across it; the letter slips out on top.
    const up = smooth(1.3, 1.9, t), out = smooth(1.8, 2.6, t);
    diary.position.set(-0.02, 0.09 + up * 0.16 - out * 0.115, out * 0.03);
    diary.rotation.set(0, out * 0.25, Math.sin(up * Math.PI) * 0.12);
    const slip = smooth(2.1, 2.9, t);
    letter.position.set(0.02 + slip * 0.06, 0.1 + up * 0.17 - slip * 0.11, 0.02 + slip * 0.07);
    letter.rotation.set(0, -slip * 0.5, Math.sin(slip * Math.PI) * 0.25);
    diary.visible = letter.visible = t > 0;
  }
  const deskLamp = new THREE.Group();
  mesh(cyl(0.08, 0.1, 0.03, 10), mat(0x2b2b20, { metalness: 0.6 }), 0, 0.015, 0, deskLamp);
  mesh(cyl(0.012, 0.012, 0.45, 5), mat(0x2b2b20, { metalness: 0.6 }), 0, 0.24, 0, deskLamp);
  mesh(new THREE.ConeGeometry(0.13, 0.16, 10, 1, true), mat(0x274a2e, { side: THREE.DoubleSide }), 0.06, 0.48, 0.05, deskLamp).rotation.z = 0.3;
  deskLamp.position.set(-0.62, 0.77, -0.95);
  study.add(deskLamp);
  const deskLight = new THREE.SpotLight(0xffb070, 22, 6, 0.9, 0.7, 1.7);
  deskLight.position.set(-0.55, 1.22, -0.88);
  deskLight.target.position.set(0.1, 0.77, -0.55);
  deskLight.castShadow = true;
  deskLight.shadow.mapSize.set(1024, 1024);
  deskLight.shadow.bias = -0.0015;
  study.add(deskLight, deskLight.target);
  // Three hundred and eleven biographies.
  const books = new THREE.InstancedMesh(box(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.9 }), 311);
  const spineColors = [0x3a1612, 0x1f2a22, 0x2a2018, 0x141820, 0x4a3a22, 0x2e1a2a];
  let b = 0;
  for (let row = 0; row < 5 && b < 311; row++) {
    const y = 1.2 + row * 0.42;
    mesh(box(3.8, 0.03, 0.26), darkWood, 0, y - 0.02, -1.95, study);
    let x = -1.85;
    while (x < 1.85 && b < 311) {
      const w = 0.025 + rand() * 0.035, h = 0.26 + rand() * 0.1;
      dummy.position.set(x + w / 2, y + h / 2, -1.95);
      dummy.scale.set(w, h, 0.2);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      books.setMatrixAt(b, dummy.matrix);
      books.setColorAt(b++, new THREE.Color(spineColors[Math.floor(rand() * spineColors.length)]));
      x += w + 0.003;
    }
  }
  study.add(books);
  const shelfLight = new THREE.PointLight(0xffa060, 4, 4, 2);
  shelfLight.position.set(0.4, 2.6, -1.2);
  study.add(shelfLight);

  scene.traverse((m) => {
    if (m.isMesh && m.material !== rainMat && m !== neon && m !== bulb && m.material !== glassM) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });

  // ——— Rendering: low-res scene → painted → screen ———
  const sceneRT = new THREE.WebGLRenderTarget(2, 2, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType });
  const paintRT = new THREE.WebGLRenderTarget(2, 2, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType });
  const quadGeo = new THREE.BufferGeometry();
  quadGeo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  quadGeo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const paint = new THREE.ShaderMaterial({
    uniforms: { tScene: { value: sceneRT.texture }, texel: { value: new THREE.Vector2() }, time: { value: 0 }, hunger: { value: 0 }, night: { value: 0 }, glitch: { value: 0 } },
    vertexShader: paintVert,
    fragmentShader: paintFrag,
  });
  const screen = new THREE.ShaderMaterial({
    uniforms: { tPaint: { value: paintRT.texture }, resolution: { value: new THREE.Vector2() }, time: { value: 0 }, hunger: { value: 0 }, beat: { value: 0 }, fade: { value: 1 }, night: { value: 0 } },
    vertexShader: paintVert,
    fragmentShader: screenFrag,
  });
  const postScene = new THREE.Scene();
  const quad = new THREE.Mesh(quadGeo, paint);
  quad.frustumCulled = false;
  postScene.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let inset = 0;
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    const lowH = Math.max(220, Math.min(400, Math.round(h / 2.6)));
    const lowW = Math.round((lowH * w) / h);
    sceneRT.setSize(lowW, lowH);
    paintRT.setSize(lowW, lowH);
    paint.uniforms.texel.value.set(1 / lowW, 1 / lowH);
    screen.uniforms.resolution.value.set(w, h);
    camera.aspect = (w + inset) / h;
    camera.setViewOffset(w + inset, h, inset, 0, w, h);
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);

  // ——— Direction ———
  const camPos = new THREE.Vector3(...SHOTS["desk-parcel"].pos);
  const camLook = new THREE.Vector3(...SHOTS["desk-parcel"].look);
  let shot = SHOTS["desk-parcel"];
  let fov = shot.fov;
  const mood = { hunger: 0, presence: 0, night: 0, nightTarget: 0, fade: 1, fadeTarget: 0, glitch: 0, beat: 0, vanishUntil: 0, strangerGone: false, phase: "none", phaseAt: 0 };
  const pointer = new THREE.Vector2(), parallax = new THREE.Vector2();
  let hovered = null, tappedAt = -Infinity;

  function setShot(name, { cut = false } = {}) {
    shot = SHOTS[name];
    if (cut || reduced) {
      camPos.set(...shot.pos);
      camLook.set(...shot.look);
      fov = shot.fov;
    }
  }
  function setHighlight(name, on) {
    for (const m of hotspots[name] ?? []) m.material.emissive?.setHex(on ? 0x3a2410 : 0x000000);
  }
  const raycaster = new THREE.Raycaster();
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(Object.values(hotspots).flat().filter((m) => m.visible && isShown(m)), false)[0];
    const name = hit && hotspotLabel(hit.object.userData.hotspot) ? hit.object.userData.hotspot : null;
    if (name !== hovered) {
      if (hovered) setHighlight(hovered, false);
      hovered = name;
      if (name) setHighlight(name, true);
      canvas.style.cursor = name ? "pointer" : "";
    }
    onHover(name && hotspotLabel(name), e.clientX, e.clientY);
  });
  canvas.addEventListener("pointerleave", () => {
    if (hovered) setHighlight(hovered, false);
    hovered = null;
    onHover(null);
  });
  canvas.addEventListener("click", () => {
    if (!hovered) return;
    if (hovered === "lamp") tappedAt = performance.now();
    onPick(hovered);
  });
  function isShown(m) {
    for (let o = m; o; o = o.parent) if (!o.visible) return false;
    return true;
  }
  function setOpacity(mats, o) {
    for (const m of mats) {
      m.transparent = o < 1;
      m.opacity = o;
      m.depthWrite = o >= 1;
    }
  }

  // ——— Frame loop ———
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const k = 1 - Math.exp(-dt * (reduced ? 50 : 1.8));
    const drift = reduced ? 0 : 1;
    parallax.lerp(pointer, 1 - Math.exp(-dt * 2));
    camPos.lerp(new THREE.Vector3(...shot.pos), k);
    camLook.lerp(new THREE.Vector3(...shot.look), k);
    fov += (shot.fov - fov) * k;
    camera.position.copy(camPos).add(new THREE.Vector3(Math.sin(t * 0.21) * 0.06 + parallax.x * 0.12, Math.sin(t * 0.17) * 0.04 + parallax.y * 0.06, 0).multiplyScalar(drift));
    camera.lookAt(camLook);
    camera.fov = fov;
    camera.updateProjectionMatrix();

    mood.fade += (mood.fadeTarget - mood.fade) * (1 - Math.exp(-dt * 3));
    mood.night += (mood.nightTarget - mood.night) * (1 - Math.exp(-dt * 0.9));
    mood.beat *= Math.exp(-dt * 5);
    mood.glitch = Math.max(0, mood.glitch - dt * 1.4);

    // Lights: steady lamp with rare dips, more of them as the hunger grows.
    const flick = reduced ? 0 : Math.max(lampFlicker(now * (1 + mood.hunger * 0.25)), now - tappedAt < 1200 ? lampFlicker(now - tappedAt + 17000) : 0);
    const out = (delay) => (mood.phase === "fed" ? THREE.MathUtils.clamp(1 - (now - mood.phaseAt - delay) / 400, 0, 1) : 1);
    const dim = mood.phase === "compelled" ? 0.45 : 1;
    lamp.intensity = 55 * (1 - flick * 0.85) * out(0) * dim;
    bulb.material.color.setScalar(Math.max(0.05, (1 - flick * 0.85) * out(0)));
    pendants.forEach((p, i) => (p.intensity = 9 * out(700 + i * 260) * dim));
    neonLight.intensity = 7 * out(1600) * (Math.sin(t * 37) > 0.97 - mood.hunger * 0.02 ? 0.3 : 1);
    neon.material.opacity = out(1600);
    windowLight.intensity = 70 * out(2300);
    rainMat.uniforms.time.value = t;
    rainMat.uniforms.night.value = 1 - out(2300);

    // The stranger: fades in, smokes, and is not always there.
    mood.presence = Math.min(1, mood.presence + dt / 2.4);
    const vanishing = now < mood.vanishUntil;
    const flickerHide = vanishing && !reduced ? Math.sin(now * 0.09) > -0.2 : vanishing;
    stranger.group.visible = !mood.strangerGone && !flickerHide && mood.presence > 0;
    setOpacity(strangerMats, mood.presence);
    const puff = reduced ? 0 : smokingFrame(now % 27000);
    const lift = puff ? Math.sin((Math.min(puff, 8) / 8) * Math.PI) : 0;
    stranger.arms[1].elbow.rotation.x = -1.15 - lift * 1.1;
    stranger.arms[1].shoulder.rotation.x = -0.45 - lift * 0.35;
    stranger.head.rotation.x = Math.sin(t * 0.4) * 0.04 + 0.12;
    emberLight.intensity = stranger.group.visible ? 0.4 + lift * 0.8 + Math.sin(t * 9) * 0.05 : 0;
    // His eyes are only there when something lights them: the ember, or your pulse.
    const glint = stranger.group.visible ? 0.3 + lift * 0.4 + mood.beat * 0.8 : 0;
    stranger.eyes.forEach((e) => {
      e.visible = true;
      e.material.color.setRGB(glint, glint * 0.1, glint * 0.05);
    });
    poseParcel(now);
    ember.updateWorldMatrix(true, false);
    const emberAt = new THREE.Vector3().setFromMatrixPosition(ember.matrixWorld);
    for (const s of smoke) {
      s.userData.age = (s.userData.age + dt * 0.18) % 1;
      const a = s.userData.age;
      s.position.copy(emberAt).add(new THREE.Vector3(Math.sin(a * 6 + t) * 0.05 * a, a * 0.9, Math.cos(a * 5) * 0.04 * a));
      s.scale.setScalar(0.05 + a * 0.35);
      s.material.opacity = stranger.group.visible && !reduced ? Math.sin(a * Math.PI) * 0.22 : 0;
    }
    writer.head.rotation.y = Math.sin(t * 0.3) * 0.08;
    const breathe = 1 + Math.sin(t * 1.1) * 0.006;
    stranger.group.scale.y = breathe;
    barkeep.arms[1].elbow.rotation.z = Math.sin(t * 2.2) * 0.25;
    barkeep.head.rotation.y = mood.phase === "none" ? Math.sin(t * 0.13) * 0.5 : 0.6;
    if (!reduced) {
      const d = dust.geometry.attributes.position;
      for (let i = 0; i < d.count; i++) d.setY(i, 0.8 + ((d.getY(i) - 0.8 + dt * 0.03) % 1.5));
      d.needsUpdate = true;
      dust.rotation.y += dt * 0.02;
    }

    // The writer, when the lights are gone.
    if (monster.group.visible) {
      const twitch = !reduced && Math.sin(t * 1.7) > 0.93 ? (Math.sin(t * 40) > 0 ? 0.35 : -0.25) : 0;
      monster.head.rotation.z = twitch;
      monster.spine.rotation.x = 0.5 + Math.sin(t * 0.9) * 0.04;
      monster.arms[0].shoulder.rotation.x = -0.5 + Math.sin(t * 0.7) * 0.05;
      monster.arms[1].shoulder.rotation.x = -1.1 + Math.sin(t * 0.6) * 0.08;
      monster.arms[1].elbow.rotation.x = -0.4;
      monster.glow.intensity = 0.35 + Math.sin(t * 3) * 0.08;
      monster.group.position.lerp(new THREE.Vector3(1.25, 0, -0.9), 1 - Math.exp(-dt * (reduced ? 50 : 0.12)));
    }
    if (mood.phase === "fed" && now - mood.phaseAt > 2600) monster.group.visible = true;
    rim.intensity = monster.group.visible ? 40 + Math.sin(t * 2) * 6 : 0;
    dust.visible = mood.night < 0.4;
    if (mood.phase === "spared") standing.group.position.lerp(new THREE.Vector3(5.2, 0, 4.4), 1 - Math.exp(-dt * 0.35));

    paint.uniforms.time.value = screen.uniforms.time.value = t;
    paint.uniforms.hunger.value = screen.uniforms.hunger.value = Math.min(1, mood.hunger / 6);
    paint.uniforms.night.value = screen.uniforms.night.value = mood.night;
    paint.uniforms.glitch.value = reduced ? 0 : mood.glitch;
    screen.uniforms.beat.value = reduced ? 0 : mood.beat;
    screen.uniforms.fade.value = mood.fade;

    renderer.setRenderTarget(sceneRT);
    renderer.render(scene, camera);
    quad.material = paint;
    renderer.setRenderTarget(paintRT);
    renderer.render(postScene, postCam);
    quad.material = screen;
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
    canvas.dataset.artReady = "true";
    requestAnimationFrame(frame);
  }
  resize();
  requestAnimationFrame(frame);

  return {
    setInset(px) {
      inset = px;
      resize();
    },
    shot: setShot,
    // A hard cut through black, for changes of place.
    cut(name, then) {
      mood.fadeTarget = 1;
      setTimeout(() => {
        setShot(name, { cut: true });
        then?.();
        mood.fadeTarget = 0;
      }, reduced ? 0 : 650);
    },
    parcel(open) {
      parcelOpenedAt = open ? performance.now() : null;
    },
    strangerArrives() {
      mood.presence = 0;
      mood.strangerGone = false;
    },
    hunger(level) {
      mood.hunger = level;
    },
    writerAtDesk(on) {
      deskWriter.group.visible = on;
    },
    cue(kind) {
      if (kind === "glitch") mood.glitch = 1;
      if (kind === "heartbeat") {
        mood.beat = 1;
        setTimeout(() => (mood.beat = Math.max(mood.beat, 0.7)), 260);
      }
      if (kind === "vanish") {
        mood.glitch = 1;
        mood.vanishUntil = performance.now() + 1600;
      }
    },
    // The interview is over. Stand up; there is no one across the table.
    reveal() {
      mood.strangerGone = true;
      mood.glitch = 1;
      writer.group.visible = false;
      writerChair.rotation.y = Math.PI * 0.8;
      writerChair.position.z = 1.05;
      standing.group.visible = true;
      setShot("table");
    },
    nightfall(fate) {
      mood.phase = fate;
      mood.phaseAt = performance.now();
      if (fate === "fed") {
        mood.nightTarget = 1;
        mood.beat = 1;
        setTimeout(() => {
          standing.group.visible = false;
          setShot("prey", { cut: true });
        }, reduced ? 0 : 2500);
      } else if (fate === "compelled") {
        standing.eyes.forEach((e) => (e.visible = true));
        mood.nightTarget = 0.35;
        setShot("prey");
      } else setShot("exit");
    },
    resetNight() {
      Object.assign(mood, { night: 0, nightTarget: 0, phase: "none", strangerGone: false, presence: 0 });
      writer.group.visible = true;
      writerChair.rotation.y = Math.PI;
      writerChair.position.z = 0.85;
      standing.group.visible = false;
      standing.group.position.set(-0.8, 0, 0.75);
      standing.eyes.forEach((e) => (e.visible = false));
      monster.group.visible = false;
      monster.group.position.set(0.5, 0, 0.9);
    },
  };
}
