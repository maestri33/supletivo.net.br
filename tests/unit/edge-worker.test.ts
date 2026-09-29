// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import worker, { buildAttributionCookies, parseAttributionParams } from '../../src/worker';

describe('Supletivo Main Landing Edge Worker Attribution & Safari ITP Mitigation', () => {
  it('parses ref and tracking query parameters from URL', () => {
    const url = new URL('https://supletivo.net.br/?ref=top-afiliado&utm_source=instagram&utm_campaign=blackfriday&gclid=xyz');
    const { ref, utm } = parseAttributionParams(url);

    expect(ref).toBe('top-afiliado');
    expect(utm).toEqual({
      utm_source: 'instagram',
      utm_campaign: 'blackfriday',
      gclid: 'xyz',
    });
  });

  it('builds 90-day HTTP Set-Cookie headers for Safari ITP mitigation', () => {
    const url = new URL('https://supletivo.net.br/?ref=promotor-vip&utm_source=tiktok');
    const cookies = buildAttributionCookies(url);

    expect(cookies).toHaveLength(2);
    // sb_ref cookie
    expect(cookies[0]).toContain('sb_ref=promotor-vip');
    expect(cookies[0]).toContain('Max-Age=7776000');
    expect(cookies[0]).toContain('SameSite=Lax');
    expect(cookies[0]).toContain('Secure');
    expect(cookies[0]).toContain('Domain=.supletivo.net.br');

    // supletivo.attr cookie
    expect(cookies[1]).toContain('supletivo.attr=');
    expect(cookies[1]).toContain('Max-Age=7776000');
    expect(cookies[1]).toContain('Domain=.supletivo.net.br');
  });

  it('returns empty cookies when no ref is present', () => {
    const url = new URL('https://supletivo.net.br/sobre');
    const cookies = buildAttributionCookies(url);

    expect(cookies).toHaveLength(0);
  });

  it('injects Set-Cookie headers on worker fetch response', async () => {
    const mockAssetFetch = vi.fn().mockResolvedValue(
      new Response('<html>mock page</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      })
    );

    const request = new Request('https://supletivo.net.br/?ref=afiliado-curitiba');
    const response = await worker.fetch(request, { ASSETS: { fetch: mockAssetFetch } });

    expect(response.status).toBe(200);
    const setCookie = response.headers.get('set-cookie');
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain('sb_ref=afiliado-curitiba');
  });

  it('enforces immutable Cache-Control on /_astro/ and /fonts/ assets', async () => {
    const mockAssetFetch = vi.fn().mockResolvedValue(
      new Response('console.log("asset")', {
        status: 200,
        headers: { 'Content-Type': 'application/javascript' },
      })
    );

    const request = new Request('https://supletivo.net.br/_astro/client.bundle.js');
    const response = await worker.fetch(request, { ASSETS: { fetch: mockAssetFetch } });

    expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(response.headers.get('strict-transport-security')).toBeTruthy();
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('x-frame-options')).toBe('DENY');
  });

  it('enforces s-maxage edge caching on HTML responses', async () => {
    const mockAssetFetch = vi.fn().mockResolvedValue(
      new Response('<!DOCTYPE html><html><body>Supletivo</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    );

    const request = new Request('https://supletivo.net.br/');
    const response = await worker.fetch(request, { ASSETS: { fetch: mockAssetFetch } });

    expect(response.headers.get('cache-control')).toBe('public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  });
});
