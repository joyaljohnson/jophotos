// menu
const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');
menuBtn.addEventListener('click', () => {
  const open = menuPanel.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
});
menuPanel.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', () => { menuPanel.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); });
});
document.addEventListener('click', (e) => {
  if (!menuPanel.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
    menuPanel.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false');
  }
});

// bio expand
const bio = document.getElementById('bio');
document.getElementById('moreBtn').addEventListener('click', (e) => {
  const expanded = bio.classList.toggle('expanded');
  e.target.textContent = expanded ? 'less' : 'more';
  e.target.setAttribute('aria-expanded', expanded ? 'true' : 'false');
});

// shared tab switcher — used by the tab bar, the menu links, and the Enquire button
function activateTab(panelId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.panel === panelId));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === panelId));
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => activateTab(tab.dataset.panel));
});

menuPanel.querySelectorAll('a[data-panel]').forEach(link => {
  link.addEventListener('click', (e) => { e.preventDefault(); activateTab(link.dataset.panel); });
});

function openEnquiry() {
  activateTab('panel-contact');
  document.querySelector('.tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('cname').focus({ preventScroll: true });
}
document.getElementById('enquireBtn').addEventListener('click', openEnquiry);
document.getElementById('talkBtn').addEventListener('click', openEnquiry);

// share (clipboard, no external calls)
const shareBtn = document.getElementById('shareBtn');
const shareToast = document.getElementById('shareToast');
shareBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(window.location.href); } catch (err) { /* clipboard unavailable — still show state */ }
  shareToast.classList.add('show');
  setTimeout(() => shareToast.classList.remove('show'), 1400);
});

// contact form (static demo — no backend, nothing leaves the page)
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('confirm').classList.add('show');
  e.target.reset();
});

// collection filter — the circles above the grid
const figures = Array.from(document.querySelectorAll('.grid-photo'));
const filterButtons = Array.from(document.querySelectorAll('.highlight'));
const COLLECTION_NAMES = { 'grey-spot': 'Grey Spot', 'seasons': 'Seasons' };

function visibleFigures() {
  return figures.filter(f => !f.hidden);
}

function applyFilter(name) {
  figures.forEach(f => { f.hidden = name !== 'all' && f.dataset.collection !== name; });
  filterButtons.forEach(b => {
    const on = b.dataset.filter === name;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

filterButtons.forEach(b => {
  b.addEventListener('click', () => {
    const already = b.classList.contains('active');
    applyFilter(already ? 'all' : b.dataset.filter);
  });
});

// lightbox — clicking a grid photo opens it larger, with its caption and details
const lightbox = document.getElementById('lightbox');
const lbMedia = document.getElementById('lightboxMedia');
const lbIndex = document.getElementById('lightboxIndex');
const lbTitle = document.getElementById('lightboxTitle');
const lbCollection = document.getElementById('lightboxCollection');
const lbNoteRow = document.getElementById('lightboxNoteRow');
const lbNote = document.getElementById('lightboxNote');
let currentPhoto = 0;
let lastFocused = null;

function openLightbox(i) {
  const list = visibleFigures();
  if (!list.length) return;
  currentPhoto = (i + list.length) % list.length;
  const fig = list[currentPhoto];
  const thumb = fig.querySelector('img');
  const img = document.createElement('img');
  img.src = thumb.currentSrc || thumb.src;
  img.alt = fig.dataset.title;
  lbMedia.replaceChildren(img);
  lbIndex.textContent = String(currentPhoto + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0');
  lbTitle.textContent = fig.dataset.title;
  lbCollection.textContent = COLLECTION_NAMES[fig.dataset.collection] || fig.dataset.collection;
  const note = fig.dataset.note || '';
  lbNote.textContent = note;
  lbNoteRow.hidden = !note;
  if (lightbox.hidden) lastFocused = document.activeElement;
  lightbox.hidden = false;
  document.getElementById('lightboxClose').focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lbMedia.replaceChildren();
  if (lastFocused) lastFocused.focus();
}

figures.forEach(fig => {
  const open = () => openLightbox(visibleFigures().indexOf(fig));
  fig.addEventListener('click', open);
  fig.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
  });
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeLightbox));
document.getElementById('lightboxPrev').addEventListener('click', () => openLightbox(currentPhoto - 1));
document.getElementById('lightboxNext').addEventListener('click', () => openLightbox(currentPhoto + 1));

document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') openLightbox(currentPhoto - 1);
  if (e.key === 'ArrowRight') openLightbox(currentPhoto + 1);
});
