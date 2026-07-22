gsap.registerPlugin(ScrollTrigger);

/* ---------------- PRELOADER ---------------- */
const preTl = gsap.timeline();
preTl
  .to('.preloader-logo', { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 0.1)
  .to('.preloader-logo', { rotate: 360, duration: 0.9, ease: 'power2.inOut' }, 0.15)
  .to('.preloader-logo', { opacity: 0, scale: 0.85, duration: 0.35, ease: 'power2.in' }, 1.05)
  .to('#preloader', {
    yPercent: -100, duration: 0.7, ease: 'power4.inOut',
    onComplete: () => { document.getElementById('preloader').style.display = 'none'; }
  }, 1.25)
  .call(() => startHeroTimeline(), null, 1.35);

/* ---------------- SCROLL PROGRESS BAR ---------------- */
ScrollTrigger.create({
  trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3,
  onUpdate: self => { document.getElementById('progressBar').style.width = (self.progress*100) + '%'; }
});

/* ---------------- HEADER ---------------- */
const header = document.getElementById('header');
ScrollTrigger.create({
  start: 'top -20', end: 99999,
  onUpdate: self => header.classList.toggle('scrolled', self.scroll() > 20)
});

/* ---------------- MOBILE NAV ---------------- */
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  navLinks.style.display = open ? 'none' : 'flex';
  navLinks.style.cssText += 'position:absolute;top:100%;left:0;right:0;background:#fff;flex-direction:column;padding:20px 28px;gap:18px;box-shadow:0 14px 30px -14px rgba(0,0,0,0.2);align-items:flex-start;max-height:75vh;overflow-y:auto;';
});

/* ---------------- MEGA MENU (desktop hover via CSS; mobile tap-to-expand) ---------------- */
document.querySelectorAll('.nav-item.has-dropdown > .dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    if (window.matchMedia('(max-width:1023px)').matches) {
      e.preventDefault();
      toggle.closest('.nav-item').classList.toggle('open');
    }
  });
});

/* ---------------- HERO ENTRANCE TIMELINE (runs after preloader) ---------------- */
gsap.set('.hero-tag', { y: 14 });
gsap.set('.hero-actions', { y: 14 });
gsap.set('.hero-stats', { y: 14 });
gsap.set('.hero-visual', { x: 40 });

function startHeroTimeline(){
  const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  heroTl
    .to('.hero-tag', { opacity: 1, y: 0, duration: 0.7 }, 0.1)
    .from('.hero h1 .line span', { yPercent: 130, rotate: 4, duration: 1, stagger: 0.11 }, 0.15)
    .to('.hero p.lead', { opacity: 1, duration: 0.8 }, 0.65)
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.7 }, 0.78)
    .to('.hero-stats', { opacity: 1, y: 0, duration: 0.7 }, 0.9)
    .to('.hero-visual', { opacity: 1, x: 0, duration: 1, ease: 'power3.out' }, 0.5)
    .call(() => {
      animateCounters();
      // idle float loop once card has settled in
      gsap.to('.hero-card', { y: -10, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }, null, 1.1);
}

/* ---------------- ANIMATED COUNTERS ---------------- */
function animateCounters(){
  document.querySelectorAll('.count-num').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 1.6, ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; }
    });
  });
}

/* ---------------- HERO PARALLAX (mouse + scroll) ---------------- */
const heroSection = document.querySelector('.hero');
const heroGlow = document.getElementById('heroGlow');
const heroSplit = document.querySelector('.hero-split');
heroSection.addEventListener('mousemove', (e) => {
  const r = heroSection.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  gsap.to(heroGlow, { x, y, opacity: 1, duration: 0.6, ease: 'power2.out' });
  gsap.to('.hero-card', {
    rotateY: (x - r.width/2) / 40, rotateX: -(y - r.height/2) / 60,
    duration: 0.6, ease: 'power2.out', transformPerspective: 800
  });
});
heroSection.addEventListener('mouseleave', () => {
  gsap.to(heroGlow, { opacity: 0, duration: 0.4 });
  gsap.to('.hero-card', { rotateY: 0, rotateX: 0, duration: 0.6 });
});
gsap.to(heroSplit, {
  y: 120, ease: 'none',
  scrollTrigger: { trigger: heroSection, start: 'top top', end: 'bottom top', scrub: 0.6 }
});

/* ---------------- MAGNETIC BUTTONS ---------------- */
document.querySelectorAll('.magnetic').forEach(wrap => {
  const btn = wrap.querySelector('.btn');
  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) * 0.35;
    const y = (e.clientY - r.top - r.height/2) * 0.5;
    gsap.to(btn, { x, y, duration: 0.4, ease: 'power2.out' });
  });
  wrap.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
  });
});

