export const opening = [
  {
    title: "A letter without a name.",
    text: "You write other people’s lives for a living. Usually, the dead ones. Three nights ago, a package arrived at your door: a damaged journal and a letter from a man who says he is forgetting his own life. He wants you to write it before it disappears.",
    next: "Unwrap the journal",
  },
  {
    title: "The dates cannot be right.",
    text: "Most of the journal is ruined. Three passages still mention a village called Bellwether, a fire, and a man who should have died. The dates put him three centuries in the past. A hoax, probably. But you copied the passages and came to hear his version.",
    next: "Find the last table",
  },
  {
    title: "Someone is waiting in the dark.",
    text: "The Last Light smells of wet coats and yesterday’s smoke. At the back, a cigarette ember lifts. Your eyes adjust around it: a hand, a shoulder, a man watching you. You set the journal on the table. Tonight, you listen. Back home, you will decide what makes it onto the page.",
    next: "Take a seat",
  },
];

export const introductions = [
  {
    short: "Before we start—what’s your name?",
    answer:
      "Depends who’s asking. A few decades, a few marriages, five or six cities… you pick up names. Sometimes a wife shortens one. Sometimes you need a new one to get work. I used to be careful about which one I answered to. Now they all sound about the same.",
    followUp: "What about your first name?",
    reply:
      "I’ve tried. There’s a memory of someone calling me in from outside. My mother, I think. I can hear that she’s annoyed. I can’t hear the word. What frightens me is that you could say my first name right now, and I might not even look up.",
  },
  {
    short: "How old are you, exactly?",
    answer:
      "Exactly is asking a lot. I was forty-three for a while. That’s what I told people, anyway. Then a woman I’d known as a child came into my shop with her grandson. I sold her a pair of gloves and moved before the end of the month.",
    followUp: "You must have some idea.",
    reply:
      "The village in those pages was three hundred years ago. I was already lying about my age then. Before that… I remember living by the sea. I remember a house I built. I can’t tell you which came first. I could give you a number, but you’d write it down, and then we’d both start believing it.",
  },
  {
    short: "Asking a stranger to write your life is unusual. Why a book?",
    answer:
      "Last month I found a photograph of a woman in my coat pocket. There was writing on the back. Mine. ‘Our second summer.’ I sat with it all afternoon. Nothing. I didn’t know whether I’d loved her, or whether she’d been happy. I still keep checking the pocket.",
    followUp: "Why not write it yourself?",
    reply:
      "I have. I read it the next morning and change things. A reason I must have had. Something I’m sure I couldn’t have done. After a week, it’s a very comfortable story. I need someone who’ll ask how I know. Who won’t let me change the subject. Put it in a book. Something I can’t quietly rub out when I’m having a bad night.",
  },
];

