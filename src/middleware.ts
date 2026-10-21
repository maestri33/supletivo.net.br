import { defineMiddleware } from 'astro:middleware';
import { buildAttributionCookies, UUID_REGEX, REF_SLUG_REGEX } from './lib/attribution-cookies';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const pathname = url.pathname;

  // 1. Suporte a Links Amigáveis de Afiliados via Path (/ref/SLUG ou UUID direto)
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  if (cleanPath.length > 0 && !cleanPath.includes('.')) {
    let refCandidate: string | null = null;
    if (cleanPath.toLowerCase().startsWith('ref/')) {
      const slug = cleanPath.slice(4);
      if (REF_SLUG_REGEX.test(slug)) {
        refCandidate = slug;
      }
    } else if (UUID_REGEX.test(cleanPath)) {
      refCandidate = cleanPath;
    }

    if (refCandidate) {
      const redirectUrl = new URL('/', url.origin);
      redirectUrl.searchParams.set('ref', refCandidate);
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
    }
  }

  const response = await next();

  // 2. HTTP Security Headers Hardening
  if (!response.headers.has('Strict-Transport-Security')) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  if (!response.headers.has('X-Content-Type-Options')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }
  if (!response.headers.has('X-Frame-Options')) {
    response.headers.set('X-Frame-Options', 'DENY');
  }
  if (!response.headers.has('Referrer-Policy')) {
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // 3. Safari ITP Mitigation First-Party Cookies (?ref=)
  const cookies = buildAttributionCookies(url);
  if (cookies.length > 0 && response.ok) {
    for (const cookie of cookies) {
      response.headers.append('Set-Cookie', cookie);
    }
  }

  // 4. Cache-Control para HTML
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    response.headers.set('Cache-Control', 'private, no-cache, must-revalidate');
  }

  return response;
});
