/**
 * Non-English 16x16 faces.
 *
 * Each language keeps its layout, its word map and its wording rules
 * together, because the grammar differs more than the geometry does:
 *
 *   German   counts against the half hour. HALB ZEHN is half past nine, not
 *            half past ten, so slots 5-7 name the *next* hour. One o'clock is
 *            EIN UHR but FÜNF NACH EINS, hence the separate S cell.
 *   French   puts the hour first and the minutes after: NEUF HEURES DIX.
 *            HEURE loses its S at one o'clock. Noon and midnight get their
 *            own words.
 *   Spanish  agrees the article with the hour: ES LA UNA but SON LAS DOS.
 *   Italian  likewise: E L'UNA but SONO LE DUE.
 *   Dutch    counts against the half hour like German: HALF TIEN is 9:30.
 *   Portuguese agrees É UMA / SÃO DUAS and has MEIO-DIA / MEIA-NOITE.
 *
 * All four round to the nearest five minutes and share the bottom dot row
 * for the leftover 1-4 minutes.
 *
 * These layouts are original to this project.
 */

/** Cells for a run of letters starting at x,y and going right. */
function run(x, y, len) {
  const out = [];
  for (let i = 0; i < len; i += 1) {
    out.push([x + i, y]);
  }
  return out;
}

const DOTS = '................';

// ------------------------------------------------------------------- German

const DE_ROWS = [
  'ESKISTBRLPSDMVGT',
  'F\u00DCNFBZEHNKRLPSDM',
  'VIERTELKRLPSDMVG',
  'ZWANZIGKRLPSDMVG',
  'NACHBVORKRLPSDMV',
  'HALBKRLPSDMVGTYB',
  'EINSBZWEIKRLPSDM',
  'DREIBVIERKRLPSDM',
  'F\u00DCNFBSECHSKRLPSD',
  'SIEBENBACHTKRLPS',
  'NEUNBZEHNKRLPSDM',
  'ELFBZW\u00D6LFKRLPSDM',
  'UHRBRLPSDMVGTYKS',
  'KRLPSDMVGTYBNXZQ',
  'BNXZQKRLPSDMVGTY',
  DOTS,
];

const DE_WORDS = {
  esIst: [[0, 0], [1, 0], [3, 0], [4, 0], [5, 0]],
  fuenfMin: run(0, 1, 4),
  zehnMin: run(5, 1, 4),
  viertel: run(0, 2, 7),
  zwanzig: run(0, 3, 7),
  nach: run(0, 4, 4),
  vor: run(5, 4, 3),
  halb: run(0, 5, 4),
  hr1: run(0, 6, 3),
  einS: [[3, 6]],
  hr2: run(5, 6, 4),
  hr3: run(0, 7, 4),
  hr4: run(5, 7, 4),
  hr5: run(0, 8, 4),
  hr6: run(5, 8, 5),
  hr7: run(0, 9, 6),
  hr8: run(7, 9, 4),
  hr9: run(0, 10, 4),
  hr10: run(5, 10, 4),
  hr11: run(0, 11, 3),
  hr12: run(4, 11, 5),
  uhr: run(0, 12, 3),
};

const DE_SPELL = {
  esIst: 'ESIST',
  fuenfMin: 'F\u00DCNF',
  zehnMin: 'ZEHN',
  viertel: 'VIERTEL',
  zwanzig: 'ZWANZIG',
  nach: 'NACH',
  vor: 'VOR',
  halb: 'HALB',
  uhr: 'UHR',
  einS: 'S',
  hr1: 'EIN',
  hr2: 'ZWEI',
  hr3: 'DREI',
  hr4: 'VIER',
  hr5: 'F\u00DCNF',
  hr6: 'SECHS',
  hr7: 'SIEBEN',
  hr8: 'ACHT',
  hr9: 'NEUN',
  hr10: 'ZEHN',
  hr11: 'ELF',
  hr12: 'ZW\u00D6LF',
};

