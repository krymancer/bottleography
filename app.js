import {
  scraps,
  questions,
  beats,
  endings,
  freshState,
  dominant,
  judge,
  pickBeat,
  opening,
  introductions,
} from "./story.js";
import { startScenery } from "./scenery.js";
const $ = (id) => document.getElementById(id);
let state = freshState();
let openingIndex = 0;
let parcelOpened = false;
let timer = null,
  fullLine = "",
  typing = false;
let lineGeneration = 0;
let selectionPending = false;
let audio = null;
let audioUnlocked = false;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function sfx(kind) {
  if (!audioUnlocked) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") void audio.resume().catch(() => {});
    const t = audio.currentTime;
    if (kind === "spark") {
      const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.65), audio.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) {
        const seconds = i / audio.sampleRate;
        const burst = Math.exp(-seconds * 28) + (seconds > 0.32 ? Math.exp(-(seconds - 0.32) * 35) * 0.6 : 0);
        samples[i] = (Math.random() * 2 - 1) * burst * 0.16;
      }
      const source = audio.createBufferSource(), filter = audio.createBiquadFilter();
      source.buffer = buffer;
      filter.type = "bandpass";
      filter.frequency.value = 1800;
      filter.Q.value = 0.7;
      source.connect(filter); filter.connect(audio.destination);
      source.onended = () => { source.disconnect(); filter.disconnect(); };
      source.start(t);
      return;
    }
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.connect(g);
    g.connect(audio.destination);
    const presets = {
      tick: [135, 0.018, 0.025],
      glass: [1700, 0.45, 0.06],
      lighter: [85, 0.13, 0.08],
      pin: [430, 0.16, 0.09],
    };
    const [freq, duration, volume] = presets[kind] || presets.tick;
    o.type = kind === "tick" || kind === "lighter" ? "square" : "sine";
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(
      Math.max(30, freq * 0.48),
      t + duration,
    );
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.start(t);
    o.stop(t + duration);
  } catch {
    // Audio support must not block the story.
  }
}
// Pixel icons come from assets/ui-icons.png (see art/source/ui.lua). tone: "" | "dim" | "ember" | "ink".
function icon(name, tone = "") {
  const i = document.createElement("i");
  i.className = `ico ico-${name}${tone ? " " + tone : ""}`;
  i.setAttribute("aria-hidden", "true");
  return i;
}
function iconHTML(name, tone = "") {
  return icon(name, tone).outerHTML;
}
// A label with an icon after (default) or before the text.
function label(text, name, { before = false, tone = "" } = {}) {
  const f = document.createDocumentFragment();
  if (before) f.append(icon(name, tone), text);
  else f.append(text, icon(name, tone));
  return f;
}
function btn(text, fn, cls = "") {
  const b = document.createElement("button");
  b.append(text);
  b.className = cls;
  b.onclick = async () => {
    if (selectionPending) return;
    sfx("tick");
    const responses = $("responses");
    if (!reduce && b.closest("#responses") && fn !== openJournal) {
      selectionPending = true;
      responses.inert = true;
      const generation = lineGeneration;
      try {
        await responses.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140 }).finished;
        if (generation === lineGeneration) fn();
      } finally {
        responses.inert = false;
        selectionPending = false;
      }
    } else fn();
  };
  return b;
}
function notice(text = "") {
  $("notice").textContent = text;
}
function showDialogue() {
  document.body.dataset.presentation = "dialogue";
  document.querySelector(".dialogue").hidden = false;
  $("responses").hidden = true;
  document.querySelector(".story-ui").scrollTop = 0;
}
function showResponses() {
  finishLine();
  document.body.dataset.presentation = "choices";
  document.querySelector(".dialogue").hidden = true;
  $("responses").hidden = false;
  document.querySelector(".story-ui").scrollTop = 0;
  const next = $("responses").querySelector("#dialogue-actions button:not(:disabled), .question:not(:disabled), .choice, .opening-next, #end-actions button");
  next?.focus({ preventScroll: true });
}
function finishLine() {
  clearInterval(timer);
  typing = false;
  $("spoken-text").textContent = fullLine;
  $("spoken").classList.remove("typing");
  $("continue-cue").textContent = "Click or Space to respond";
}
function say(text) {
  lineGeneration++;
  showDialogue();
  clearInterval(timer);
  fullLine = text;
  $("spoken").dataset.fullLine = text;
  notice();
  $("spoken").classList.remove("pinnable");
  $("spoken").setAttribute("aria-label", text);
  if (reduce) {
    finishLine();
    return;
  }
  typing = true;
  let n = 0;
  $("spoken-text").textContent = "";
  $("spoken").classList.add("typing");
  $("continue-cue").textContent = "Click or Space to reveal";
  timer = setInterval(() => {
    n += 2;
    $("spoken-text").textContent = text.slice(0, n);
    if (n % 6 === 0) sfx("tick");
    if (n >= text.length) finishLine();
  }, 22);
}
function actions(items) {
  $("dialogue-actions").replaceChildren(
    ...items.map(([label, fn, cls]) => btn(label, fn, cls)),
  );
}
function ask(i) {
  if (state.asked.includes(i)) {
    return;
  }
  finishLine();
  state.current = i;
  state.asked.push(i);
  state.stage = "answer";
  say(questions[i].answer);
  renderBar();
  sfx("glass");
}
function askIntroduction(i) {
  if (state.introductionsAsked.includes(i)) return;
  state.currentIntroduction = i;
  state.introductionsAsked.push(i);
  state.stage = "introduction-answer";
  say(introductions[i].answer);
  renderBar();
}
function followUpIntroduction() {
  state.stage = "introduction-reply";
  say(introductions[state.currentIntroduction].reply);
  renderBar();
}
function finishIntroduction() {
  state.currentIntroduction = null;
  state.stage = "idle";
  say(
    "He rests his cigarette on the edge of the ashtray and waits for your next question.",
  );
  renderBar();
}
function beginJournalQuestions() {
  state.round = "journal";
  state.stage = "idle";
  state.currentIntroduction = null;
  state.held = null;
  say(
    "You turn the copied pages toward him. He stops turning his glass. “All right. What does she say I did?”",
  );
  renderBar();
}
function showClaim() {
  finishLine();
  state.stage = "claim";
  say(questions[state.current].claim);
  renderBar();
}
function decide(action) {
  finishLine();
  if (!judge(state, action)) {
    notice(
      state.held === null
        ? "Hold a journal scrap first."
        : "That scrap doesn’t contradict this line. Try another, or let it slide.",
    );
    return;
  }
  const q = questions[state.current];
  say(
    q[action === "pin" ? "pinned" : action === "believe" ? "believed" : "slid"],
  );
  renderBar();
  if (action === "pin") {
    sfx("pin");
    notice("Contradiction pinned. His account is in your notes.");
  }
}
function finishQuestion() {
  finishLine();
  state.stage = "idle";
  state.current = null;
  state.held = null;
  say(
    "He turns his glass a quarter turn. The rain fills the silence between you.",
  );
  renderBar();
}
function goDesk() {
  closeJournal();
  finishLine();
  if (state.stage === "claim") {
    judge(state, "slide");
  } else if (state.stage === "answer") {
    state.decisions.push({ question: state.current, action: "slide" });
  }
  state.scene = "desk";
  state.held = null;
  sfx("lighter");
  renderDesk();
  window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
}
function closeJournal() {
  if ($("journal-dialog").open) $("journal-dialog").close();
}
function openJournal() {
  if (!$("journal-dialog").open) $("journal-dialog").showModal();
}
function openParcel() {
  finishLine();
  parcelOpened = true;
  intro();
}
function inspectDiary() {
  if (state.stage === "intro" && openingIndex === 0) {
    if (!parcelOpened) { openParcel(); return; }
    openingIndex = 1;
    intro();
  }
  if (state.scene !== "bar") journal();
  openJournal();
}
function inspectManuscript() {
  if (state.scene === "bar") return;
  draft();
  openJournal();
}
function nextOpening() {
  finishLine();
  if (openingIndex === 0) {
    if (!parcelOpened) openParcel();
    else inspectDiary();
  } else if (openingIndex < opening.length - 1) {
    closeJournal();
    openingIndex++;
    intro();
  } else {
    state.stage = "idle";
    beginInterview();
    sfx("glass");
  }
}
function heading(scene) {
  document.body.dataset.scene = scene;
  document.body.dataset.stage = state.stage;
  const parcel = state.stage === "intro" && openingIndex < 2;
  document.body.dataset.view = parcel ? (parcelOpened ? "parcel-open" : "parcel-closed") : scene;
  $("journal-toggle-label").textContent = parcel && !parcelOpened ? "Parcel" : "Journal";
  document.body.classList.toggle("opening", state.stage === "intro");
  $("world").setAttribute(
    "aria-label",
    scene === "bar"
      ? "Pixel art of a shadowed stranger at a dim bar table"
      : "Pixel art of a lamp, manuscript and typewriter at your home desk",
  );
}
function journal() {
  const j = $("journal");
  j.innerHTML =
    '<div class="journal-top"><span>EXHIBIT 01</span><span>' + iconHTML("pin", "ink") + 'FOUND, NOT GIVEN</span></div><h2>A borrowed memory.</h2><p class="intro">Three lines from a water-damaged journal. The handwriting feels almost familiar.</p>';
  scraps.forEach((scrap, i) => {
    const pinned = state.decisions.some(
      (d) => d.action === "pin" && questions[d.question].scrap === i,
    );
    const b = btn(
      "",
      () => {
        finishLine();
        state.held = state.held === i ? null : i;
        notice();
        renderBar();
        closeJournal();
        showDialogue();
        if (state.stage === "claim" && state.held !== null) $("continue-cue").textContent = "Click this line to pin the contradiction";
        $("spoken").focus({ preventScroll: true });
        if (state.held !== null) {
          notice(
            state.stage === "claim"
              ? "Scrap held. Click his last line or “Pin contradiction”."
              : "Scrap held. Listen for a line that clashes.",
          );

        }
      },
      "scrap" + (state.held === i ? " selected" : ""),
    );
    b.setAttribute("aria-pressed", String(state.held === i));
    b.disabled = state.scene !== "bar" || state.stage === "intro" || state.round === "introductions";
    b.innerHTML = `<img class="evidence-art" src="./assets/evidence-${["fire", "key", "river"][i]}.png" alt="" width="24" height="24"><small>${String(i + 1).padStart(2, "0")} / ${scrap.date}</small><p>${scrap.text}</p><span class="scrap-state">${b.disabled ? (state.scene !== "bar" ? "FROM THE JOURNAL" : "FOR WHEN YOU REACH THE PAGES") : state.held === i ? iconHTML("diamond", "ember") + "HELD. CLICK AGAIN TO RELEASE" : pinned ? iconHTML("pin", "ink") + "PINNED IN YOUR NOTES" : iconHTML("arrow", "ink") + "HOLD THIS SCRAP"}</span>`;
    j.append(b);
  });
  const hint = document.createElement("p");
  hint.className = "journal-tip";
  hint.textContent =
    state.round === "introductions"
      ? "The pages can wait a moment. There’s a person across the table."
      : "Hold a scrap. Click a line that clashes. Or let the silence have it.";
  j.append(hint);
  const notes = document.createElement("div");
  notes.className = "notes";
  notes.innerHTML = "<strong>YOUR MARGIN NOTES</strong>";
  if (!state.decisions.length) notes.innerHTML += "<p>No judgments. Yet.</p>";
  state.decisions.forEach((d) => {
    const p = document.createElement("p");
    p.append(icon(d.action === "pin" ? "pin" : d.action === "believe" ? "check" : "close", "ink"), `${questions[d.question].topic.toLowerCase()}: ${d.action === "pin" ? "contradiction pinned" : d.action === "believe" ? "account believed" : "left unresolved"}`);
    notes.append(p);
  });
  j.append(notes);
}
function renderBar() {
  heading("bar");
  journal();
  if (state.round === "introductions") {
    renderIntroductions();
    return;
  }
  const q = state.current === null ? null : questions[state.current];
  $("speaker").textContent = "THE STRANGER";
  $("line-count").textContent = q ? q.topic : "OFF THE RECORD";
  $("spoken").classList.toggle(
    "pinnable",
    state.stage === "claim" && state.held !== null,
  );
  if (state.stage === "answer") actions([[label("Keep listening", "arrow"), showClaim]]);
  else if (state.stage === "claim")
    actions([
      [label("Pin contradiction", "pin", { before: true, tone: "ember" }), () => decide("pin"), "pin"],
      [label("Read the journal", "book", { before: true }), openJournal],
      ["Believe him", () => decide("believe")],
      ["Let it slide", () => decide("slide")],
    ]);
  else if (state.stage === "reaction")
    actions([[label("Back to your questions", "arrow"), finishQuestion]]);
  else actions([]);
  const area = $("interaction");
  area.innerHTML = `<div class="section-label"><span>YOUR QUESTIONS</span><span>${state.asked.length} / 4 ASKED</span></div>`;
  questions.forEach((question, i) => {
    const done = state.asked.includes(i);
    const b = btn("", () => ask(i), "question" + (done ? " done" : ""));
    b.innerHTML = `<span class="number">${String(i + 1).padStart(2, "0")}</span><span>${question.short}</span>`;
    b.disabled = done || ["answer", "claim", "reaction"].includes(state.stage);
    area.append(b);
  });
  const row = document.createElement("div");
  row.className = "leave-row";
  row.innerHTML = "<p>You don’t have to ask everything.</p>";
  row.append(btn(label("Leave & write", "pen"), goDesk, "primary"));
  area.append(row);
}
function renderIntroductions() {
  $("speaker").textContent = "THE STRANGER";
  $("line-count").textContent = "OFF THE RECORD";
  $("spoken").classList.remove("pinnable");
  if (state.stage === "introduction-answer") {
    actions([
      [introductions[state.currentIntroduction].followUp, followUpIntroduction],
    ]);
  } else if (state.stage === "introduction-reply") {
    actions([[label("Ask something else", "arrow"), finishIntroduction]]);
  } else actions([]);
  const area = $("interaction");
  area.innerHTML =
    '<div class="section-label"><span>BEFORE THE PAGES</span><span>TAKE YOUR TIME</span></div>';
  introductions.forEach((question, i) => {
    const done = state.introductionsAsked.includes(i);
    const b = btn(
      "",
      () => askIntroduction(i),
      "question" + (done ? " done" : ""),
    );
    b.innerHTML = `<span class="number">${String(i + 1).padStart(2, "0")}</span><span>${question.short}</span>`;
    b.disabled = done || state.stage !== "idle";
    area.append(b);
  });
  const row = document.createElement("div");
  row.className = "leave-row";
  row.append(
    btn(label("Leave & write", "pen"), goDesk),
    btn(label("About the journal", "book"), beginJournalQuestions, "primary"),
  );
  area.append(row);
}
function draft() {
  const j = $("journal");
  j.innerHTML =
    '<div class="journal-top"><span>MANUSCRIPT</span><span>CHAPTER 01</span></div><h2>What remains.</h2><p class="intro">A version of a life. In your words.</p>';
  state.picks.forEach((p) => {
    const el = document.createElement("p");
    el.className = "draft-line";
    el.textContent = p.text;
    j.append(el);
  });
  if (state.picks.length < 3) {
    const p = document.createElement("p");
    p.className = "empty-draft";
    p.textContent = state.picks.length
      ? "The next line is still yours."
      : "The page waits for someone to decide what happened.";
    j.append(p);
  }
  const notes = document.createElement("div");
  notes.className = "notes";
  notes.innerHTML = "<strong>FROM THE INTERVIEW</strong>";
  for (const d of state.decisions) {
    const p = document.createElement("p");
    p.append(icon(d.action === "pin" ? "pin" : d.action === "believe" ? "check" : "close", "ink"), `${questions[d.question].topic.toLowerCase()}: ${d.action === "pin" ? "contradiction pinned" : d.action === "believe" ? "believed" : "unresolved"}`);
    notes.append(p);
  }
  if (!state.decisions.length)
    notes.innerHTML += "<p>You brought only his silence home.</p>";
  j.append(notes);
}
function renderDesk() {
  heading("desk");
  draft();
  $("speaker").textContent = "THE WRITER";
  $("line-count").textContent = "DRAFT / " + (state.picks.length + 1);
  say(
    state.picks.length === 0
      ? "“Leave a little room,” he said. You had written those words in the margin before leaving home. You turn to a clean page."
      : state.picks.length === 1
        ? "The first line makes the next one easier. That is what frightens you."
        : "He gave you fragments. You are giving them a shape. One more sentence, and it becomes a life.",
  );
  actions([]);
  const beat = beats[state.picks.length];
  const area = $("interaction");
  area.innerHTML = `<div class="section-label"><span>WRITE TONIGHT’S CHAPTER</span><span>BEAT ${state.picks.length + 1} / 3</span></div><h2 class="beat-title">${beat.title}</h2><p class="beat-prompt">${beat.prompt}</p>`;
  beat.options.forEach((p, i) => {
    const b = btn(
      "",
      () => {
        finishLine();
        if (pickBeat(state, i)) {
          sfx("tick");
          state.scene === "end" ? renderEnd() : renderDesk();
        }
      },
      "choice",
    );
    b.textContent = p.text;
    area.append(b);
  });
}
function renderEnd() {
  heading("end");
  draft();
  const tone = dominant(state),
    end = endings[tone];
  $("speaker").textContent = "CHAPTER LOCKED";
  $("line-count").textContent = "ONE NIGHT. ONE VERSION.";
  say(
    "Somewhere downstairs, a glass touches a table. You put a full stop where a man used to be.",
  );
  actions([]);
  const area = $("interaction");
  area.innerHTML = `<article class="end-card"><div class="chip">${tone.toUpperCase()}</div><span class="eyebrow">THE VERSION YOU WROTE</span><h2>${end.title}</h2><p>${end.text}</p><p class="stat">${end.percent}% of players chose ${tone}.</p><small>Illustrative POC statistic. No player data collected.</small><div id="end-actions"></div></article><details class="feedback"><summary>${iconHTML("arrow", "dim")}Finished? Four questions for the friend test</summary><ol><li>Could you tell what you were supposed to do?</li><li>Did pinning feel satisfying or fussy?</li><li>Did writing feel like your choice mattered?</li><li>Would you sit down for a second night?</li></ol><p class="beat-prompt">Your run: ${Math.max(1, Math.round((Date.now() - state.started) / 60000))} minutes. Share your answers with whoever sent you this.</p></details>`;
  const recap = document.createElement("div");
  recap.className = "ending-manuscript";
  state.picks.forEach((pick) => {
    const line = document.createElement("p");
    line.textContent = pick.text;
    recap.append(line);
  });
  area.querySelector(".end-card .stat").before(recap);
  $("end-actions").append(
    btn(
      label("Write another version", "replay"),
      () => {
        state = freshState();
        openingIndex = 0;
        parcelOpened = false;
        closeJournal();
        intro();
        window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
      },
      "primary",
    ),
  );
}
function intro() {
  heading("bar");
  const page = opening[openingIndex];
  $("speaker").textContent = page.title.toUpperCase();
  $("line-count").textContent = `${openingIndex + 1} / ${opening.length}`;
  $("world").setAttribute(
    "aria-label",
    openingIndex < 2
      ? (parcelOpened ? "An opened parcel with a leather journal and a folded letter" : "A paper-wrapped parcel tied with string on a dark wooden table")
      : "A stranger slowly becomes visible in the shadows at the bar table",
  );
  say(openingIndex === 0 && parcelOpened ? "Under the string: a battered diary and a letter. No signature. You lift the cover; the paper smells faintly of river water. Click the diary to read what survived." : page.text);
  actions([]);
  journal();
  if (openingIndex === 0) {
    $("journal").innerHTML =
      '<div class="journal-top"><span>THREE NIGHTS AGO</span><span>NO RETURN ADDRESS</span></div><h2>An invitation.</h2><p class="draft-line">You write lives for a living.<br><br>I am having trouble remembering mine.<br><br>The Last Light. Thursday. Before midnight.<br><br>Bring the pages. Come alone.</p><p class="intro">No signature. Just a journal, wrapped in the letter.</p>';
  }
  $("interaction").replaceChildren(
    btn(label(openingIndex === 0 ? (parcelOpened ? "Read the diary" : "Untie the parcel") : page.next, "arrow"),
      nextOpening, "primary opening-next"),
  );
}
function beginInterview() {
  renderBar();
  say(
    "“You’re late. Or I’m early. After a while, the years stop keeping their side of the bargain.” He nudges a glass toward you. “You brought your questions?”",
  );
}
$("spoken").onclick = () => {
  if (typing) {
    finishLine();
    return;
  }
  if (state.stage === "claim" && state.scene === "bar" && state.held !== null) {
    decide("pin");
    return;
  }
  showResponses();
};
$("review-line").onclick = () => {
  showDialogue();
  $("spoken").focus({ preventScroll: true });
};
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  sfx("lighter");
}
document.addEventListener("pointerdown", unlockAudio, { capture: true });
document.addEventListener("keydown", unlockAudio, { capture: true });
$("parcel-hotspot").onclick = openParcel;
$("diary-hotspot").onclick = inspectDiary;
$("manuscript-hotspot").onclick = inspectManuscript;
$("journal-toggle").onclick = inspectDiary;
$("journal-close").onclick = closeJournal;
$("journal-dialog").addEventListener("click", (event) => {
  if (event.target === $("journal-dialog")) {
    const r = event.target.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeJournal();
  }
});
$("fullscreen-toggle").onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { notice("Fullscreen isn’t available in this browser. The scene still fills the window."); }
};
document.addEventListener("fullscreenchange", () => {
  $("fullscreen-toggle").setAttribute("aria-label", document.fullscreenElement ? "Exit fullscreen" : "Enter fullscreen");
});
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !e.repeat && !$("journal-dialog").open && document.body.dataset.presentation === "dialogue" && !e.target.closest("button")) {
    e.preventDefault(); $("spoken").click(); return;
  }
  if (e.key.toLowerCase() === "m" && !e.ctrlKey && !e.metaKey && !e.altKey && state.scene !== "bar") {
    e.preventDefault(); inspectManuscript(); return;
  }
  if (e.key.toLowerCase() === "j" && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    if ($("journal-dialog").open) closeJournal(); else inspectDiary();
    return;
  }
  if (e.key === "Escape") {
    if ($("journal-dialog").open) { e.preventDefault(); closeJournal(); return; }
    finishLine();
    if (state.scene === "bar" && state.stage !== "intro") {
      state.held = null;
      renderBar();
      notice();
    }
  }
});
const scenery = startScenery(
  $("world"),
  () => state.stage === "intro" && openingIndex < 2 ? (parcelOpened ? "parcel-open" : "parcel-closed") : state.scene,
  () => (state.stage === "intro" && openingIndex < 2 ? 0 : 1),
);
$("lamp-secret").onclick = () => {
  if (scenery.tapLamp()) sfx("spark");
};
intro();
