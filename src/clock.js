/**
 * Time to words.
 *
 * Two schemes, picked by plate.mode:
 *
 *   'slots'  five-minute rounding, matching composeTime() /
 *            formatSpokenTime() / applyMinuteDots() in the companion
 *            ESP-WordClock8x8 firmware.
 *   'exact'  a word for every single minute on the 16x16 plate.
 */

import { letterAt, secondsCells } from './faces.js';

const HOUR_WORDS = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX',
  'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE',
];

const MIN_WORDS = [
  '', 'FIVE', 'TEN', 'QUARTER', 'TWENTY', 'TWENTY FIVE', 'HALF',
];

/** Word id that spells each hour. TEN needs its own map on the 8x8 plates. */
const HOUR_IDS = [
  null, 'one', 'two', 'three', 'four', 'fiveHour', 'six',
  'seven', 'eight', 'nine', 'tenHour', 'eleven', 'twelve',
];

/** Minute words per five-minute slot. Slot 0 is the bare hour. */
const SLOT_IDS = [
  [], ['fiveMin'], ['tenMin'], ['quarter'], ['twenty'],
  ['twenty', 'fiveMin'], ['half'],
];

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Work out which words are lit for a wall-clock time.
 *
 * @param {object} plate  a plate from faces.js
 * @param {number} hour24 0-23
 * @param {number} minute 0-59
 * @param {boolean} minDots when true, minutes are floored and the 1-4
 *   remainder shows as corner dots instead of rounding to the nearest slot.
 *   Ignored by exact-minute plates, which have no remainder to show.
 * @param {number} second 0-59, only used by plates with a seconds row.
 */
export function resolveTime(plate, hour24, minute, minDots, second = 0) {
  if (plate.mode === 'exact') {
    return resolveExact(plate, hour24, minute, second);
  }
  if (plate.mode === 'lang') {
    return resolveLang(plate, hour24, minute, minDots);
  }
  return resolveSlots(plate, hour24, minute, minDots);
}

// ------------------------------------------------- language-specific plates

/**
 * Plates that bring their own grammar. The plate's compose() gets the
 * five-minute slot (0-11, unrounded direction) and the real hour, and returns
 * the word ids, the phrase and which hour it decided to name.
 */
function resolveLang(plate, hour24, minute, minDots) {
  let slot;
  let extra = 0;
  if (minDots) {
    slot = Math.floor(minute / 5);
    extra = clamp(minute % 5, 0, 4);
  } else {
    slot = Math.floor((minute + 2) / 5);
  }

  let hour = hour24;
  if (slot >= 12) {
    slot = 0;
    hour = (hour + 1) % 24;
  }

  const { ids, text, hour12 } = plate.compose(slot, hour);
  const { cells, lit } = collect(plate, ids);
  const dots = minDots ? minuteDots(plate, extra, lit) : [];

  return {
    cells,
    dots,
    words: ids,
    lit,
    text: extra > 0 && minDots ? `${text}  +${extra}` : text,
    hour12,
    slot,
    toHour: slot >= 7,
    extra,
  };
}

/** Collect the cells for a word list, skipping duplicates from shared letters. */
function collect(plate, words) {
  const cells = [];
  const lit = new Set();
  for (const id of words) {
    for (const cell of plate.words[id] || []) {
      const key = `${cell[0]},${cell[1]}`;
      if (!lit.has(key)) {
        lit.add(key);
        cells.push(cell);
      }
    }
  }
  return { cells, lit };
}

// ------------------------------------------------------------- exact minutes

const MIN_IDS = Array.from({ length: 20 }, (_, i) => `min${i + 1}`);
const HR_IDS = Array.from({ length: 12 }, (_, i) => `hr${i + 1}`);

const MIN_TEXT = [
  'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'QUARTER', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY',
];

/** True when the minute wants the word MINUTES after the number. */
const wantsPlural = (m) => m > 1 && m < 59 && m % 5 !== 0;

/** Day-part words. The boundaries are the reference clock's. */
function dayPart(hour24) {
  if (hour24 < 1) {
    return { ids: ['at', 'night'], text: 'AT NIGHT' };
  }
  if (hour24 < 12) {
    return { ids: ['inWord', 'theDay', 'morning'], text: 'IN THE MORNING' };
  }
  if (hour24 < 18) {
    return { ids: ['inWord', 'theDay', 'afternoon'], text: 'IN THE AFTERNOON' };
  }
  if (hour24 < 21) {
    return { ids: ['inWord', 'theDay', 'evening'], text: 'IN THE EVENING' };
  }
  return { ids: ['at', 'night'], text: 'AT NIGHT' };
}

