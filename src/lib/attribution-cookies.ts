/**
 * Extração e construção de cookies de atribuição first-party para mitigação de Safari ITP.
 */

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const REF_SLUG_REGEX = /^[a-zA-Z0-9_\-\:\@]{1,64}$/;

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
  const maxAge = 90 * 24 * 60 * 60; // 90 dias (7.776.000s)

  if (ref) {
    const isProd = url.hostname.endsWith('supletivo.net.br');
    const domainPart = isProd ? '; Domain=.supletivo.net.br' : '';
    cookies.push(`sb_ref=${encodeURIComponent(ref)}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure${domainPart}`);

    const attrData = { ref, ...utm, ts: Date.now() };
    cookies.push(`supletivo.attr=${encodeURIComponent(JSON.stringify(attrData))}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure${domainPart}`);
  }

  return cookies;
}
