import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import es from './translations/es.json';
import ch from './translations/ch.json';
import fr from './translations/fr.json';
import ua from './translations/ua.json';
import hy from './translations/hy.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  ch: { translation: ch },
  fr: { translation: fr },
  ua: { translation: ua },
  hy: { translation: hy },
};

const languages = Object.keys(resources);
const defaultLanguage = 'en';

const storedLanguage = localStorage.getItem('i18nextLng') || defaultLanguage;
const savedLanguage = languages.includes(storedLanguage)
  ? storedLanguage
  : defaultLanguage;

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: ['en', 'es', 'ch', 'fr', 'ua', 'hy'],
  debug: true,
});

export default i18n;