const DE_HOURS = [
  '', 'EIN', 'ZWEI', 'DREI', 'VIER', 'F\u00DCNF', 'SECHS',
  'SIEBEN', 'ACHT', 'NEUN', 'ZEHN', 'ELF', 'ZW\u00D6LF',
];

/** Minute words per slot, and whether the slot names the next hour. */
const DE_SLOTS = [
  { ids: [], words: [], next: false },
  { ids: ['fuenfMin', 'nach'], words: ['F\u00DCNF', 'NACH'], next: false },
  { ids: ['zehnMin', 'nach'], words: ['ZEHN', 'NACH'], next: false },
  { ids: ['viertel', 'nach'], words: ['VIERTEL', 'NACH'], next: false },
  { ids: ['zwanzig', 'nach'], words: ['ZWANZIG', 'NACH'], next: false },
  { ids: ['fuenfMin', 'vor', 'halb'], words: ['F\u00DCNF', 'VOR', 'HALB'], next: true },
  { ids: ['halb'], words: ['HALB'], next: true },
  { ids: ['fuenfMin', 'nach', 'halb'], words: ['F\u00DCNF', 'NACH', 'HALB'], next: true },
  { ids: ['zwanzig', 'vor'], words: ['ZWANZIG', 'VOR'], next: true },
  { ids: ['viertel', 'vor'], words: ['VIERTEL', 'VOR'], next: true },
  { ids: ['zehnMin', 'vor'], words: ['ZEHN', 'VOR'], next: true },
  { ids: ['fuenfMin', 'vor'], words: ['F\u00DCNF', 'VOR'], next: true },
];

function composeDe(slot, hour24) {
  const h12 = hour24 % 12 || 12;
  const rule = DE_SLOTS[slot];
  const named = rule.next ? (h12 % 12) + 1 : h12;

  const ids = ['esIst', ...rule.ids, `hr${named}`];
  const words = ['ES', 'IST', ...rule.words];

  // EIN UHR on the hour, EINS the rest of the time.
  const bare = named === 1 && slot === 0;
  if (named === 1 && !bare) {
    ids.push('einS');
  }
  words.push(bare ? 'EIN' : DE_HOURS[named] + (named === 1 ? 'S' : ''));

  if (slot === 0) {
    ids.push('uhr');
    words.push('UHR');
  }
  return { ids, text: words.join(' '), hour12: named };
}

// ------------------------------------------------------------------- French

const FR_ROWS = [
  'ILBESTKRLPSDMVGT',
  'UNEBDEUXKRLPSDMV',
  'TROISBQUATREKRLP',
  'CINQBSIXKRLPSDMV',
  'SEPTBHUITKRLPSDM',
  'NEUFBDIXKRLPSDMV',
  'ONZEBDOUZEKRLPSD',
  'HEURESBRLPSDMVGT',
  'MOINSBLEKRLPSDMV',
  'ETBQUARTKRLPSDMV',
  'DEMIEKRLPSDMVGTY',
  'CINQBDIXKRLPSDMV',
  'VINGTKRLPSDMVGTY',
  'MIDIBMINUITKRLPS',
  'BNXZQKRLPSDMVGTY',
  DOTS,
];

const FR_WORDS = {
  ilEst: [[0, 0], [1, 0], [3, 0], [4, 0], [5, 0]],
  hr1: run(0, 1, 3),
  hr2: run(4, 1, 4),
  hr3: run(0, 2, 5),
  hr4: run(6, 2, 6),
  hr5: run(0, 3, 4),
  hr6: run(5, 3, 3),
  hr7: run(0, 4, 4),
  hr8: run(5, 4, 4),
  hr9: run(0, 5, 4),
  hr10: run(5, 5, 3),
  hr11: run(0, 6, 4),
  hr12: run(5, 6, 5),
  heure: run(0, 7, 5),
  heureS: [[5, 7]],
  moins: run(0, 8, 5),
  le: run(6, 8, 2),
  et: run(0, 9, 2),
  quart: run(3, 9, 5),
  demie: run(0, 10, 5),
  cinqMin: run(0, 11, 4),
  dixMin: run(5, 11, 3),
  vingt: run(0, 12, 5),
  midi: run(0, 13, 4),
  minuit: run(5, 13, 6),
};

