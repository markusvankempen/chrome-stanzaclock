import { PLATES, getPlate } from './faces.js';
import { wordLabel } from './clock.js';
import { COLOR_MODES } from './colors.js';
import { SEC_FX, runTicks } from './effects.js';
import { MatrixView, formatDigital, overrideDate } from './render.js';
import { load, onChange, save } from './settings.js';

const el = (id) => document.getElementById(id);

const view = new MatrixView(el('matrix'));
let opts;

function fillSelects() {
  el('plate').replaceChildren(...Object.values(PLATES).map((p) => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = `${p.size}\u00d7${p.size}  ${p.title}`;
    return o;
  }));
  el('colorMode').replaceChildren(...COLOR_MODES.map((m) => {
    const o = document.createElement('option');
    o.value = String(m.id);
    o.textContent = m.label;
    return o;
  }));
  const labels = {
    off: 'Off — words only',
    star: 'Star — unused * blinks',
    pulse: 'Pulse — words breathe',
    trail: 'Trail — unused cells fill the minute',
    tick: 'Tick — one unused cell hops',
    sparkle: 'Sparkle — unused letters twinkle',
  };
  el('secFx').replaceChildren(...SEC_FX.map((fx) => {
    const o = document.createElement('option');
    o.value = String(fx.id);
    o.textContent = labels[fx.name] || fx.name;
    return o;
  }));
}

function applyToForm() {
  el('plate').value = opts.plate;
  el('colorMode').value = String(opts.colorMode);
  el('solid').value = opts.solid;
  el('solidWrap').hidden = Number(opts.colorMode) !== 1;
  el('brightness').value = String(opts.brightness);
  el('brightVal').textContent = String(opts.brightness);
  el('minDots').checked = !!opts.minDots;
  el('secFx').value = String(opts.secFx ?? 0);
  el('clock24').checked = !!opts.clock24;
  el('override').value = opts.override || '';
  // Exact-minute plates spell every minute, so there is no remainder to dot.
  el('minDots').closest('label').hidden = getPlate(opts.plate).mode === 'exact';
}

function tick() {
  const plate = getPlate(opts.plate);
  const now = overrideDate(opts.override) || new Date();
  const state = view.paint(plate, now, opts);

  el('digital').textContent = formatDigital(now, opts.clock24);
  el('plateTitle').textContent = plate.title;
  el('words').textContent = opts.showWords
    ? state.words.map((id) => wordLabel(plate, id)).join(' ')
    : state.text;
}

async function change(patch) {
  opts = await save(patch);
  applyToForm();
  tick();
}

function wire() {
  el('plate').addEventListener('change', (e) => change({ plate: e.target.value }));
  el('colorMode').addEventListener('change',
    (e) => change({ colorMode: Number(e.target.value) }));
  el('solid').addEventListener('input', (e) => change({ solid: e.target.value }));
  el('minDots').addEventListener('change',
    (e) => change({ minDots: e.target.checked }));
  el('secFx').addEventListener('change',
    (e) => change({ secFx: Number(e.target.value) }));
  el('clock24').addEventListener('change',
    (e) => change({ clock24: e.target.checked }));
  el('override').addEventListener('input',
    (e) => change({ override: e.target.value.trim() || null }));

  // Repaint while dragging, but only persist when the slider is released.
  el('brightness').addEventListener('input', (e) => {
    opts.brightness = Number(e.target.value);
    el('brightVal').textContent = e.target.value;
    tick();
  });
  el('brightness').addEventListener('change',
    (e) => change({ brightness: Number(e.target.value) }));

  el('openOptions').addEventListener('click', (e) => {
    e.preventDefault();
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  });
}

async function main() {
  fillSelects();
  opts = await load();
  applyToForm();
  wire();
  runTicks(tick, () => opts?.secFx);
  onChange((next) => {
    opts = next;
    applyToForm();
    tick();
  });
}

main();
