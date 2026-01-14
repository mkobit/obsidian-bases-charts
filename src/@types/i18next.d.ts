import 'i18next'
import type en from '../lang/locales/en.json'

declare module 'i18next' {

  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof en
    }
  }
}
