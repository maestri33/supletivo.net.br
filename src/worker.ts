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
    const response = await env.ASSETS.fetch(request);

    // If query string has ref, set first-party HTTP Set-Cookie headers to defeat Safari ITP
    const cookies = buildAttributionCookies(url);
    if (cookies.length > 0 && response.ok) {
      const headers = new Headers(response.headers);
      for (const cookie of cookies) {
        headers.append('Set-Cookie', cookie);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};
