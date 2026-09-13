/**
 * Settings, stored in chrome.storage.sync when the extension is loaded and in
 * localStorage otherwise, so the same code runs in a plain page during testing.
 */

export const DEFAULTS = {
  plate: 'en08',
  colorMode: 0,
  solid: '#ffa028',
  brightness: 40,
  minDots: false,
  showWords: true,
  showGrid: true,
  dimUnlit: true,
  clock24: false,
  /** "HH:MM" to freeze the display, or null to follow the system clock. */
  override: null,

  // ---- full-screen / new-tab display ----
  /** 'fit' scales the matrix to the window; 'fixed' uses cellSize verbatim. */
  sizeMode: 'fit',
  /** Cell size in px when sizeMode is 'fixed'. */
  cellSize: 40,
  /** How much of the window 'fit' is allowed to fill, 0.5 to 1. */
  fillRatio: 0.95,
  /** Show the spelled-out phrase under the matrix on the new-tab page. */
  showPhrase: true,
  /** Show the digital time on the new-tab page. */
  showDigital: false,
  /** Light the seconds row on plates that have one. */
  showSeconds: true,
  /**
   * Seconds animation, matching the ESP firmware:
   * 0 off, 1 pulse, 2 trail, 3 tick, 4 sparkle, 5 star.
   */
  secFx: 5,
  /** Brightness of the seconds effect, 1-80. */
  fxBright: 48,
};

const KEY = 'wordclock';

const area = (() => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return chrome.storage.sync;
    }
  } catch (e) {
    // Not running as an extension.
  }
  return null;
})();

export async function load() {
  if (!area) {
    try {
      return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch (e) {
      return { ...DEFAULTS };
    }
  }
  const got = await area.get(KEY);
  return { ...DEFAULTS, ...(got[KEY] || {}) };
}

export async function save(patch) {
  const next = { ...(await load()), ...patch };
  if (!area) {
    localStorage.setItem(KEY, JSON.stringify(next));
  } else {
    await area.set({ [KEY]: next });
  }
  return next;
}

export async function reset() {
  if (!area) {
    localStorage.removeItem(KEY);
  } else {
    await area.remove(KEY);
  }
  return { ...DEFAULTS };
}

/** Call back whenever another view (popup or options) changes a setting. */
export function onChange(fn) {
  if (!area || !chrome.storage.onChanged) {
    return;
  }
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes[KEY]) {
      fn({ ...DEFAULTS, ...(changes[KEY].newValue || {}) });
    }
  });
}
