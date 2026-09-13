/**
 * Layout and time-logic checks. Run with: node test/verify.mjs
 *
 * The important one is spellCheck(): it walks every word's cell list and
 * confirms the letters under those cells actually spell the word, which is
 * what catches a mistyped coordinate in a letter plate.
 */

import { PLATES, letterAt } from '../src/faces.js';
import { resolveTime } from '../src/clock.js';

const SPELLING = {
  twenty: 'TWENTY',
  quarter: 'QUARTER',
  fiveMin: 'FIVE',
  half: 'HALF',
  past: 'PAST',
  to: 'TO',
  tenMin: 'TEN',
  one: 'ONE',
  two: 'TWO',
  three: 'THREE',
  four: 'FOUR',
  fiveHour: 'FIVE',
  six: 'SIX',
  seven: 'SEVEN',
  eight: 'EIGHT',
  nine: 'NINE',
  tenHour: 'TEN',
  eleven: 'ELEVEN',
  twelve: 'TWELVE',
  aWord: 'A',
  oclock: 'OCLOCK',
  itIs: 'ITIS',
  minutes: 'MINUTES',
  inThe: 'INTHE',
  morning: 'MORNING',
  afternoon: 'AFTERNOON',
  evening: 'EVENING',
  night: 'NIGHT',
  // Exact-minute plates.
  the: 'THE',
  timeWord: 'TIME',
  is: 'IS',
  minuteWord: 'MINUTE',
  sWord: 'S',
  inWord: 'IN',
  at: 'AT',
  theDay: 'THE',
  noon: 'NOON',
};

// min1..min20 spell ONE..TWENTY, with QUARTER standing in for FIFTEEN.
const MIN_SPELL = [
  'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'QUARTER', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY',
];
MIN_SPELL.forEach((w, i) => {
  SPELLING[`min${i + 1}`] = w;
});
MIN_SPELL.slice(0, 12).forEach((w, i) => {
  SPELLING[`hr${i + 1}`] = w;
});

/** Word ids a five-minute-slot plate must be able to show. */
const REQUIRED_SLOTS = [
  'twenty', 'quarter', 'fiveMin', 'half', 'past', 'to', 'tenMin',
  'one', 'two', 'three', 'four', 'fiveHour', 'six', 'seven', 'eight',
  'nine', 'tenHour', 'eleven', 'twelve',
];

/** Word ids an exact-minute plate must be able to show. */
const REQUIRED_EXACT = [
  'the', 'timeWord', 'is', 'half', 'aWord', 'minuteWord', 'sWord',
  'past', 'to', 'oclock', 'inWord', 'at', 'night', 'theDay', 'morning',
  'evening', 'afternoon',
  ...MIN_SPELL.map((_, i) => `min${i + 1}`),
  ...Array.from({ length: 12 }, (_, i) => `hr${i + 1}`),
];

let failures = 0;
const fail = (msg) => {
  failures += 1;
  if (failures <= 20) {
    console.error(`  FAIL  ${msg}`);
  } else if (failures === 21) {
    console.error('  ... further failures suppressed');
  }
};

/**
 * How many dot cells a plate can offer for a given lit state: marker cells
 * (* . :) first, then spare top-row cells. The firmware lights
 * min(extra, 4, capacity), so a plate with a single "*" and a busy top row
 * legitimately shows fewer dots than there are leftover minutes.
 */
function dotCapacity(plate, lit) {
  let markers = 0;
  for (let y = 0; y < plate.size; y += 1) {
    for (let x = 0; x < plate.size; x += 1) {
      const c = letterAt(plate, x, y);
      if (c === '*' || c === '.' || c === ':') {
        markers += 1;
      }
    }
  }
  let n = Math.min(markers, 8);
  if (n < 4) {
    for (let x = plate.size - 1; x >= 0 && n < 4; x -= 1) {
      const isMarker = ['*', '.', ':'].includes(letterAt(plate, x, 0));
      if (!isMarker && !lit.has(`${x},0`)) {
        n += 1;
      }
    }
  }
  return n;
}

