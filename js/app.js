import { buildKeyboard, KEYS, IS_MAC, keyFor, codeForChar } from './keyboard.js';
import { SwitchSynth, PROFILES, CASES } from './audio.js';

const $ = (id) => document.getElementById(id);
const synth = new SwitchSynth();

const store = {
  get(k, d) { try { const v = localStorage.getItem('keyscape:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('keyscape:' + k, JSON.stringify(v)); } catch { /* private mode */ } },
};

/* ---------- Build ---------- */
const plate = $('plate');
buildKeyboard(plate);
$('totalCount').textContent = KEYS.size;

const WORD = 'Keyscape';
const wordmark = $('wordmark');
[...WORD].forEach((ch) => {
  const s = document.createElement('span');
  s.className = 'wm-letter';
  s.textContent = ch;
  s.dataset.code = 'Key' + ch.toUpperCase();
  s.setAttribute('aria-hidden', 'true');
  wordmark.appendChild(s);
});

synth.profile = store.get('profile', 'thock') in PROFILES ? store.get('profile', 'thock') : 'thock';
synth.caseMat = store.get('case', 'aluminum') in CASES ? store.get('case', 'aluminum') : 'aluminum';
synth.volume = store.get('volume', 0.7);
synth.pitch = store.get('pitch', 1);
$('volume').value = synth.volume;
$('pitch').value = synth.pitch;

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ---------- Key state ---------- */
const held = new Set();
const tested = new Set();
let virtualShift = false;
const MODS = new Set(['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight']);

function setPressed(code, on) {
  const k = KEYS.get(code);
  if (k) k.el.classList.toggle('pressed', on);
  wordmark.querySelectorAll(`[data-code="${code}"]`).forEach((s) => s.classList.toggle('down', on));
}

function markTested(code) {
  if (!KEYS.has(code) || tested.has(code)) return;
  tested.add(code);
  KEYS.get(code).el.classList.add('tested');
  $('testedCount').textContent = tested.size;
  if (tested.size === KEYS.size) toast('Every key works. Nice board.');
}

$('clearTested').addEventListener('click', () => {
  tested.forEach((c) => KEYS.get(c).el.classList.remove('tested'));
  tested.clear();
  $('testedCount').textContent = 0;
});

function normalizeCode(code) {
  if (code === 'NumpadEnter') return 'Enter';
  if (code === 'MetaRight' || code === 'OSRight') return 'ContextMenu';
  if (code === 'OSLeft') return 'MetaLeft';
  return code;
}

/**
 * Single entry point for every key press, physical or on-screen.
 * ev: { code, key, shift, ctrl, alt, meta, repeat, location, virtual, original }
 */
function press(ev) {
  const code = normalizeCode(ev.code);
  if (!ev.repeat) {
    const size = KEYS.get(code)?.width || 1;
    synth.play('down', { size, code });
    held.add(code);
    setPressed(code, true);
    markTested(code);
  }
  $('lastKey').textContent = ev.key === ' ' ? 'Space' : ev.key || code;
  $('lastCode').textContent = code;
  hideHint();

  if (activeTab === 'shortcuts') shortcutPress(ev, code);
  if (game) game.onKey(ev, code);
}

function release(code) {
  code = normalizeCode(code);
  if (!held.has(code)) return;
  held.delete(code);
  setPressed(code, false);
  synth.play('up', { size: KEYS.get(code)?.width || 1 });
  // macOS swallows keyup for other keys while ⌘ is held
  if (code === 'MetaLeft' || code === 'ContextMenu') [...held].forEach(release);
}

function releaseAll() { [...held].forEach(release); }

/* Physical keyboard */
const isFormControl = (el) => el && (el.matches?.('input, select, textarea') || el.isContentEditable);
const SCROLL_KEYS = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', 'Tab', 'Backspace', 'Quote', 'Slash']);

window.addEventListener('keydown', (e) => {
  if (isFormControl(e.target) && !game) return;
  const onButton = e.target?.matches?.('button') && !e.target.classList.contains('key');
  // Let Space/Enter activate a focused control unless a game is running.
  if (onButton && !game && (e.code === 'Space' || e.code === 'Enter')) {
    press({ code: e.code, key: e.key, repeat: e.repeat, location: e.location });
    return;
  }
  if (onButton && !game && e.code === 'Tab') return; // keep keyboard navigation
  if (SCROLL_KEYS.has(e.code) && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
  press({
    code: e.code, key: e.key, shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey,
    repeat: e.repeat, location: e.location, original: e,
  });
});
window.addEventListener('keyup', (e) => release(e.code));
window.addEventListener('blur', releaseAll);

/* On-screen keyboard */
plate.addEventListener('pointerdown', (e) => {
  const keyEl = e.target.closest('.key');
  if (!keyEl) return;
  e.preventDefault();
  e.stopPropagation();
  const code = keyEl.dataset.code;
  keyEl.setPointerCapture?.(e.pointerId);

  if (code === 'ShiftLeft' || code === 'ShiftRight') {
    virtualShift = !virtualShift;
    document.querySelectorAll('.key[data-code^="Shift"]').forEach((k) => k.classList.toggle('latched', virtualShift));
    press({ code, key: 'Shift', virtual: true });
    return;
  }
  const shifted = virtualShift;
  press({ code, key: keyFor(code, shifted), shift: shifted, virtual: true });
  if (virtualShift && !MODS.has(code)) {
    virtualShift = false;
    document.querySelectorAll('.key.latched').forEach((k) => k.classList.remove('latched'));
  }
});
const pointerUp = (e) => {
  const keyEl = e.target.closest?.('.key');
  if (keyEl) release(keyEl.dataset.code);
};
plate.addEventListener('pointerup', pointerUp);
plate.addEventListener('pointercancel', pointerUp);
plate.addEventListener('lostpointercapture', pointerUp);

/* ---------- Tilt: drag to rotate ---------- */
const stage = $('stage');
const board = $('board');
const root = document.documentElement;
const BASE = () => ({ rx: matchMedia('(max-width: 820px)').matches ? 22 : 34, ry: 0, rz: -2 });
let tilt = { ...BASE() };
let drag = null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyTilt() {
  root.style.setProperty('--rx', tilt.rx.toFixed(2) + 'deg');
  root.style.setProperty('--ry', tilt.ry.toFixed(2) + 'deg');
  root.style.setProperty('--rz', tilt.rz.toFixed(2) + 'deg');
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

if (!reduced) {
  board.classList.add('intro');
  board.addEventListener('animationend', () => board.classList.remove('intro'), { once: true });
}

stage.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.key')) return;
  drag = { x: e.clientX, y: e.clientY, start: { ...tilt } };
  stage.classList.add('dragging');
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener('pointermove', (e) => {
  if (!drag) return;
  tilt.ry = clamp(drag.start.ry + (e.clientX - drag.x) * 0.25, -55, 55);
  tilt.rx = clamp(drag.start.rx - (e.clientY - drag.y) * 0.25, -10, 75);
  applyTilt();
  hideHint();
});
const endDrag = () => { drag = null; stage.classList.remove('dragging'); };
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);

$('resetBtn').addEventListener('click', () => { tilt = { ...BASE() }; applyTilt(); });

let hintHidden = false;
function hideHint() {
  if (hintHidden) return;
  hintHidden = true;
  $('stageHint').classList.add('gone');
}

/* ---------- Mute ---------- */
$('muteBtn').addEventListener('click', () => {
  synth.muted = !synth.muted;
  $('muteBtn').setAttribute('aria-pressed', String(synth.muted));
  $('muteBtn').textContent = synth.muted ? 'Unmute' : 'Mute';
});

/* ---------- Tabs ---------- */
let activeTab = 'sound';
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(name, focus = false) {
  activeTab = name;
  tabs.forEach((t) => {
    const on = t.id === 'tab-' + name;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    $(t.getAttribute('aria-controls')).hidden = !on;
    if (on && focus) t.focus();
  });
  if (name !== 'play' && game) game.stop(false);
}
tabs.forEach((t, i) => {
  t.addEventListener('click', (e) => { selectTab(t.id.slice(4)); if (e.detail) t.blur(); });
  t.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.stopPropagation();
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next.id.slice(4), true);
  });
});

/* ---------- Sound board ---------- */
const STEM_COLORS = { thock: '#7A5C99', clack: '#3E7CB1', clicky: '#2F6FD6', creamy: '#E6C9A8', marbly: '#5FB3A1', typewriter: '#5C5C5C' };
const switchesEl = $('switches');
switchesEl.setAttribute('role', 'radiogroup');
switchesEl.setAttribute('aria-label', 'Switch sound');
Object.entries(PROFILES).forEach(([id, p]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'switch';
  b.setAttribute('role', 'radio');
  b.setAttribute('aria-checked', String(id === synth.profile));
  b.style.setProperty('--stem', STEM_COLORS[id]);
  b.innerHTML = `<span class="stem" aria-hidden="true"></span><strong></strong><span class="blurb"></span>`;
  b.querySelector('strong').textContent = p.name;
  b.querySelector('.blurb').textContent = p.blurb;
  b.addEventListener('click', (e) => {
    synth.profile = id;
    store.set('profile', id);
    switchesEl.querySelectorAll('.switch').forEach((s) => s.setAttribute('aria-checked', String(s === b)));
    roll(id === 'typewriter' ? 'keys\n' : 'keyscape', 75);
    if (e.detail) b.blur();
  });
  switchesEl.appendChild(b);
});

const caseSeg = $('caseSeg');
Object.entries(CASES).forEach(([id, c]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = c.name;
  b.setAttribute('aria-pressed', String(id === synth.caseMat));
  b.addEventListener('click', (e) => {
    synth.caseMat = id;
    store.set('case', id);
    caseSeg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    roll('asdf', 80);
    if (e.detail) b.blur();
  });
  caseSeg.appendChild(b);
});

$('volume').addEventListener('input', (e) => { synth.volume = +e.target.value; store.set('volume', synth.volume); });
$('pitch').addEventListener('input', (e) => { synth.pitch = +e.target.value; store.set('pitch', synth.pitch); });
$('pitch').addEventListener('change', () => roll('jk', 90));

/* Animated typing on the board */
let rollTimer = null;
function roll(text, speed = 85) {
  clearTimeout(rollTimer);
  const chars = [...text];
  let i = 0;
  const step = () => {
    if (i >= chars.length) return;
    const ch = chars[i++];
    const hit = ch === '\n' ? { code: 'Enter', shift: false } : codeForChar(ch);
    if (hit) {
      if (hit.shift) { press({ code: 'ShiftLeft', key: 'Shift', virtual: true }); }
      press({ code: hit.code, key: ch === '\n' ? 'Enter' : ch, virtual: true });
      const c = hit.code;
      setTimeout(() => { release(c); if (hit.shift) release('ShiftLeft'); }, speed * 0.55);
    }
    rollTimer = setTimeout(step, speed * (0.7 + Math.random() * 0.7));
  };
  step();
}
$('demoBtn').addEventListener('click', (e) => {
  roll('the quick brown fox jumps over the lazy dog.\n', 95);
  if (e.detail) e.currentTarget.blur();
});

/* ---------- Shortcut tester ---------- */
const MOD_LABEL = IS_MAC ? '⌘' : 'Ctrl';
const SHORTCUTS = [
  { id: 'copy', name: 'Copy', code: 'KeyC', mod: true },
  { id: 'paste', name: 'Paste', code: 'KeyV', mod: true },
  { id: 'cut', name: 'Cut', code: 'KeyX', mod: true },
  { id: 'undo', name: 'Undo', code: 'KeyZ', mod: true },
  { id: 'redo', name: 'Redo', code: IS_MAC ? 'KeyZ' : 'KeyY', mod: true, shift: IS_MAC },
  { id: 'all', name: 'Select all', code: 'KeyA', mod: true },
  { id: 'save', name: 'Save', code: 'KeyS', mod: true },
  { id: 'find', name: 'Find', code: 'KeyF', mod: true },
  { id: 'print', name: 'Print', code: 'KeyP', mod: true },
  { id: 'bold', name: 'Bold', code: 'KeyB', mod: true },
  { id: 'italic', name: 'Italic', code: 'KeyI', mod: true },
  { id: 'underline', name: 'Underline', code: 'KeyU', mod: true },
  { id: 'address', name: 'Jump to address bar', code: 'KeyL', mod: true },
  { id: 'reload', name: 'Reload page', code: 'KeyR', mod: true },
  { id: 'zoomin', name: 'Zoom in', code: 'Equal', mod: true },
  { id: 'zoomout', name: 'Zoom out', code: 'Minus', mod: true },
  { id: 'delword', name: 'Delete previous word', code: 'Backspace', mod: !IS_MAC, alt: IS_MAC },
  { id: 'wordleft', name: 'Move one word left', code: 'ArrowLeft', mod: !IS_MAC, alt: IS_MAC },
  { id: 'linestart', name: 'Start of line', code: IS_MAC ? 'ArrowLeft' : 'Home', mod: IS_MAC },
  { id: 'emoji', name: IS_MAC ? 'Emoji picker' : 'Emoji picker', code: IS_MAC ? 'Space' : 'Period', mod: !IS_MAC, ctrlMac: IS_MAC, meta: !IS_MAC },
];
const done = new Set(store.get('shortcutsDone', []));

function shortcutKeys(s) {
  const parts = [];
  if (s.ctrlMac) parts.push('Ctrl', '⌘');
  else if (s.meta) parts.push('Win');
  else if (s.mod) parts.push(MOD_LABEL);
  if (s.alt) parts.push(IS_MAC ? '⌥' : 'Alt');
  if (s.shift) parts.push('Shift');
  const k = KEYS.get(s.code);
  const label = s.code === 'Space' ? 'Space' : s.code === 'Backspace' ? '⌫' : s.code === 'Home' ? 'Home'
    : (k?.el.querySelector('.legend:last-child')?.textContent || s.code);
  parts.push(label);
  return parts;
}

const listEl = $('shortcutList');
SHORTCUTS.forEach((s) => {
  const li = document.createElement('li');
  li.dataset.id = s.id;
  if (done.has(s.id)) li.classList.add('done');
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = s.name;
  const keys = document.createElement('span');
  keys.className = 'keys';
  shortcutKeys(s).forEach((p) => { const k = document.createElement('kbd'); k.textContent = p; keys.appendChild(k); });
  li.append(label, keys);
  listEl.appendChild(li);
});

function matchShortcut(ev, code) {
  const ctrl = !!ev.ctrl, meta = !!ev.meta, alt = !!ev.alt, shift = !!ev.shift;
  return SHORTCUTS.find((s) => {
    if (s.code !== code) return false;
    let wantCtrl, wantMeta;
    if (s.ctrlMac) { wantCtrl = true; wantMeta = true; }
    else if (s.meta) { wantCtrl = false; wantMeta = true; }
    else { wantCtrl = s.mod && !IS_MAC; wantMeta = s.mod && IS_MAC; }
    return ctrl === wantCtrl && meta === wantMeta && alt === !!s.alt && shift === !!s.shift;
  });
}

const comboEl = $('combo');
function renderCombo(last, name) {
  const parts = [];
  const has = (a, b) => held.has(a) || held.has(b);
  if (has('ControlLeft', 'ControlRight')) parts.push('Ctrl');
  if (has('MetaLeft', 'ContextMenu')) parts.push(IS_MAC ? '⌘' : 'Win');
  if (has('AltLeft', 'AltRight')) parts.push(IS_MAC ? '⌥' : 'Alt');
  if (has('ShiftLeft', 'ShiftRight')) parts.push('Shift');
  if (last) parts.push(last);
  comboEl.replaceChildren();
  if (!parts.length) {
    const m = document.createElement('span'); m.className = 'muted'; m.textContent = 'Hold a modifier and press a key';
    comboEl.appendChild(m);
    return;
  }
  parts.forEach((p, i) => {
    if (i) { const plus = document.createElement('span'); plus.className = 'plus'; plus.textContent = '+'; comboEl.appendChild(plus); }
    const k = document.createElement('kbd'); k.textContent = p; comboEl.appendChild(k);
  });
  if (name) { const n = document.createElement('span'); n.className = 'name'; n.textContent = name; comboEl.appendChild(n); }
}

const logBody = $('logBody');
const SIDES = ['', 'left', 'right', 'numpad'];
function logEvent(ev, code) {
  const tr = document.createElement('tr');
  [ev.key === ' ' ? 'Space' : ev.key, code, SIDES[ev.location || 0] || (ev.virtual ? 'on screen' : '')].forEach((v) => {
    const td = document.createElement('td'); td.textContent = v || '–'; tr.appendChild(td);
  });
  logBody.prepend(tr);
  while (logBody.children.length > 9) logBody.lastChild.remove();
}

function shortcutPress(ev, code) {
  logEvent(ev, code);
  if (MODS.has(code) || code === 'MetaLeft' || code === 'ContextMenu') { renderCombo(); return; }
  const hit = matchShortcut(ev, code);
  const k = KEYS.get(code);
  const label = code === 'Space' ? 'Space' : (k?.el.querySelector('.legend:last-child')?.textContent || ev.key || code);
  renderCombo(label, hit?.name);
  if (hit) {
    ev.original?.preventDefault();
    done.add(hit.id);
    store.set('shortcutsDone', [...done]);
    const li = listEl.querySelector(`[data-id="${hit.id}"]`);
    li.classList.add('done', 'flash');
    setTimeout(() => li.classList.remove('flash'), 600);
    if (done.size === SHORTCUTS.length) toast('All shortcuts found.');
  }
}

/* ---------- Games ---------- */
let game = null;
const CHASE_POOL = [...KEYS.keys()].filter((c) => /^(Key[A-Z]|Digit\d)$/.test(c));
const GAME_SECONDS = 30;

function makeTimer(el, seconds, onEnd) {
  const t0 = performance.now();
  const id = setInterval(() => {
    const left = Math.max(0, seconds - (performance.now() - t0) / 1000);
    el.textContent = left.toFixed(1);
    if (left <= 0) { clearInterval(id); onEnd(); }
  }, 100);
  return () => clearInterval(id);
}

function blurActive() { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); }

