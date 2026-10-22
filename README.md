# Bennett — Round Two

Local implementation of Sean Bennett / Homepage — Blue / Round 2 — Final Hero + new sections + Final Footer.

## Preview

`node dev-server.js 4321` then visit http://localhost:4321. No build or package install is required to run the site.

## Source of truth

Paper: https://app.paper.design/file/01M5G7XC4B0SW5SCEYMSCR3VEJ/p-2-0

The desktop artboard and both mobile artboards were exported directly as JSX into `design-source/`. Typography, original SVG paths, spacing, letter geometry, and colors are translated into `index.html` and `css/paper.css`. At 1440px the desktop geometry uses Paper's pixel values. Below 900px the layout reflows using the supplied mobile design; the gallery, company section, letter, and footer extend that design responsively.

`css/round-two.css` contains responsive adaptations, interactions, and motion. `js/round-two.js` is dependency-free. `scripts/import-paper.py` regenerates the static source layer from the saved exports (requires Python + beautifulsoup4); it leaves the behavior and responsive CSS untouched.

## Interaction

- Slow, seamless upward vehicle loop behind a stationary seal, with a pause control; stationary on mobile and with reduced motion.
- Center pinstripes draw down with scrolling. Left and right content reveal at their own positions.
- All six situations support horizontal trackpad scrolling, mouse drag, keyboard arrows, the next control, and touch swiping. Desktop wheel movement over the rail advances cards and releases at the ends.
- Five gallery categories, keyboard-operated tabs, and a click-to-enlarge native dialog.
- The letter opens gently along its two supplied folds (12 degrees maximum) and settles into the original geometry. Reduced motion and mobile use the readable static letter.
- Mobile navigation uses the blue Paper menu. Native dialogs provide Escape handling and focus containment. FAQ content comes from the original GitHub website.

## Asset notes

Only the original Successor Light and Malamocco Regular font binaries are used. They remain trial fonts as recorded in the original repository.

The initial car image matches Paper's BB Garage photograph. The office illustration is a 4x native Paper export, preserving the exact selected rendering; the source SVG is retained too. Other gallery categories use existing supplied photographs (not newly approved art direction). Reference photography has not been cleared for public website publication.

Contact actions use the supplied phone number. Internal navigation points to the appropriate homepage sections. Separate attorney, service, privacy, and legal pages are not part of this prototype; the footer's policy labels remain noninteractive until those pages exist.

This is a local review build, not a production deployment.
