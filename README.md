# Bottleography — one-night POC

A browser visual novel about interviewing a man whose memories have outlived their owners. Ask, compare his words with a damaged journal, then write one version of his life. The larger story's identity reveal is deliberately absent; there is one quiet verbal echo.

[Play in your browser](https://krymancer.github.io/bottleography/).

Plain JavaScript, HTML/CSS, and a 480 × 240 canvas. No engine, runtime packages, analytics, or backend. Nothing loads from a third-party host: the scenery, the dialogue frames, buttons and icons are locally bundled Aseprite pixel art, and the two pixel typefaces ([Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans) for prose, [Jersey 10](https://fonts.google.com/specimen/Jersey+10) for labels, both SIL OFL) ship in `assets/fonts`. Python is only needed for the optional MCP development tooling. Sound is synthesized locally: glass, lighter, text/typewriter ticks.

## Play locally

Requires Node.js 20+ for the development scripts. No install step.

```sh
npm run dev
```

Open http://localhost:5173. Sound is always enabled and starts on the first click or keypress, as required by browser audio policies. Click dialogue or press Space to reveal it immediately, then advance to the responses. Dialogue and choices appear in turns; selecting a response fades it out before the next line. Use Tab/Enter to navigate controls; J opens/closes the journal, M opens the manuscript upstairs, and Escape closes the pages (or reveals text/releases a scrap when pages are closed). The top-right fullscreen control requests browser fullscreen. Reduced-motion preferences disable text reveal and scene movement.

The scene fills the window, with dialogue and compact, centered choices taking turns in a translucent overlay. The ending expands into a large panel with the completed manuscript. Open the pixel-art parcel, then click the diary to read the surviving pages. Hover or focus an object to highlight it. The stranger fades into view at the bar; reduced-motion mode reveals him immediately and disables lamp flicker and the occasional cigarette puff. Clicking the bar lamp secretly triggers a voltage dip and a short electrical crackle (sound only with reduced motion).

1. Meet him first: ask his name, age, and why he wants a book. Each has a conversational follow-up. These questions do not award judgment points. Select **About the journal** whenever you want to move on, or leave for the desk even during this first round.
2. Ask one of four journal questions. Select **Keep listening** to reach the statement you can judge.
3. Click the journal on the table (or press J), select a scrap, then click his statement or **Pin contradiction**. Selecting a scrap closes the pages and returns focus to the dialogue. A mismatched scrap does not punish you. You can instead believe him or let it slide.
4. Return to the question list. **Leave & write** is always available, including before asking anything. Leaving mid-answer treats that topic as unresolved.
5. Pick three chapter lines. Click the manuscript in the typewriter (or press M) to review your draft; the diary remains a separate readable object. Each choice commits immediately. The third locks the ending. Replay from the end card.

Progress is in memory only; refreshing starts a new run. This is a single-sitting demo. The target is 10–15 minutes of considered reading, but the present text can be finished faster; do not treat that duration as validated. No forced delays. The end card reports elapsed time and offers the four friend-test questions.

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

`story.js` holds all journal scraps, questions, responses, chapter choices, endings, and rules. Four sticky facts: a lamp at the grain house, the chapel key, the river rescue, and the stranger surviving without a pulse. Three scraps group those facts. Their accounts are intentionally incomplete, not an objective morality checklist.

- Pin fire or key: Monster +1.
- Pin rescue denial: Hero +1. Evidence can support him.
- Believe an account: Hero +1 (a deliberate act of charitable trust, even when he condemns himself).
- Let a statement slide: Nobody +1. Unasked questions add nothing.
- Each written line: +2 to its internal tone. All three written lines in one tone can overcome all interview judgments.
- Choices show only prose, with no morality labels or visible score tally. The final version is named only after the chapter is locked.
- Highest total locks one chip. Ties follow the most recent written choice among the tied tones.
- End percentages are explicitly marked illustrative: Hero 35%, Monster 42%, Nobody 23%. Nothing is collected.

`scenery.js` composites Aseprite scene layers, four-frame rain/smoke sheets, and a localized mask for occasional bar-lamp flicker. Both the bar and writing room use native 480 × 240 artwork. The opening reveal and reduced-motion support are preserved. Editable sources and regeneration instructions are in [art/source](art/source/README.md). `style.css` scales the pixel UI chrome by a `--px` unit (3 px, 2 px on narrow screens, 4 px on wide ones) so frames, icons and type stay on one grid; the UI sprites come from `art/source/ui.lua`. `app.js` handles presentation and interaction; rules live separately so they can be tested without a browser.

An optional [Aseprite + MCP art experiment](art/experiments/README.md) creates an editable bottle sprite and transparent PNG exports. Its development tools are separate from the browser game.

## Friend test

Send the link without explaining the interaction first. Ask afterward:

- Could you tell what you were supposed to do?
- Did pinning feel satisfying or fussy?
- Did the chapter feel like your choice mattered?
- Would you play a second night?

Record completion time, the ending, where they hesitated, and what they thought the journal proved. The next content pass should respond to those observations. No extra nights, full identity reveal, cloud stats, inventory, VO, or engine migration are included in this POC.

## Tailscale playtest

On the Tailscale network, play at [zireael.tailcd7688.ts.net:4173](http://zireael.tailcd7688.ts.net:4173/)
(IP fallback: [100.86.51.62:4173](http://100.86.51.62:4173/)).
The user service `bottleography-preview.service` serves only the `dist/` build
and binds to the machine’s Tailscale IP. Rebuild with `npm run build` to update it.
Use `systemctl --user status bottleography-preview` to inspect it, or
`systemctl --user stop bottleography-preview` to stop it. The host must remain online.
