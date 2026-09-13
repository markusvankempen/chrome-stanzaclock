/**
 * Seconds effects, ported from the ESP firmware's applySeconds().
 *
 *   0 off      words only
 *   1 pulse    lit words breathe
 *   2 trail    unused cells fill across the minute
 *   3 tick     one unused cell hops each second
 *   4 sparkle  unused letters twinkle
 *   5 star     * (or leftover dots) blink each second
 */

import { letterAt } from './faces.js';
import { colorHSV, gamma, scaleColor } from './colors.js';

export const SEC_FX = [
  { id: 0, name: 'off', key: 'fxOff' },
  { id: 5, name: 'star', key: 'fxStar' },
  { id: 1, name: 'pulse', key: 'fxPulse' },
  { id: 2, name: 'trail', key: 'fxTrail' },
  { id: 3, name: 'tick', key: 'fxTick' },
  { id: 4, name: 'sparkle', key: 'fxSparkle' },
];

export function fxNeedsAnim(id) {
  return id === 1 || id === 2 || id === 4 || id === 5;
}

function unusedCells(size, lit) {
  const out = [];
  const n = size * size;
  for (let i = 0; i < n; i += 1) {
    if (!lit.has(i)) {
      out.push(i);
    }
  }
  return out;
}

function collectStars(plate, lit) {
  const stars = [];
  const dots = [];
  for (let y = 0; y < plate.size; y += 1) {
    for (let x = 0; x < plate.size; x += 1) {
      const idx = y * plate.size + x;
      if (lit.has(idx)) {
        continue;
      }
      const ch = letterAt(plate, x, y);
      if (ch === '*') {
        stars.push(idx);
      } else if (ch === '.') {
        dots.push(idx);
      }
    }
  }
  const pick = stars.length ? stars : dots;
  if (!pick.length) {
    return [plate.size - 1];
  }
  return pick.slice(0, 8);
}

/**
 * Paint the current seconds effect into the lit-cell map.
 * @param {Map<number, number[]>} lit
 */
export function applySeconds(plate, date, lit, fx, fxBright) {
  const id = Number(fx) || 0;
  if (id === 0) {
    return;
  }
  const now = Date.now();
  const second = date.getSeconds();
  const gain = Math.min(Math.max((Number(fxBright) || 48) / 80, 0.05), 1);

  if (id === 5) {
    if ((now % 1000) < 500) {
      const color = scaleColor([255, 220, 80], gain);
      for (const idx of collectStars(plate, lit)) {
        lit.set(idx, color);
      }
    }
    return;
  }

  if (id === 1) {
    const breath = 0.35 + (0.30 + 0.35 * gain)
      * (0.5 + 0.5 * Math.sin(now / 280));
    for (const [idx, rgb] of lit) {
      lit.set(idx, scaleColor(rgb, breath));
    }
    return;
  }

  const unused = unusedCells(plate.size, lit);
  if (!unused.length) {
    return;
  }
  const frac = second + (now % 1000) / 1000;
  const head = Math.floor((frac * unused.length) / 60) % unused.length;

  if (id === 2) {
    for (let i = 0; i <= head; i += 1) {
      const trail = ((i === head) ? 1 : 0.35 + 0.45 * (i / unused.length)) * gain;
      const hue = (i * 900 + second * 400) & 0xffff;
      lit.set(unused[i], scaleColor(gamma(colorHSV(hue, 200, 220)), trail));
    }
    return;
  }

  if (id === 3) {
    lit.set(unused[second % unused.length], scaleColor([0, 160, 110], gain));
    return;
  }

  const spark = Math.floor((now / 80 + second * 7) % unused.length);
  lit.set(unused[spark], scaleColor([180, 180, 200], gain));
  if (unused.length > 3) {
    lit.set(
      unused[(spark + Math.floor(unused.length / 3)) % unused.length],
      scaleColor([40, 50, 80], gain * 0.45),
    );
  }
}

/** Drive the clock loop at 80ms when an effect needs motion, else 1s. */
export function runTicks(tick, getFx) {
  let timer = 0;
  let stopped = false;
  const loop = () => {
    if (stopped) {
      return;
    }
    tick();
    timer = setTimeout(loop, fxNeedsAnim(getFx()) ? 80 : 1000);
  };
  loop();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