// Chase the light
function startChase() {
  if (game) game.stop(false);
  blurActive();
  let score = 0, misses = 0, times = [], target = null, shownAt = 0;
  const btn = $('chaseBtn');
  btn.textContent = 'Stop';
  $('chaseScore').textContent = 0; $('chaseAvg').textContent = '–';

  const next = () => {
    if (target) KEYS.get(target).el.classList.remove('target');
    let c;
    do { c = CHASE_POOL[Math.floor(Math.random() * CHASE_POOL.length)]; } while (c === target);
    target = c;
    KEYS.get(target).el.classList.add('target');
    shownAt = performance.now();
  };
  const stop = (finished) => {
    stopTimer();
    if (target) KEYS.get(target).el.classList.remove('target');
    game = null;
    btn.textContent = 'Start chase';
    if (finished) {
      const best = store.get('chaseBest', 0);
      if (score > best) { store.set('chaseBest', score); $('chaseBest').textContent = score; toast(`New best: ${score} hits`); }
      else toast(`${score} hits, ${misses} missed`);
    }
  };
  const stopTimer = makeTimer($('chaseTime'), GAME_SECONDS, () => stop(true));
  game = {
    stop,
    onKey(ev, code) {
      if (ev.repeat || MODS.has(code)) return;
      ev.original?.preventDefault();
      if (code === target) {
        score++;
        times.push(performance.now() - shownAt);
        $('chaseScore').textContent = score;
        $('chaseAvg').textContent = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
        next();
      } else misses++;
    },
  };
  next();
}
$('chaseBtn').addEventListener('click', () => (game && $('chaseBtn').textContent === 'Stop' ? game.stop(false) : startChase()));
$('chaseBest').textContent = store.get('chaseBest', 0) || '–';

