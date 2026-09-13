/**
 * New-tab page. Reads the same settings the popup writes, repaints once a
 * second, and re-fits the matrix whenever the window changes size.
 */

import { getPlate } from './faces.js';
import { runTicks } from './effects.js';
import { load, onChange } from './settings.js';
import {
  MatrixView, formatDigital, overrideDate, sizeMatrix,
} from './render.js';

const host = document.getElementById('matrix');
const wordsEl = document.getElementById('words');
const digitalEl = document.getElementById('digital');
const view = new MatrixView(host);

let opts = null;

function draw() {
  if (!opts) {
    return;
  }
  const plate = getPlate(opts.plate);
  const now = overrideDate(opts.override) || new Date();

  wordsEl.hidden = !opts.showPhrase;
  digitalEl.hidden = !opts.showDigital;

  // The grid gets whatever height the readouts below it do not need.
  const reserve = (opts.showPhrase ? 48 : 0) + (opts.showDigital ? 48 : 0) + 24;
  sizeMatrix(host, plate.size, opts, reserve);

  const state = view.paint(plate, now, opts);
  wordsEl.textContent = state.text;
  digitalEl.textContent = formatDigital(now, opts.clock24);
}

async function start() {
  opts = await load();
  draw();
  runTicks(draw, () => opts?.secFx);
  window.addEventListener('resize', draw);
  onChange((next) => {
    opts = next;
    draw();
  });
}

document.getElementById('openOptions').addEventListener('click', (e) => {
  e.preventDefault();
  if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.location.href = 'options.html';
  }
});

start();