/**
 * Minute number words. Above twenty the clock counts back off TWENTY, and
 * past the half hour it counts down to the next hour.
 */
function minuteIds(m) {
  if (m <= 20) {
    return [MIN_IDS[m - 1]];
  }
  if (m < 30) {
    return [MIN_IDS[19], MIN_IDS[m - 21]];
  }
  if (m === 30) {
    return ['half'];
  }
  if (m < 40) {
    return [MIN_IDS[19], MIN_IDS[60 - m - 21]];
  }
  return [MIN_IDS[60 - m - 1]];
}

function minuteText(m) {
  if (m <= 20) {
    return MIN_TEXT[m - 1];
  }
  if (m < 30) {
    return `TWENTY ${MIN_TEXT[m - 21]}`;
  }
  if (m === 30) {
    return 'HALF';
  }
  if (m < 40) {
    return `TWENTY ${MIN_TEXT[60 - m - 21]}`;
  }
  return MIN_TEXT[60 - m - 1];
}

function resolveExact(plate, hour24, minute, second) {
  const h = hour24;
  const m = minute;
  const words = ['the', 'timeWord', 'is'];
  const parts = ['THE', 'TIME', 'IS'];

  // Midnight and midday on the hour read as a single phrase, with no
  // PAST/TO and no separate hour block.
  const wholeHourSpecial = m === 0 && (h === 0 || h === 12);
  // Past the half hour the clock counts down to the next hour.
  const h2 = m > 30 ? h + 1 : h;
  const hour12 = h2 % 12 === 0 ? 12 : h2 % 12;

  if (m === 0) {
    words.push('oclock');
    if (wholeHourSpecial) {
      const part = dayPart(h);
      words.push('hr12', ...part.ids);
      parts.push('TWELVE', 'O\u2019CLOCK', part.text);
    }
  } else {
    words.push(...minuteIds(m));
    words.push(m > 30 ? 'to' : 'past');
    if (m === 15 || m === 45) {
      // The A of "A QUARTER" is the A inside HALF.
      words.push('aWord');
      parts.push('A');
    }
    parts.push(minuteText(m));
  }

  if (!wholeHourSpecial) {
    words.push(HR_IDS[hour12 - 1]);

    if (m === 1 || m === 59) {
      words.push('minuteWord');
      parts.push('MINUTE');
    } else if (wantsPlural(m)) {
      words.push('minuteWord', 'sWord');
      parts.push('MINUTES');
    }
    if (m !== 0) {
      parts.push(m > 30 ? 'TO' : 'PAST');
    }
    parts.push(HOUR_WORDS[hour12]);
    if (m === 0) {
      parts.push('O\u2019CLOCK');
    }

    const part = dayPart(h);
    words.push(...part.ids);
    parts.push(part.text);
  }

  const { cells, lit } = collect(plate, words);
  const dots = plate.seconds ? secondsCells(second) : [];
  for (const [x, y] of dots) {
    lit.add(`${x},${y}`);
  }

  return {
    cells,
    dots,
    words,
    lit,
    text: parts.join(' '),
    hour12,
    slot: -1,
    toHour: m > 30,
    extra: 0,
  };
}

// --------------------------------------------------------- five-minute slots

function resolveSlots(plate, hour24, minute, minDots) {
  let slot;
  let extra = 0;
  if (minDots) {
    slot = Math.floor(minute / 5);
    extra = minute % 5;
  } else {
    slot = Math.floor((minute + 2) / 5);
  }

  let hour = hour24;
  if (slot >= 12) {
    slot = 0;
    hour = (hour + 1) % 24;
  }

  let hour12 = hour % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }

  const toHour = slot > 6;
  if (toHour) {
    hour12 = hour12 === 12 ? 1 : hour12 + 1;
    slot = 12 - slot;
  }

  slot = clamp(slot, 0, 6);
  extra = clamp(extra, 0, 4);

  // Roomier plates can declare extra words; the 8x8 faces declare none and
  // behave exactly as the firmware does.
  const words = [...(plate.always || [])];
  words.push(...SLOT_IDS[slot]);
  if (plate.minutesId && PLURAL_SLOTS.has(slot)) {
    words.push(plate.minutesId);
  }
  if (slot !== 0) {
    words.push(toHour ? 'to' : 'past');
  }
  words.push(HOUR_IDS[hour12]);
  if (slot === 0 && plate.oclockId) {
    words.push(plate.oclockId);
  }
  if (plate.dayParts) {
    words.push(...slotDayPart(hour24).ids);
  }

  const { cells, lit } = collect(plate, words);
  const dots = minDots ? minuteDots(plate, extra, lit) : [];

  return {
    cells,
    dots,
    words: words.filter(Boolean),
    lit,
    text: slotPhrase(plate, slot, hour12, toHour, hour24, extra, minDots),
    hour12,
    slot,
    toHour,
    extra,
  };
}

