// Keyboard layouts, positioned on a unit grid (1u = one standard key).
// Each row is a list of keys [code, label, width, options] or gaps { gap: n }.
// options.h makes a key taller (numpad + and Enter).

const isMac = /Mac|iPhone|iPad|iPod/.test(
  (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ''
);
export const IS_MAC = isMac;

const gap = (n) => ({ gap: n });
const fk = (i) => [`F${i}`, `F${i}`, 1, { cls: 'fn' }];
const num = (d, s) => [`Digit${d}`, String(d), 1, { sub: s }];
const sym = (code, l, s, w = 1) => [code, l, w, { sub: s }];
const letters = (str) => [...str].map((c) => [`Key${c}`, c, 1, {}]);
const mod = (code, l, w = 1, extra = {}) => [code, l, w, { cls: 'mod', ...extra }];
const acc = (code, l, w = 1, extra = {}) => [code, l, w, { cls: 'accent', ...extra }];
const np = (code, l, w = 1, extra = {}) => [code, l, w, { cls: 'alpha', ...extra }];

const META = isMac ? '⌘' : 'Win';
const ALT = isMac ? '⌥' : 'Alt';

const ESC = acc('Escape', 'Esc');
const DIGITS = [num(1, '!'), num(2, '@'), num(3, '#'), num(4, '$'), num(5, '%'), num(6, '^'),
  num(7, '&'), num(8, '*'), num(9, '('), num(0, ')'), sym('Minus', '-', '_'), sym('Equal', '=', '+')];
const BACKQUOTE = sym('Backquote', '`', '~');

// The 15u alphanumeric block shared by every size
const numRow = (first) => [first, ...DIGITS, mod('Backspace', 'Backspace', 2)];
const TOP = [mod('Tab', 'Tab', 1.5), ...letters('QWERTYUIOP'), sym('BracketLeft', '[', '{'), sym('BracketRight', ']', '}'), sym('Backslash', '\\', '|', 1.5)];
const HOME = [mod('CapsLock', 'Caps', 1.75), ...letters('ASDFGHJKL'), sym('Semicolon', ';', ':'), sym('Quote', "'", '"'), acc('Enter', 'Enter', 2.25)];
const BOTTOM_KEYS = [...letters('ZXCVBNM'), sym('Comma', ',', '<'), sym('Period', '.', '>'), sym('Slash', '/', '?')];
const SPACE = ['Space', '', 6.25, { cls: 'space' }];
const MODS_FULL = [mod('ControlLeft', 'Ctrl', 1.25), mod('MetaLeft', META, 1.25), mod('AltLeft', ALT, 1.25), SPACE,
  mod('AltRight', ALT, 1.25), mod('MetaRight', META, 1.25), mod('ContextMenu', 'Menu', 1.25), mod('ControlRight', 'Ctrl', 1.25)];
const ARROWS = [mod('ArrowLeft', '←'), mod('ArrowDown', '↓'), mod('ArrowRight', '→')];

const F_SPLIT = [ESC, gap(1), fk(1), fk(2), fk(3), fk(4), gap(0.5), fk(5), fk(6), fk(7), fk(8), gap(0.5), fk(9), fk(10), fk(11), fk(12)];

const NUMPAD = {
  num: [gap(0.25), np('NumLock', 'Num', 1, { cls: 'mod' }), np('NumpadDivide', '/'), np('NumpadMultiply', '*'), np('NumpadSubtract', '-', 1, { cls: 'mod' })],
  top: [gap(0.25), np('Numpad7', '7'), np('Numpad8', '8'), np('Numpad9', '9'), np('NumpadAdd', '+', 1, { h: 2, cls: 'mod' })],
  home: [gap(0.25), np('Numpad4', '4'), np('Numpad5', '5'), np('Numpad6', '6')],
  bottom: [gap(0.25), np('Numpad1', '1'), np('Numpad2', '2'), np('Numpad3', '3'), np('NumpadEnter', 'Enter', 1, { h: 2, cls: 'accent' })],
  mods: [gap(0.25), np('Numpad0', '0', 2), np('NumpadDecimal', '.')],
};

const NAV = {
  f: [gap(0.25), mod('PrintScreen', 'PrtSc'), mod('ScrollLock', 'ScrLk'), mod('Pause', 'Pause')],
  num: [gap(0.25), mod('Insert', 'Ins'), mod('Home', 'Home'), mod('PageUp', 'PgUp')],
  top: [gap(0.25), mod('Delete', 'Del'), mod('End', 'End'), mod('PageDown', 'PgDn')],
  home: [gap(3.25)],
  bottom: [gap(1.25), mod('ArrowUp', '↑'), gap(1)],
  mods: [gap(0.25), ...ARROWS],
};

const tkl = (withPad) => {
  const pad = (k) => (withPad ? NUMPAD[k] : []);
  return {
    fnRow: [...F_SPLIT, ...NAV.f],
    rows: [
      [...numRow(BACKQUOTE), ...NAV.num, ...pad('num')],
      [...TOP, ...NAV.top, ...pad('top')],
      [...HOME, ...NAV.home, ...pad('home')],
      [mod('ShiftLeft', 'Shift', 2.25), ...BOTTOM_KEYS, mod('ShiftRight', 'Shift', 2.75), ...NAV.bottom, ...pad('bottom')],
      [...MODS_FULL, ...NAV.mods, ...pad('mods')],
    ],
  };
};

export const LAYOUTS = {
  '60': {
    name: '60%',
    rows: [
      numRow(ESC), TOP, HOME,
      [mod('ShiftLeft', 'Shift', 2.25), ...BOTTOM_KEYS, mod('ShiftRight', 'Shift', 2.75)],
      MODS_FULL,
    ],
  },
  '65': {
    name: '65%',
    rows: [
      [...numRow(ESC), mod('Delete', 'Del')],
      [...TOP, mod('PageUp', 'PgUp')],
      [...HOME, mod('PageDown', 'PgDn')],
      [mod('ShiftLeft', 'Shift', 2.25), ...BOTTOM_KEYS, mod('ShiftRight', 'Shift', 1.75), mod('ArrowUp', '↑'), mod('End', 'End')],
      [mod('ControlLeft', 'Ctrl', 1.25), mod('MetaLeft', META, 1.25), mod('AltLeft', ALT, 1.25), SPACE,
        mod('AltRight', ALT), mod('ContextMenu', 'Menu'), mod('ControlRight', 'Ctrl'), ...ARROWS],
    ],
  },
  '75': {
    name: '75%',
    fnRow: [ESC, fk(1), fk(2), fk(3), fk(4), fk(5), fk(6), fk(7), fk(8), fk(9), fk(10), fk(11), fk(12),
      mod('PrintScreen', 'PrtSc'), mod('Insert', 'Ins'), mod('Delete', 'Del')],
    rows: [
      [...numRow(BACKQUOTE), mod('Home', 'Home')],
      [...TOP, mod('PageUp', 'PgUp')],
      [...HOME, mod('PageDown', 'PgDn')],
      [mod('ShiftLeft', 'Shift', 2.25), ...BOTTOM_KEYS, mod('ShiftRight', 'Shift', 1.75), mod('ArrowUp', '↑'), mod('End', 'End')],
      [mod('ControlLeft', 'Ctrl', 1.25), mod('MetaLeft', META, 1.25), mod('AltLeft', ALT, 1.25), SPACE,
        mod('AltRight', ALT), mod('ContextMenu', 'Menu'), mod('ControlRight', 'Ctrl'), ...ARROWS],
    ],
  },
  tkl: { name: 'TKL', ...tkl(false) },
  full: { name: 'Full', ...tkl(true) },
};

const KEY_NAMES = {
  Escape: 'Escape', PrintScreen: 'PrintScreen', ScrollLock: 'ScrollLock', Pause: 'Pause', Insert: 'Insert',
  Delete: 'Delete', Backspace: 'Backspace', Home: 'Home', End: 'End', Tab: 'Tab', PageUp: 'PageUp',
  PageDown: 'PageDown', CapsLock: 'CapsLock', Enter: 'Enter', NumpadEnter: 'Enter', NumLock: 'NumLock',
  ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Control', ControlRight: 'Control', MetaLeft: 'Meta',
  MetaRight: 'Meta', AltLeft: 'Alt', AltRight: 'Alt', ContextMenu: 'ContextMenu', Space: ' ',
  ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
};

/** Map of code -> { el, width, key, shiftKey } for the current layout */
export const KEYS = new Map();

/** What KeyboardEvent.key would be for an on-screen press */
export function keyFor(code, shifted) {
  const k = KEYS.get(code);
  if (!k) return '';
  return shifted ? k.shiftKey : k.key;
}

const ROW_GAP = 0.25; // space under the function row

/**
 * Build (or rebuild) the keyboard into `plate`. Returns the layout size in units.
 */
export function buildKeyboard(plate, layoutId = '75') {
  const layout = LAYOUTS[layoutId] || LAYOUTS['75'];
  plate.replaceChildren();
  KEYS.clear();

  const rows = [];
  if (layout.fnRow) rows.push({ keys: layout.fnRow, row: 0 });
  layout.rows.forEach((keys, i) => rows.push({ keys, row: i + 1 }));

  let maxX = 0;
  let y = 0;
  rows.forEach(({ keys, row }, ri) => {
    let x = 0;
    for (const item of keys) {
      if (item.gap !== undefined) { x += item.gap; continue; }
      const [code, label, width, opts] = item;
      const h = opts.h || 1;
      plate.appendChild(makeKey(code, label, width, h, opts, x, y, row));
      x += width;
    }
    maxX = Math.max(maxX, x);
    y += 1 + (row === 0 && layout.fnRow && ri === 0 ? ROW_GAP : 0);
  });

  plate.style.setProperty('--cols', maxX);
  plate.style.setProperty('--rows', y);
  return { cols: maxX, rows: y };
}

function makeKey(code, label, width, h, opts, x, y, row) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'key ' + (opts.cls || 'alpha') + (h > 1 ? ' tall' : '');
  el.dataset.code = code;
  el.dataset.row = row;
  el.style.setProperty('--x', x);
  el.style.setProperty('--y', y);
  el.style.setProperty('--w', width);
  el.style.setProperty('--h', h);
  el.tabIndex = -1;
  el.setAttribute('aria-label', label || 'Space');

  const cap = document.createElement('span');
  cap.className = 'cap';
  const main = document.createElement('span');
  main.className = 'legend';
  main.textContent = label;
  if (opts.sub) {
    const sub = document.createElement('span');
    sub.className = 'legend sub';
    sub.textContent = opts.sub;
    cap.append(sub, main);
    cap.classList.add('stacked');
  } else {
    cap.append(main);
    if (label.length > 3) cap.classList.add('small');
  }
  el.appendChild(cap);

  let key, shiftKey;
  if (/^Key[A-Z]$/.test(code)) { key = label.toLowerCase(); shiftKey = label; }
  else if (opts.sub) { key = label; shiftKey = opts.sub; }
  else if (/^Numpad(\d|Divide|Multiply|Subtract|Add|Decimal)$/.test(code)) { key = label; shiftKey = label; }
  else { key = KEY_NAMES[code] || code; shiftKey = key; }
  KEYS.set(code, { el, width, key, shiftKey });
  return el;
}

/** Find the code for a character (for demos and typing guides) */
export function codeForChar(ch) {
  if (ch === ' ') return { code: 'Space', shift: false };
  for (const [code, k] of KEYS) {
    if (code.startsWith('Numpad')) continue;
    if (k.key === ch) return { code, shift: false };
    if (k.shiftKey === ch) return { code, shift: true };
  }
  return null;
}
