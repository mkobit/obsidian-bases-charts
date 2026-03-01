import i18next from 'i18next'
import en from './locales/en.json'

export async function initializeI18n(_?: unknown): Promise<void> {
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