const FR_SPELL = {
  ilEst: 'ILEST',
  hr1: 'UNE',
  hr2: 'DEUX',
  hr3: 'TROIS',
  hr4: 'QUATRE',
  hr5: 'CINQ',
  hr6: 'SIX',
  hr7: 'SEPT',
  hr8: 'HUIT',
  hr9: 'NEUF',
  hr10: 'DIX',
  hr11: 'ONZE',
  hr12: 'DOUZE',
  heure: 'HEURE',
  heureS: 'S',
  moins: 'MOINS',
  le: 'LE',
  et: 'ET',
  quart: 'QUART',
  demie: 'DEMIE',
  cinqMin: 'CINQ',
  dixMin: 'DIX',
  vingt: 'VINGT',
  midi: 'MIDI',
  minuit: 'MINUIT',
};

const FR_HOURS = [
  '', 'UNE', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX',
  'SEPT', 'HUIT', 'NEUF', 'DIX', 'ONZE', 'DOUZE',
];

/** Minute tail after "<hour> HEURES". */
const FR_SLOTS = [
  { ids: [], words: [] },
  { ids: ['cinqMin'], words: ['CINQ'] },
  { ids: ['dixMin'], words: ['DIX'] },
  { ids: ['et', 'quart'], words: ['ET', 'QUART'] },
  { ids: ['vingt'], words: ['VINGT'] },
  { ids: ['vingt', 'cinqMin'], words: ['VINGT-CINQ'] },
  { ids: ['et', 'demie'], words: ['ET', 'DEMIE'] },
  { ids: ['moins', 'vingt', 'cinqMin'], words: ['MOINS', 'VINGT-CINQ'] },
  { ids: ['moins', 'vingt'], words: ['MOINS', 'VINGT'] },
  { ids: ['moins', 'le', 'quart'], words: ['MOINS', 'LE', 'QUART'] },
  { ids: ['moins', 'dixMin'], words: ['MOINS', 'DIX'] },
  { ids: ['moins', 'cinqMin'], words: ['MOINS', 'CINQ'] },
];

function composeFr(slot, hour24) {
  const h12 = hour24 % 12 || 12;
  const named = slot >= 7 ? (h12 % 12) + 1 : h12;

  // MIDI and MINUIT replace the whole hour phrase.
  if (slot === 0 && (hour24 === 12 || hour24 === 0)) {
    const noon = hour24 === 12;
    return {
      ids: ['ilEst', noon ? 'midi' : 'minuit'],
      text: `IL EST ${noon ? 'MIDI' : 'MINUIT'}`,
      hour12: 12,
    };
  }

  const rule = FR_SLOTS[slot];
  const ids = ['ilEst', `hr${named}`, 'heure'];
  const words = ['IL', 'EST', FR_HOURS[named]];
  if (named === 1) {
    words.push('HEURE');
  } else {
    ids.push('heureS');
    words.push('HEURES');
  }
  ids.push(...rule.ids);
  words.push(...rule.words);
  return { ids, text: words.join(' '), hour12: named };
}

// ------------------------------------------------------------------ Spanish

const ES_ROWS = [
  'ESBLABSONBLASKRL',
  'UNABDOSKRLPSDMVG',
  'TRESBCUATROKRLPS',
  'CINCOBSEISKRLPSD',
  'SIETEBOCHOKRLPSD',
  'NUEVEBDIEZKRLPSD',
  'ONCEBDOCEKRLPSDM',
  'YBMENOSKRLPSDMVG',
  'CINCOBDIEZKRLPSD',
  'CUARTOBMEDIAKRLP',
  'VEINTEKRLPSDMVGT',
  'VEINTICINCOKRLPS',
  'KRLPSDMVGTYBNXZQ',
  'BNXZQKRLPSDMVGTY',
  'QZXNBYTGVMDSPLRK',
  DOTS,
];

