import type { APIRoute } from 'astro';
import { fetchBackendPricing } from '../../lib/edge-pricing';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const ref = url.searchParams.get('ref');
  try {
    const data = await fetchBackendPricing(ref);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Condições temporariamente indisponíveis. Tente novamente.' }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
};
