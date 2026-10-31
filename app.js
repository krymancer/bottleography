import {
  scraps,
  questions,
  beats,
  endings,
  freshState,
  dominant,
  judge,
  pickBeat,
  doDeed as markDeed,
  opening,
  letter,
  diaryPages,
  introductions,
  leaveBar,
  resolveNightfall,
  epilogues,
  shelf,
} from "./story.js";
import { asides, deeds, nightfall } from "./asides.js";
import { startWorld } from "./world3d.js";
import { sfx, unlock, ambience } from "./audio.js";

const $ = (id) => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let state = freshState();
let parcelOpened = false;
let read = { letter: false, diary: false };
let onPageClosed = null;
let queue = [];
let after = null;
let typing = null;
let waiting = false;
let generation = 0;
let titleTimer = 0;

// ——— Subtitles: one line at a time, bottom centre ———
function escape(text) {
  return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}
const rich = (text) => escape(text).replace(/\*(.+?)\*/g, "<em>$1</em>");
const narr = (text, extra = {}) => ({ kind: "narr", text, ...extra });
const line = (text, who = "THE STRANGER") => ({ who, text });
const title = (text) => ({ kind: "title", text });
const you = (text) => ({ kind: "you", text });
const aside = (id) => asides[id] ?? [];
const kindOf = (e) => e.kind ?? (e.who ? "line" : "narr");
function whoLabel(e) {
  const kind = kindOf(e);
  if (kind === "you") return "YOU";
  if (kind === "line") return e.who;
  return "";
}
function setSubtitle(e) {
  const sub = $("subtitle");
  const kind = kindOf(e);
  const who = whoLabel(e);
  sub.className = `subtitle ${kind}${e.who === "THE STRANGER" ? " stranger" : ""}`;
  sub.innerHTML = `${who ? `<span class="who">${escape(who)}</span>` : ""}<span class="body"></span>`;
  return sub.querySelector(".body");
}
function finishTyping() {
  if (!typing) return false;
  const t = typing;
  typing = null;
  clearInterval(t.timer);
  t.body.innerHTML = rich(t.text);
  t.done();
  return true;
}
function say(e, done) {
  const body = setSubtitle(e);
  if (reduce) {
    body.innerHTML = rich(e.text);
    return done();
  }
  let n = 0;
  const typed = kindOf(e) === "typed";
  typing = { body, text: e.text, done };
  typing.timer = setInterval(() => {
    n += typed ? 1 : 2;
    body.textContent = e.text.slice(0, n).replace(/\*/g, "");
    if (typed) {
      const ch = e.text[n - 1];
      world.typeKey(ch);
      sfx(ch === " " ? "space" : "key");
    }
    if (n >= e.text.length) finishTyping();
  }, typed ? 70 : 22);
}
function showTitle(text) {
  const card = $("title-card");
  card.textContent = text;
  card.classList.remove("show");
  void card.offsetWidth;
  card.classList.add("show");
  clearTimeout(titleTimer);
  titleTimer = setTimeout(() => card.classList.remove("show"), 3600);
}
function play(entries, choices) {
  generation++;
  finishTyping();
  queue = entries.filter(Boolean);
  after = choices;
  next();
}
function next() {
  waiting = false;
  $("subtitle").classList.remove("waiting");
  hideChoices();
  const e = queue.shift();
  if (!e) {
    const list = typeof after === "function" ? after() : after;
    if (list) showChoices(list);
    return;
  }
  cue(e);
  record(e);
  if (e.kind === "title") {
    showTitle(e.text);
    return next();
  }
  const g = generation;
  say(e, () => {
    if (g !== generation) return;
    // Your own line hands straight back to him, the way a conversation does.
    if (e.kind === "you" && queue.length) return setTimeout(() => g === generation && !typing && next(), 700);
    if (queue.length) {
      waiting = true;
      $("subtitle").classList.add("waiting");
    } else next();
  });
}
function advance() {
  if (finishTyping()) return;
  if (waiting) {
    sfx("tick");
    next();
  }
}
function cue(e) {
  if (!e.fx) return;
  world.cue(e.fx);
  sfx(e.fx === "vanish" ? "glitch" : e.fx);
}
function hideChoices() {
  $("choices").replaceChildren();
}
function showChoices(list) {
  const items = list.filter(Boolean).map((c, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = `choice ${c.cls ?? ""}`;
    b.disabled = !!c.done;
    b.innerHTML = `<span class="num">${i + 1}</span><span class="text">${rich(c.text)}</span>`;
    b.onclick = (event) => {
      event.stopPropagation();
      if (b.disabled) return;
      sfx("tick");
      if (!c.keep) hideChoices();
      c.fn();
    };
    li.append(b);
    return li;
  });
  $("choices").replaceChildren(...items);
  $("choices").querySelector("button:not(:disabled)")?.focus({ preventScroll: true });
}

