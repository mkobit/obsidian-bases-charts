import i18next from 'i18next'
import en from './locales/en.json'

export async function initializeI18n(_?: unknown): Promise<void> {
  // eslint-disable-next-line functional/no-expression-statements
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
