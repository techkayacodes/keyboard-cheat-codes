// Procedural switch sounds. Nothing is sampled: each press is built from
// filtered noise (the plastic impact) and short tones (case and spring resonance).

const n = (f, freq, g, d, extra = {}) => ({ t: 'noise', f, freq, g, d, ...extra });
const tone = (w, freq, g, d, extra = {}) => ({ t: 'tone', w, freq, g, d, ...extra });

export const PROFILES = {
  thock: {
    name: 'Thock',
    blurb: 'Deep and rounded. Lubed tactiles in a heavy, dampened case.',
    down: [n('lowpass', 650, 0.95, 0.07, { q: 1.2 }), tone('sine', 150, 0.55, 0.09, { to: 105 }), n('bandpass', 1700, 0.14, 0.02, { q: 2 })],
    up: [n('lowpass', 900, 0.22, 0.03), tone('sine', 190, 0.12, 0.03)],
  },
  clack: {
    name: 'Clack',
    blurb: 'Bright and sharp. Thin ABS caps bottoming out on a stiff plate.',
    down: [n('bandpass', 2600, 0.85, 0.035, { q: 1.4 }), tone('triangle', 430, 0.28, 0.04, { to: 380 }), n('highpass', 5200, 0.22, 0.012)],
    up: [n('bandpass', 3000, 0.35, 0.02, { q: 1.6 })],
  },
  clicky: {
    name: 'Clicky',
    blurb: 'A crisp click on the way down and up, like click-bar or click-jacket switches.',
    down: [n('highpass', 4200, 0.95, 0.008, { q: 0.8 }), tone('square', 3300, 0.05, 0.01),
      n('bandpass', 2000, 0.5, 0.03, { at: 0.018, q: 1.2 }), tone('triangle', 520, 0.15, 0.03, { at: 0.018 })],
    up: [n('highpass', 4600, 0.6, 0.008), tone('square', 3600, 0.035, 0.008)],
  },
  creamy: {
    name: 'Creamy',
    blurb: 'Smooth and quiet. Lubed linears with a soft, muted bottom-out.',
    down: [n('lowpass', 1150, 0.55, 0.05, { q: 0.5, a: 0.004 }), tone('sine', 260, 0.22, 0.05)],
    up: [n('lowpass', 1300, 0.14, 0.03, { q: 0.5 })],
  },
  marbly: {
    name: 'Marbly',
    blurb: 'A glassy pop with a high pitch, like PBT caps on a thin polycarbonate plate.',
    down: [tone('sine', 920, 0.38, 0.035, { to: 700 }), n('bandpass', 1600, 0.5, 0.03, { q: 4 }), n('highpass', 6000, 0.08, 0.006)],
    up: [tone('sine', 1150, 0.13, 0.02), n('bandpass', 1900, 0.12, 0.015, { q: 4 })],
  },
  typewriter: {
    name: 'Typewriter',
    blurb: 'A typebar strike with a metal snap, and a bell when you hit Enter.',
    down: [n('highpass', 3200, 1, 0.01), n('bandpass', 900, 0.9, 0.08, { q: 1 }), tone('triangle', 220, 0.3, 0.06),
      n('bandpass', 2400, 0.25, 0.02, { at: 0.03, q: 3 })],
    up: [n('bandpass', 1500, 0.2, 0.03)],
    enter: [tone('sine', 2100, 0.3, 1.1), tone('sine', 4230, 0.12, 0.7), tone('sine', 6340, 0.05, 0.4)],
  },
};

export const CASES = {
  aluminum: { name: 'Aluminum', pitch: 1, ring: 1 },
  polycarb: { name: 'Polycarbonate', pitch: 0.86, ring: 0.85 },
  brass: { name: 'Brass', pitch: 1.1, ring: 1.6 },
  walnut: { name: 'Walnut', pitch: 0.78, ring: 0.7 },
};

export class SwitchSynth {
  constructor() {
    this.ctx = null;
    this.profile = 'thock';
    this.caseMat = 'aluminum';
    this.volume = 0.7;
    this.pitch = 1;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.bus = this.ctx.createGain();
      this.bus.gain.value = 0.9;
      this.bus.connect(comp).connect(this.ctx.destination);

      const len = this.ctx.sampleRate; // 1 second of white noise
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /**
   * @param {'down'|'up'} kind
   * @param {{size?: number, code?: string}} opts
   */
  play(kind = 'down', { size = 1, code = '' } = {}) {
    if (this.muted || this.volume <= 0) return;
    const ctx = this.ensure();
    if (!ctx) return;

    const p = PROFILES[this.profile];
    const c = CASES[this.caseMat];
    let layers = kind === 'up' ? p.up : p.down;

    // Longer keys sit lower; big stabilized keys get a little rattle.
    const sizeF = 1 / (1 + (Math.min(size, 6.25) - 1) * 0.06);
    if (kind === 'down' && size >= 2) {
      layers = layers.concat([n('bandpass', 2900, 0.1 + size * 0.015, 0.02, { at: 0.012, q: 3 })]);
    }
    if (kind === 'down' && code === 'Enter' && p.enter) layers = layers.concat(p.enter);

    const pitch = this.pitch * c.pitch * sizeF * (1 + (Math.random() - 0.5) * 0.08);
    const gainBase = this.volume * (0.88 + Math.random() * 0.24);
    const now = ctx.currentTime + 0.002;

    for (const L of layers) {
      const isBell = p.enter && p.enter.includes(L);
      const start = now + (L.at || 0);
      const attack = L.a || 0.0012;
      const decay = L.d * (isBell ? 1 : c.ring);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(L.g * gainBase, start + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay);
      g.connect(this.bus);
      const end = start + attack + decay + 0.05;

      if (L.t === 'noise') {
        const src = ctx.createBufferSource();
        src.buffer = this.noise;
        const filter = ctx.createBiquadFilter();
        filter.type = L.f;
        filter.frequency.value = L.freq * pitch;
        filter.Q.value = L.q || 1;
        src.connect(filter).connect(g);
        src.start(start, Math.random() * 0.8);
        src.stop(end);
      } else {
        const osc = ctx.createOscillator();
        osc.type = L.w;
        const f = L.freq * (isBell ? 1 : pitch);
        osc.frequency.setValueAtTime(f, start);
        if (L.to) osc.frequency.exponentialRampToValueAtTime(L.to * pitch, start + attack + decay);
        osc.connect(g);
        osc.start(start);
        osc.stop(end);
      }
    }
  }
}