// ——— History: everything said tonight ———
function record(e) {
  const p = document.createElement("p");
  const kind = kindOf(e);
  p.className = `entry ${kind}`;
  const who = whoLabel(e);
  p.innerHTML = (who ? `<span class="who">${escape(who)}</span> ` : "") + rich(e.text);
  $("history").append(p);
}
function place(text) {
  const el = $("place");
  el.textContent = text;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
}

// ——— Pages: the letter and the diary, in two different hands ———
const damaged = (text) => rich(text).replace(/\[\[(.+?)\]\]/g, '<span class="lost">$1</span>');
function letterPage() {
  $("journal").className = "journal page letter-page";
  $("journal").innerHTML = letter.map((p) => `<p>${escape(p)}</p>`).join("") + '<p class="blot"></p>';
}
function diaryPage() {
  const j = $("journal");
  const presenting = state.scene === "bar" && state.stage === "claim" && questions[state.current]?.scrap !== null;
  j.className = `journal page diary-page${presenting ? " presenting" : ""}`;
  j.innerHTML = presenting ? '<p class="ask">Which line says otherwise?</p>' : "";
  for (const page of diaryPages) {
    if (page.scrap === undefined) {
      const p = document.createElement("div");
      p.className = "entry";
      p.innerHTML = `${page.date ? `<p class="date">${page.date}</p>` : ""}<p>${damaged(page.text)}</p>`;
      j.append(p);
      continue;
    }
    const scrap = scraps[page.scrap];
    const b = document.createElement("button");
    b.className = "entry scrap";
    b.disabled = !presenting;
    b.innerHTML = `<p class="date">${scrap.date.toLowerCase().replace(/^\w|\s\w/g, (c) => c.toUpperCase())}</p><p>${damaged(page.before)} <span class="key-line">${escape(scrap.text)}</span> ${damaged(page.after)}</p>`;
    b.onclick = () => present(page.scrap);
    j.append(b);
  }
}
function draft() {
  const j = $("journal");
  j.className = "journal manuscript";
  j.innerHTML = '<div class="journal-top"><span>MANUSCRIPT</span><span>CHAPTER 01</span></div><h2>What remains.</h2><p class="intro">A version of a life. In your words.</p>';
  for (const p of state.picks) j.innerHTML += `<p class="draft-line">${escape(p.text)}</p>`;
  if (state.picks.length < beats.length) j.innerHTML += `<p class="empty-draft">${state.picks.length ? "The next line is still yours." : "The page waits for someone to decide what happened."}</p>`;
}
function openJournal(kind = "diary", then = null) {
  if (kind === "manuscript") draft();
  else if (kind === "letter") letterPage();
  else diaryPage();
  onPageClosed = then;
  hideChoices();
  if (!$("journal-dialog").open) $("journal-dialog").showModal();
  sfx("paper");
}
function closeJournal() {
  if ($("journal-dialog").open) $("journal-dialog").close();
}
function inspectJournal() {
  if (!parcelOpened) return openParcel();
  if (state.scene === "study") return readDiary();
  openJournal();
}

