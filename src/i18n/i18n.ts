import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './locales/es.json'
import and from './locales/and.json'
import ca from './locales/ca.json'
import eu from './locales/eu.json'
import va from './locales/va.json'
import gl from './locales/gl.json'
import ary from './locales/ary.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      and: { translation: and },
      ca: { translation: ca },
      eu: { translation: eu },
      va: { translation: va },
      gl: { translation: gl },
      ary: { translation: ary },
    },
    fallbackLng: 'es',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
