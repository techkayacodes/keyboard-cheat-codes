// 75% layout. Each row sums to 16 units.
// [code, label, width, options]
const isMac = /Mac|iPhone|iPad|iPod/.test(
  (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || ''
);
export const IS_MAC = isMac;

const F = Array.from({ length: 12 }, (_, i) => [`F${i + 1}`, `F${i + 1}`, 1, { cls: 'fn' }]);
const num = (d, s) => [`Digit${d}`, String(d), 1, { sub: s }];
const sym = (code, l, s, w = 1) => [code, l, w, { sub: s }];
const letters = (str) => [...str].map((c) => [`Key${c}`, c, 1, {}]);
const mod = (code, l, w = 1, extra = {}) => [code, l, w, { cls: 'mod', ...extra }];

export const LAYOUT = [
  [['Escape', 'Esc', 1, { cls: 'accent' }], ...F, mod('PrintScreen', 'PrtSc'), mod('Insert', 'Ins'), mod('Delete', 'Del')],
  [sym('Backquote', '`', '~'), num(1, '!'), num(2, '@'), num(3, '#'), num(4, '$'), num(5, '%'), num(6, '^'),
    num(7, '&'), num(8, '*'), num(9, '('), num(0, ')'), sym('Minus', '-', '_'), sym('Equal', '=', '+'),
    mod('Backspace', 'Backspace', 2), mod('Home', 'Home')],
  [mod('Tab', 'Tab', 1.5), ...letters('QWERTYUIOP'), sym('BracketLeft', '[', '{'), sym('BracketRight', ']', '}'),
    sym('Backslash', '\\', '|', 1.5), mod('PageUp', 'PgUp')],
  [mod('CapsLock', 'Caps', 1.75), ...letters('ASDFGHJKL'), sym('Semicolon', ';', ':'), sym('Quote', "'", '"'),
    ['Enter', 'Enter', 2.25, { cls: 'accent' }], mod('PageDown', 'PgDn')],
  [mod('ShiftLeft', 'Shift', 2.25), ...letters('ZXCVBNM'), sym('Comma', ',', '<'), sym('Period', '.', '>'),
    sym('Slash', '/', '?'), mod('ShiftRight', 'Shift', 1.75), mod('ArrowUp', '↑'), mod('End', 'End')],
  [mod('ControlLeft', isMac ? 'Ctrl' : 'Ctrl', 1.25), mod('MetaLeft', isMac ? '⌘' : 'Win', 1.25),
    mod('AltLeft', isMac ? '⌥' : 'Alt', 1.25), ['Space', '', 6.25, { cls: 'space' }],
    mod('AltRight', isMac ? '⌥' : 'Alt'), mod('ContextMenu', 'Menu'), mod('ControlRight', 'Ctrl'),
    mod('ArrowLeft', '←'), mod('ArrowDown', '↓'), mod('ArrowRight', '→')],
];

const KEY_NAMES = {
  Escape: 'Escape', PrintScreen: 'PrintScreen', Insert: 'Insert', Delete: 'Delete', Backspace: 'Backspace',
  Home: 'Home', End: 'End', Tab: 'Tab', PageUp: 'PageUp', PageDown: 'PageDown', CapsLock: 'CapsLock',
  Enter: 'Enter', ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Control', ControlRight: 'Control',
  MetaLeft: 'Meta', AltLeft: 'Alt', AltRight: 'Alt', ContextMenu: 'ContextMenu', Space: ' ',
  ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
};

/** Map of code -> { el, width, key, shiftKey } */
export const KEYS = new Map();

/** What KeyboardEvent.key would be for an on-screen press */
export function keyFor(code, shifted) {
  const k = KEYS.get(code);
  if (!k) return '';
  return shifted ? k.shiftKey : k.key;
}

export function buildKeyboard(plate) {
  LAYOUT.forEach((row, ri) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'row' + (ri === 0 ? ' row-fn' : '');
    row.forEach(([code, label, width, opts]) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'key ' + (opts.cls || 'alpha');
      el.dataset.code = code;
      el.style.setProperty('--w', width);
      el.tabIndex = -1;
      el.setAttribute('aria-label', label || 'Space');

      const cap = document.createElement('span');
      cap.className = 'cap';
      if (opts.sub) {
        cap.innerHTML = `<span class="legend sub">${escapeHtml(opts.sub)}</span><span class="legend">${escapeHtml(label)}</span>`;
        cap.classList.add('stacked');
      } else {
        cap.innerHTML = `<span class="legend">${escapeHtml(label)}</span>`;
        if (label.length > 3) cap.classList.add('small');
      }
      el.appendChild(cap);
      rowEl.appendChild(el);

      let key, shiftKey;
      if (/^Key[A-Z]$/.test(code)) { key = label.toLowerCase(); shiftKey = label; }
      else if (opts.sub) { key = label; shiftKey = opts.sub; }
      else { key = KEY_NAMES[code] || code; shiftKey = key; }
      KEYS.set(code, { el, width, key, shiftKey });
    });
    plate.appendChild(rowEl);
  });
  return KEYS;
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/** Find the code for a character (for demos and typing guides) */
export function codeForChar(ch) {
  if (ch === ' ') return { code: 'Space', shift: false };
  for (const [code, k] of KEYS) {
    if (k.key === ch) return { code, shift: false };
    if (k.shiftKey === ch) return { code, shift: true };
  }
  return null;
}
