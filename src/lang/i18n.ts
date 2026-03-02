import i18next from 'i18next'
import en from './locales/en.json'

// eslint-disable-next-line functional/functional-parameters
export async function initializeI18n(): Promise<void> {
  await i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: en,
      },
    },
  })
}
