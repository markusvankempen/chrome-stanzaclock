/**
 * UI locale helper.
 *
 * In the packed extension chrome.i18n supplies the strings from _locales.
 * The preview server has no chrome.i18n, so we fetch the same JSON files.
 */

const ALIAS = {
  de: 'de',
  fr: 'fr',
  es: 'es',
  it: 'it',
  nl: 'nl',
  pt: 'pt_BR',
  'pt-br': 'pt_BR',
  'pt-pt': 'pt_BR',
  'en-gb': 'en_GB',
  'es-419': 'es_419',
  'es-mx': 'es_419',
  'es-ar': 'es_419',
  'es-cl': 'es_419',
  'es-co': 'es_419',
  'es-pe': 'es_419',
};

const PLATE_FOR_LOCALE = {
  de: 'de16',
  fr: 'fr16',
  es: 'es16',
  es_419: 'es16',
  it: 'it16',
  nl: 'nl16',
  pt_BR: 'pt16',
};

let fallbackPack = null;

export function uiLocale() {
  const raw = (typeof chrome !== 'undefined' && chrome.i18n?.getUILanguage)
    ? chrome.i18n.getUILanguage()
    : (typeof navigator !== 'undefined' ? navigator.language : 'en');
  const lower = String(raw || 'en').toLowerCase().replace('_', '-');
  if (ALIAS[lower]) {
    return ALIAS[lower];
  }
  const prefix = lower.split('-')[0];
  return ALIAS[prefix] || 'en';
}

/** First-run plate that matches the browser / Chrome UI language. */
export function suggestedPlate(locale = uiLocale()) {
  return PLATE_FOR_LOCALE[locale] || 'en16f';
}

export async function initI18n() {
  if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
    return;
  }
  const locale = uiLocale();
  const candidates = [`../_locales/${locale}/messages.json`, '../_locales/en/messages.json'];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        fallbackPack = await res.json();
        return;
      }
    } catch (e) {
      // Try the next candidate.
    }
  }
  fallbackPack = {};
}

export function t(key) {
  if (typeof chrome !== 'undefined' && chrome.i18n?.getMessage) {
    const msg = chrome.i18n.getMessage(key);
    if (msg) {
      return msg;
    }
  }
  return fallbackPack?.[key]?.message || key;
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-title]').forEach((node) => {
    node.title = t(node.dataset.i18nTitle);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  const pageKey = document.body?.dataset.pageTitle;
  if (pageKey) {
    document.title = t(pageKey);
  }
  document.documentElement.lang = uiLocale().split('_')[0];
}

export function plateTitle(plate) {
  const key = `plate_${plate.id}`;
  const localized = t(key);
  return localized === key ? plate.title : localized;
}
