import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';

export const LANGUAGE_STORAGE_KEY = 'flashreel-admin-lang';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
    zh: { translation: zh }
  },
  lng: localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'zh',
  fallbackLng: 'en',
  supportedLngs: ['en', 'vi', 'zh'],
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
