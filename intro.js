// Opening animation: camera zooms out, turns into your hand, the portrait is
// drawn into a circle, your name is typed, then it all dissolves into the site.
(function () {
  const root = document.documentElement;
  const intro = document.getElementById('intro');
  if (!intro || !root.classList.contains('intro-on')) return;

  const card = document.querySelector('.card');
  const stage = intro.querySelector('.intro-stage');
  const cam = intro.querySelector('.intro-camera');
  const portrait = intro.querySelector('.intro-portrait');
  const photo = intro.querySelector('.intro-photo');
  const ring = intro.querySelector('.intro-ring');
  const circle = ring.querySelector('circle');
  const nameEl = intro.querySelector('.intro-name');
  const typed = intro.querySelector('.intro-typed');
  const skipBtn = document.getElementById('introSkip');
  const avatar = document.querySelector('.avatar');

  const NAME_TEXT = 'I’m Joyal Johnson, Jo for short.';

  // where the lens sits in camera.png, and where the camera sits in the portrait (as fractions)
  const LENS_X = 0.58, LENS_Y = 0.583, LENS_D = 0.507;
  const HAND_X = 0.768, HAND_Y = 0.42, HAND_D = 0.22;

  const LIGHT = '#efefef', DARK = '#0a0a0a';
  const ease = 'cubic-bezier(.65,0,.25,1)';

  const anims = [];
  const waits = new Set();
  let skipped = false;
  let done = false;

  const A = (el, keyframes, options) => {
    const a = el.animate(keyframes, Object.assign({ fill: 'forwards' }, options));
    anims.push(a);
    return a;
  };
  const wait = (ms) => new Promise((res) => {
    const h = { res };
    h.t = setTimeout(() => { waits.delete(h); res(); }, ms);
    waits.add(h);
  });
  const tf = (x, y, s, ry, rz) =>
    `perspective(1400px) translate(${x}px, ${y}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;

  function cleanup() {
    if (done) return;
    done = true;
    card.style.animation = 'none';
    root.classList.remove('intro-on');
    card.getAnimations().forEach((a) => a.cancel());
    card.removeAttribute('inert');
    window.removeEventListener('keydown', onKey);
    intro.remove();
  }

  function skip() {
    if (skipped || done) return;
    skipped = true;
    waits.forEach((h) => { clearTimeout(h.t); h.res(); });
    waits.clear();
    A(stage, [{ backgroundColor: getComputedStyle(stage).backgroundColor }, { backgroundColor: DARK }], { duration: 200 });
    const fade = A(intro, [{ opacity: 1 }, { opacity: 0 }], { duration: 450, delay: 120, easing: 'ease-out' });
    A(card, [{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 120 });
    fade.finished.then(cleanup, cleanup);
  }

  function onKey(e) { if (e.key === 'Escape') skip(); }
  window.addEventListener('keydown', onKey);
  skipBtn.addEventListener('click', skip);
  setTimeout(cleanup, 40000); // failsafe: never trap the visitor behind the intro

  async function typeName() {
    nameEl.style.opacity = '1';
    for (let i = 1; i <= NAME_TEXT.length; i++) {
      if (skipped) return;
      typed.textContent = NAME_TEXT.slice(0, i);
      await wait(NAME_TEXT[i - 1] === ',' ? 260 : 58);
    }
  }

  async function run() {
    const timeout = (ms) => new Promise((r) => setTimeout(r, ms));
    const ready = [timeout(3000)];
    ready.push(Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), timeout(2500)]));
    intro.querySelectorAll('img').forEach((img) => ready.push(img.decode ? img.decode().catch(() => {}) : Promise.resolve()));
    await Promise.race([Promise.all(ready.slice(1)), ready[0]]);
    if (skipped) return;

    window.scrollTo(0, 0);
    card.setAttribute('inert', '');

    // measure before anything is transformed
    const cr = cam.getBoundingClientRect();
    const pr = portrait.getBoundingClientRect();
    const W = cr.width;
    const lens = { x: cr.left + LENS_X * W, y: cr.top + LENS_Y * W };
    const T0 = { x: -(LENS_X - 0.5) * W, y: -(LENS_Y - 0.5) * W };
    const hand = { x: pr.left + HAND_X * pr.width, y: pr.top + HAND_Y * pr.height };
    const T1 = { x: hand.x - lens.x, y: hand.y - lens.y };
    const z0 = Math.min(7, (1.2 * Math.max(innerWidth, innerHeight)) / (LENS_D * W));
    const s1 = (HAND_D * pr.width) / (LENS_D * W);

    // 1 — camera fades in on the lens and slowly zooms out
    A(cam, [{ opacity: 0 }, { opacity: 1 }], { duration: 1800, easing: 'ease-out' });
    const zoom = A(cam, [{ transform: tf(T0.x, T0.y, z0, 0, 0) }, { transform: tf(0, 0, 1, 0, 0) }], { duration: 4400, easing: ease });
    await zoom.finished; if (skipped) return;
    await wait(400); if (skipped) return;

    // 2 — it turns, drifts into the hand, and the portrait appears around it
    const lerp = (a, b, t) => a + (b - a) * t;
    const move = A(cam, [
      { transform: tf(0, 0, 1, 0, 0), offset: 0 },
      { transform: tf(T1.x * 0.15, T1.y * 0.15, 0.82, 34, -5), offset: 0.35 },
      { transform: tf(T1.x * 0.62, T1.y * 0.62, lerp(s1, 1, 0.22), -24, -10), offset: 0.7 },
      { transform: tf(T1.x, T1.y, s1, 0, -9), offset: 1 },
    ], { duration: 3400, easing: 'ease-in-out' });
    A(stage, [{ backgroundColor: LIGHT }, { backgroundColor: DARK }], { duration: 3400, delay: 300, easing: 'ease-in-out' });
    A(photo, [{ opacity: 0 }, { opacity: 1 }], { duration: 2200, delay: 1700, easing: 'ease-in-out' });
    A(cam, [{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 2500 });
    await move.finished; if (skipped) return;
    await wait(800); if (skipped) return;

    // 3 — a circle is drawn and the portrait settles into it
    A(ring, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    const draw = A(circle, [{ strokeDashoffset: 312.3 }, { strokeDashoffset: 0 }], { duration: 2400, easing: 'ease-in-out' });
    A(photo, [{ borderRadius: '0%' }, { borderRadius: '50%' }], { duration: 1500, delay: 1400, easing: 'ease-in-out' });
    await draw.finished; if (skipped) return;
    await wait(300); if (skipped) return;

    // 4 — the name is written
    await typeName(); if (skipped) return;
    await wait(900); if (skipped) return;

    // 5 — the portrait travels to the avatar slot while the site fades in
    const ar = avatar.getBoundingClientRect();
    const dx = ar.left - pr.left, dy = ar.top - pr.top, sc = ar.width / pr.width;
    const D = 1900;
    const fly = A(portrait, [
      { transform: 'translate(0px, 0px) scale(1)' },
      { transform: `translate(${dx}px, ${dy}px) scale(${sc})` },
    ], { duration: D, easing: ease });
    portrait.style.transformOrigin = '0 0';
    A(ring, [{ opacity: 1 }, { opacity: 0 }], { duration: 900 });
    A(nameEl, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(10px)' }], { duration: 900 });
    A(skipBtn, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 });
    A(stage, [{ opacity: 1 }, { opacity: 0 }], { duration: D - 300, delay: 300, easing: 'ease-in-out' });
    A(card, [{ opacity: 0 }, { opacity: 1 }], { duration: D, delay: 400, easing: 'ease-in-out' });
    await fly.finished; if (skipped) return;
    cleanup();
  }

  run().catch(cleanup);
})();