/* ---------------- SCROLL REVEALS (staggered, per section) ---------------- */
const groups = [
  '.services-grid .service-card',
  '.process-row .process-step',
  '.why-list .why-item',
  '.about-stats .about-stat',
  '.port-grid .port-item',
  '.pkg-grid .pkg-card',
  '.trust-grid .trust-card'
];
groups.forEach(sel => {
  const items = gsap.utils.toArray(sel);
  if (!items.length) return;
  gsap.set(items, { opacity: 0, y: 34 });
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out' }),
    once: true
  });
});
// standalone reveal elements (headings, notes) not in the grid groups above
document.querySelectorAll('.reveal').forEach(el => {
  if (el.closest(groups.join(','))) return;
  gsap.set(el, { opacity: 0, y: 26 });
  ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
  });
});

/* why-visual image reveal + subtle parallax on scroll */
gsap.set('.why-visual', { opacity: 0, scale: 0.92 });
ScrollTrigger.create({
  trigger: '.why-visual', start: 'top 85%', once: true,
  onEnter: () => gsap.to('.why-visual', { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' })
});
gsap.to('.why-visual img', {
  y: -30, ease: 'none',
  scrollTrigger: { trigger: '.why', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
});

/* ---------------- 3D TILT: service cards & package cards ---------------- */
function addTilt(selector, strength = 10) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateY: px * strength, rotateX: -py * strength,
        transformPerspective: 700, duration: 0.4, ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
    });
  });
}
addTilt('.service-card', 7);
addTilt('.pkg-card', 5);
addTilt('.stationery-item', 6);
addTilt('.port-item', 5);

/* ---------------- PRINT SHOWCASE: connector lines + entrance ---------------- */
(function () {
  const stage = document.getElementById('showcaseStage');
  if (!stage) return;
  const cards = gsap.utils.toArray('.float-card');
  const center = stage.querySelector('.showcase-center');
  const showcaseLogo = document.getElementById('showcaseLogo');
  const linesSvg = document.getElementById('showcaseLines');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function isDesktop() { return window.matchMedia('(min-width:1024px)').matches; }

  function drawLines() {
    if (!linesSvg) return;
    linesSvg.innerHTML = '';
    if (!isDesktop()) return;
    const stageRect = stage.getBoundingClientRect();
    linesSvg.setAttribute('width', stageRect.width);
    linesSvg.setAttribute('height', stageRect.height);
    linesSvg.setAttribute('viewBox', '0 0 ' + stageRect.width + ' ' + stageRect.height);
    const cRect = center.getBoundingClientRect();
    const cx = cRect.left + cRect.width / 2 - stageRect.left;
    const cy = cRect.top + cRect.height / 2 - stageRect.top;
    let html = '';
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const tx = r.left + r.width / 2 - stageRect.left;
      const ty = r.top + r.height / 2 - stageRect.top;
      const mx = (cx + tx) / 2, my = (cy + ty) / 2;
      const dx = tx - cx, dy = ty - cy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const bend = 22;
      const qx = mx + nx * bend, qy = my + ny * bend;
      html += '<path d="M ' + cx + ' ' + cy + ' Q ' + qx + ' ' + qy + ' ' + tx + ' ' + ty + '" class="showcase-line" data-idx="' + i + '"></path>';
    });
    linesSvg.innerHTML = html;
  }

  if (reduceMotion) {
    gsap.set(cards, { opacity: 1 });
    gsap.set(center, { opacity: 1, scale: 1 });
  } else {
    gsap.set(cards, { opacity: 0, y: 16 });
    gsap.set(center, { opacity: 0, scale: 0.75 });
  }

  ScrollTrigger.create({
    trigger: stage, start: 'top 82%', once: true,
    onEnter: () => {
      drawLines();
      if (reduceMotion) return;
      gsap.to(center, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' });
      if (showcaseLogo) {
        gsap.fromTo(showcaseLogo, { rotate: -360, opacity: 0 }, { rotate: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.1 });
      }
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' });
    }
  });

  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      const line = linesSvg && linesSvg.querySelector('[data-idx="' + i + '"]');
      if (line) line.classList.add('line-active');
    });
    card.addEventListener('mouseleave', () => {
      const line = linesSvg && linesSvg.querySelector('[data-idx="' + i + '"]');
      if (line) line.classList.remove('line-active');
    });
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawLines, 150);
  });
})();