// Type sprint
const WORDS = ('the of and to in is you that it he was for on are as with his they at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should world high every near add food between own below country plant last school father keep tree never start city earth eye light thought head under story saw left few while along might close something seem next hard open example begin life always those both paper together got group often run').split(' ');

function startSprint() {
  if (game) game.stop(false);
  blurActive();
  const words = Array.from({ length: 60 }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const text = words.join(' ');
  const typed = [];
  let correctKeys = 0, totalKeys = 0, t0 = 0, started = false, guideCode = null;
  const btn = $('sprintBtn');
  const box = $('sprintText');
  btn.textContent = 'Stop';
  $('sprintWpm').textContent = 0; $('sprintAcc').textContent = 100; $('sprintTime').textContent = GAME_SECONDS.toFixed(1);

  const render = () => {
    const frag = document.createDocumentFragment();
    const end = Math.min(text.length, typed.length + 140);
    for (let i = 0; i < end; i++) {
      const s = document.createElement('span');
      s.textContent = text[i];
      if (i < typed.length) s.className = typed[i] === text[i] ? 'ok' : 'bad';
      if (i === typed.length) s.className = 'cur';
      frag.appendChild(s);
    }
    box.replaceChildren(frag);
    const cur = box.querySelector('.cur');
    if (cur) box.scrollTop = Math.max(0, cur.offsetTop - box.offsetTop - 8);
    // light up the next key
    if (guideCode) KEYS.get(guideCode)?.el.classList.remove('guide');
    const hit = codeForChar(text[typed.length] || ' ');
    guideCode = hit?.code || null;
    if (guideCode) KEYS.get(guideCode)?.el.classList.add('guide');
  };
  const wpm = () => {
    const mins = Math.max((performance.now() - t0) / 60000, 1 / 60);
    const ok = typed.filter((c, i) => c === text[i]).length;
    return Math.round(ok / 5 / mins);
  };
  let stopTimer = () => {};
  const stop = (finished) => {
    stopTimer();
    if (guideCode) KEYS.get(guideCode)?.el.classList.remove('guide');
    game = null;
    btn.textContent = 'Start sprint';
    if (finished) {
      const w = wpm();
      $('sprintWpm').textContent = w;
      const best = store.get('sprintBest', 0);
      if (w > best) { store.set('sprintBest', w); $('sprintBest').textContent = w + ' wpm'; toast(`New best: ${w} wpm`); }
      else toast(`${w} wpm at ${$('sprintAcc').textContent}% accuracy`);
    }
  };
  game = {
    stop: (f) => stop(f),
    onKey(ev, code) {
      if (MODS.has(code) || code === 'CapsLock') return;
      if (ev.ctrl || ev.meta) return;
      ev.original?.preventDefault();
      if (!started) {
        started = true; t0 = performance.now();
        stopTimer = makeTimer($('sprintTime'), GAME_SECONDS, () => stop(true));
      }
      if (code === 'Backspace') { typed.pop(); render(); return; }
      const ch = ev.key;
      if (!ch || ch.length !== 1) return;
      totalKeys++;
      if (ch === text[typed.length]) correctKeys++;
      typed.push(ch);
      $('sprintAcc').textContent = Math.round((correctKeys / totalKeys) * 100);
      $('sprintWpm').textContent = wpm();
      if (typed.length >= text.length) { stop(true); return; }
      render();
    },
  };
  render();
}
$('sprintBtn').addEventListener('click', () => (game && $('sprintBtn').textContent === 'Stop' ? game.stop(false) : startSprint()));
const sb = store.get('sprintBest', 0);
$('sprintBest').textContent = sb ? sb + ' wpm' : '–';
$('sprintText').textContent = 'Press Start sprint, then begin typing. The timer starts on your first key.';

/* First interaction unlocks audio on iOS/Safari */
const unlock = () => { synth.ensure(); window.removeEventListener('pointerdown', unlock); };
window.addEventListener('pointerdown', unlock);
