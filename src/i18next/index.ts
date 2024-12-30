import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { uk } from './locales';
import { Languages } from './types';

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      [Languages.UK]: {
        translation: uk,
      },
    },
    fallbackLng: Languages.UK,
    supportedLngs: [Languages.UK],
    keySeparator: '.',
    interpolation: {
      escapeValue: true,
    },
  });

export default i18n;
