import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://scitem.net',
  redirects: { '/check/teacher': '/teacher', '/parents': '/' },
  integrations: [sitemap({ customPages: ['https://scitem.net/shop/'], filter: (page) => !page.includes('/check/') && !page.includes('/teacher') })],
});
