/**
 * Letter plates and word-to-cell maps.
 *
 * The three 8x8 plates are ported cell-for-cell from src/face.cpp in the
 * ESP-WordClock8x8 firmware, so the extension lights exactly the same pixels
 * as the real matrix. Coordinates are [x, y] with the origin top-left.
 */

import { LANG_PLATES } from './langs.js';

/** Cells for a run of letters starting at x,y and going right. */
function run(x, y, len) {
  const out = [];
  for (let i = 0; i < len; i += 1) {
    out.push([x + i, y]);
  }
  return out;
}

// ---------------------------------------------------------------- Home 8x8

const HOME_ROWS = [
  'TWENTYH*',
  'QUARTERM',
  'FIVEHALF',
  'SETPASTO',
  'FIVEIGHT',
  'SIXTHREE',
  'TWELEVEN',
  'FOURNINE',
];

const HOME_WORDS = {
  twenty: run(0, 0, 6),
  quarter: run(0, 1, 7),
  fiveMin: run(0, 2, 4),
  half: run(4, 2, 4),
  past: run(3, 3, 4),
  to: run(6, 3, 2),
  fiveHour: run(0, 4, 4),
  eight: run(3, 4, 5),
  six: run(0, 5, 3),
  three: run(3, 5, 5),
  // TWELVE / ELEVEN / TEN / TWO / SEVEN / ONE share letters, so they are not
  // contiguous runs and have to be spelled out cell by cell.
  twelve: [[0, 6], [1, 6], [2, 6], [3, 6], [5, 6], [6, 6]],
  eleven: [[2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6]],
  two: [[0, 6], [1, 6], [1, 7]],
  seven: [[0, 5], [4, 6], [5, 6], [6, 6], [7, 6]],
  four: run(0, 7, 4),
  nine: run(4, 7, 4),
  one: [[1, 7], [4, 7], [7, 7]],
  tenHour: [[3, 5], [6, 5], [7, 6]],
  tenMin: [[0, 0], [2, 0], [3, 0]],
};

// ------------------------------------------------------------ ATWENTYD 8x8

const DORO_ROWS = [
  'ATWENTYD',
  'QUARTERY',
  'FIVEHALF',
  'DPASTORO',
  'FIVEIGHT',
  'SIXTHREE',
  'TWELEVEN',
  'FOURNINE',
];

// Only the shifted words differ; the rest of the plate matches Home.
const DORO_WORDS = {
  ...HOME_WORDS,
  twenty: run(1, 0, 6),
  quarter: run(0, 1, 7),
  past: run(1, 3, 4),
  to: run(4, 3, 2),
  tenMin: [[1, 0], [3, 0], [4, 0]],
};

// ------------------------------------------- EN08x08 (TWFIFTHA) 8x8

/**
 * Common maker-community 8×8 English stencil. The row text is a functional
 * packing of the time words, not a third-party artwork or font we ship.
 */
const EN08_ROWS = [
  'TWFIFTHA',
  'ENVEENLF',
  'TYPASTOT',
  'TWELVELE',
  'FOURNVEN',
  'SIXEIGHT',
  'SEVENONE',
  'THREETWO',
];

const EN08_WORDS = {
  twenty: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],
  // This plate says FIFTEEN where the others say QUARTER.
  quarter: [[2, 0], [3, 0], [4, 0], [5, 0], [3, 1], [4, 1], [5, 1]],
  fiveMin: [[2, 0], [3, 0], [2, 1], [3, 1]],
  half: [[6, 0], [7, 0], [6, 1], [7, 1]],
  past: run(2, 2, 4),
  to: [[5, 2], [6, 2]],
  tenMin: [[0, 0], [0, 1], [1, 1]],
  one: [[5, 6], [6, 6], [7, 6]],
  two: [[5, 7], [6, 7], [7, 7]],
  three: run(0, 7, 5),
  four: run(0, 4, 4),
  fiveHour: [[0, 4], [1, 5], [2, 6], [3, 7]],
  six: run(0, 5, 3),
  seven: run(0, 6, 5),
  eight: run(3, 5, 5),
  nine: [[4, 4], [4, 5], [4, 6], [4, 7]],
  tenHour: [[7, 2], [7, 3], [7, 4]],
  eleven: [[5, 3], [6, 3], [7, 3], [5, 4], [6, 4], [7, 4]],
  twelve: run(0, 3, 6),
};

