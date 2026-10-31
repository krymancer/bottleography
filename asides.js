// What happens around the dialogue: what you notice about him, what you'd rather not notice
// about yourself, and the night's last scene. Keyed by the moment they follow.
// kind "thought" is the biographer's own head; "narr" is what the room shows.
// fx: a cue for the 3D room (glitch, heartbeat, vanish).
const thought = (text, fx) => ({ kind: "thought", text, fx });
const narr = (text, fx) => ({ kind: "narr", text, fx });

export const asides = {
  "opening-0": [thought("You write other people’s lives for a living. Usually, the dead ones. You have never once asked yourself how they got that way.")],
  letter: [
    thought("The letter leans to the right, the way yours does. The g’s close in a little loop, the way yours do. Lots of people write like that. Lots."),
    thought("The last table. Thursday, before midnight. You already know you’re going."),
  ],
  diary: [
    thought("A borrowed memory. Three entries the water didn’t take, and a warning it couldn’t. The handwriting feels almost familiar."),
    thought("The pages smell of river water. So do the cuffs of your coat. They have for as long as you can remember, which is not, now you think about it, very long."),
  ],
  "opening-2": [
    narr("He doesn’t look up when the door opens. Under the brim there is no face to speak of: a jaw, when the ember lifts, and then nothing again."),
    thought("Wet coats. Warm necks. You count them without meaning to. The barkeep. The man in the dark. That’s all there is tonight.", "heartbeat"),
  ],
  interview: [thought("You know the end of that sentence. You’ve heard it before, across this same table.", "glitch")],
  "intro-0-reply": [narr("He taps the cover once, the way you would touch a sleeping dog you weren’t sure of.")],
  "intro-1-answer": [thought("A photograph in a coat pocket. Don’t check your pocket.")],
  "intro-1-reply": [thought("A house by the sea. A door that sticks in wet weather; you have to lift it on the hinge. How do you know that?")],
  "intro-2-reply": [thought("You have never sent him a word in your own hand. Not one.", "glitch")],
  "intro-3-reply": [narr("He says it smiling. The ember shows you the smile and nothing above it.")],
  "journal-round": [narr("He stops turning the glass. Something in the dark under his hat stops moving with it.")],
  "q-0-answer": [narr("He smiles when he says counting. It is the first time he has smiled at anything.")],
  "q-0-pinned": [
    narr("He leans into the lamp for the first time. You wish he hadn’t. Then he leans back, and you’re grateful for the dark.", "glitch"),
    thought("It was warm. After so much winter, it was so warm.", "heartbeat"),
  ],
  "q-1-answer": [narr("He sets the glass down without a sound. In this light his eyes are two places the light doesn’t reach.")],
  "q-1-claim": [thought("There is a key in your trouser pocket. Iron, old, too heavy for any door you own. You’ve never thought about it before.")],
  "q-1-pinned": [
    thought("It was you outside the door. No. Him. Him.", "glitch"),
    thought("Six people behind a locked door. Like a larder.", "heartbeat"),
  ],
  "q-2-answer": [thought("Red wool. A missing sleeve. There’s a sleeve like that in a drawer at home, folded very small.")],
  "q-2-believed": [narr("He laughs once, without opening his mouth.")],
  "q-3-claim": [thought("‘Leave a little room.’ That line is already in your margin. You wrote it before you left home.")],
  "q-3-slid": [thought("For both of us. One ashtray. One coat over one chair. Two glasses. One of them is still full.", "glitch")],
  "wrong-page": [narr("He doesn’t even look at the page. He looks at you, and waits.")],
  "pick-Monster": [narr("Downstairs, through two floors, you could swear you hear someone laugh.", "heartbeat")],
};

// Things you do instead of asking.
export const deeds = {
  pocket: {
    label: "(Check your own coat pocket.)",
    entries: [
      narr("A photograph, soft at the corners. A woman squinting into sunlight on a sea wall. On the back, in your handwriting: Our second summer."),
      thought("She tasted of salt.", "heartbeat"),
    ],
  },
  pulse: {
    label: "(Press two fingers to your own wrist.)",
    entries: [
      narr("You wait. You wait longer than a person should have to."),
      thought("Nothing. The ferryman found no pulse in him. Find yours.", "glitch"),
    ],
  },
  mirror: {
    label: "(Look at the mirror behind the bar.)",
    entries: [
      narr("Bottles. Smoke. The lamp over your table. Under it, one figure in your coat, talking to an empty chair.", "vanish"),
      thought("Old glass. Bad silvering. Look back at him. Look back at him now."),
    ],
  },
  barkeep: {
    label: "(Watch the barkeep.)",
    entries: [
      narr("He polishes the same glass for the third time. Wedding ring on a chain round his neck, not on his finger. He lives upstairs. Alone."),
      thought("The fourth stair creaks. The latch sticks. You know this. When were you up those stairs?", "heartbeat"),
    ],
  },
};

// Closing time. You stand to leave and there is nobody across the table.
export const nightfall = {
  reveal: [
    narr("You stand. Your chair scrapes on the boards. Across the table, his chair doesn’t."),
    { who: "BARKEEP", text: "“Closing up, friend. You were at it a long time.” He holds a glass up to the lamp. “Talking to yourself is free. The drinks aren’t.”" },
    narr("Look across the table.", "vanish"),
    narr("One chair pulled out. One glass, untouched. An ashtray with a single cigarette burned to the filter. Your coat over the back of the other chair. You are wearing your coat."),
    thought("There was never a stranger. There is the one who remembers and the one who forgets. Every few decades the hunger eats the memories too. So you write yourself a letter. You wrap the journal. You book a table at the Last Light, and you interview the only man who knows what you did."),
    thought("He’s alone. The door is bolted. The rain is loud. Nobody saw you come in.", "heartbeat"),
  ],
  leave: {
    label: "(Pay. Keep your mouth closed when you smile. Leave.)",
    entries: [
      narr("Coins on the counter. Collar up. You don’t look at his throat. The door. The rain."),
      thought("Next time."),
    ],
  },
  compel: {
    label: "Hold his eyes. “You served one man tonight. You’ll forget his face by morning.”",
    entries: [
      narr("Your pupils open until there is no colour left in them. His do the same, as if answering."),
      { who: "BARKEEP", text: "“…one man. Quiet fellow. Paid in cash.”" },
      thought("Just a mouthful, then. He won’t remember missing it."),
    ],
  },
  feed: { label: "(Let the lights go out.)" },
  fed: [
    narr("The lamp over your table goes out first. Then the ones over the bar. Then the window, which should not be able to go dark, goes dark."),
    { who: "BARKEEP", text: "“Hey. Hey, who’s—”" },
    narr("Rain on the glass. The fourth stair does not creak, because nobody climbs it tonight."),
  ],
};
