import 'i18next';
import type en from '../lang/locales/en.json';

declare module 'i18next' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface CustomTypeOptions {
		defaultNS: 'translation';
		resources: {
			translation: typeof en;
		};
	}
}
