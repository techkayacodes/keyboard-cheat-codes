# Keyscape

A 3D keyboard playground in the browser. Tilt the board, test shortcuts, play typing games, and hear what different switches sound like.

## What's on the page

- **3D keyboard.** A 75% layout (84 keys) built in CSS 3D. Drag the space around it to tilt it. Keys press down when you type on your own keyboard, and you can tap or click them too. A green dot marks each key you've tested, which helps when checking a new board.
- **Sound board.** Six switch sounds, all generated live with the Web Audio API (no audio files): Thock, Clack, Clicky, Creamy, Marbly and Typewriter (with a bell on Enter). You can change the case material (Aluminum, Polycarbonate, Brass, Walnut), volume and pitch.
- **Shortcut tester.** Press common shortcuts (copy, paste, undo, save, find and more) and they get ticked off. The page adapts to Mac or Windows. The browser doesn't act on them while this tab is open. A live log shows each key's `key`, `code` and side.
- **Games.** *Chase the light* (hit the glowing key, 30 seconds) and *Type sprint* (30-second WPM test, with the next key lit on the board). Best scores are saved in your browser.

## Run it locally

It's plain HTML, CSS and JavaScript with no build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. You need a server because the JavaScript is loaded as ES modules, which don't load from `file://`.

## Put it live with GitHub Pages

1. In this repo, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Pick the branch (`main` once this work is merged) and the **/ (root)** folder, then **Save**.
4. After a minute or so the site is live at `https://techkayacodes.github.io/keyscape/`.

The `.nojekyll` file tells Pages to serve the files as they are.

## Custom domain: keyboardcheat.codes

The site is served at **https://keyboardcheat.codes**. The `CNAME` file in this repo tells GitHub Pages which domain to answer for.

DNS records at Namecheap (**Domain List → Manage → Advanced DNS → Host Records**):

| Type | Host | Value |
| --- | --- | --- |
| A Record | `@` | `185.199.108.153` |
| A Record | `@` | `185.199.109.153` |
| A Record | `@` | `185.199.110.153` |
| A Record | `@` | `185.199.111.153` |
| CNAME Record | `www` | `techkayacodes.github.io.` |

Remove any default Namecheap records for `@` or `www` (the parking page CNAME and URL redirect records) first.

Then in **Settings → Pages**, confirm the custom domain shows `keyboardcheat.codes`, wait for the DNS check to pass, and tick **Enforce HTTPS**.

## Project layout

```
index.html        page structure
css/styles.css    colorway, 3D keyboard, layout
js/keyboard.js    key layout and key-to-code mapping
js/audio.js       switch sound synthesis
js/app.js         input, tilt, shortcuts, games
```
