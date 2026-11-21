// Statische site: Astro bouwt alles naar dist/, de workflow zet dat op mijn.host.
// Zie docs/superpowers/specs/2026-11-21-website-design.md.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mvesign.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
