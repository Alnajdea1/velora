# RAMZ — official site

Static site. No build step, no dependencies, no framework: open `index.html`
and it runs.

```
website/
├─ index.html          the whole page
└─ assets/
   ├─ styles.css       design tokens + layout, light and dark
   ├─ i18n.js          every string, Arabic and English
   ├─ app.js           the scroll engine and each section's scene
   ├─ fonts.css        @font-face for the self-hosted subsets
   ├─ fonts/           Rubik, Readex Pro, IBM Plex Mono (OFL)
   └─ media/           the reel clip and its poster
```

## Publishing

Upload the `website/` folder as-is to any static host — Netlify, Vercel,
Cloudflare Pages, S3, Nginx, or GitHub Pages. Nothing needs to be compiled or
installed, and there are no outbound requests: fonts, video and scripts are all
served from the same origin.

Two things to set on the host:

- serve `assets/media/*.mp4` with `Accept-Ranges: bytes` (every standard host
  already does) — the reel seeks through the file and needs range requests;
- cache `assets/fonts/*` and `assets/media/*` long (they are content-stable),
  `index.html` short.

## Swapping the reel footage

Replace `assets/media/reel-placeholder.mp4` and `reel-poster.jpg`. The current
clip is a labelled placeholder, not brand footage.

Encode for seeking, not just for playback — a keyframe every 5–10 frames is
what makes scrubbing smooth:

```sh
ffmpeg -i source.mov -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -g 5 -keyint_min 5 -sc_threshold 0 -crf 20 -movflags +faststart -an \
  assets/media/reel-placeholder.mp4
```

A clip encoded with the usual 2-second keyframe interval will visibly jump as
the reader scrolls.

The five captions come from `reel` in `assets/i18n.js`; they are spread evenly
across the clip. Edit that array to change the words, their side of the frame
(`start` / `end` / `center`), or how many stages there are.

## Languages

`assets/i18n.js` holds both languages. The first visit follows the browser's
language, after that the reader's choice is remembered. Switching sets `lang`
and `dir` on `<html>` and re-renders the chat, the deck, the sectors and the
reel captions; the layout is built on logical properties, so RTL and LTR come
out of the same CSS.

## Motion

One `requestAnimationFrame` loop drives every section from the scroll position.
Under `prefers-reduced-motion: reduce` nothing pins and nothing animates: the
page becomes a plain document with all content visible, which is also the
fallback if the video cannot be decoded.
