import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://scitem.net',
  redirects: { '/check/circular-gifted/': '/check/post-circular/' },
  integrations: [sitemap({ filter: (page) => !page.includes('/check/') })],
});