// ------------------------------------------------------------ English 16x16

/**
 * Original English 16x16 with exact-minute resolution.
 *
 * Designed for this extension: every minute has its own wording, hours reuse
 * the same number cells as minutes 1-12, and the bottom row is a seconds bar.
 */
const EN16_ROWS = [
  'THEBTIMELISVHALF',
  'AQUARTERYTWENTYK',
  'ONELTWOYTHREERLP',
  'FOURKFIVEBSIXRLP',
  'SEVENYEIGHTZNINE',
  'TENYELEVENKRLPSD',
  'TWELVEYTHIRTEENK',
  'FOURTEENYSIXTEEN',
  'SEVENTEENKRLPSDM',
  'EIGHTEENNINETEEN',
  'MINUTESYPASTZTOY',
  'OCLOCKYINZATKRLP',
  'THEYMORNINGKRLPS',
  'AFTERNOONEVENING',
  'NIGHTKRLPSDMVGTB',
  '................',
];

const EN16_WORDS = {
  the: run(0, 0, 3),
  timeWord: run(4, 0, 4),
  is: run(9, 0, 2),
  half: run(12, 0, 4),
  aWord: [[0, 1]],

  minuteWord: run(0, 10, 6),
  sWord: [[6, 10]],
  past: run(8, 10, 4),
  to: run(13, 10, 2),

  oclock: run(0, 11, 6),
  inWord: run(7, 11, 2),
  at: run(10, 11, 2),

  theDay: run(0, 12, 3),
  morning: run(4, 12, 7),
  afternoon: run(0, 13, 9),
  evening: run(9, 13, 7),
  noon: run(5, 13, 4),
  night: run(0, 14, 5),

  min1: run(0, 2, 3),
  min2: run(4, 2, 3),
  min3: run(8, 2, 5),
  min4: run(0, 3, 4),
  min5: run(5, 3, 4),
  min6: run(10, 3, 3),
  min7: run(0, 4, 5),
  min8: run(6, 4, 5),
  min9: run(12, 4, 4),
  min10: run(0, 5, 3),
  min11: run(4, 5, 6),
  min12: run(0, 6, 6),
  min13: run(7, 6, 8),
  min14: run(0, 7, 8),
  min15: run(1, 1, 7),
  min16: run(9, 7, 7),
  min17: run(0, 8, 9),
  min18: run(0, 9, 8),
  min19: run(8, 9, 8),
  min20: run(9, 1, 6),

  // Hours light the same number cells as minutes 1-12.
  hr1: run(0, 2, 3),
  hr2: run(4, 2, 3),
  hr3: run(8, 2, 5),
  hr4: run(0, 3, 4),
  hr5: run(5, 3, 4),
  hr6: run(10, 3, 3),
  hr7: run(0, 4, 5),
  hr8: run(6, 4, 5),
  hr9: run(12, 4, 4),
  hr10: run(0, 5, 3),
  hr11: run(4, 5, 6),
  hr12: run(0, 6, 6),
};

// -------------------------------------------------- English 16x16, 5 minutes

/**
 * A roomier 16x16 that rounds to the nearest five minutes.
 *
 * Where the exact-minute plate packs nineteen number words in, this one gives
 * each word its own generous run, which is what a big matrix is for. The
 * extra space pays for IT IS, MINUTES, O'CLOCK and a day-part line, and the
 * bottom row is sixteen dots for the leftover-minute markers.
 */
const EN16F_ROWS = [
  'ITKISBRLPSDMVGTY',
  'FIVEBTENKRLPSDMV',
  'QUARTERTWENTYKRL',
  'HALFBMINUTESKRLP',
  'PASTBTOKRLPSDMVG',
  'ONEBTWOKRLPSDMVG',
  'THREEBFOURKRLPSD',
  'FIVEBSIXKRLPSDMV',
  'SEVENBEIGHTKRLPS',
  'NINEBTENKRLPSDMV',
  'ELEVENBTWELVEKRL',
  'OCLOCKBRLPSDMVGT',
  'INBTHEBMORNINGRL',
  'AFTERNOONEVENING',
  'ATBNIGHTKRLPSDMV',
  '................',
];

