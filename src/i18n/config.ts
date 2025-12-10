import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationJA from './locales/ja.json';
import translationEN from './locales/en.json';

const resources = {
  ja: {
    translation: translationJA,
  },
  en: {
    translation: translationEN,
  },
};

i18n
  .use(LanguageDetector) // ブラウザの言語を自動検出
  .use(initReactI18next) // React用の初期化
  .init({
    resources,
    fallbackLng: 'ja', // デフォルト言語
    lng: 'ja', // 初期言語
    debug: false, // 本番環境ではfalse
    interpolation: {
      escapeValue: false, // Reactは既にXSS対策済み
    },
    detection: {
      // 言語検出の優先順位
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
