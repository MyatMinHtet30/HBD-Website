'use strict';

const $ = (id) => document.getElementById(id);
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const message = 'များများဗြောင်လိမ်နိုင်ပါစေ 🤣';
let candlesLit = true;
let surpriseOpen = false;
let celebrationTimer;

function announce(text) { $('announcement').textContent = text; }
function scrollToSection(id) {
  $(id).scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'center' });
}
function revealSurprise(scroll = true) {
  if (!surpriseOpen) {
    surpriseOpen = true;
    $('surprise-content').hidden = false;
    $('surprise-content').classList.add('revealed');
    $('note-open').hidden = true;
    $('open-surprise').setAttribute('aria-expanded', 'true');
    burst(150);
    announce(message + ' Another year older, another year of legendary stories!');
  }
  if (scroll) scrollToSection('birthday-note');
}
function blowCandles() {
  if (!candlesLit) return;
  candlesLit = false;
  $('cake').classList.add('blown');
  document.querySelector('.cake-scene').classList.add('party');
  $('cake').setAttribute('aria-label', 'Candles are out. Relight the candles with the button below.');
  $('blow').hidden = true;
  $('relight').hidden = false;
  $('relight').focus({ preventScroll: true });
  $('cake-hint').textContent = 'Wish made. Birthday magic activated. ✨';
  revealSurprise(false);
  burst(240);
  announce('The candles are out! ' + message);
  clearTimeout(celebrationTimer);
  celebrationTimer = setTimeout(() => {
    scrollToSection('birthday-note');
  }, motion.matches ? 0 : 1200);
}
function relight() {
  clearTimeout(celebrationTimer);
  candlesLit = true;
  $('cake').classList.remove('blown');
  document.querySelector('.cake-scene').classList.remove('party');
  $('cake').setAttribute('aria-label', 'Blow out the birthday cake candles');
  $('blow').hidden = false;
  $('relight').hidden = true;
  $('cake-hint').textContent = 'A wish is just a little magic away.';
  announce('Candles relit. Make another wish!');
}
$('open-surprise').setAttribute('aria-controls', 'surprise-content');
$('open-surprise').setAttribute('aria-expanded', 'false');
$('open-surprise').addEventListener('click', () => revealSurprise());
$('note-open').addEventListener('click', () => revealSurprise());
$('cake').addEventListener('click', blowCandles);
$('blow').addEventListener('click', blowCandles);
$('relight').addEventListener('click', () => { relight(); $('blow').focus({ preventScroll: true }); });

// Small, dependency-free confetti engine. Runs only during a celebration.
const canvas = $('confetti');
const ctx = canvas.getContext('2d');
let particles = [];
let frame = 0;
let lastTime = 0;
const colors = ['#ba94cd', '#e8a1ba', '#dfbb68', '#94bdb2', '#f7d7a7', '#8970a8'];
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function burst(count) {
  if (!ctx || motion.matches || document.hidden) return;
  const amount = Math.min(count, innerWidth < 620 ? 130 : 240);
  for (let i = 0; i < amount; i++) {
    const left = i % 2 === 0;
    particles.push({ x: left ? innerWidth * .12 : innerWidth * .88, y: innerHeight * .65,
      vx: (left ? 1 : -1) * (Math.random() * 7 + 2), vy: -Math.random() * 13 - 5,
      life: 0, max: 150 + Math.random() * 50, angle: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .2, size: 4 + Math.random() * 5,
      shape: i % 7 === 0 ? 'star' : i % 3 === 0 ? 'ribbon' : 'paper',
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)] });
  }
  particles = particles.slice(-400);
  if (!frame) { lastTime = performance.now(); frame = requestAnimationFrame(drawConfetti); }
}
function drawConfetti(now) {
  const step = Math.min((now - lastTime) / 16.67, 2);
  lastTime = now;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter(p => p.life < p.max && p.y < innerHeight + 40);
  for (const p of particles) {
    p.life += step; p.x += p.vx * step; p.y += p.vy * step;
    p.vy += .17 * step; p.vx *= Math.pow(.993, step); p.angle += p.spin * step;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
    ctx.globalAlpha = Math.min(1, (p.max - p.life) / 35);
    ctx.fillStyle = p.color;
    ctx.scale(1, .45 + Math.abs(Math.cos(p.life * .06 + p.phase)) * .55);
    if (p.shape === 'star') {
      ctx.beginPath();
      for (let j = 0; j < 10; j++) {
        const radius = p.size * (j % 2 ? .4 : 1);
        const angle = j * Math.PI / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      ctx.closePath(); ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * (p.shape === 'ribbon' ? 2.5 : .65));
    }
    ctx.restore();
  }
  frame = particles.length ? requestAnimationFrame(drawConfetti) : 0;
}
function stopConfetti() {
  cancelAnimationFrame(frame); frame = 0; particles = [];
  if (ctx) ctx.clearRect(0, 0, innerWidth, innerHeight);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopConfetti(); });
