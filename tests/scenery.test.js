import test from "node:test";
import assert from "node:assert/strict";
import { lampFlicker, smokingFrame } from "../scenery.js";

test("bar lamp is steady most of the time, with two bounded dips", () => {
  for (let ms = 0; ms <= 17000; ms += 100) assert.equal(lampFlicker(ms), 0);
  assert.ok(lampFlicker(17210) > 0.7);
  assert.equal(lampFlicker(17500), 0);
  assert.ok(lampFlicker(17950) > 0.39);
  for (let ms = 18100; ms < 23000; ms += 100) assert.equal(lampFlicker(ms), 0);
  for (let ms = 0; ms < 23000; ms += 10) {
    assert.ok(lampFlicker(ms) >= 0 && lampFlicker(ms) <= 0.72);
    assert.equal(lampFlicker(ms), lampFlicker(ms + 23000));
  }
});

test("occasional puff progresses through eight poses and returns to rest", () => {
  assert.equal(smokingFrame(18999), 0);
  [19000,19300,19600,20000,20800,21200,21700,22500].forEach((ms, i) => assert.equal(smokingFrame(ms), i + 1));
  assert.equal(smokingFrame(23500), 0);
  assert.equal(smokingFrame(26999), 0);
  assert.equal(smokingFrame(46000), 1);
});