const ES_WORDS = {
  es: run(0, 0, 2),
  la: run(3, 0, 2),
  son: run(6, 0, 3),
  las: run(10, 0, 3),
  hr1: run(0, 1, 3),
  hr2: run(4, 1, 3),
  hr3: run(0, 2, 4),
  hr4: run(5, 2, 6),
  hr5: run(0, 3, 5),
  hr6: run(6, 3, 4),
  hr7: run(0, 4, 5),
  hr8: run(6, 4, 4),
  hr9: run(0, 5, 5),
  hr10: run(6, 5, 4),
  hr11: run(0, 6, 4),
  hr12: run(5, 6, 4),
  y: [[0, 7]],
  menos: run(2, 7, 5),
  cincoMin: run(0, 8, 5),
  diezMin: run(6, 8, 4),
  cuarto: run(0, 9, 6),
  media: run(7, 9, 5),
  veinte: run(0, 10, 6),
  veinticinco: run(0, 11, 11),
};

const ES_SPELL = {
  es: 'ES',
  la: 'LA',
  son: 'SON',
  las: 'LAS',
  hr1: 'UNA',
  hr2: 'DOS',
  hr3: 'TRES',
  hr4: 'CUATRO',
  hr5: 'CINCO',
  hr6: 'SEIS',
  hr7: 'SIETE',
  hr8: 'OCHO',
  hr9: 'NUEVE',
  hr10: 'DIEZ',
  hr11: 'ONCE',
  hr12: 'DOCE',
  y: 'Y',
  menos: 'MENOS',
  cincoMin: 'CINCO',
  diezMin: 'DIEZ',
  cuarto: 'CUARTO',
  media: 'MEDIA',
  veinte: 'VEINTE',
  veinticinco: 'VEINTICINCO',
};

const ES_HOURS = [
  '', 'UNA', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS',
  'SIETE', 'OCHO', 'NUEVE', 'DIEZ', 'ONCE', 'DOCE',
];

const ES_SLOTS = [
  { ids: [], words: [] },
  { ids: ['y', 'cincoMin'], words: ['Y', 'CINCO'] },
  { ids: ['y', 'diezMin'], words: ['Y', 'DIEZ'] },
  { ids: ['y', 'cuarto'], words: ['Y', 'CUARTO'] },
  { ids: ['y', 'veinte'], words: ['Y', 'VEINTE'] },
  { ids: ['y', 'veinticinco'], words: ['Y', 'VEINTICINCO'] },
  { ids: ['y', 'media'], words: ['Y', 'MEDIA'] },
  { ids: ['menos', 'veinticinco'], words: ['MENOS', 'VEINTICINCO'] },
  { ids: ['menos', 'veinte'], words: ['MENOS', 'VEINTE'] },
  { ids: ['menos', 'cuarto'], words: ['MENOS', 'CUARTO'] },
  { ids: ['menos', 'diezMin'], words: ['MENOS', 'DIEZ'] },
  { ids: ['menos', 'cincoMin'], words: ['MENOS', 'CINCO'] },
];

function composeEs(slot, hour24) {
  const h12 = hour24 % 12 || 12;
  const named = slot >= 7 ? (h12 % 12) + 1 : h12;
  const rule = ES_SLOTS[slot];

  // The article agrees with the hour: ES LA UNA, but SON LAS DOS.
  const one = named === 1;
  const ids = [...(one ? ['es', 'la'] : ['son', 'las']), `hr${named}`];
  const words = [...(one ? ['ES', 'LA'] : ['SON', 'LAS']), ES_HOURS[named]];

  ids.push(...rule.ids);
  words.push(...rule.words);
  return { ids, text: words.join(' '), hour12: named };
}

// ------------------------------------------------------------------ Italian