motion.addEventListener('change', () => { if (motion.matches) stopConfetti(); });

// Pointer parallax stays within the decorative layer and never moves the controls.
let pointerFrame = 0;
window.addEventListener('pointermove', (event) => {
  if (motion.matches || event.pointerType !== 'mouse' || pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    document.querySelector('.orbit').style.translate = `${(event.clientX / innerWidth - .5) * 12}px ${(event.clientY / innerHeight - .5) * 10}px`;
    pointerFrame = 0;
  });
}, { passive: true });

// Reveal sections once, without hiding content in browsers without this API.
if ('IntersectionObserver' in window && !motion.matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }, { threshold: .12 });
  document.querySelectorAll('.note-card').forEach((section) => {
    section.classList.add('scroll-reveal');
    observer.observe(section);
  });
}

// A gentle music-box rendition, synthesized locally without audio downloads.
const birthdayMelody = [
  [67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2],
  [67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2],
  [67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,2],
  [77,.75],[77,.25],[76,1],[72,1],[74,1],[72,2.5]
];
let audioContext;
let musicVoices = [];
let musicEndTimer;
let musicPlaying = false;
let musicStarted = false;
function updateMusicIndicator(playing) {
  musicPlaying = playing;
  $('music-indicator').setAttribute('aria-label', playing ? 'Happy Birthday melody playing' : 'Birthday melody');
  $('music-indicator').classList.toggle('is-playing', playing);
}
function stopMusic() {
  clearTimeout(musicEndTimer);
  for (const voice of musicVoices) {
    voice.oscillator.onended = null;
    try { voice.oscillator.stop(); } catch { /* Already finished. */ }
    voice.oscillator.disconnect();
    voice.gain.disconnect();
  }
  musicVoices = [];
  updateMusicIndicator(false);
}
async function tryBirthdayMusic() {
  if (musicStarted || document.hidden) return;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  try {
    audioContext ||= new AudioEngine();
    await audioContext.resume();
    if (document.hidden || musicStarted || audioContext.state !== 'running') return;
    musicStarted = true;
    const beat = .43;
    let start = audioContext.currentTime + .06;
    for (const [note, beats] of birthdayMelody) {
      const duration = beats * beat;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 440 * Math.pow(2, (note + 12 - 69) / 12);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(.15, start + .012);
      gain.gain.exponentialRampToValueAtTime(.001, start + duration + .15);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(start); oscillator.stop(start + duration + .2);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      musicVoices.push({ oscillator, gain });
      start += duration;
    }
    updateMusicIndicator(true);

    musicEndTimer = setTimeout(stopMusic, (start - audioContext.currentTime + .3) * 1000);
  } catch {
    stopMusic();
    musicStarted = false;
  }
}
// Attempt on arrival; blocked autoplay resumes only after a real visitor gesture.
tryBirthdayMusic();
document.addEventListener('pointerdown', tryBirthdayMusic, { passive: true });
document.addEventListener('keydown', tryBirthdayMusic);
document.addEventListener('visibilitychange', () => { if (document.hidden) stopMusic(); });