const EN16F_WORDS = {
  itIs: [[0, 0], [1, 0], [3, 0], [4, 0]],

  fiveMin: run(0, 1, 4),
  tenMin: run(5, 1, 3),
  quarter: run(0, 2, 7),
  twenty: run(7, 2, 6),
  half: run(0, 3, 4),
  minutes: run(5, 3, 7),

  past: run(0, 4, 4),
  to: run(5, 4, 2),

  one: run(0, 5, 3),
  two: run(4, 5, 3),
  three: run(0, 6, 5),
  four: run(6, 6, 4),
  fiveHour: run(0, 7, 4),
  six: run(5, 7, 3),
  seven: run(0, 8, 5),
  eight: run(6, 8, 5),
  nine: run(0, 9, 4),
  tenHour: run(5, 9, 3),
  eleven: run(0, 10, 6),
  twelve: run(7, 10, 6),

  oclock: run(0, 11, 6),

  inThe: [[0, 12], [1, 12], [3, 12], [4, 12], [5, 12]],
  morning: run(7, 12, 7),
  afternoon: run(0, 13, 9),
  evening: run(9, 13, 7),
  at: run(0, 14, 2),
  night: run(3, 14, 5),
};

/**
 * Bottom row: six cells mark the tens digit of the seconds and ten mark the
 * units, one lit in each group.
 */
export function secondsCells(second) {
  const tens = Math.floor(second / 10);
  const units = second % 10;
  return [[tens, 15], [6 + units, 15]];
}

// --------------------------------------------------------------------------

export const PLATES = {
  home: {
    id: 'home',
    size: 8,
    /** Five-minute slots, as the ESP firmware does it. */
    mode: 'slots',
    title: 'Home 8x8 (TWENTYH* / SETPASTO)',
    rows: HOME_ROWS,
    words: HOME_WORDS,
    locale: 'en',
  },
  doro: {
    id: 'doro',
    size: 8,
    mode: 'slots',
    title: 'ATWENTYD 8x8 letter plate',
    rows: DORO_ROWS,
    words: DORO_WORDS,
    locale: 'en',
  },
  en08: {
    id: 'en08',
    size: 8,
    mode: 'slots',
    title: 'EN 8x8 TWFIFTHA',
    rows: EN08_ROWS,
    words: EN08_WORDS,
    /** This plate spells FIFTEEN rather than QUARTER. */
    labels: { quarter: 'FIFTEEN' },
    locale: 'en',
  },
  en16: {
    id: 'en16',
    size: 16,
    /** Every minute has its own wording, and the bottom row shows seconds. */
    mode: 'exact',
    title: 'EN 16x16 exact minute',
    rows: EN16_ROWS,
    words: EN16_WORDS,
    seconds: true,
    locale: 'en',
  },
  en16f: {
    id: 'en16f',
    size: 16,
    mode: 'slots',
    title: 'EN 16x16 five minute',
    rows: EN16F_ROWS,
    words: EN16F_WORDS,
    /** Lit on every tick. */
    always: ['itIs'],
    /** Lit only on the hour. */
    oclockId: 'oclock',
    /** Lit for FIVE / TEN / TWENTY / TWENTY FIVE, but not QUARTER or HALF. */
    minutesId: 'minutes',
    /** Light IN THE MORNING / AFTERNOON / EVENING / AT NIGHT. */
    dayParts: true,
    locale: 'en',
  },
  ...LANG_PLATES,
};

export const PLATE_IDS = Object.keys(PLATES);

export function getPlate(id) {
  return PLATES[id] || PLATES.home;
}

/** Letter at x,y, or a space when out of range. */
export function letterAt(plate, x, y) {
  const row = plate.rows[y];
  if (!row || x < 0 || x >= plate.size) {
    return ' ';
  }
  return row[x] || ' ';
}