const IT_ROWS = [
  '\u00C8BSONOBLEKRLPSDM',
  'LUNABDUEKRLPSDMV',
  'TREBQUATTROKRLPS',
  'CINQUEBSEIKRLPSD',
  'SETTEBOTTOKRLPSD',
  'NOVEBDIECIKRLPSD',
  'UNDICIBDODICIKRL',
  'EBMENOKRLPSDMVGT',
  'CINQUEBDIECIKRLP',
  'UNBQUARTOKRLPSDM',
  'MEZZAKRLPSDMVGTY',
  'VENTIBRLPSDMVGTY',
  'VENTICINQUEKRLPS',
  'KRLPSDMVGTYBNXZQ',
  'BNXZQKRLPSDMVGTY',
  DOTS,
];

const IT_WORDS = {
  eWord: [[0, 0]],
  sono: run(2, 0, 4),
  le: run(7, 0, 2),
  lApos: [[0, 1]],
  hr1: run(1, 1, 3),
  hr2: run(5, 1, 3),
  hr3: run(0, 2, 3),
  hr4: run(4, 2, 7),
  hr5: run(0, 3, 6),
  hr6: run(7, 3, 3),
  hr7: run(0, 4, 5),
  hr8: run(6, 4, 4),
  hr9: run(0, 5, 4),
  hr10: run(5, 5, 5),
  hr11: run(0, 6, 6),
  hr12: run(7, 6, 6),
  e: [[0, 7]],
  meno: run(2, 7, 4),
  cinqueMin: run(0, 8, 6),
  dieciMin: run(7, 8, 5),
  unQuarto: [[0, 9], [1, 9], ...run(3, 9, 6)],
  mezza: run(0, 10, 5),
  venti: run(0, 11, 5),
  venticinque: run(0, 12, 11),
};

const IT_SPELL = {
  eWord: '\u00C8',
  sono: 'SONO',
  le: 'LE',
  lApos: 'L',
  hr1: 'UNA',
  hr2: 'DUE',
  hr3: 'TRE',
  hr4: 'QUATTRO',
  hr5: 'CINQUE',
  hr6: 'SEI',
  hr7: 'SETTE',
  hr8: 'OTTO',
  hr9: 'NOVE',
  hr10: 'DIECI',
  hr11: 'UNDICI',
  hr12: 'DODICI',
  e: 'E',
  meno: 'MENO',
  cinqueMin: 'CINQUE',
  dieciMin: 'DIECI',
  unQuarto: 'UNQUARTO',
  mezza: 'MEZZA',
  venti: 'VENTI',
  venticinque: 'VENTICINQUE',
};

const IT_HOURS = [
  '', 'UNA', 'DUE', 'TRE', 'QUATTRO', 'CINQUE', 'SEI',
  'SETTE', 'OTTO', 'NOVE', 'DIECI', 'UNDICI', 'DODICI',
];

const IT_SLOTS = [
  { ids: [], words: [] },
  { ids: ['e', 'cinqueMin'], words: ['E', 'CINQUE'] },
  { ids: ['e', 'dieciMin'], words: ['E', 'DIECI'] },
  { ids: ['e', 'unQuarto'], words: ['E', 'UN', 'QUARTO'] },
  { ids: ['e', 'venti'], words: ['E', 'VENTI'] },
  { ids: ['e', 'venticinque'], words: ['E', 'VENTICINQUE'] },
  { ids: ['e', 'mezza'], words: ['E', 'MEZZA'] },
  { ids: ['meno', 'venticinque'], words: ['MENO', 'VENTICINQUE'] },
  { ids: ['meno', 'venti'], words: ['MENO', 'VENTI'] },
  { ids: ['meno', 'unQuarto'], words: ['MENO', 'UN', 'QUARTO'] },
  { ids: ['meno', 'dieciMin'], words: ['MENO', 'DIECI'] },
  { ids: ['meno', 'cinqueMin'], words: ['MENO', 'CINQUE'] },
];

