import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'ru', 'es'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
