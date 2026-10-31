# Bottleography — usually, the dead ones

A horror detective-novel about a biographer who interviews a man whose memories have outlived their owners. Ask him questions, compare his words with a damaged journal, then write one version of his life: the man you sat with, or the madman in the stories. By closing time you learn there was never a stranger. The biographer and the immortal are the same man, and the last person left in the Last Light is the barkeep.

[Play in your browser](https://krymancer.github.io/bottleography/).

Plain JavaScript, HTML/CSS and [three.js](https://threejs.org) (r186, vendored and minified in `vendor/`, MIT). There's no bundler, runtime install, analytics or backend, and nothing loads from a third-party host. The bar and the study are built from primitives in `world3d.js`. They render at low resolution and go through a Kuwahara "oil paint" pass, grain, and a red grade that deepens with the hunger. Labels use the bundled [Jersey 10](https://fonts.google.com/specimen/Jersey+10) (SIL OFL); the letter and diary use bundled [Caveat](https://fonts.google.com/specimen/Caveat) and [Cedarville Cursive](https://fonts.google.com/specimen/Cedarville+Cursive) (SIL OFL); prose uses the system's book serif. Sound is synthesized locally: rain, a music box over a low pad, paper, glass, lighter, typewriter keys and bell, a heartbeat, and the drone at nightfall.

## Play locally

Requires Node.js 20+ for the development scripts. No install step.

```sh
npm run dev
```

Open http://localhost:5173. Audio starts on the first click or keypress. The painted room fills the screen and dialogue runs as subtitles along the bottom, one line at a time. Click anywhere or press Space/Enter to finish a line, then again for the next one. Pick responses with the mouse or the number keys 1–9. Choices in parentheses are things you do; the rest you say aloud. J opens the diary, M opens the manuscript at the desk, and H shows everything said so far. Hover objects in the room to interact: the parcel, the letter, the diary, the typewriter, the bar lamp. Reduced-motion preferences turn off text reveal, camera drift, glitches and flicker.

1. **Three nights ago.** Untie the parcel. Read the letter tucked inside the diary, then the diary itself. Both explain why you go.
2. **The Last Light.** Meet him first: where the diary came from, what is happening to him, why he wants a book, who he is. Each answer has one follow-up. **Tell me about Bellwether** moves on. You can stand up and leave at any time.
3. **The journal.** Ask one of four questions, then **Keep listening** to reach the statement you can judge. **Show him the line** opens the diary. Present the scrap that contradicts him (a wrong page costs nothing), believe him, or let it slide.
4. **Small things.** Some choices are things you do rather than say: check your pocket, take your own pulse, look in the mirror, watch the barkeep. Each happens once.
5. **Closing time.** When you leave, the twist plays out and the barkeep is alone with you. Pay and leave, make him forget you, or let the lights go out.
6. **The desk.** Write the three chapter lines. Each one is a choice between the man you met and the man in the journal. The end card names your version (**A good man** or **A psycho**) and what happened to the barkeep.

Progress is kept in memory only, so refreshing starts a new run.

## Publish with GitHub Pages

GitHub Pages serves the static files directly from the root of `main`. The `.nojekyll` file disables Jekyll processing. All asset imports are relative, so the game works under `/bottleography/` without a separate base-path configuration.

In **Settings → Pages**, the publishing source is **Deploy from a branch**, branch **main**, folder **/ (root)**. Each push to `main` triggers GitHub’s built-in Pages deployment. Run `npm test` before pushing changes. No custom Actions workflow, package installation, or server is required for hosting.

The repository and game are public. GitHub Pages does not provide the password gate described in the itch.io option below. For a restricted friend test, use that itch.io option instead.

## Build and share on itch.io

```sh
npm test
npm run build
```

Upload `release/bottleography-itch.zip`. `dist/` contains the same static web build. Preview the export with `node scripts/serve.mjs --dist` (stop the other server first, or set `PORT=5174`). JavaScript modules require an HTTP server; do not open index.html with a file:// URL.

On itch.io:

1. Create a project and select **HTML Game**.
2. Upload the ZIP and select it as the browser-playable file.
3. Use **Click to launch in fullscreen**, or an embedded viewport at 1920 × 1080 with fullscreen enabled. The game uses a window-filling scene with overlaid dialogue and choices, plus journal pages that open on demand. On small screens the dialogue panel can scroll internally while the scene remains fixed.
4. Set **Visibility & access → Restricted**, then enable **Also allow a password to view page**. Share the page link and password with friends. Restricted projects do not appear in browse/search/profile pages. Download keys are another option.
5. Test the uploaded game in a private browser window before sharing.

A browser link avoids OS-specific executables and installs. The build script only creates local files. It does not create or upload an itch.io project. GitHub Pages publishing is handled separately through pushes to the repository.

Official references: [itch access control](https://itch.io/docs/creators/access-control), [HTML5 upload guide](https://itch.io/docs/creators/html5).

## Scoring and content

`story.js` holds the original scraps, questions, responses, chapter lines and endings, plus the rules. `asides.js` holds the horror layer: the stage directions that make him unsettling, the biographer's own stray thoughts, the deeds, and the nightfall scene.

- Pin fire or key: Monster +1 and hunger +1. Pin the rescue denial: Hero +1.
- Believe an account: Hero +1. Let a statement slide: no change.
- Each written line: +2 to its tone. A Monster line also adds hunger +1. Watching the barkeep adds hunger +1; feeding adds 2.
- The higher total names the chapter: Hero is **A good man**, Monster is **A psycho**. Ties follow the most recent written line.

`world3d.js` takes direction from the story through shots (`desk-parcel`, `desk`, `bar`, `table`, `prey`, `exit`, `shelf`), mood (hunger) and cues (`glitch`, `heartbeat`, `vanish`, nightfall). The stranger and the writer are built from the same figure: coat, wide-brimmed hat, and a face kept in shadow. The table lamp's cone is cut to the tabletop, so only his hands and the cigarette ember are ever lit. During nightfall the writer is replaced by a tall, wrapped thing with red eyes, seen from the barkeep's side of the counter. The parcel opens in three animated movements: the string goes slack, the lid comes off, and the diary and letter rise out. `scenery.js` keeps the pure timing curves for the lamp's voltage dips and the stranger's smoking rhythm. The legacy Aseprite sources in `art/` are kept; the journal still uses the evidence icons.

## Friend test

Send the link without explaining the interaction first. Ask afterward:

- Could you tell what you were supposed to do?
- Did pinning feel satisfying or fussy?
- Did the chapter feel like your choice mattered?
- Would you play a second night?

Record completion time, the ending, the barkeep's fate, when they first suspected the twist, and which version of him they believed. The next content pass should respond to those observations.

## Tailscale playtest

On the Tailscale network, play at [zireael.tailcd7688.ts.net:4173](http://zireael.tailcd7688.ts.net:4173/)
(IP fallback: [100.86.51.62:4173](http://100.86.51.62:4173/)).
The user service `bottleography-preview.service` serves only the `dist/` build
and binds to the machine’s Tailscale IP. Rebuild with `npm run build` to update it.
Use `systemctl --user status bottleography-preview` to inspect it, or
`systemctl --user stop bottleography-preview` to stop it. The host must remain online.
