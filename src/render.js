/**
 * Grid renderer. Builds one <i> per cell once, then only repaints colours on
 * each tick so a 16x16 face stays cheap to animate.
 */

import { letterAt } from './faces.js';
import { resolveTime } from './clock.js';
import {
  DOT_COLOR, css, hexToRgb, scaleColor, themeColor, wordGain,
} from './colors.js';
import { applySeconds } from './effects.js';

/** Perceptual curve for on-screen display. Keeps the ordering of levels. */
function screenGain(gain) {
  return gain ** 0.45;
}

export class MatrixView {
  constructor(host) {
    this.host = host;
    this.size = 0;
    this.cells = [];
  }

  /** Rebuild the DOM when the plate size changes. */
  layout(plate) {
    if (this.size === plate.size && this.plateId === plate.id) {
      return;
    }
    this.size = plate.size;
    this.plateId = plate.id;
    this.cells = [];
    this.host.style.setProperty('--n', String(plate.size));
    this.host.replaceChildren();
    for (let y = 0; y < plate.size; y += 1) {
      for (let x = 0; x < plate.size; x += 1) {
        const el = document.createElement('i');
        el.textContent = letterAt(plate, x, y);
        this.host.appendChild(el);
        this.cells.push(el);
      }
    }
  }

  /** Repaint for a given time. Returns the resolved state. */
  paint(plate, date, opts) {
    this.layout(plate);
    const second = opts.showSeconds === false ? -1 : date.getSeconds();
    const state = resolveTime(
      plate, date.getHours(), date.getMinutes(), opts.minDots,
      second < 0 ? 0 : second,
    );
    if (second < 0) {
      state.dots = [];
    }

    // A monitor pixel at 50% looks far dimmer than an LED at 50%, so the
    // brightness setting is curved for display. Hues stay exactly as the
    // firmware computes them; only the level is lifted.
    const gain = screenGain(wordGain(opts.brightness));
    const solid = hexToRgb(opts.solid);
    const lit = new Map();

    state.cells.forEach((cell, i) => {
      const idx = cell[1] * plate.size + cell[0];
      const base = themeColor(opts.colorMode, state.hour12, i + idx, solid);
      lit.set(idx, scaleColor(base, gain));
    });
    for (const cell of state.dots) {
      const idx = cell[1] * plate.size + cell[0];
      lit.set(idx, scaleColor(DOT_COLOR, gain * 0.85));
    }

    applySeconds(plate, date, lit, opts.secFx, opts.fxBright);

    for (let i = 0; i < this.cells.length; i += 1) {
      const el = this.cells[i];
      const rgb = lit.get(i);
      if (rgb) {
        const c = css(rgb);
        el.className = 'on';
        el.style.color = c;
        el.style.textShadow = `0 0 10px ${c}`;
      } else {
        el.className = '';
        el.style.color = '';
        el.style.textShadow = '';
      }
    }
    this.host.classList.toggle('grid', !!opts.showGrid);
    this.host.classList.toggle('dim', !!opts.dimUnlit);
    return state;
  }
}

/**
 * Size the matrix.
 *
 * In 'fit' mode the cell size is derived from the space actually left over
 * after the phrase and any chrome, so the grid grows to fill the window and
 * stays square. In 'fixed' mode the setting is used verbatim.
 *
 * @param {HTMLElement} host  the .matrix element
 * @param {number} n          cells per side
 * @param {object} opts       settings
 * @param {number} reserve    px of window height taken by text below the grid
 */
export function sizeMatrix(host, n, opts, reserve = 0) {
  const gap = n > 8 ? 3 : 4;
  let cell;
  if (opts.sizeMode === 'fixed') {
    cell = Math.max(6, Math.round(opts.cellSize));
  } else {
    const ratio = Math.min(Math.max(opts.fillRatio ?? 0.95, 0.4), 1);
    const side = Math.min(
      window.innerWidth,
      window.innerHeight - reserve,
    ) * ratio;
    // Padding and gaps come out of the side before it is split into cells.
    cell = Math.max(6, Math.floor((side - gap * (n - 1) - 16) / n));
  }
  host.style.setProperty('--n', String(n));
  host.style.setProperty('--cell', `${cell}px`);
  host.style.setProperty('--gap', `${gap}px`);
  // Letters look right at roughly two-thirds of the cell.
  host.style.setProperty('--letter', `${Math.max(5, Math.round(cell * 0.62))}px`);
  return cell;
}

/** "14:05" or "2:05 PM" depending on the setting. */
export function formatDigital(date, clock24) {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  if (clock24) {
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Parse an "HH:MM" override into a Date on today, or null. */
export function overrideDate(text) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((text || '').trim());
  if (!m) {
    return null;
  }
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) {
    return null;
  }
  const d = new Date();
  const live = new Date();
  d.setHours(h, min, live.getSeconds(), live.getMilliseconds());
  return d;
}
