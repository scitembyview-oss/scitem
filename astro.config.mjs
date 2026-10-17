import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://scitem.net',
  redirects: { '/check/teacher': '/teacher' },
  integrations: [sitemap({ filter: (page) => !page.includes('/check/') && !page.includes('/teacher') })],
});