/** Slots that read naturally with MINUTES after the number. */
const PLURAL_SLOTS = new Set([1, 2, 4, 5]);

/** Day-part words for plates that have a day-part line. */
function slotDayPart(hour24) {
  if (hour24 < 1) {
    return { ids: ['at', 'night'], text: 'AT NIGHT' };
  }
  if (hour24 < 12) {
    return { ids: ['inThe', 'morning'], text: 'IN THE MORNING' };
  }
  if (hour24 < 18) {
    return { ids: ['inThe', 'afternoon'], text: 'IN THE AFTERNOON' };
  }
  if (hour24 < 21) {
    return { ids: ['inThe', 'evening'], text: 'IN THE EVENING' };
  }
  return { ids: ['at', 'night'], text: 'AT NIGHT' };
}

/**
 * The phrase for a slot plate. Plain plates get the bare firmware wording;
 * plates that declare the extra words get a full sentence.
 */
function slotPhrase(plate, slot, hour12, toHour, hour24, extra, minDots) {
  const rich = plate.always || plate.oclockId || plate.dayParts;
  if (!rich) {
    return spokenTime(plate, slot, hour12, toHour, extra, minDots);
  }

  const parts = [];
  if (plate.always) {
    parts.push('IT IS');
  }
  const labels = plate.labels || {};
  if (slot !== 0) {
    parts.push(slot === 3 && labels.quarter ? labels.quarter : MIN_WORDS[slot]);
    if (plate.minutesId && PLURAL_SLOTS.has(slot)) {
      parts.push('MINUTES');
    }
    parts.push(toHour ? 'TO' : 'PAST');
  }
  parts.push(HOUR_WORDS[hour12]);
  if (slot === 0 && plate.oclockId) {
    parts.push('O\u2019CLOCK');
  }
  if (plate.dayParts) {
    parts.push(slotDayPart(hour24).text);
  }
  const phrase = parts.join(' ');
  return extra > 0 && minDots ? `${phrase}  +${extra}` : phrase;
}

/**
 * Up to four leftover minutes, shown on marker cells (* . :) and otherwise on
 * spare cells along the top row, working in from the right.
 */
function minuteDots(plate, extra, used) {
  if (extra <= 0) {
    return [];
  }
  const dots = [];
  for (let y = 0; y < plate.size && dots.length < 8; y += 1) {
    for (let x = 0; x < plate.size && dots.length < 8; x += 1) {
      const c = letterAt(plate, x, y);
      if (c === '*' || c === '.' || c === ':') {
        dots.push([x, y]);
      }
    }
  }
  if (dots.length < 4) {
    for (let x = plate.size - 1; x >= 0 && dots.length < 4; x -= 1) {
      const key = `${x},0`;
      const known = dots.some((d) => d[0] === x && d[1] === 0);
      if (!known && !used.has(key)) {
        dots.push([x, 0]);
      }
    }
  }
  return dots.slice(0, Math.min(extra, 4));
}

/** The spoken phrase, e.g. "TWENTY FIVE TO ONE". */
export function spokenTime(plate, slot, hour12, toHour, extra, minDots) {
  const labels = plate.labels || {};
  let minWord = MIN_WORDS[slot];
  if (slot === 3 && labels.quarter) {
    minWord = labels.quarter;
  }
  const hourWord = HOUR_WORDS[hour12];
  if (slot === 0) {
    return hourWord;
  }
  const phrase = `${minWord} ${toHour ? 'TO' : 'PAST'} ${hourWord}`;
  return extra > 0 && minDots ? `${phrase}  +${extra}` : phrase;
}

/** Human label for a word id, used by the word list in the popup. */
export function wordLabel(plate, id) {
  const labels = plate.labels || {};
  if (labels[id]) {
    return labels[id];
  }
  const named = {
    fiveMin: 'FIVE',
    fiveHour: 'FIVE',
    tenMin: 'TEN',
    tenHour: 'TEN',
    timeWord: 'TIME',
    minuteWord: 'MINUTE',
    sWord: 'S',
    inWord: 'IN',
    theDay: 'THE',
    aWord: 'A',
    oclock: 'O\u2019CLOCK',
  };
  if (named[id]) {
    return named[id];
  }
  // min7 -> SEVEN, hr7 -> SEVEN
  const num = /^(min|hr)(\d+)$/.exec(id);
  if (num) {
    return num[1] === 'hr' ? HOUR_WORDS[Number(num[2])] : MIN_TEXT[num[2] - 1];
  }
  return id.toUpperCase();
}
