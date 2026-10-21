import { fetchBackendPricing, referralFromRequest, rewritePricing } from './lib/edge-pricing';
import { buildAttributionCookies, parseAttributionParams, UUID_REGEX, REF_SLUG_REGEX } from './lib/attribution-cookies';

export { buildAttributionCookies, parseAttributionParams };

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const ref = referralFromRequest(request);
    if (pathname === '/api/pricing') {
      if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
      try {
        return Response.json(await fetchBackendPricing(ref), { headers: { 'Cache-Control': 'no-store' } });
      } catch {
        return Response.json({ error: 'Condições temporariamente indisponíveis. Tente novamente.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
      }
    }
    const response = await env.ASSETS.fetch(request);

    // 0. Normalização Canônica de Barra Final (converte 307 temporário do Cloudflare Assets em 301 permanente)
    if (response.status === 307 || response.status === 308) {
      const location = response.headers.get('Location');
      if (location) {
        const redirectHeaders = new Headers(response.headers);
        redirectHeaders.set('Location', location);
        redirectHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
        if (!redirectHeaders.has('Strict-Transport-Security')) {
          redirectHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        return new Response(null, {
          status: 301,
          statusText: 'Moved Permanently',
          headers: redirectHeaders,
        });
      }
    }

    // 0.1 Suporte a Links Amigáveis de Afiliados via Path (/ref/SLUG ou UUID direto)
    if (response.status === 404) {
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
    }

    const headers = new Headers(response.headers);
    const contentType = response.headers.get('content-type') || '';

    if (pathname.startsWith('/_astro/') || pathname.startsWith('/fonts/')) {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (pathname.startsWith('/images/') || pathname.match(/\.(png|jpg|jpeg|webp|svg|ico)$/i)) {
      headers.set('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
    } else if (contentType.includes('text/html')) {
      headers.set('Cache-Control', 'private, no-cache, must-revalidate');
      headers.delete('ETag');
      headers.delete('Content-Length');
    }

    // 2. HTTP Security Headers Hardening
    if (!headers.has('Strict-Transport-Security')) {
      headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    if (!headers.has('X-Content-Type-Options')) {
      headers.set('X-Content-Type-Options', 'nosniff');
    }
    if (!headers.has('X-Frame-Options')) {
      headers.set('X-Frame-Options', 'DENY');
    }
    if (!headers.has('Referrer-Policy')) {
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // 3. Safari ITP Mitigation First-Party Cookies (?ref=)
    const cookies = buildAttributionCookies(url);
    if (cookies.length > 0 && response.ok) {
      for (const cookie of cookies) {
        headers.append('Set-Cookie', cookie);
      }
    }

    const result = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    if (response.ok && contentType.includes('text/html')) {
      const pricing = await fetchBackendPricing(ref).catch((error: unknown) => {
        console.warn('Canonical pricing unavailable:', error instanceof Error ? error.message : 'unknown transport error');
        return null;
      });
      return rewritePricing(result, pricing, ref);
    }
    return result;
  },
};