export const scraps = [
  {
    title: "THE FIRE",
    date: "17 OCTOBER 1683",
    text: "He carried the lamp into the grain house. By dawn, Bellwether was ash.",
  },
  {
    title: "THE LOCK",
    date: "18 OCTOBER 1683",
    text: "Mara put the chapel key in his palm. Six people were still behind the door.",
  },
  {
    title: "THE RIVER",
    date: "19 OCTOBER 1683",
    text: "He came out of the river with a child. The ferryman found no pulse in him.",
  },
];
export const questions = [
  {
    short: "Where were you when the village burned?",
    topic: "THE FIRE",
    scrap: 0,
    answer:
      "Bellwether. There’s a name I haven’t heard in a long time. They’ll tell you it was a beautiful place. It wasn’t. The winter had started early. We burned furniture before the trees. People stood outside the grain house and counted the sacks through the windows. I remember the counting better than I remember the faces.",
    claim:
      "I kept watch by the road. Never went near the grain house. By the time I smelled smoke, it was already too late.",
    pinned:
      "A lamp? That’s what she wrote? There were rats in the grain. A sickness. Someone had to do something. I remember thinking that. I don’t remember whether it was before or after I struck the match.",
    believed:
      "Thank you. No—don’t write that I thanked you. It makes it sound like I needed something from you.",
    slid: "The road was white with frost. I can give you that much. It’s strange, the things that stay.",
  },
  {
    short: "Who was Mara to you?",
    topic: "THE LOCK",
    scrap: 1,
    answer:
      "She repaired the chapel roof. That’s the first thing I think of. Not her face, not her voice. Her boots dangling from a ladder. She’d hold the nails between her teeth, like she had a mouth full of little silver bones. Everyone else was afraid of heights. She said heights were just distance with an opinion.",
    claim:
      "She asked me to open the chapel. I couldn’t. Mara kept the only key. Those people were trapped, and I was useless.",
    pinned:
      "She put it in my hand? Then why do I remember her leaving? There was someone outside the door. Someone begging me not to open it. Maybe that was me. Would you put that in a book? A man afraid of his own hand?",
    believed:
      "She was brave. Make sure she gets a sentence of her own. People like me take up too much paper.",
    slid: "I used to say her name every morning. A little ritual. One day I realised I’d been saying it without knowing who it belonged to.",
  },
  {
    short: "How did you survive the river?",
    topic: "THE RIVER",
    scrap: 2,
    answer:
      "I remember the child’s coat. Red wool, a missing sleeve. I held the collar between my teeth because my hands wouldn’t close. The water was so cold it stopped feeling like water. On the bank, someone turned me over with a boot. I could hear everything. I just couldn’t persuade my chest to move.",
    claim:
      "I crawled out alone. There was no child. If anyone survived that night, it wasn’t because of me.",
    pinned:
      "A child. Right. Yes. The coat. I was trying not to remember the coat. Because if I saved someone, I have to ask why I didn’t save the others. It’s easier to be one terrible thing, isn’t it?",
    believed:
      "Then leave it at that. A man who kept breathing. Nothing remarkable enough to print.",
    slid: "For years, I dreamed of a small hand in mine. I thought it was something I’d invented to make the nights easier.",
  },
  {
    short: "What do you want me to write?",
    topic: "THE MEMORY",
    scrap: null,
    answer:
      "Something that stays. I had a brother once. I know because I remember being jealous. The person is gone, but the jealousy survived him. Imagine that. Carrying the shape of a wound after you’ve forgotten the knife. Now multiply it by every person who has ever loved you.",
    claim:
      "Write it down as weather. A fire, a locked door, a river. Things that happened. Leave a little room for what you can’t know.",
    pinned: "",
    believed:
      "You make it sound possible. A life that fits between two covers. No loose pages falling out.",
    slid: "Just don’t mistake an empty space for an innocent one. I’ve done that often enough for both of us.",
  },
];
// Three sentences decide which man reaches the page: the one you sat with, or the one in the stories.
export const beats = [
  {
    title: "Begin with the fire.",
    prompt: "Every life needs a first sentence. The man across the table, or the man in the journal?",
    options: [
      {
        tone: "Hero",
        text: "He stood between a hungry village and a winter that meant to kill it.",
      },
      {
        tone: "Monster",
        text: "He brought a lamp to Bellwether, and called the ashes necessary.",
      },
    ],
  },
  {
    title: "Decide what the door means.",
    prompt: "Six people behind a door. One account to leave behind.",
    options: [
      {
        tone: "Monster",
        text: "He held six lives in his palm, and kept his hand closed.",
      },
      {
        tone: "Hero",
        text: "He failed to open the chapel, and carried that failure longer than any man should.",
      },
    ],
  },
  {
    title: "Leave him on the riverbank.",
    prompt: "The last line is the one your reader carries home.",
    options: [
      {
        tone: "Hero",
        text: "Even after everything, his hands remembered how to save someone.",
      },
      {
        tone: "Monster",
        text: "One child could not wash a village from his hands.",
      },
    ],
  },
];
export const endings = {
  Hero: {
    label: "A GOOD MAN",
    title: "A good man, in the end.",
    text: "You sat with him. You heard it in his own voice, and you wrote the man you met: tired, sorry, almost gentle. The journal says otherwise. The dead don’t get to approve the manuscript.",
  },
  Monster: {
    label: "A PSYCHO",
    title: "Some fires have a name.",
    text: "You kept to the stories. A lamp, a key, a closed hand. You wrote him the way Bellwether would have: a madman who smiled at the word counting. Whatever he has forgotten, the page will remember.",
  },
};
export function freshState() {
  return {
    scene: "bar",
    round: "introductions",
    introductionsAsked: [],
    currentIntroduction: null,
    asked: [],
    decisions: [],
    current: null,
    held: null,
    stage: "intro",
    picks: [],
    started: Date.now(),
    hunger: 0,
    deeds: [],
    barkeep: null,
  };
}
// Leaving a claim unresolved takes no side.
export function judgmentTone(index, action) {
  if (action === "pin") return index === 2 ? "Hero" : "Monster";
  return action === "believe" ? "Hero" : null;
}
export function score(state) {
  const totals = { Hero: 0, Monster: 0 };
  for (const d of state.decisions) {
    const tone = judgmentTone(d.question, d.action);
    if (tone) totals[tone]++;
  }
  for (const p of state.picks) totals[p.tone] += 2;
  return totals;
}
export function dominant(state) {
  const { Hero, Monster } = score(state);
  if (Hero !== Monster) return Hero > Monster ? "Hero" : "Monster";
  return state.picks.at(-1)?.tone ?? "Hero";
}
export function judge(state, action) {
  if (
    state.scene !== "bar" ||
    state.stage !== "claim" ||
    state.current === null
  )
    return false;
  const q = questions[state.current];
  if (action === "pin" && (q.scrap === null || state.held !== q.scrap))
    return false;
  if (!["pin", "believe", "slide"].includes(action)) return false;
  state.decisions.push({ question: state.current, action });
  if (judgmentTone(state.current, action) === "Monster") state.hunger++;
  state.stage = "reaction";
  state.held = null;
  return true;
}
export function pickBeat(state, index) {
  if (state.scene !== "desk") return false;
  const option = beats[state.picks.length]?.options[index];
  if (!option) return false;
  state.picks.push({ ...option });
  if (option.tone === "Monster") state.hunger++;
  if (state.picks.length === beats.length) state.scene = "end";
  return true;
}
// Things you do instead of asking. Each happens once.
export function doDeed(state, id) {
  if (state.scene !== "bar" || state.deeds.includes(id)) return false;
  state.deeds.push(id);
  if (id === "barkeep") state.hunger++;
  return true;
}
// Leaving the bar ends the interview. The last person in the room is the barkeep.
export function leaveBar(state) {
  if (state.scene !== "bar") return false;
  if (state.stage === "claim") judge(state, "slide");
  else if (state.stage === "answer") state.decisions.push({ question: state.current, action: "slide" });
  state.scene = "nightfall";
  state.stage = "idle";
  state.current = null;
  state.held = null;
  return true;
}
export function resolveNightfall(state, fate) {
  if (state.scene !== "nightfall" || !["spared", "compelled", "fed"].includes(fate)) return false;
  state.barkeep = fate;
  if (fate === "fed") state.hunger += 2;
  state.scene = "desk";
  return true;
}
export const epilogues = {
  spared:
    "Downstairs at the Last Light, the barkeep is stacking chairs, alive, and he will never know how close it came. Neither will you, after a while.",
  compelled:
    "The barkeep will wake behind his counter with a sore neck and a story about a quiet customer who paid in cash. He will tell it wrong. You made sure of that.",
  fed:
    "By Friday the Last Light will have a new name over the door and an old one missing. You have already started his chapter. You write other people’s lives for a living. Usually, the dead ones.",
};
export const shelf =
  "Above your desk: three hundred and eleven biographies in the same hand. You don’t remember writing them. Every subject is dead. One of them is you. It has been rewritten more often than the others.";
