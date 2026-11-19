import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Páginas fora do sitemap (404 e rotas redirecionadas).
const EXCLUDE = new Set(['404/']);

/**
 * Normaliza o identificador da página vindo do Astro (string legada ou objeto { pathname } no Astro 5+).
 * @param {string | { pathname: string }} p
 * @returns {string}
 */
function toPathname(p) {
  if (typeof p === 'string') return p;
  if (p && typeof p.pathname === 'string') return p.pathname;
  return '';
}

/**
 * Gera sitemap.xml e robots.txt no build, a partir do `site` do astro.config.
 * @returns {import('astro').AstroIntegration}
 */
export default function seoFiles() {
  /** @type {string | undefined} */
  let site;

  return {
    name: 'seo-files',
    hooks: {
      'astro:config:done': ({ config }) => {
        site = config.site;
      },
      'astro:build:done': async ({ dir, pages, logger }) => {
        if (!site) {
          logger.warn('`site` não configurado — sitemap.xml/robots.txt não gerados.');
          return;
        }

        const today = new Date().toISOString().slice(0, 10);

        const normalizedPages = pages
          .map(toPathname)
          .filter((pathname) => pathname !== undefined && pathname !== null && !EXCLUDE.has(pathname));

        // Coloca a home primeiro, seguida pelas demais páginas ordenadas
        normalizedPages.sort((a, b) => {
          if (a === '') return -1;
          if (b === '') return 1;
          return a.localeCompare(b);
        });

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${normalizedPages
          .map(
            (pathname) =>
              `  <url>\n    <loc>${new URL(pathname, site).href}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
          )
          .join('\n')}\n</urlset>\n`;

        const robots = `User-agent: *\nAllow: /\n\nSitemap: ${new URL('./sitemap.xml', site).href}\n`;

        await writeFile(fileURLToPath(new URL('./sitemap.xml', dir)), sitemap, 'utf-8');
        await writeFile(fileURLToPath(new URL('./robots.txt', dir)), robots, 'utf-8');
        logger.info('sitemap.xml e robots.txt gerados com sucesso.');
      },
    },
  };
}
