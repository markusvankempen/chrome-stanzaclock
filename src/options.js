import { PLATES, getPlate } from './faces.js';
import { wordLabel } from './clock.js';
import { COLOR_MODES } from './colors.js';
import { SEC_FX, runTicks } from './effects.js';
import { applyI18n, initI18n, plateTitle, t } from './i18n.js';
import { MatrixView, overrideDate } from './render.js';
import { load, onChange, reset, save } from './settings.js';

const el = (id) => document.getElementById(id);

const PLATE_GROUPS = [
  { key: 'groupEn8', ids: ['home', 'doro', 'en08'] },
  { key: 'groupEn16', ids: ['en16', 'en16f'] },
  { key: 'groupLang', ids: ['de16', 'fr16', 'es16', 'it16', 'nl16', 'pt16'] },
];

const TABS = ['face', 'look', 'newtab', 'about'];
const TAB_KEYS = {
  face: 'tabFace',
  look: 'tabLook',
  newtab: 'tabNewtab',
  about: 'tabAbout',
};

const view = new MatrixView(el('matrix'));
let opts;

function plateMeta(plate) {
  const size = `${plate.size}\u00d7${plate.size}`;
  const mode = plate.mode === 'exact' ? t('modeExact') : t('modeSlots');
  return `${size}  ·  ${mode}`;
}

