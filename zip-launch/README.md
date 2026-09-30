# ZIP α: launch film ("Riso Idol")

A 90 s hype video for Zip Labs' token-compression model, built entirely in code: every frame is drawn in Canvas 2D (paper, riso inks, halftone, die-cut stickers), and the soundtrack and all SFX are synthesized in numpy. Both are driven by one cue sheet, so the picture and the sound share the same 120 BPM grid.

| Path | What it is |
|---|---|
| `cues.json` | The single source of truth: section times, every word's landing time, every SFX |
| `src/data.js` | **Every number shown on screen. The race and benchmark values are PLACEHOLDERS: replace them before posting.** |
| `src/core.js`, `type.js`, `fx.js` | Engine: seeded noise, paper and riso textures, halftone, variable-width type (Anybody 50–150 %), the zipper wipe |
| `src/zip.js`, `cast.js` | Zip the mascot, Bloat, tokens, scissors, and so on |
| `src/scenes/` | Eight scene files (hook → end card) |
| `audio/song.py`, `synth.py` | The composition, drum machine, synths, SFX and mastering |
| `STYLE.md` | Style bible |
| `deliverables/` | Character sheet, style sheet, 720p preview |

## Render

```bash
npm i && pip install numpy scipy imageio-ffmpeg
python3 audio/song.py                       # → audio/mix.wav
node render.mjs --sheet=0,4.2,11,36.6 --out=out/check.jpg   # contact sheet
node render.mjs --frames=0:90 --workers=4   # → out/frames (resumable, about 2 min)
node render.mjs --encode --out=out/zip.mp4  # frames + audio → MP4
```

After editing `src/data.js`, set `placeholder: false` to remove the "PLACEHOLDER DATA" and "sample run" tags, then re-render the frames and re-encode.