function composeIt(slot, hour24) {
  const h12 = hour24 % 12 || 12;
  const named = slot >= 7 ? (h12 % 12) + 1 : h12;
  const rule = IT_SLOTS[slot];

  // One o'clock is E L'UNA; every other hour is SONO LE ...
  const one = named === 1;
  const ids = one
    ? ['eWord', 'lApos', 'hr1']
    : ['sono', 'le', `hr${named}`];
  const words = one
    ? ['\u00C8', 'L\u2019UNA']
    : ['SONO', 'LE', IT_HOURS[named]];

  ids.push(...rule.ids);
  words.push(...rule.words);
  return { ids, text: words.join(' '), hour12: named };
}

// -------------------------------------------------------------------- Dutch

const NL_ROWS = [
  'HETKISBRLPSDMVGT',
  'VIJFBTIENKRLPSDM',
  'KWARTKRLPSDMVGTY',
  'TWINTIGKRLPSDMVG',
  'OVERBVOORKRLPSDM',
  'HALFKRLPSDMVGTYB',
  'EENBTWEEKRLPSDMV',
  'DRIEBVIERKRLPSDM',
  'VIJFBZESKRLPSDMV',
  'ZEVENBACHTKRLPSD',
  'NEGENBTIENKRLPSD',
  'ELFBTWAALFKRLPSD',
  'UURBRLPSDMVGTYKS',
  'KRLPSDMVGTYBNXZQ',
  'BNXZQKRLPSDMVGTY',
  DOTS,
];

const NL_WORDS = {
  hetIs: [[0, 0], [1, 0], [2, 0], [4, 0], [5, 0]],
  vijfMin: run(0, 1, 4),
  tienMin: run(5, 1, 4),
  kwart: run(0, 2, 5),
  twintig: run(0, 3, 7),
  over: run(0, 4, 4),
  voor: run(5, 4, 4),
  half: run(0, 5, 4),
  hr1: run(0, 6, 3),
  hr2: run(4, 6, 4),
  hr3: run(0, 7, 4),
  hr4: run(5, 7, 4),
  hr5: run(0, 8, 4),
  hr6: run(5, 8, 3),
  hr7: run(0, 9, 5),
  hr8: run(6, 9, 4),
  hr9: run(0, 10, 5),
  hr10: run(6, 10, 4),
  hr11: run(0, 11, 3),
  hr12: run(4, 11, 6),
  uur: run(0, 12, 3),
};

const NL_SPELL = {
  hetIs: 'HETIS',
  vijfMin: 'VIJF',
  tienMin: 'TIEN',
  kwart: 'KWART',
  twintig: 'TWINTIG',
  over: 'OVER',
  voor: 'VOOR',
  half: 'HALF',
  uur: 'UUR',
  hr1: 'EEN',
  hr2: 'TWEE',
  hr3: 'DRIE',
  hr4: 'VIER',
  hr5: 'VIJF',
  hr6: 'ZES',
  hr7: 'ZEVEN',
  hr8: 'ACHT',
  hr9: 'NEGEN',
  hr10: 'TIEN',
  hr11: 'ELF',
  hr12: 'TWAALF',
};

const NL_HOURS = [
  '', 'EEN', 'TWEE', 'DRIE', 'VIER', 'VIJF', 'ZES',
  'ZEVEN', 'ACHT', 'NEGEN', 'TIEN', 'ELF', 'TWAALF',
];

const NL_SLOTS = [
  { ids: [], words: [] },
  { ids: ['vijfMin', 'over'], words: ['VIJF', 'OVER'] },
  { ids: ['tienMin', 'over'], words: ['TIEN', 'OVER'] },
  { ids: ['kwart', 'over'], words: ['KWART', 'OVER'] },
  { ids: ['twintig', 'over'], words: ['TWINTIG', 'OVER'] },
  { ids: ['vijfMin', 'voor', 'half'], words: ['VIJF', 'VOOR', 'HALF'] },
  { ids: ['half'], words: ['HALF'] },
  { ids: ['vijfMin', 'over', 'half'], words: ['VIJF', 'OVER', 'HALF'] },
  { ids: ['twintig', 'voor'], words: ['TWINTIG', 'VOOR'] },
  { ids: ['kwart', 'voor'], words: ['KWART', 'VOOR'] },
  { ids: ['tienMin', 'voor'], words: ['TIEN', 'VOOR'] },
  { ids: ['vijfMin', 'voor'], words: ['VIJF', 'VOOR'] },
];

