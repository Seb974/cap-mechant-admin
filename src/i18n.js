import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

i18n.use(Backend)
    .use(initReactI18next)
    .init({
        lng: 'fr',
        backend: {
            loadPath: '/assets/i18n/{{ns}}/{{lng}}.json'
        },
        fallbackLng: 'fr',
        debug: false,
        ns: 'translations',
        defaultNS: 'translations',
        keySeparator: false,
        initImmediate: false,
        interpolation: {
            escapeValue: false,
            formatSeparator: ','
        },
        react: {
            wait: true
        }
    });

export default i18n