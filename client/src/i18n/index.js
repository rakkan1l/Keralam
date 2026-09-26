import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ml from './locales/ml.json';

// English and Malayalam ship with the MVP. Other languages are declared so the
// architecture (language switcher, RTL handling, server overrides) is ready for them;
// add a locale JSON file and flip `enabled` to turn one on.
export const LANGUAGES = [
  { code: 'en', label: 'English', enabled: true, dir: 'ltr' },
  { code: 'ml', label: 'മലയാളം', enabled: true, dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी', enabled: false, dir: 'ltr' },
  { code: 'ta', label: 'தமிழ்', enabled: false, dir: 'ltr' },
  { code: 'kn', label: 'ಕನ್ನಡ', enabled: false, dir: 'ltr' },
  { code: 'ar', label: 'العربية', enabled: false, dir: 'rtl' },
  { code: 'fr', label: 'Français', enabled: false, dir: 'ltr' },
  { code: 'de', label: 'Deutsch', enabled: false, dir: 'ltr' },
  { code: 'ru', label: 'Русский', enabled: false, dir: 'ltr' },
];

const STORAGE_KEY = 'kt_lang';

function initialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored && l.enabled)) return stored;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.startsWith('ml') ? 'ml' : 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ml: { translation: ml } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnObjects: true,
});

function applyDocumentLanguage(lng) {
  const lang = LANGUAGES.find((l) => l.code === lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lang?.dir || 'ltr';
}
applyDocumentLanguage(i18n.language);

i18n.on('languageChanged', (lng) => {
  applyDocumentLanguage(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

/** Merge admin-managed overrides from the API over the bundled strings. */
export async function loadServerOverrides(lng, fetcher) {
  try {
    const data = await fetcher(lng);
    const flat = data?.common || {};
    const nested = {};
    for (const [key, value] of Object.entries(flat)) {
      key.split('.').reduce((acc, part, i, arr) => {
        if (i === arr.length - 1) acc[part] = value;
        else acc[part] = acc[part] || {};
        return acc[part];
      }, nested);
    }
    if (Object.keys(nested).length) i18n.addResourceBundle(lng, 'translation', nested, true, true);
  } catch {
    /* overrides are optional */
  }
}

export default i18n;
