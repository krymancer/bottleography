import test from "node:test";
import assert from "node:assert/strict";
import { freshState, judge, pickBeat, doDeed, leaveBar, resolveNightfall } from "../story.js";
import { asides, deeds, nightfall } from "../asides.js";

test("Monster judgments and lines feed the hunger", () => {
  const s = freshState();
  s.current = 0;
  s.stage = "claim";
  s.held = 0;
  judge(s, "pin");
  assert.equal(s.hunger, 1);
  s.scene = "desk";
  pickBeat(s, beatIndex(0, "Monster"));
  assert.equal(s.hunger, 2);
});
test("each deed happens once, only at the bar; watching the barkeep feeds the hunger", () => {
  const s = freshState();
  assert.ok(doDeed(s, "barkeep"));
  assert.equal(doDeed(s, "barkeep"), false);
  assert.equal(s.hunger, 1);
  s.scene = "desk";
  assert.equal(doDeed(s, "mirror"), false);
});
test("leaving mid-claim lets it slide, and only the bar can be left", () => {
  const s = freshState();
  s.current = 1;
  s.stage = "claim";
  assert.ok(leaveBar(s));
  assert.deepEqual(s.decisions, [{ question: 1, action: "slide" }]);
  assert.equal(s.scene, "nightfall");
  assert.equal(leaveBar(s), false);
  assert.equal(resolveNightfall(s, "forgave"), false);
  assert.ok(resolveNightfall(s, "spared"));
  assert.equal(s.barkeep, "spared");
  assert.equal(s.scene, "desk");
});
test("feeding costs two hunger", () => {
  const s = freshState();
  s.scene = "nightfall";
  assert.ok(resolveNightfall(s, "fed"));
  assert.equal(s.hunger, 2);
});
test("every aside has text and only cues effects the room knows", () => {
  const fx = [undefined, "glitch", "heartbeat", "vanish"];
  const all = [...Object.values(asides).flat(), ...Object.values(deeds).flatMap((d) => d.entries), ...nightfall.reveal, ...nightfall.leave.entries, ...nightfall.compel.entries, ...nightfall.fed];
  for (const e of all) {
    assert.equal(typeof e.text, "string");
    assert.ok(fx.includes(e.fx), e.fx);
  }
});
import { beats } from "../story.js";
function beatIndex(n, tone) {
  return beats[n].options.findIndex((o) => o.tone === tone);
}