function composeNl(slot, hour24) {
  const h12 = hour24 % 12 || 12;
  const rule = NL_SLOTS[slot];
  const named = slot >= 5 ? (h12 % 12) + 1 : h12;
  const ids = ['hetIs', ...rule.ids, `hr${named}`];
  const words = ['HET', 'IS', ...rule.words, NL_HOURS[named]];
  if (slot === 0) {
    ids.push('uur');
    words.push('UUR');
  }
  return { ids, text: words.join(' '), hour12: named };
}

// --------------------------------------------------------------- Portuguese

const PT_ROWS = [
  '\u00C9BS\u00C3OBKRLPSDMVGT',
  'UMABDUASKRLPSDMV',
  'TR\u00CASBQUATROKRLPS',
  'CINCOBSEISKRLPSD',
  'SETEBOITOKRLPSDM',
  'NOVEBDEZKRLPSDMV',
  'ONZEBDOZEKRLPSDM',
  'HORASBRLPSDMVGTY',
  'EBMENOSKRLPSDMVG',
  'CINCOBDEZKRLPSDM',
  'QUINZEBVINTEKRLP',
  'MEIAKRLPSDMVGTYB',
  'VINTEECINCOKRLPS',
  'MEIODIAKRLPSDMVG',
  'MEIANOITEKRLPSDM',
  DOTS,
];

const PT_WORDS = {
  eWord: [[0, 0]],
  sao: run(2, 0, 3),
  hr1: run(0, 1, 3),
  hr2: run(4, 1, 4),
  hr3: run(0, 2, 4),
  hr4: run(5, 2, 6),
  hr5: run(0, 3, 5),
  hr6: run(6, 3, 4),
  hr7: run(0, 4, 4),
  hr8: run(5, 4, 4),
  hr9: run(0, 5, 4),
  hr10: run(5, 5, 3),
  hr11: run(0, 6, 4),
  hr12: run(5, 6, 4),
  hora: run(0, 7, 4),
  horaS: [[4, 7]],
  e: [[0, 8]],
  menos: run(2, 8, 5),
  cincoMin: run(0, 9, 5),
  dezMin: run(6, 9, 3),
  quinze: run(0, 10, 6),
  vinte: run(7, 10, 5),
  meia: run(0, 11, 4),
  vinteecinco: run(0, 12, 11),
  meiodia: run(0, 13, 7),
  meianoite: run(0, 14, 9),
};

const PT_SPELL = {
  eWord: '\u00C9',
  sao: 'S\u00C3O',
  hr1: 'UMA',
  hr2: 'DUAS',
  hr3: 'TR\u00CAS',
  hr4: 'QUATRO',
  hr5: 'CINCO',
  hr6: 'SEIS',
  hr7: 'SETE',
  hr8: 'OITO',
  hr9: 'NOVE',
  hr10: 'DEZ',
  hr11: 'ONZE',
  hr12: 'DOZE',
  hora: 'HORA',
  horaS: 'S',
  e: 'E',
  menos: 'MENOS',
  cincoMin: 'CINCO',
  dezMin: 'DEZ',
  quinze: 'QUINZE',
  vinte: 'VINTE',
  meia: 'MEIA',
  vinteecinco: 'VINTEECINCO',
  meiodia: 'MEIODIA',
  meianoite: 'MEIANOITE',
};

const PT_HOURS = [
  '', 'UMA', 'DUAS', 'TR\u00CAS', 'QUATRO', 'CINCO', 'SEIS',
  'SETE', 'OITO', 'NOVE', 'DEZ', 'ONZE', 'DOZE',
];

