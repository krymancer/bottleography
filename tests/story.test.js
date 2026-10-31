import test from "node:test";
import assert from "node:assert/strict";
import {
  freshState,
  judge,
  pickBeat,
  dominant,
  score,
  beats,
} from "../story.js";
test("pin requires a matching scrap and cannot award twice", () => {
  const s = freshState();
  s.current = 0;
  s.stage = "claim";
  s.held = 1;
  assert.equal(judge(s, "pin"), false);
  assert.equal(s.decisions.length, 0);
  s.held = 0;
  assert.equal(judge(s, "pin"), true);
  assert.equal(judge(s, "pin"), false);
  assert.equal(score(s).Monster, 1);
});
test("river contradiction supports Hero; memory question cannot be pinned", () => {
  const s = freshState();
  s.current = 2;
  s.stage = "claim";
  s.held = 2;
  assert.ok(judge(s, "pin"));
  assert.equal(score(s).Hero, 1);
  s.current = 3;
  s.stage = "claim";
  s.held = null;
  assert.equal(judge(s, "pin"), false);
  assert.ok(judge(s, "slide"));
});
test("both portrayals reachable even against three interview judgments", () => {
  for (const [tone, against] of [["Hero", "pin"], ["Monster", "believe"]]) {
    const s = freshState();
    s.scene = "desk";
    s.decisions = [0, 1, 3].map((question) => ({ question, action: against }));
    for (const beat of beats)
      assert.ok(
        pickBeat(
          s,
          beat.options.findIndex((p) => p.tone === tone),
        ),
      );
    assert.equal(s.scene, "end");
    assert.equal(dominant(s), tone);
    assert.equal(pickBeat(s, 0), false);
  }
});
test("all 8 chapter paths finish with skipped interview", () => {
  for (let a = 0; a < 2; a++)
    for (let b = 0; b < 2; b++)
      for (let c = 0; c < 2; c++) {
        const s = freshState();
        s.scene = "desk";
        [a, b, c].forEach((i) => assert.ok(pickBeat(s, i)));
        assert.equal(s.scene, "end");
        assert.ok(["Hero", "Monster"].includes(dominant(s)));
      }
});
test("letting a claim slide takes no side; a tie follows the last line written", () => {
  const s = freshState();
  s.current = 3;
  s.stage = "claim";
  judge(s, "slide");
  assert.deepEqual(score(s), { Hero: 0, Monster: 0 });
  s.scene = "desk";
  s.decisions.push({ question: 0, action: "pin" }, { question: 1, action: "pin" });
  pickBeat(s, beats[0].options.findIndex((p) => p.tone === "Monster"));
  pickBeat(s, beats[1].options.findIndex((p) => p.tone === "Hero"));
  pickBeat(s, beats[2].options.findIndex((p) => p.tone === "Hero"));
  assert.deepEqual(score(s), { Hero: 4, Monster: 4 });
  assert.equal(dominant(s), "Hero");
});