/* ---------------- PORTFOLIO FILTER ---------------- */
const tabs = document.querySelectorAll('.port-tab');
const items = document.querySelectorAll('.port-item');
const catMap = { 'All': null, 'Signage': 'Signage', 'Printing': 'Printing', 'Fit-Out': 'Fit-Out' };
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const filter = catMap[tab.textContent.trim()];
    const toHide = [], toShow = [];
    items.forEach(item => {
      const cat = item.querySelector('.cat').textContent.trim();
      const match = !filter || cat === filter;
      (match ? toShow : toHide).push(item);
    });
    gsap.to(toHide, {
      opacity: 0, scale: 0.85, duration: 0.3, stagger: 0.03, ease: 'power2.in',
      onComplete: () => toHide.forEach(el => el.style.display = 'none')
    });
    gsap.set(toShow, { display: 'flex' });
    gsap.fromTo(toShow, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, delay: toHide.length ? 0.2 : 0, ease: 'power3.out' });
  });
});

/* ---------------- CTA BAND subtle parallax orb ---------------- */
gsap.to('.cta-band', {
  backgroundPosition: '20% 50%',
  scrollTrigger: { trigger: '.cta-band', start: 'top bottom', end: 'bottom top', scrub: 1 }
});

/* ---------------- NAV SCROLLSPY INDICATOR ---------------- */
const navIndicator = document.getElementById('navIndicator');
const navAnchors = document.querySelectorAll('.nav-links a[data-link]');
function moveIndicator(link){
  if (!link) { gsap.to(navIndicator, { opacity: 0, duration: 0.2 }); return; }
  const r = link.getBoundingClientRect();
  const parentR = link.closest('.nav-links').getBoundingClientRect();
  gsap.to(navIndicator, {
    opacity: 1, x: r.left - parentR.left, width: r.width, duration: 0.4, ease: 'power3.out'
  });
}
navAnchors.forEach(a => {
  a.addEventListener('mouseenter', () => moveIndicator(a));
});
document.querySelector('.nav-links').addEventListener('mouseleave', () => {
  const current = document.querySelector('.nav-links a.current');
  moveIndicator(current);
});
navAnchors.forEach(a => {
  const sectionEl = document.getElementById(a.dataset.link);
  if (!sectionEl) return;
  ScrollTrigger.create({
    trigger: sectionEl, start: 'top 40%', end: 'bottom 40%',
    onEnter: () => setCurrent(a), onEnterBack: () => setCurrent(a)
  });
});
function setCurrent(a){
  navAnchors.forEach(x => x.classList.remove('current'));
  a.classList.add('current');
  if (!document.querySelector('.nav-links:hover')) moveIndicator(a);
}

/* ---------------- BUTTON RIPPLE ---------------- */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e){
    const r = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(r.width, r.height) * 1.6;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - r.left - size/2) + 'px';
    ripple.style.top = (e.clientY - r.top - size/2) + 'px';
    this.appendChild(ripple);
    gsap.fromTo(ripple, { scale: 0, opacity: 0.55 }, {
      scale: 1, opacity: 0, duration: 0.65, ease: 'power2.out',
      onComplete: () => ripple.remove()
    });
  });
});

/* ---------------- PROCESS LINE DRAW + STEP PULSE ---------------- */
const processLine = document.getElementById('processLine');
if (processLine) {
  ScrollTrigger.create({
    trigger: '.process-row', start: 'top 75%', once: true,
    onEnter: () => {
      gsap.to(processLine, { scaleX: 1, duration: 1.3, ease: 'power3.inOut' });
      gsap.fromTo('.process-num', { scale: 0.6, opacity: 0 }, {
        scale: 1, opacity: 1, duration: 0.55, stagger: 0.28, ease: 'back.out(2.2)', delay: 0.15
      });
    }
  });
}

/* ---------------- EYEBROW LINE DRAW ---------------- */
document.querySelectorAll('.eyebrow').forEach(eb => {
  ScrollTrigger.create({
    trigger: eb, start: 'top 92%', once: true,
    onEnter: () => eb.classList.add('drawn')
  });
});

/* ---------------- CUSTOM CURSOR (dot + trailing ring) ---------------- */
(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return; // skip touch/coarse pointers
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  document.body.classList.add('has-cursor');

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  gsap.set([dot, ring], { x: mouseX, y: mouseY });

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(dot, { x: mouseX, y: mouseY });
    dot.style.opacity = 1;
    ring.style.opacity = 1;
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = 0;
    ring.style.opacity = 0;
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = 1;
    ring.style.opacity = 1;
  });

  gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    gsap.set(ring, { x: ringX, y: ringY });
  });

  document.addEventListener('mousedown', () => ring.classList.add('click'));
  document.addEventListener('mouseup', () => ring.classList.remove('click'));

  const hoverSelector = 'a, button, .btn, .service-card, .stationery-item, .pkg-card, .port-item, .trust-card, .float-card, .showcase-center, input, textarea, select, .magnetic, .nav-links a';
  document.querySelectorAll(hoverSelector).forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });

  // Re-bind hover targets that get added dynamically (e.g. after filters) — light re-scan on click
  document.addEventListener('click', () => {
    document.querySelectorAll(hoverSelector).forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
  });
})();
