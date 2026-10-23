// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import seoFiles from './integrations/seo-files.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// SITE = domínio canônico (canonical, OG, sitemap.xml, robots.txt).
// Configurável via .env ou variável de ambiente no build.
const SITE = process.env.SITE ?? 'https://supletivo.net.br';

export default defineConfig({
  site: SITE,
  output: 'static',
  adapter: cloudflare(),
  trailingSlash: 'ignore',
  build: {
    // CSS pequeno → inline no HTML, elimina request render-blocking
    inlineStylesheets: 'always',
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Archivo Black',
      cssVariable: '--font-archivo-black',
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [react(), svelte(), seoFiles()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
