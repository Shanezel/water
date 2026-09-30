/* ============================================================
   Flask — interactions (vanilla JS, no dependencies)
   ============================================================ */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Scroll reveal (Apple-style fade + rise) ---- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  // Fallback: show everything so nothing is ever stuck invisible.
  revealEls.forEach((el) => el.classList.add('in'));
}

/* ---- Nav background solidifies on scroll ---- */
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => {
    nav.style.background =
      window.scrollY > 20 ? 'rgba(8,9,14,0.85)' : 'rgba(8,9,14,0.6)';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---- Subtle 3D tilt on the product (pointer parallax) ---- */
const tilt = document.getElementById('bottleTilt');
const wrap = document.getElementById('bottleWrap');
if (tilt && wrap && !reduceMotion && window.matchMedia('(hover:hover)').matches) {
  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform =
      `perspective(900px) rotateY(${x * 16}deg) rotateX(${-y * 10}deg)`;
  });
  wrap.addEventListener('mouseleave', () => {
    tilt.style.transform = '';
  });
}

/* ---- Color helpers ---- */
function clamp255(v) { return Math.max(0, Math.min(255, v | 0)); }
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = clamp255(((n >> 16) & 255) + amt * 255);
  const g = clamp255(((n >> 8) & 255) + amt * 255);
  const b = clamp255((n & 255) + amt * 255);
  return `rgb(${r},${g},${b})`;
}

/* ---- SVG gradient stop references ---- */
const heroStops = {
  body: document.querySelectorAll('#bodyGrad stop'),
  cap: document.querySelectorAll('#capGrad stop'),
  strap: document.querySelector('.bottle-strap'),
};
const miniStops = {
  body: [
    document.getElementById('miniStop0'),
    document.getElementById('miniStop1'),
    document.getElementById('miniStop2'),
    document.getElementById('miniStop3'),
    document.getElementById('miniStop4'),
  ],
  cap: [
    document.getElementById('miniCapStop0'),
    document.getElementById('miniCapStop1'),
    document.getElementById('miniCapStop2'),
  ],
};
const miniGlow = document.querySelector('.mini-glow');

/* Apply a color to a set of gradient <stop> elements.
   The offset pattern goes dark -> light -> dark so the bottle keeps
   its cylindrical, glossy look in any color. */
function paintBody(stops, color) {
  if (!stops || !stops.length) return;
  const dark = shade(color, -0.2);
  const mid = color;
  const light = shade(color, 0.14);
  const seq = [dark, mid, light, mid, dark];
  const list = stops.length ? Array.from(stops) : [];
  // Map available stops evenly across the dark->light->dark sequence.
  list.forEach((stop, i) => {
    const idx = Math.round((i / (list.length - 1)) * (seq.length - 1));
    stop.setAttribute('stop-color', seq[idx]);
  });
}
function paintCap(stops, cap) {
  if (!stops || !stops.length) return;
  const dark = shade(cap, -0.16);
  const light = shade(cap, 0.16);
  const seq = [dark, light, dark];
  const list = Array.from(stops);
  list.forEach((stop, i) => {
    const idx = Math.round((i / (list.length - 1)) * (seq.length - 1));
    stop.setAttribute('stop-color', seq[idx]);
  });
}

/* ---- Color swatch switching ---- */
const swatches = document.querySelectorAll('.swatch');
const nameEl = document.getElementById('swatchName');

function applyColor(color, cap, label) {
  // hero bottle
  paintBody(heroStops.body, color);
  paintCap(heroStops.cap, cap);
  if (heroStops.strap) heroStops.strap.setAttribute('stroke', cap);
  // mini preview bottle
  paintBody(miniStops.body, color);
  paintCap(miniStops.cap, cap);
  // recolor the preview glow to match
  if (miniGlow) {
    miniGlow.style.background =
      `radial-gradient(circle, ${shade(color, 0.1)}88, rgba(0,0,0,0) 66%)`;
  }
  if (nameEl && label) nameEl.textContent = label;
}

swatches.forEach((sw) => {
  sw.addEventListener('click', () => {
    swatches.forEach((s) => s.classList.remove('active'));
    sw.classList.add('active');
    applyColor(
      sw.dataset.color,
      sw.dataset.cap,
      sw.getAttribute('aria-label')
    );
  });
});
