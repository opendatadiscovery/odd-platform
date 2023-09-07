import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import es from './translations/es.json';
import ch from './translations/ch.json';
import fr from './translations/fr.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  ch: { translation: ch },
  fr: { translation: fr },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: ['en', 'es', 'ch', 'fr'],
  debug: true,
});

export default i18n;
