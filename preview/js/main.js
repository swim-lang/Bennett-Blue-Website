// Bennett homepage — BLUE version (Paper page "Blue Website": Center Layout with the green swapped for #2c4a9b).
//
// Over the first screen of scroll (scrubbed):
//   • the fixed hero fades off-white → blue
//   • the LOGO grows from State A (1 column, in the row, equidistant between
//     the wordmark and the nav) to State B (3 columns / 460 wide, centered)
//   • the WORDMARK and NAV rise from the vertically centered row (State A:
//     wordmark in column 1, nav right-anchored) to the top, side by side as one
//     centered unit (State B). Their sizes don't change.
// All three are laid out in CSS at State B; we tween FROM State A.
// Then the "reveal" text holds at the bottom for HOLD × viewport height.
// Values are design px from Paper × u (1 design px at the 1440 artboard).

(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Subtle smooth scroll (Lenis), driven by GSAP's ticker so ScrollTrigger
  // stays in sync. lerp: lower = smoother/floatier; 0.28 keeps it very light.
  // Touch devices keep native scrolling; skipped for reduced motion.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.28 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const u = () => window.innerWidth / 1440;
  const vh = () => window.innerHeight;

  const hero = document.querySelector('.hero');
  const rowTop = () => vh() / 2 - 10.805 * u();

  const logo = document.querySelector('.logo');
  const linesTopLeft = document.querySelectorAll('.lines--top-left .lines__line');
  const linesBottomRight = document.querySelectorAll('.lines--bottom-right .lines__line');
  const wordmark = document.querySelector('.wordmark');

  // The wordmark links back to the top of the page — a smooth scroll back up
  // through the content (instant for reduced motion).
  wordmark.addEventListener('click', (e) => {
    e.preventDefault();
    if (lenis) lenis.scrollTo(0, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 3) });
    else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  const nav = document.querySelector('.nav');

  // After a resize the tweens are invalidated; nudge each animation so its
  // recalculated values render even at the ends of its scroll range.
  const nudge = (self) => {
    const anim = self.animation;
    if (!anim) return;
    const p = self.progress;
    anim.progress(p > 0.5 ? 0 : 1, true).progress(p, true);
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.hero-scroll',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: nudge,
    },
  });

  // Hero stays fixed; its background fades off-white → blue
  tl.fromTo(hero, { backgroundColor: '#f2efdd' }, { backgroundColor: '#2c4a9b' }, 0);

  // Logo: 146.67 → 460 wide; left 427.98 (equidistant between the wordmark's
  // right edge, 166.67, and the nav's left edge, 835.95) → 490; centered
  // vertically in both states (State A top = 50vh − 38.28, State B 50vh − 120.06)
  tl.fromTo(
    logo,
    {
      x: () => (427.98 - 490) * u(),
      y: () => (120.06 - 38.28) * u(),
      scale: 146.67 / 460,
    },
    { x: 0, y: 0, scale: 1 },
    0
  );

  // Wordmark: left 20 (column 1) → 349.64; top rowTop → 20
  tl.fromTo(
    wordmark,
    {
      x: () => (20 - 349.64) * u(),
      y: () => rowTop() - 20 * u(),
    },
    { x: 0, y: 0 },
    0
  );

  // Nav: left 835.95 (right margin) → 506.31 (wordmark + 10px); top rowTop → 20
  tl.fromTo(
    nav,
    {
      x: () => (835.95 - 506.31) * u(),
      y: () => rowTop() - 20 * u(),
    },
    { x: 0, y: 0 },
    0
  );

  // Hold: once the morph finishes, the reveal text sits at the bottom of the
  // viewport and the view holds for HOLD × viewport height of scroll (the
  // reveal section is that much taller in CSS — keep --hold in sync).
  const HOLD = 0.1;
  gsap.fromTo(
    '.reveal__text',
    { y: () => -HOLD * vh() },
    {
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.reveal',
        start: 'top top',
        end: () => '+=' + HOLD * vh(),
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: nudge,
      },
    }
  );

  // Lines: hidden through the morph and the hold. As the viewer scrolls past
  // State B (the hold ends and the content starts to rise), each line grows
  // into the frame along its own path, one after another from the corner
  // outward, tied 1:1 to scroll over LINES_IN × viewport height.
  // A line "grows" by sliding along its own length (inside the band, which is
  // rotated 60°): it starts LINE_HIDE design px back, which puts its tip just
  // outside the viewport, so the visible part draws in from the edge.
  //   top-left lines enter from the left edge and grow up to the top edge;
  //   bottom-right lines enter from the right edge and grow down to the bottom.
  const LINES_IN = 1.5;
  const LINE_HIDE = 945;
  const linesIn = gsap.timeline({
    defaults: { ease: 'none', duration: 0.7 },
    scrollTrigger: {
      trigger: '.reveal',
      start: () => `top+=${HOLD * vh()} top`,  // = the end of the hold
      end: () => '+=' + LINES_IN * vh(),
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: nudge,
    },
  });
  // Corner-most line first: in the rotated band, line 1 is nearest the top-left
  // corner and line 4 nearest the bottom-right corner.
  linesIn.fromTo(linesTopLeft, { y: () => LINE_HIDE * u() }, { y: 0, stagger: 0.1 }, 0);
  linesIn.fromTo(linesBottomRight, { y: () => -LINE_HIDE * u() }, { y: 0, stagger: { each: 0.1, from: 'end' } }, 0);

  // Rolodex: the viewport feels fixed while content cards grow in as they rise
  // from the bottom edge and shrink out as they approach the top.
  //   SCALE_MIN — scale at the very edges of the viewport
  //   GROW_IN   — card reaches full size after travelling this × viewport height
  //   SHRINK_OUT — card starts shrinking this × viewport height before leaving
  //   TILT      — degrees each card is turned at the edges, like a card on a
  //               drum: entering, its top edge leans toward the viewer (top wider
  //               than bottom); leaving, its top leans away (top narrower)
  //   PERSPECTIVE — viewing distance in design px; lower = stronger warp
  // Stacks animate card by card; a caption scales and tilts with its photo
  // (around the photo's centre) so the pair stays locked together.
  const ROLODEX = { SCALE_MIN: 0.5, GROW_IN: 0.55, SHRINK_OUT: 0.7, TILT: 60, PERSPECTIVE: 1200 };

  if (!reduceMotion) {
    const canvas = document.querySelector('.content__canvas');
    const cards = [
      ...canvas.querySelectorAll(':scope > .frame:not(.caption), :scope > .photo, :scope > .stack > .frame'),
    ];
    // Both phases ease against the distance from the viewport edge, so a card
    // eases gently into full size on the way in and gently out of it on the
    // way out — the shrink-out is a mirror image of the grow-in.
    const ease = gsap.parseEase('power2.out');
    const lerp = (p) => ROLODEX.SCALE_MIN + (1 - ROLODEX.SCALE_MIN) * p;

    cards.forEach((card) => {
      const caption = card.matches('.photo') && card.nextElementSibling?.matches('.caption')
        ? card.nextElementSibling
        : null;
      const targets = caption ? [card, caption] : [card];
      targets.forEach((t) => (t.style.willChange = 'transform'));

      const render = (self) => {
        const travelled = self.scroll() - self.start;  // since the card's top hit the bottom edge
        const remaining = self.end - self.scroll();    // until the card's bottom hits the top edge
        const pIn = gsap.utils.clamp(0, 1, travelled / (ROLODEX.GROW_IN * vh()));
        const pOut = gsap.utils.clamp(0, 1, remaining / (ROLODEX.SHRINK_OUT * vh()));
        // 0 = fully settled, 1 = at an edge. A short card on a tall screen can
        // be in both zones at once; taking the larger for scale and the
        // difference for tilt keeps the motion continuous either way.
        const tIn = 1 - ease(pIn);
        const tOut = 1 - ease(pOut);
        gsap.set(targets, {
          scale: lerp(1 - Math.max(tIn, tOut)),
          rotationX: ROLODEX.TILT * (tOut - tIn),
          transformPerspective: ROLODEX.PERSPECTIVE * u(),
        });
      };

      ScrollTrigger.create({
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: render,
        onRefresh: (self) => {
          if (caption) {
            // Scale and tilt the caption around the photo's centre
            const ox = card.offsetLeft + card.offsetWidth / 2 - caption.offsetLeft;
            const oy = card.offsetTop + card.offsetHeight / 2 - caption.offsetTop;
            caption.style.transformOrigin = `${ox}px ${oy}px`;
          }
          render(self);
        },
      });
    });
  }

  // Re-run once everything exists so nudge() can render every start state.
  ScrollTrigger.refresh();
})();