// ——— Three nights ago ———
// Run later, unless the scene has moved on by then.
function later(ms, fn) {
  const g = generation;
  setTimeout(() => g === generation && fn(), reduce ? 0 : ms);
}
function start() {
  state.scene = "study";
  place("YOUR STUDY — THREE NIGHTS AGO");
  world.cut("desk-parcel");
  play([title(opening.title), ...opening.arrive.map((t) => narr(t)), ...aside("opening-0")], [{ text: "(Untie the parcel.)", fn: openParcel }]);
}
function openParcel() {
  if (parcelOpened) return;
  parcelOpened = true;
  generation++;
  finishTyping();
  hideChoices();
  $("subtitle").replaceChildren();
  world.parcel(true);
  sfx("spark");
  later(1500, () => sfx("paper"));
  later(3200, () => sfx("paper"));
  // Let the lid come off and the diary settle before anyone speaks.
  later(5200, () => play([narr(opening.opened)], studyChoices));
}
function studyChoices() {
  return [
    !read.letter && { text: "(Unfold the letter.)", fn: readLetter },
    !read.diary && { text: "(Open the diary.)", fn: readDiary },
    read.letter && read.diary && { text: opening.go, fn: toBar },
  ];
}
function afterReading() {
  return read.letter && read.diary ? [narr(opening.bothRead)] : [];
}
function readLetter() {
  if (!parcelOpened) return openParcel();
  openJournal("letter", () => {
    if (read.letter) return showChoices(studyChoices());
    read.letter = true;
    play([...aside("letter"), ...afterReading()], studyChoices);
  });
}
function readDiary() {
  if (!parcelOpened) return openParcel();
  openJournal("diary", () => {
    if (state.scene !== "study") return;
    if (read.diary) return showChoices(studyChoices());
    read.diary = true;
    play([...aside("diary"), ...afterReading()], studyChoices);
  });
}
function toBar() {
  closeJournal();
  generation++;
  hideChoices();
  $("subtitle").replaceChildren();
  state.scene = "bar";
  state.stage = "arriving";
  world.cut("bar", () => world.strangerArrives(), { slow: true, hold: 2400 });
  later(2200, () => showTitle(opening.barTitle));
  later(5000, () => {
    place("THE LAST LIGHT — THURSDAY, 23:40");
    play([...opening.bar.map((t) => narr(t)), ...aside("opening-2")], [{ text: opening.sit, fn: beginInterview }]);
  });
}

// ——— The interview ———
const leaveChoice = () => ({ text: "(Stand up. Go home and write.)", fn: leave, cls: "leave" });
function deedChoice(id, back) {
  return { text: deeds[id].label, done: state.deeds.includes(id), fn: () => doDeed(id, back) };
}
function doDeed(id, back) {
  if (!markDeed(state, id)) return;
  world.hunger(state.hunger);
  play(deeds[id].entries, back);
}
function beginInterview() {
  state.stage = "idle";
  world.shot("table");
  sfx("glass");
  play(
    [
      narr("You pull out the chair. The legs scrape on the boards. He lets the sound die completely before he speaks."),
      line("“You came. They mostly don’t, the ones I write to.” He nudges a glass toward you, across the wet ring of another. “You read her diary, and you still sat down. That’s either very brave or very foolish, and I’ve never been able to tell those two apart.”"),
      ...aside("interview"),
      line("“Go on, then. Ask. That’s what you’re for.”"),
    ],
    introHub,
  );
}
function introHub() {
  return [
    ...introductions.map((q, i) => ({ text: q.short, done: state.introductionsAsked.includes(i), fn: () => askIntroduction(i) })),
    { text: "Tell me about Bellwether.", fn: beginJournalQuestions },
    leaveChoice(),
  ];
}
function askIntroduction(i) {
  const q = introductions[i];
  state.currentIntroduction = i;
  state.introductionsAsked.push(i);
  state.stage = "introduction-answer";
  const choices = () => [{ text: q.followUp, fn: () => followUp(i) }, i === 1 && deedChoice("pocket", choices)];
  play([you(q.short), line(q.answer), ...aside(`intro-${i}-answer`)], choices);
}
function followUp(i) {
  state.stage = "idle";
  state.currentIntroduction = null;
  play([you(introductions[i].followUp), line(introductions[i].reply), ...aside(`intro-${i}-reply`), narr("He rests his cigarette on the edge of the ashtray and waits for your next question.")], introHub);
}
function beginJournalQuestions() {
  state.round = "journal";
  state.stage = "idle";
  play(
    [
      narr("You open the diary on the table between you, the three legible entries face up. He doesn’t look down at them. He doesn’t need to."),
      line("“Bellwether. Once upon a time, as they say.” He smiles at nothing. “All right. What does she say I did?”"),
      ...aside("journal-round"),
    ],
    journalHub,
  );
}
function journalHub() {
  state.stage = "idle";
  state.current = null;
  return [
    ...questions.map((q, i) => ({ text: q.short, done: state.asked.includes(i), fn: () => ask(i) })),
    deedChoice("mirror", journalHub),
    deedChoice("barkeep", journalHub),
    leaveChoice(),
  ];
}
function ask(i) {
  const q = questions[i];
  state.current = i;
  state.asked.push(i);
  state.stage = "answer";
  sfx("glass");
  const choices = () => [{ text: "(Keep listening.)", fn: showClaim }, i === 2 && deedChoice("pulse", choices)];
  play([you(q.short), line(q.answer), ...aside(`q-${i}-answer`)], choices);
}
function showClaim() {
  state.stage = "claim";
  play([line(questions[state.current].claim), ...aside(`q-${state.current}-claim`)], claimChoices);
}
function claimChoices() {
  return [
    questions[state.current].scrap !== null && { text: "(Open the diary. Show him the line.)", fn: () => openJournal(), keep: true },
    { text: "I believe you.", fn: () => decide("believe") },
    { text: "(Let it slide.)", fn: () => decide("slide") },
    leaveChoice(),
  ];
}
const quarterTurn = () => narr("He turns his glass a quarter turn. The rain fills the silence between you.");
function present(i) {
  closeJournal();
  const q = questions[state.current];
  state.held = i;
  const shown = narr(`You turn the diary toward him, your finger under one line. “${scraps[i].text}”`);
  if (judge(state, "pin")) {
    sfx("pin");
    world.hunger(state.hunger);
    play([shown, line(q.pinned), ...aside(`q-${state.current}-pinned`), quarterTurn()], journalHub);
  } else {
    state.held = null;
    play([shown, ...aside("wrong-page")], claimChoices);
  }
}
function decide(action) {
  const q = questions[state.current];
  const said = action === "believe" ? you("I believe you.") : null;
  judge(state, action);
  world.hunger(state.hunger);
  const key = action === "believe" ? "believed" : "slid";
  play([said, line(q[key]), ...aside(`q-${state.current}-${key}`), quarterTurn()], journalHub);
}

