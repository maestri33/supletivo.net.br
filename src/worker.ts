export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export function parseAttributionParams(url: URL): { ref: string | null; utm: Record<string, string> } {
  const ref = url.searchParams.get('ref');
  const utm: Record<string, string> = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith('utm_') || key === 'gclid' || key === 'fbclid') {
      utm[key] = value;
    }
  }
  return { ref, utm };
}

export function buildAttributionCookies(url: URL): string[] {
  const { ref, utm } = parseAttributionParams(url);
  const cookies: string[] = [];
  const maxAge = 90 * 24 * 60 * 60; // 90 days (7,776,000s)

  if (ref) {
    const isProd = url.hostname.endsWith('supletivo.net.br');
    const domainPart = isProd ? '; Domain=.supletivo.net.br' : '';
    cookies.push(`sb_ref=${encodeURIComponent(ref)}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure${domainPart}`);

    const attrData = { ref, ...utm, ts: Date.now() };
    cookies.push(`supletivo.attr=${encodeURIComponent(JSON.stringify(attrData))}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure${domainPart}`);
  }

  return cookies;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const response = await env.ASSETS.fetch(request);

    // 0. Suporte a Links Amigáveis de Afiliados via Path (/REF ou /ref/REF)
    if (response.status === 404) {
      const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
      if (cleanPath.length > 0 && !cleanPath.includes('.')) {
        let refCandidate = cleanPath;
        if (cleanPath.toLowerCase().startsWith('ref/')) {
          refCandidate = cleanPath.slice(4);
        }
        if (/^[a-zA-Z0-9_\-\:\@]+$/.test(refCandidate)) {
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
      headers.set('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
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

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
