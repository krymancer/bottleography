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
let openingIndex = 0;
let parcelOpened = false;
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
  typing = { body, text: e.text, done };
  typing.timer = setInterval(() => {
    n += 2;
    body.textContent = e.text.slice(0, n).replace(/\*/g, "");
    if (n % 12 === 0 && kindOf(e) === "typed") sfx("tick");
    if (n >= e.text.length) finishTyping();
  }, 22);
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

// ——— Journal pages ———
const letterHTML =
  '<div class="journal-top"><span>THREE NIGHTS AGO</span><span>NO RETURN ADDRESS</span></div><h2>An invitation.</h2><p class="draft-line letter">You write lives for a living.<br><br>I am having trouble remembering mine.<br><br>The Last Light. Thursday. Before midnight.<br><br>Bring the pages. Come alone.</p>';
function journal() {
  const j = $("journal");
  const presenting = state.scene === "bar" && state.stage === "claim" && questions[state.current]?.scrap !== null;
  j.innerHTML =
    (state.scene === "bar" ? "" : letterHTML) +
    '<div class="journal-top"><span>EXHIBIT 01</span><span>FOUND, NOT GIVEN</span></div><h2>A borrowed memory.</h2><p class="intro">Three lines from a water-damaged journal. The handwriting feels almost familiar.</p>';
  scraps.forEach((scrap, i) => {
    const pinned = state.decisions.some((d) => d.action === "pin" && questions[d.question].scrap === i);
    const b = document.createElement("button");
    b.className = "scrap";
    b.disabled = !presenting;
    b.innerHTML = `<img class="evidence-art" src="./assets/evidence-${["fire", "key", "river"][i]}.png" alt="" width="24" height="24"><small>${String(i + 1).padStart(2, "0")} / ${scrap.date}</small><p>${scrap.text}</p><span class="scrap-state">${presenting ? "SHOW HIM THIS PAGE" : pinned ? "PINNED IN YOUR NOTES" : state.scene === "bar" ? "WAIT FOR A LINE THAT CLASHES" : "FROM THE JOURNAL"}</span>`;
    b.onclick = () => present(i);
    j.append(b);
  });
  const notes = document.createElement("div");
  notes.className = "notes";
  notes.innerHTML = "<strong>YOUR MARGIN NOTES</strong>";
  if (!state.decisions.length) notes.innerHTML += "<p>No judgments. Yet.</p>";
  for (const d of state.decisions)
    notes.innerHTML += `<p>${questions[d.question].topic.toLowerCase()}: ${d.action === "pin" ? "contradiction pinned" : d.action === "believe" ? "account believed" : "left unresolved"}</p>`;
  j.append(notes);
}
function draft() {
  const j = $("journal");
  j.innerHTML = '<div class="journal-top"><span>MANUSCRIPT</span><span>CHAPTER 01</span></div><h2>What remains.</h2><p class="intro">A version of a life. In your words.</p>';
  for (const p of state.picks) j.innerHTML += `<p class="draft-line">${escape(p.text)}</p>`;
  if (state.picks.length < beats.length) j.innerHTML += `<p class="empty-draft">${state.picks.length ? "The next line is still yours." : "The page waits for someone to decide what happened."}</p>`;
}
function openJournal(kind = "journal") {
  kind === "manuscript" ? draft() : journal();
  if (!$("journal-dialog").open) $("journal-dialog").showModal();
}
function closeJournal() {
  if ($("journal-dialog").open) $("journal-dialog").close();
}
function inspectJournal() {
  if (!parcelOpened) return openParcel();
  if (openingIndex === 0) return readDiary();
  openJournal();
}

// ——— Three nights ago ———
function start() {
  place("YOUR STUDY — THREE NIGHTS AGO");
  world.cut("desk-parcel");
  play([title(opening[0].title), narr(opening[0].text), ...aside("opening-0")], [{ text: "(Untie the parcel.)", fn: openParcel }]);
}
function openParcel() {
  if (parcelOpened) return;
  parcelOpened = true;
  hideChoices();
  world.parcel(true);
  sfx("spark");
  setTimeout(() => sfx("glass"), reduce ? 0 : 900);
  // Let the lid come off before anyone speaks.
  const g = ++generation;
  setTimeout(() => {
    if (g !== generation) return;
    play(
      [narr("The string gives. Under the lid: a battered diary and a letter. No signature. The paper smells faintly of river water."), ...aside("parcel")],
      [{ text: "(Read the letter and the diary.)", fn: readDiary }],
    );
  }, reduce ? 0 : 2300);
}
function readDiary() {
  if (openingIndex > 0) return openJournal();
  openingIndex = 1;
  openJournal();
  play([title(opening[1].title), narr(opening[1].text), ...aside("opening-1")], [{ text: `(${opening[1].next}.)`, fn: toBar }]);
}
function toBar() {
  closeJournal();
  openingIndex = 2;
  place("THE LAST LIGHT — 23:40");
  world.cut("bar", () => world.strangerArrives());
  play([title(opening[2].title), narr(opening[2].text), ...aside("opening-2")], [{ text: `(${opening[2].next}.)`, fn: beginInterview }]);
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
  play([line("“You’re late. Or I’m early. After a while, the years stop keeping their side of the bargain.” He nudges a glass toward you. “You brought your questions?”"), ...aside("interview")], introHub);
}
function introHub() {
  return [
    ...introductions.map((q, i) => ({ text: q.short, done: state.introductionsAsked.includes(i), fn: () => askIntroduction(i) })),
    { text: "About the journal.", fn: beginJournalQuestions },
    leaveChoice(),
  ];
}
function askIntroduction(i) {
  const q = introductions[i];
  state.currentIntroduction = i;
  state.introductionsAsked.push(i);
  state.stage = "introduction-answer";
  const choices = () => [{ text: q.followUp, fn: () => followUp(i) }, i === 2 && deedChoice("pocket", choices)];
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
  play([narr("You turn the copied pages toward him."), line("“All right. What does she say I did?”"), ...aside("journal-round")], journalHub);
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
    questions[state.current].scrap !== null && { text: "(Show him a page from the journal.)", fn: () => openJournal(), keep: true },
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
  const shown = narr(`You slide a page across the table. “${scraps[i].text}”`);
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
  place("YOUR STUDY — 03:12");
  world.cut("desk", () => {
    world.resetNight();
    world.writerAtDesk(true);
    ambience(true, { night: false });
  });
  sfx("lighter");
  renderDesk();
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
  play([{ kind: "typed", text: p.text }, ...aside(`pick-${p.tone}`)], () => (state.scene === "end" ? renderEnd() : renderDesk()));
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
  openingIndex = 0;
  parcelOpened = false;
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
    if (name === "journal") return parcelOpened && (state.scene === "bar" || openingIndex < 2) ? "Read the journal [J]" : null;
    if (name === "manuscript") return state.scene === "desk" || state.scene === "end" ? "Read your manuscript [M]" : null;
    if (name === "lamp") return state.scene === "bar" ? "The lamp" : null;
    return null;
  },
  onPick(name) {
    if (name === "parcel") openParcel();
    else if (name === "journal") inspectJournal();
    else if (name === "manuscript") openJournal("manuscript");
    else if (name === "lamp") sfx("spark");
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