for (const plate of Object.values(PLATES)) {
  console.log(`\n${plate.id}  (${plate.size}x${plate.size})  ${plate.title}`);

  if (plate.rows.length !== plate.size) {
    fail(`${plate.rows.length} rows, expected ${plate.size}`);
  }
  plate.rows.forEach((row, y) => {
    if (row.length !== plate.size) {
      fail(`row ${y} is ${row.length} chars, expected ${plate.size}: "${row}"`);
    }
  });

  // Language plates bring their own vocabulary; the per-minute walk below
  // proves every word they ask for exists, so there is no fixed list.
  const required = plate.mode === 'lang' ? [] : plate.mode === 'exact'
    ? REQUIRED_EXACT
    : [
      ...REQUIRED_SLOTS,
      ...(plate.always || []),
      ...(plate.oclockId ? [plate.oclockId] : []),
      ...(plate.minutesId ? [plate.minutesId] : []),
      ...(plate.dayParts
        ? ['inThe', 'at', 'morning', 'afternoon', 'evening', 'night']
        : []),
    ];
  for (const id of required) {
    if (!plate.words[id] || plate.words[id].length === 0) {
      fail(`missing required word "${id}"`);
    }
  }

  let checked = 0;
  for (const [id, cells] of Object.entries(plate.words)) {
    for (const [x, y] of cells) {
      if (x < 0 || x >= plate.size || y < 0 || y >= plate.size) {
        fail(`"${id}" cell (${x},${y}) is off the ${plate.size}x${plate.size} grid`);
      }
    }
    const expected = (plate.spell && plate.spell[id])
      || (plate.labels && plate.labels[id])
      || SPELLING[id];
    if (!expected) {
      fail(`no expected spelling registered for "${id}"`);
      continue;
    }
    const got = cells.map(([x, y]) => letterAt(plate, x, y)).join('');
    if (got !== expected) {
      fail(`"${id}" spells "${got}", expected "${expected}"`);
    } else {
      checked += 1;
    }
  }
  console.log(`  ${checked} words spell correctly`);

  // Every minute of the day must resolve to something displayable.
  const exact = plate.mode === 'exact';
  for (const minDots of [false, true]) {
    for (let mins = 0; mins < 1440; mins += 1) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const second = mins % 60;
      const st = resolveTime(plate, h, m, minDots, second);
      const label = `${plate.id} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} dots=${minDots}`;
      if (st.cells.length === 0) {
        fail(`${label} lit nothing`);
      }
      if (!st.text || /undefined|NaN/.test(st.text)) {
        fail(`${label} produced text "${st.text}"`);
      }
      if (st.words.some((w) => !plate.words[w])) {
        fail(`${label} wants a word this plate lacks: ${st.words.filter((w) => !plate.words[w])}`);
      }
      if (exact) {
        // The seconds row shows one cell for the tens digit and one for the
        // units, both on the bottom row.
        if (st.dots.length !== 2) {
          fail(`${label} lit ${st.dots.length} seconds cells, expected 2`);
        }
        for (const [dx, dy] of st.dots) {
          if (dy !== plate.size - 1 || dx < 0 || dx >= plate.size) {
            fail(`${label} seconds cell (${dx},${dy}) is not on the bottom row`);
          }
        }
        const [tens, units] = st.dots;
        if (tens[0] !== Math.floor(second / 10) || units[0] !== 6 + (second % 10)) {
          fail(`${label} seconds cells ${JSON.stringify(st.dots)} wrong for s=${second}`);
        }
      } else if (minDots) {
        const want = Math.min(m % 5, 4, dotCapacity(plate, st.lit));
        if (st.dots.length !== want) {
          fail(`${label} lit ${st.dots.length} dots, expected ${want}`);
        }
        for (const [dx, dy] of st.dots) {
          if (dx < 0 || dx >= plate.size || dy < 0 || dy >= plate.size) {
            fail(`${label} dot (${dx},${dy}) is off the grid`);
          }
          if (st.lit.has(`${dx},${dy}`)) {
            fail(`${label} dot (${dx},${dy}) sits on a lit word cell`);
          }
        }
      } else if (st.dots.length) {
        fail(`${label} lit dots with the setting off`);
      }
    }
  }
  console.log('  all 1440 minutes resolve (both minute-dot modes)');
}

