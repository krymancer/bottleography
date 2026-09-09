// Deliberately code-drawn placeholder sprites. Replace individual layers with art later.
export function startScenery(canvas, getScene, getPresence = () => 1) {
  let presence = getPresence();
  let previousFrame = 0;
  const c = canvas.getContext("2d");
  c.imageSmoothingEnabled = false;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const r = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const poly = (points, col) => {
    c.fillStyle = col;
    c.beginPath();
    points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  };
  const bottle = (x, y, col, w = 8, h = 25) => {
    r(x + 2, y - 7, w - 4, 7, col);
    r(x + 1, y - 9, w - 2, 2, "#77816a");
    r(x, y, w, h, col);
    r(x + 1, y + 9, w - 2, 7, "#787a5c");
    r(x + 1, y + 2, 1, 6, "#6b77594d");
  };
  function frame(ms) {
    const t = reduced ? 0 : ms / 1000;
    const desk = getScene() !== "bar";
    r(0, 0, 480, 240, "#151d1b");
    // Wall, rain-streaked window, and distant rooftops.
    for (let y = 17; y < 175; y += 25) {
      r(0, y, 480, 1, "#1b2420");
      for (let x = (y % 2) * 23; x < 480; x += 64) r(x, y, 1, 25, "#19221e");
    }
    r(29, 31, 117, 127, "#0d1413");
    r(33, 35, 109, 119, "#30433f");
    r(36, 38, 103, 113, "#243934");
    for (let i = 0; i < 13; i++) {
      const x = 37 + i * 8;
      const h = 15 + ((i * 17) % 39);
      r(x, 113 - h, 9, h + 38, i % 2 ? "#192c28" : "#1c302c");
      r(x + 3, 120 - h, 2, 3, "#777c4b");
    }
    for (let i = 0; i < 31; i++) {
      const x = 38 + ((i * 37) % 98);
      const y = 38 + ((i * 23 + t * (22 + (i % 7))) % 110);
      r(x, y, 1, 5, "#607f7438");
    }
    r(85, 35, 4, 119, "#101d18");
    r(33, 89, 109, 4, "#111d19");
    r(24, 155, 128, 5, "#3d493a");
    if (!desk) {
      // Back bar and small bottles.
      r(331, 48, 129, 5, "#3c4431");
      r(336, 53, 119, 3, "#0d1410");
      r(329, 112, 140, 6, "#494b34");
      r(337, 118, 125, 3, "#0e150f");
      [345, 367, 389, 418, 442].forEach((x, i) =>
        bottle(
          x,
          31 - (i % 2) * 6,
          ["#3c4b36", "#596046", "#434332"][i % 3],
          7,
          17 + (i % 2) * 5,
        ),
      );
      [339, 360, 384, 406, 435, 452].forEach((x, i) =>
        bottle(
          x,
          91 - (i % 3) * 7,
          ["#374c3f", "#626044", "#454e34"][i % 3],
          8,
          20 + (i % 3) * 6,
        ),
      );
      r(316, 149, 164, 7, "#54503a");
      r(324, 156, 156, 24, "#242c22");
      for (let x = 331; x < 480; x += 39) r(x, 157, 2, 20, "#394130");
      // Low pendant, hard-edged pool of light.
      r(223, 0, 2, 30, "#777b4c");
      poly(
        [
          [214, 29],
          [232, 29],
          [243, 43],
          [203, 43],
        ],
        "#5f6545",
      );
      r(207, 43, 32, 3, "#bab775");
      c.globalAlpha = 0.1;
      poly(
        [
          [207, 47],
          [239, 47],
          [306, 183],
          [137, 183],
        ],
        "#c3c78c",
      );
      c.globalAlpha = 1;
      // Booth behind the sitter.
      r(166, 137, 150, 49, "#242c22");
      r(170, 140, 143, 2, "#4e5035");
      r(166, 143, 4, 43, "#3d422e");
      r(309, 143, 5, 43, "#3d422e");
      const target = getPresence();
      const elapsed = Math.min(100, ms - previousFrame);
      previousFrame = ms;
      presence =
        reduced || target === 0
          ? target
          : Math.min(target, presence + elapsed / 2400);
      c.save();
      c.globalAlpha = presence;
      const bob = reduced ? 0 : Math.round(Math.sin(t * 0.9));
      // Silhouette: head, collar, shoulders, bent arm. No identity reveal.
      poly(
        [
          [219, 72 + bob],
          [227, 65 + bob],
          [245, 65 + bob],
          [254, 75 + bob],
          [256, 101 + bob],
          [247, 118 + bob],
          [249, 129],
          [272, 136],
          [286, 167],
          [286, 190],
          [181, 190],
          [188, 153],
          [202, 136],
          [222, 128],
          [223, 116 + bob],
          [215, 99 + bob],
        ],
        "#0d1312",
      );
      poly(
        [
          [218, 76 + bob],
          [224, 70 + bob],
          [240, 69 + bob],
          [224, 73 + bob],
          [220, 98 + bob],
          [224, 107 + bob],
          [218, 102 + bob],
        ],
        "#25302a",
      );
      poly(
        [
          [208, 137],
          [219, 131],
          [228, 144],
          [225, 171],
          [210, 145],
        ],
        "#222b22",
      );
      poly(
        [
          [246, 130],
          [258, 137],
          [245, 146],
          [236, 166],
          [241, 143],
        ],
        "#293024",
      );
      poly(
        [
          [268, 145],
          [280, 157],
          [286, 181],
          [273, 185],
          [258, 164],
          [260, 149],
        ],
        "#19211c",
      );
      poly(
        [
          [259, 162],
          [248, 148],
          [249, 132],
          [254, 122],
          [260, 126],
          [261, 141],
          [274, 163],
        ],
        "#30372a",
      );
      r(255, 124, 13, 2, "#a39e7c");
      r(267, 124, 3, 2, Math.sin(t * 2) > 0 ? "#f5ad69" : "#d77949");
      r(267, 123, 2, 1, "#e2a85c");
      // Smoke is spare, stepped, and constantly drifting.
      for (let i = 0; i < 11; i++) {
        let age = (t * 0.35 + i / 11) % 1;
        let x = 268 + Math.sin(age * 8 + t * 0.5) * 5;
        let y = 122 - age * 57;
        c.globalAlpha = presence * (1 - age) * 0.3;
        r(x, y, 2 + (i % 2), 3, "#a8b4a0");
      }
      c.restore();
      // Table foreground and props.
      poly(
        [
          [59, 183],
          [421, 183],
          [480, 240],
          [0, 240],
        ],
        "#443c29",
      );
      r(59, 183, 362, 3, "#706145");
      for (let i = 0; i < 10; i++)
        r(25 + i * 43, 195 + ((i * 19) % 44), 27, 1, "#554830");
      poly(
        [
          [327, 199],
          [375, 195],
          [382, 209],
          [335, 214],
        ],
        "#77775b",
      );
      poly(
        [
          [334, 200],
          [372, 198],
          [376, 207],
          [339, 211],
        ],
        "#323b2e",
      );
      r(348, 201, 15, 2, "#8b8b69");
      r(363, 201, 3, 2, "#bb7750");
      r(173, 166, 19, 29, "#77887944");
      r(173, 165, 19, 2, "#9ca28b");
      r(175, 177, 15, 15, "#9c6f3655");
      r(174, 169, 2, 22, "#8c9b7955");
      r(173, 193, 19, 2, "#8c9671");
      bottle(112, 162, "#263f2c", 15, 41);
      r(115, 176, 9, 15, "#a2a078");
      r(117, 180, 5, 1, "#525c3d");
      poly(
        [
          [50, 215],
          [117, 210],
          [140, 236],
          [60, 240],
        ],
        "#aeaa87",
      );
      for (let i = 0; i < 4; i++) r(68 + i * 2, 220 + i * 4, 40, 1, "#787b60");
      r(83, 211, 3, 25, "#373d2d");
    } else {
      // Same palette, new room: desk, lamp and manuscript.
      r(323, 31, 106, 105, "#242c22");
      r(328, 36, 96, 95, "#101b17");
      r(341, 48, 70, 1, "#566044");
      r(341, 55, 54, 1, "#46503a");
      poly(
        [
          [52, 152],
          [430, 152],
          [480, 240],
          [0, 240],
        ],
        "#4a402c",
      );
      r(52, 152, 378, 3, "#797054");
      for (let i = 0; i < 15; i++)
        r(i * 35, 173 + ((i * 19) % 64), 30, 1, "#5d4e32");
      r(127, 81, 4, 84, "#62684a");
      r(104, 165, 50, 5, "#343c29");
      poly(
        [
          [112, 61],
          [148, 61],
          [165, 87],
          [95, 87],
        ],
        "#737a4e",
      );
      r(99, 87, 62, 3, "#d9cf8b");
      c.globalAlpha = 0.15;
      poly(
        [
          [99, 90],
          [161, 90],
          [244, 212],
          [50, 212],
        ],
        "#d9cf8b",
      );
      c.globalAlpha = 1;
      poly(
        [
          [208, 114],
          [297, 114],
          [308, 186],
          [199, 186],
        ],
        "#c8c1a0",
      );
      for (let i = 0; i < 9; i++)
        r(220, 129 + i * 5, 59 - (i % 3) * 9, 1, "#7d8267");
      poly(
        [
          [194, 162],
          [311, 162],
          [324, 208],
          [180, 208],
        ],
        "#29332b",
      );
      r(196, 162, 114, 8, "#727961");
      r(202, 168, 101, 5, "#151f19");
      r(210, 171, 82, 3, "#939a7c");
      for (let j = 0; j < 4; j++)
        for (let i = 0; i < 11; i++) {
          r(194 + i * 10 + (j % 2) * 3, 178 + j * 6, 7, 4, "#a3a486");
          r(196 + i * 10 + (j % 2) * 3, 179 + j * 6, 2, 1, "#434d3c");
        }
      r(224, 202, 53, 3, "#9b9d7d");
      poly(
        [
          [353, 180],
          [405, 185],
          [393, 213],
          [337, 206],
        ],
        "#9b9c7b",
      );
      r(351, 191, 32, 1, "#5c664d");
      r(350, 196, 36, 1, "#5c664d");
      r(401, 159, 18, 24, "#697963");
      r(403, 160, 14, 3, "#1d2920");
    }
    // Near foreground shadow anchors the frame.
    poly(
      [
        [0, 224],
        [25, 222],
        [45, 240],
        [0, 240],
      ],
      "#0b1411",
    );
    poly(
      [
        [461, 209],
        [480, 201],
        [480, 240],
        [433, 240],
      ],
      "#101911",
    );
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