function buildPlates() {
  const host = el('plates');
  host.replaceChildren();
  for (const group of PLATE_GROUPS) {
    const wrap = document.createElement('div');
    wrap.className = 'group';
    const heading = document.createElement('h3');
    heading.textContent = t(group.key);
    const grid = document.createElement('div');
    grid.className = 'plates';
    for (const id of group.ids) {
      const p = PLATES[id];
      if (!p) {
        continue;
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.plate = p.id;
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = plateTitle(p);
      const meta = document.createElement('span');
      meta.className = 'meta';
      meta.textContent = plateMeta(p);
      const sample = document.createElement('span');
      sample.className = 'sample';
      sample.textContent = p.rows[0];
      b.append(name, meta, sample);
      b.addEventListener('click', () => change({ plate: p.id }));
      grid.append(b);
    }
    wrap.append(heading, grid);
    host.append(wrap);
  }
}

function buildColorModes() {
  const keys = ['colorHour', 'colorSolid', 'colorRainbow', 'colorWarm'];
  el('colorMode').replaceChildren(...COLOR_MODES.map((m, i) => {
    const o = document.createElement('option');
    o.value = String(m.id);
    o.textContent = t(keys[i]) || m.label;
    return o;
  }));
}

function buildEffects() {
  el('secFx').replaceChildren(...SEC_FX.map((fx) => {
    const o = document.createElement('option');
    o.value = String(fx.id);
    o.textContent = t(fx.key);
    return o;
  }));
}

function showTab(id) {
  const tab = TABS.includes(id) ? id : 'face';
  for (const name of TABS) {
    const button = document.getElementById(`tab-${name}`);
    const pane = document.getElementById(`pane-${name}`);
    const on = name === tab;
    button.setAttribute('aria-selected', on ? 'true' : 'false');
    pane.hidden = !on;
  }
  try {
    sessionStorage.setItem('stanza-tab', tab);
  } catch (e) {
    // Ignore private-mode storage failures.
  }
  if (location.hash !== `#${tab}`) {
    history.replaceState(null, '', `#${tab}`);
  }
}

function applyToForm() {
  for (const b of document.querySelectorAll('#plates button')) {
    b.classList.toggle('on', b.dataset.plate === opts.plate);
  }
  el('colorMode').value = String(opts.colorMode);
  el('solid').value = opts.solid;
  el('solidWrap').hidden = Number(opts.colorMode) !== 1;
  el('brightness').value = String(opts.brightness);
  el('brightVal').textContent = String(opts.brightness);
  el('minDots').checked = !!opts.minDots;
  el('showGrid').checked = !!opts.showGrid;
  el('dimUnlit').checked = !!opts.dimUnlit;
  el('showWords').checked = !!opts.showWords;
  el('clock24').checked = !!opts.clock24;
  el('showSeconds').checked = !!opts.showSeconds;
  el('secFx').value = String(opts.secFx ?? 0);
  el('fxBright').value = String(opts.fxBright ?? 48);
  el('fxBrightVal').textContent = String(opts.fxBright ?? 48);
  el('fxBrightWrap').hidden = Number(opts.secFx) === 0;
  el('override').value = opts.override || '';
  const exact = getPlate(opts.plate).mode === 'exact';
  el('minDots').closest('label').hidden = exact;
  el('showSeconds').closest('label').hidden = !exact;

  el('sizeMode').value = opts.sizeMode;
  el('cellWrap').hidden = opts.sizeMode !== 'fixed';
  el('fillWrap').hidden = opts.sizeMode === 'fixed';
  el('cellSize').value = String(opts.cellSize);
  el('cellVal').textContent = String(opts.cellSize);
  const pct = Math.round(opts.fillRatio * 100);
  el('fillRatio').value = String(pct);
  el('fillVal').textContent = String(pct);
  el('showPhrase').checked = !!opts.showPhrase;
  el('showDigital').checked = !!opts.showDigital;
}

function tick() {
  const plate = getPlate(opts.plate);
  const now = overrideDate(opts.override) || new Date();
  const state = view.paint(plate, now, opts);
  el('words').textContent = opts.showWords
    ? state.words.map((id) => wordLabel(plate, id)).join(' ')
    : state.text;
}

async function change(patch) {
  opts = await save(patch);
  applyToForm();
  tick();
}

function bindCheck(id) {
  el(id).addEventListener('change', (e) => change({ [id]: e.target.checked }));
}

function wire() {
  document.querySelectorAll('.tabs [role="tab"]').forEach((button) => {
    button.addEventListener('click', () => showTab(button.dataset.tab));
  });
  window.addEventListener('hashchange', () => {
    showTab(location.hash.slice(1));
  });

  el('secFx').addEventListener('change',
    (e) => change({ secFx: Number(e.target.value) }));
  el('fxBright').addEventListener('input', (e) => {
    opts.fxBright = Number(e.target.value);
    el('fxBrightVal').textContent = e.target.value;
    tick();
  });
  el('fxBright').addEventListener('change',
    (e) => change({ fxBright: Number(e.target.value) }));

  el('colorMode').addEventListener('change',
    (e) => change({ colorMode: Number(e.target.value) }));
  el('solid').addEventListener('input', (e) => change({ solid: e.target.value }));
  el('override').addEventListener('input',
    (e) => change({ override: e.target.value.trim() || null }));
  [
    'minDots', 'showGrid', 'dimUnlit', 'showWords', 'clock24',
    'showSeconds', 'showPhrase', 'showDigital',
  ].forEach(bindCheck);

  el('sizeMode').addEventListener('change',
    (e) => change({ sizeMode: e.target.value }));
  el('cellSize').addEventListener('input', (e) => {
    el('cellVal').textContent = e.target.value;
  });
  el('cellSize').addEventListener('change',
    (e) => change({ cellSize: Number(e.target.value) }));
  el('fillRatio').addEventListener('input', (e) => {
    el('fillVal').textContent = e.target.value;
  });
  el('fillRatio').addEventListener('change',
    (e) => change({ fillRatio: Number(e.target.value) / 100 }));

  el('brightness').addEventListener('input', (e) => {
    opts.brightness = Number(e.target.value);
    el('brightVal').textContent = e.target.value;
    tick();
  });
  el('brightness').addEventListener('change',
    (e) => change({ brightness: Number(e.target.value) }));

  el('reset').addEventListener('click', async () => {
    opts = await reset();
    applyToForm();
    tick();
  });
}

async function main() {
  await initI18n();
  applyI18n();
  document.querySelectorAll('.tabs [role="tab"]').forEach((button) => {
    button.textContent = t(TAB_KEYS[button.dataset.tab]);
  });
  buildPlates();
  buildColorModes();
  buildEffects();
  opts = await load();
  applyToForm();
  wire();
  const stored = (() => {
    try {
      return sessionStorage.getItem('stanza-tab');
    } catch (e) {
      return null;
    }
  })();
  showTab(location.hash.slice(1) || stored || 'face');
  runTicks(tick, () => opts?.secFx);
  onChange((next) => {
    opts = next;
    applyToForm();
    tick();
  });
}

main();
