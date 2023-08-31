import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './translations/en.json';
import es from './translations/es.json';
import ch from './translations/ch.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  ch: { translation: ch },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: ['en', 'es', 'ch'],
    debug: true,
  });

export default i18n;
