import type { APIRoute } from 'astro';
import { buildAttributionCookies, REF_SLUG_REGEX } from '../../lib/attribution-cookies';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug;
  if (!slug || !REF_SLUG_REGEX.test(slug)) {
    return new Response('Not Found', { status: 404 });
  }

  const redirectUrl = new URL('/', url.origin);
  redirectUrl.searchParams.set('ref', slug);
  for (const [key, val] of url.searchParams.entries()) {
    if (key !== 'ref') redirectUrl.searchParams.set(key, val);
  }

  const redirectCookies = buildAttributionCookies(redirectUrl);
  const redirectHeaders = new Headers({
    Location: redirectUrl.toString(),
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });
  for (const c of redirectCookies) {
    redirectHeaders.append('Set-Cookie', c);
  }

  return new Response(null, {
    status: 302,
    headers: redirectHeaders,
  });
};
