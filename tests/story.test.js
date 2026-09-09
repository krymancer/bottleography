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
test("all endings reachable even against four interview judgments", () => {
  for (const tone of ["Hero", "Monster", "Nobody"]) {
    const s = freshState();
    s.scene = "desk";
    s.decisions = [0, 1, 2, 3].map((question) => ({
      question,
      action: "believe",
    }));
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
test("all 27 chapter paths finish with skipped interview", () => {
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++)
      for (let c = 0; c < 3; c++) {
        const s = freshState();
        s.scene = "desk";
        [a, b, c].forEach((i) => assert.ok(pickBeat(s, i)));
        assert.equal(s.scene, "end");
        assert.ok(["Hero", "Monster", "Nobody"].includes(dominant(s)));
      }
});
test("tied chapter tones follow latest chosen tone", () => {
  const s = freshState();
  s.scene = "desk";
  for (const [i, tone] of ["Hero", "Monster", "Nobody"].entries())
    pickBeat(
      s,
      beats[i].options.findIndex((p) => p.tone === tone),
    );
  assert.deepEqual(score(s), { Hero: 2, Monster: 2, Nobody: 2 });
  assert.equal(dominant(s), "Nobody");
});
