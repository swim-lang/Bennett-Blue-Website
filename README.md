# Bennett Law Office — Blue version

Desktop build of the Paper page **"Blue Website"**: identical to "Center Layout" (`../bennett-center-layout`) except the brand green #767d0b is replaced with blue #2c4a9b.

```bash
node dev-server.js 4325
```

- Centered, odd-column layout (3 / 5 / 7 columns) with a 300px vertical rhythm. The five headline frames have the wordmark styling: a square off-black edge around a rounded inner panel (40px corners).
- Scroll morph (first screen): the oval **logo** grows from 1 column (between the wordmark and the nav) to 3 columns centered. The **wordmark** and the 4-pill **nav** rise from the centered row to the top, side by side.
- Hero stays fixed and fades off-white → blue. The reveal text holds for 10% of a screen (`--hold` / `HOLD`).
- **Lines**: two bands of four lines at 60° across the top-left and bottom-right corners. Once you scroll past the morph, each line grows in along its own path, tied to scroll (`LINES_IN`).
- Content cards grow in from 50% as they rise and shrink out toward the top, with a rolodex tilt (`ROLODEX` in `js/main.js`).
- Smooth scroll: Lenis, `lerp: 0.28`. The wordmark scrolls back to the top.
- Hover: the wordmark, nav pills and buttons turn Blue Grey ("View All Questions" turns blue).
- Fonts are trial versions and need web licenses before launch.