// Spot-check the phrasing.
console.log('\nphrase spot checks');
const cases = [
  ['home', 13, 0, 'ONE'],
  ['home', 13, 1, 'ONE'],
  ['home', 13, 3, 'FIVE PAST ONE'],
  ['home', 12, 55, 'FIVE TO ONE'],
  ['home', 13, 30, 'HALF PAST ONE'],
  ['home', 13, 35, 'TWENTY FIVE TO TWO'],
  ['home', 0, 15, 'QUARTER PAST TWELVE'],
  ['home', 23, 58, 'TWELVE'],
  ['en08', 13, 15, 'FIFTEEN PAST ONE'],
  // Exact-minute wording on the original EN16 plate.
  ['en16', 13, 0, 'THE TIME IS ONE O\u2019CLOCK IN THE AFTERNOON'],
  ['en16', 13, 1, 'THE TIME IS ONE MINUTE PAST ONE IN THE AFTERNOON'],
  ['en16', 9, 3, 'THE TIME IS THREE MINUTES PAST NINE IN THE MORNING'],
  ['en16', 9, 15, 'THE TIME IS A QUARTER PAST NINE IN THE MORNING'],
  ['en16', 9, 30, 'THE TIME IS HALF PAST NINE IN THE MORNING'],
  ['en16', 9, 45, 'THE TIME IS A QUARTER TO TEN IN THE MORNING'],
  ['en16', 9, 59, 'THE TIME IS ONE MINUTE TO TEN IN THE MORNING'],
  ['en16', 9, 37, 'THE TIME IS TWENTY THREE MINUTES TO TEN IN THE MORNING'],
  ['en16', 9, 23, 'THE TIME IS TWENTY THREE MINUTES PAST NINE IN THE MORNING'],
  ['en16', 0, 0, 'THE TIME IS TWELVE O\u2019CLOCK AT NIGHT'],
  ['en16', 12, 0, 'THE TIME IS TWELVE O\u2019CLOCK IN THE AFTERNOON'],
  ['en16', 19, 20, 'THE TIME IS TWENTY PAST SEVEN IN THE EVENING'],
  ['en16', 23, 45, 'THE TIME IS A QUARTER TO TWELVE AT NIGHT'],
  // Five-minute 16x16: same rounding as the 8x8 plates, fuller wording.
  ['en16f', 13, 0, 'IT IS ONE O\u2019CLOCK IN THE AFTERNOON'],
  ['en16f', 13, 2, 'IT IS ONE O\u2019CLOCK IN THE AFTERNOON'],
  ['en16f', 9, 5, 'IT IS FIVE MINUTES PAST NINE IN THE MORNING'],
  ['en16f', 9, 15, 'IT IS QUARTER PAST NINE IN THE MORNING'],
  ['en16f', 9, 25, 'IT IS TWENTY FIVE MINUTES PAST NINE IN THE MORNING'],
  ['en16f', 9, 30, 'IT IS HALF PAST NINE IN THE MORNING'],
  ['en16f', 9, 40, 'IT IS TWENTY MINUTES TO TEN IN THE MORNING'],
  ['en16f', 9, 45, 'IT IS QUARTER TO TEN IN THE MORNING'],
  ['en16f', 0, 30, 'IT IS HALF PAST TWELVE AT NIGHT'],
  ['en16f', 19, 0, 'IT IS SEVEN O\u2019CLOCK IN THE EVENING'],

  // German counts against the half hour: HALB ZEHN is half past nine.
  ['de16', 9, 0, 'ES IST NEUN UHR'],
  ['de16', 13, 0, 'ES IST EIN UHR'],
  ['de16', 13, 5, 'ES IST F\u00DCNF NACH EINS'],
  ['de16', 9, 15, 'ES IST VIERTEL NACH NEUN'],
  ['de16', 9, 25, 'ES IST F\u00DCNF VOR HALB ZEHN'],
  ['de16', 9, 30, 'ES IST HALB ZEHN'],
  ['de16', 9, 35, 'ES IST F\u00DCNF NACH HALB ZEHN'],
  ['de16', 9, 45, 'ES IST VIERTEL VOR ZEHN'],
  ['de16', 12, 30, 'ES IST HALB EINS'],
  ['de16', 23, 55, 'ES IST F\u00DCNF VOR ZW\u00D6LF'],

  // French puts the hour first, and HEURE loses its S at one o'clock.
  ['fr16', 9, 0, 'IL EST NEUF HEURES'],
  ['fr16', 13, 0, 'IL EST UNE HEURE'],
  ['fr16', 12, 0, 'IL EST MIDI'],
  ['fr16', 0, 0, 'IL EST MINUIT'],
  ['fr16', 9, 10, 'IL EST NEUF HEURES DIX'],
  ['fr16', 9, 15, 'IL EST NEUF HEURES ET QUART'],
  ['fr16', 9, 30, 'IL EST NEUF HEURES ET DEMIE'],
  ['fr16', 9, 45, 'IL EST DIX HEURES MOINS LE QUART'],
  ['fr16', 9, 35, 'IL EST DIX HEURES MOINS VINGT-CINQ'],

  // Spanish agrees the article with the hour.
  ['es16', 13, 0, 'ES LA UNA'],
  ['es16', 14, 0, 'SON LAS DOS'],
  ['es16', 9, 15, 'SON LAS NUEVE Y CUARTO'],
  ['es16', 9, 30, 'SON LAS NUEVE Y MEDIA'],
  ['es16', 9, 45, 'SON LAS DIEZ MENOS CUARTO'],
  // The article follows the hour that is named, so counting down to one
  // switches back to the singular.
  ['es16', 12, 35, 'ES LA UNA MENOS VEINTICINCO'],
  ['it16', 12, 35, '\u00C8 L\u2019UNA MENO VENTICINQUE'],

  // Italian likewise.
  ['it16', 13, 0, '\u00C8 L\u2019UNA'],
  ['it16', 14, 0, 'SONO LE DUE'],
  ['it16', 9, 15, 'SONO LE NOVE E UN QUARTO'],
  ['it16', 9, 30, 'SONO LE NOVE E MEZZA'],
  ['it16', 9, 45, 'SONO LE DIECI MENO UN QUARTO'],
  ['it16', 9, 5, 'SONO LE NOVE E CINQUE'],

  // Dutch counts against the half hour, like German.
  ['nl16', 9, 0, 'HET IS NEGEN UUR'],
  ['nl16', 13, 0, 'HET IS EEN UUR'],
  ['nl16', 9, 15, 'HET IS KWART OVER NEGEN'],
  ['nl16', 9, 25, 'HET IS VIJF VOOR HALF TIEN'],
  ['nl16', 9, 30, 'HET IS HALF TIEN'],
  ['nl16', 9, 45, 'HET IS KWART VOOR TIEN'],
  ['nl16', 12, 30, 'HET IS HALF EEN'],

  // Portuguese agrees \u00C9 UMA / S\u00C3O DUAS and names noon and midnight.
  ['pt16', 13, 0, '\u00C9 UMA HORA'],
  ['pt16', 14, 0, 'S\u00C3O DUAS HORAS'],
  ['pt16', 9, 15, 'S\u00C3O NOVE HORAS E QUINZE'],
  ['pt16', 9, 30, 'S\u00C3O NOVE HORAS E MEIA'],
  ['pt16', 9, 45, 'S\u00C3O DEZ HORAS MENOS QUINZE'],
  ['pt16', 12, 0, '\u00C9 MEIO-DIA'],
  ['pt16', 0, 0, '\u00C9 MEIA-NOITE'],
  ['pt16', 12, 35, '\u00C9 UMA HORA MENOS VINTE E CINCO'],
];
for (const [id, h, m, want] of cases) {
  const got = resolveTime(PLATES[id], h, m, false).text;
  const stamp = `${id} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  if (got !== want) {
    fail(`${stamp} -> "${got}", expected "${want}"`);
  } else {
    console.log(`  ok  ${stamp}  ->  ${got}`);
  }
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} failure(s).`);
process.exit(failures === 0 ? 0 : 1);
