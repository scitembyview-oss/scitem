import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://scitem.net',
  integrations: [sitemap({ filter: (page) => !page.includes('/check/') })],
});