const PT_SLOTS = [
  { ids: [], words: [] },
  { ids: ['e', 'cincoMin'], words: ['E', 'CINCO'] },
  { ids: ['e', 'dezMin'], words: ['E', 'DEZ'] },
  { ids: ['e', 'quinze'], words: ['E', 'QUINZE'] },
  { ids: ['e', 'vinte'], words: ['E', 'VINTE'] },
  { ids: ['e', 'vinteecinco'], words: ['E', 'VINTE', 'E', 'CINCO'] },
  { ids: ['e', 'meia'], words: ['E', 'MEIA'] },
  { ids: ['menos', 'vinteecinco'], words: ['MENOS', 'VINTE', 'E', 'CINCO'] },
  { ids: ['menos', 'vinte'], words: ['MENOS', 'VINTE'] },
  { ids: ['menos', 'quinze'], words: ['MENOS', 'QUINZE'] },
  { ids: ['menos', 'dezMin'], words: ['MENOS', 'DEZ'] },
  { ids: ['menos', 'cincoMin'], words: ['MENOS', 'CINCO'] },
];

function composePt(slot, hour24) {
  if (slot === 0 && (hour24 === 12 || hour24 === 0)) {
    const noon = hour24 === 12;
    return {
      ids: ['eWord', noon ? 'meiodia' : 'meianoite'],
      text: noon ? '\u00C9 MEIO-DIA' : '\u00C9 MEIA-NOITE',
      hour12: 12,
    };
  }

  const h12 = hour24 % 12 || 12;
  const named = slot >= 7 ? (h12 % 12) + 1 : h12;
  const rule = PT_SLOTS[slot];
  const one = named === 1;
  const ids = [one ? 'eWord' : 'sao', `hr${named}`, 'hora'];
  const words = [one ? '\u00C9' : 'S\u00C3O', PT_HOURS[named]];
  if (one) {
    words.push('HORA');
  } else {
    ids.push('horaS');
    words.push('HORAS');
  }
  ids.push(...rule.ids);
  words.push(...rule.words);
  return { ids, text: words.join(' '), hour12: named };
}

// --------------------------------------------------------------------------

export const LANG_PLATES = {
  de16: {
    id: 'de16',
    size: 16,
    mode: 'lang',
    title: 'DE 16x16 (ES IST \u2026 UHR)',
    rows: DE_ROWS,
    words: DE_WORDS,
    spell: DE_SPELL,
    compose: composeDe,
    locale: 'de',
  },
  fr16: {
    id: 'fr16',
    size: 16,
    mode: 'lang',
    title: 'FR 16x16 (IL EST \u2026 HEURES)',
    rows: FR_ROWS,
    words: FR_WORDS,
    spell: FR_SPELL,
    compose: composeFr,
    locale: 'fr',
  },
  es16: {
    id: 'es16',
    size: 16,
    mode: 'lang',
    title: 'ES 16x16 (SON LAS \u2026)',
    rows: ES_ROWS,
    words: ES_WORDS,
    spell: ES_SPELL,
    compose: composeEs,
    locale: 'es',
  },
  it16: {
    id: 'it16',
    size: 16,
    mode: 'lang',
    title: 'IT 16x16 (SONO LE \u2026)',
    rows: IT_ROWS,
    words: IT_WORDS,
    spell: IT_SPELL,
    compose: composeIt,
    locale: 'it',
  },
  nl16: {
    id: 'nl16',
    size: 16,
    mode: 'lang',
    title: 'NL 16x16 (HET IS \u2026 UUR)',
    rows: NL_ROWS,
    words: NL_WORDS,
    spell: NL_SPELL,
    compose: composeNl,
    locale: 'nl',
  },
  pt16: {
    id: 'pt16',
    size: 16,
    mode: 'lang',
    title: 'PT 16x16 (S\u00C3O \u2026 HORAS)',
    rows: PT_ROWS,
    words: PT_WORDS,
    spell: PT_SPELL,
    compose: composePt,
    locale: 'pt_BR',
  },
};