// ——— Closing time ———
function leave() {
  closeJournal();
  leaveBar(state);
  place("THE LAST LIGHT — CLOSING");
  world.reveal();
  play(nightfall.reveal, nightChoices);
}
function nightChoices() {
  return [
    { text: nightfall.leave.label, fn: () => night("spared", nightfall.leave.entries) },
    { text: nightfall.compel.label, fn: () => night("compelled", [you("You served one man tonight. You’ll forget his face by morning."), ...nightfall.compel.entries]) },
    { text: nightfall.feed.label, fn: () => night("fed", nightfall.fed), cls: "hunger" },
  ];
}
function night(fate, entries) {
  resolveNightfall(state, fate);
  world.nightfall(fate);
  world.hunger(state.hunger);
  if (fate === "fed") {
    ambience(true, { night: true });
    sfx("heartbeat");
  }
  play(entries, goHomeChoice);
}
function goHomeChoice() {
  return [{ text: "(Go home. Write it down while you still know what it means.)", fn: goHome }];
}
function goHome() {
  generation++;
  hideChoices();
  $("subtitle").replaceChildren();
  world.cut(
    "desk",
    () => {
      world.resetNight();
      world.writerAtDesk(true);
      world.carriageReturn();
      ambience(true, { night: false });
    },
    { slow: true, hold: 1200 },
  );
  later(3600, () => {
    place("YOUR STUDY — 03:12");
    sfx("lighter");
    renderDesk();
  });
}

// ——— The desk ———
const deskLines = [
  "He was almost kind to you tonight. The journal says he was something else. You turn to a clean page.",
  "The first line makes the next one easier. That is what frightens you.",
  "He gave you fragments. You are giving them a shape. One more sentence, and it becomes a life.",
];
function renderDesk() {
  const n = state.picks.length;
  const beat = beats[n];
  play([title(beat.title), narr(deskLines[n]), narr(beat.prompt)], () => beat.options.map((o, i) => ({ text: o.text, fn: () => pick(i) })));
}
function pick(i) {
  if (!pickBeat(state, i)) return;
  const p = state.picks.at(-1);
  world.hunger(state.hunger);
  play([{ kind: "typed", text: p.text }, ...aside(`pick-${p.tone}`)], () => {
    world.carriageReturn();
    sfx("ding");
    return state.scene === "end" ? renderEnd() : renderDesk();
  });
}
function renderEnd() {
  world.shot("shelf");
  play([narr("Somewhere downstairs, a glass touches a table. You put a full stop where a man used to be."), narr(epilogues[state.barkeep ?? "spared"]), narr(shelf)], () => {
    showEnd();
    return [{ text: "Write another version.", fn: restart }];
  });
}
function showEnd() {
  const tone = dominant(state), end = endings[tone];
  const minutes = Math.max(1, Math.round((Date.now() - state.started) / 60000));
  const el = $("end");
  el.className = `end-card ${tone}`;
  el.innerHTML = `<div class="chip">${end.label}</div><span class="eyebrow">THE VERSION YOU WROTE</span><h2>${end.title}</h2><p>${end.text}</p><div class="ending-manuscript">${state.picks.map((p) => `<p>${escape(p.text)}</p>`).join("")}</div><p class="stat">The barkeep: ${state.barkeep}. ${minutes} minute${minutes === 1 ? "" : "s"}.</p>`;
  el.hidden = false;
  $("subtitle").replaceChildren();
}
function restart() {
  state = freshState();
  parcelOpened = false;
  read = { letter: false, diary: false };
  $("end").hidden = true;
  $("history").replaceChildren();
  closeJournal();
  world.resetNight();
  world.writerAtDesk(false);
  world.parcel(false);
  world.hunger(0);
  start();
}

