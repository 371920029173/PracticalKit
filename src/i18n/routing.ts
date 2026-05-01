import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'ru', 'es', 'fr'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
