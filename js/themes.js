// Keycap colorways: original sets, each with its own case.
// Values become CSS custom properties on the board.

export const COLORWAYS = {
  tidepool: {
    name: 'Tidepool',
    case: ['#34525F', '#27404D', '#1A2D37'], plate: '#142530',
    alpha: ['#F3EEE3', '#CFC6B4', '#172A33'],
    fn: ['#E7E1D3', '#BDB39F', '#172A33'],
    mod: ['#5E8796', '#3F6371', '#F3EEE3'],
    accent: ['#EE9B3A', '#B96F1E', '#172A33'],
  },
  ember: {
    name: 'Ember',
    case: ['#45403D', '#34302D', '#221F1D'], plate: '#191715',
    alpha: ['#3A3634', '#211E1C', '#F0E6D8'],
    fn: ['#45403D', '#2A2624', '#F0E6D8'],
    mod: ['#57504B', '#36312D', '#F0E6D8'],
    accent: ['#E0533B', '#9C3020', '#FFF4EA'],
  },
  sakura: {
    name: 'Sakura',
    case: ['#F7E9EB', '#EBD3D7', '#D8B5BB'], plate: '#C99EA6',
    alpha: ['#FFF8F6', '#E5D3CF', '#6B3A48'],
    fn: ['#FBEDEE', '#E1C8CB', '#6B3A48'],
    mod: ['#F2B8C6', '#CD8FA0', '#5A2A38'],
    accent: ['#C9506E', '#933550', '#FFF8F6'],
  },
  matcha: {
    name: 'Matcha',
    case: ['#6E7F55', '#5B6B46', '#455236'], plate: '#38432B',
    alpha: ['#F1EBDC', '#CFC5AE', '#3D4A2F'],
    fn: ['#E6DFCC', '#C2B89E', '#3D4A2F'],
    mod: ['#8DA36B', '#677D4A', '#F7F3E8'],
    accent: ['#3F5A2E', '#2A3D1F', '#F1EBDC'],
  },
  beige: {
    name: 'Office beige',
    case: ['#DDD5C3', '#D0C7B3', '#B9AF99'], plate: '#A69C86',
    alpha: ['#EDE6D6', '#C8BFA9', '#3B362E'],
    fn: ['#E3DCCB', '#BFB59E', '#3B362E'],
    mod: ['#A8A193', '#86806F', '#2C2924'],
    accent: ['#B84A3A', '#85332A', '#F5EFE3'],
  },
  mono: {
    name: 'Mono',
    case: ['#F1F1EF', '#E4E4E1', '#CFCFCB'], plate: '#C4C4C0',
    alpha: ['#FFFFFF', '#D6D6D2', '#1F1F1F'],
    fn: ['#FAFAF8', '#D2D2CE', '#1F1F1F'],
    mod: ['#E2E2DF', '#BDBDB8', '#1F1F1F'],
    accent: ['#2A2A2A', '#000000', '#FFFFFF'],
  },
  signal: {
    name: 'Signal',
    case: ['#202020', '#141414', '#000000'], plate: '#000000',
    alpha: ['#1C1C1C', '#000000', '#FFFFFF'],
    fn: ['#1C1C1C', '#000000', '#FFFFFF'],
    mod: ['#2E2E2E', '#000000', '#FFE14D'],
    accent: ['#FFD400', '#B39400', '#000000'],
  },
};

export function applyColorway(el, id) {
  const c = COLORWAYS[id] || COLORWAYS.tidepool;
  const set = (k, v) => el.style.setProperty(k, v);
  set('--case-a', c.case[0]); set('--case-b', c.case[1]); set('--case-c', c.case[2]); set('--plate', c.plate);
  for (const part of ['alpha', 'fn', 'mod', 'accent']) {
    set(`--${part}-face`, c[part][0]);
    set(`--${part}-side`, c[part][1]);
    set(`--${part}-legend`, c[part][2]);
  }
}

export const PROFILES_CAP = {
  cherry: { name: 'Cherry', blurb: 'Low and sculpted' },
  sa: { name: 'SA', blurb: 'Tall and rounded' },
  dsa: { name: 'DSA', blurb: 'Flat and uniform' },
  low: { name: 'Low profile', blurb: 'Thin, laptop-like' },
};

export const SITE_THEMES = {
  light: 'Light',
  dark: 'Dark',
  contrast: 'High contrast',
  minimal: 'Minimal',
};