// ——— Wiring ———
const world = startWorld($("world"), {
  reduced: reduce,
  hotspotLabel(name) {
    if (name === "parcel") return parcelOpened ? null : "Untie the parcel";
    if (name === "journal") return parcelOpened && (state.scene === "bar" || state.scene === "study") ? "The diary [J]" : null;
    if (name === "letter") return parcelOpened && state.scene === "study" ? "The letter" : null;
    if (name === "manuscript") return state.scene === "desk" || state.scene === "end" ? "Read your manuscript [M]" : null;
    if (name === "lamp") return state.scene === "bar" ? "The lamp" : null;
    return null;
  },
  onPick(name) {
    if (name === "parcel") openParcel();
    else if (name === "journal") inspectJournal();
    else if (name === "letter") readLetter();
    else if (name === "manuscript") openJournal("manuscript");
    else if (name === "lamp") sfx("spark");
  },
  onHoverStart(name) {
    if (name === "letter" || name === "journal") sfx("paper");
  },
  onHover(label, x, y) {
    const tip = $("tooltip");
    tip.hidden = !label;
    if (label) {
      tip.textContent = label;
      tip.style.transform = `translate(${x + 14}px, ${y + 14}px)`;
    }
  },
});
// Clicking the room or the subtitle moves the scene on, unless it lands on something you can pick up.
for (const el of [$("world"), $("subtitle")])
  el.addEventListener("click", () => {
    if ($("tooltip").hidden) advance();
  });
$("journal-toggle").onclick = inspectJournal;
$("journal-close").onclick = closeJournal;
$("journal-dialog").addEventListener("close", () => {
  const then = onPageClosed;
  onPageClosed = null;
  then?.();
});
$("history-toggle").onclick = () => $("history-dialog").showModal();
$("history-close").onclick = () => $("history-dialog").close();
for (const id of ["journal-dialog", "history-dialog"])
  $(id).addEventListener("click", (event) => {
    if (event.target !== $(id)) return;
    const r = event.target.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) $(id).close();
  });
$("fullscreen-toggle").onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    $("notice").textContent = "Fullscreen isn’t available in this browser.";
  }
};
document.addEventListener("pointerdown", unlock, { capture: true });
document.addEventListener("keydown", unlock, { capture: true });
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const dialogOpen = $("journal-dialog").open || $("history-dialog").open;
  if ((e.code === "Space" || e.key === "Enter") && !dialogOpen && !e.target.closest("button")) {
    e.preventDefault();
    advance();
    return;
  }
  if (/^[1-9]$/.test(e.key) && !dialogOpen) {
    const b = $("choices").querySelectorAll("button")[Number(e.key) - 1];
    if (b && !b.disabled) {
      e.preventDefault();
      b.click();
    }
    return;
  }
  const key = e.key.toLowerCase();
  if (key === "j" && !$("history-dialog").open) {
    e.preventDefault();
    $("journal-dialog").open ? closeJournal() : inspectJournal();
  } else if (key === "m" && !$("history-dialog").open && (state.scene === "desk" || state.scene === "end")) {
    e.preventDefault();
    $("journal-dialog").open ? closeJournal() : openJournal("manuscript");
  } else if (key === "h" && !$("journal-dialog").open) {
    e.preventDefault();
    $("history-dialog").open ? $("history-dialog").close() : $("history-dialog").showModal();
  }
});
start();
