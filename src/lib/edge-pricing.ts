import { parseCommercialPrice, formatBRL, type CommercialPrice } from './commercial-pricing';

interface RewriteElement {
  getAttribute(name: string): string | null;
  setInnerContent(content: string, options?: { html: boolean }): void;
  setAttribute(name: string, value: string): void;
  append(content: string, options?: { html: boolean }): void;
}
interface RewriteText { text: string; lastInTextNode: boolean; remove(): void; after(content: string): void }
declare const HTMLRewriter: { new(): {
  on(selector: string, handler: { element?: (el: RewriteElement) => void; text?: (text: RewriteText) => void }): any;
  transform(response: Response): Response;
} };

export function referralFromRequest(request: Request): string | null {
  const url = new URL(request.url);
  if (url.searchParams.has('ref')) return url.searchParams.get('ref');
  const cookie = (request.headers.get('cookie') || '').split(';').find(part => part.trim().startsWith('sb_ref='));
  try { return cookie ? decodeURIComponent(cookie.trim().slice(7)) : null; } catch { return null; }
}

export async function fetchBackendPricing(ref: string | null): Promise<Record<string, unknown>> {
  const url = new URL('https://backend.supletivo.net.br/api/v1/clients/pricing');
  if (ref) url.searchParams.set('ref', ref);
  const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error('Pricing unavailable');
  const payload = await response.json() as Record<string, unknown>;
  parseCommercialPrice(payload, Boolean(ref));
  return payload;
}

function updateStructuredPrices(node: any, price: CommercialPrice | null): any {
  if (Array.isArray(node)) return node.map(item => updateStructuredPrices(item, price));
  if (!node || typeof node !== 'object') return node;
  const output = { ...node };
  for (const [key, value] of Object.entries(output)) {
    if (!price && key === 'offers') delete output[key];
    else output[key] = updateStructuredPrices(value, price);
  }
  if (price && output['@type'] === 'AggregateOffer') {
    output.lowPrice = String(price.pixTotal);
    output.highPrice = String(price.cardTotal);
  }
  if (price && output['@type'] === 'Offer' && 'price' in output) {
    output.price = String(/cart|card|\d+x/i.test(String(output.name || output.category || '')) ? price.cardTotal : price.pixTotal);
  }
  return output;
}

/** Rewrite every monetary display from the same live backend quote, including no-JS HTML. */
export function rewritePricing(response: Response, payload: Record<string, unknown> | null, ref: string | null): Response {
  if (typeof HTMLRewriter === 'undefined') return response;
  const price = payload ? parseCommercialPrice(payload, Boolean(ref)) : null;
  const unavailable = 'Condições temporariamente indisponíveis';
  const month = price ? formatBRL(price.perMonth) : unavailable;
  const card = price ? `${price.installments}x de ${month}` : unavailable;
  const rewriter = new HTMLRewriter();
  rewriter.on('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]', { element(element) {
    const description = element.getAttribute('content') || '';
    if (!/R\$|\d+x\b/.test(description)) return;
    element.setAttribute('content', price
      ? description.replace(/\d{1,2}x\s+(?:de\s+)?R\$\s*[\d.,]+/g, card).replace(/R\$\s*[\d.,]+\s*(?=no Pix|via Pix|à vista)/gi, formatBRL(price.pixTotal))
      : 'Conheça o Supletivo Brasil e consulte as condições comerciais assim que estiverem disponíveis.');
  } });
  const isPromoEffective = Boolean(price?.hasDiscount && (price.full - price.pixTotal > 0));
  const savings = isPromoEffective && price
    ? price.full - price.pixTotal
    : (price ? Math.max(0, Math.round((price.cardTotal - price.pixTotal) * 100) / 100) : 0);

  rewriter.on('[data-price-old], [data-promo-scarcity], [data-card-aleta], [data-card-stamp], [data-promo-badge], [data-floating-promo], [data-promoter-banner]', { element(element) {
    const classes = (element.getAttribute('class') || '').split(/\s+/).filter(Boolean).filter(name => name !== 'hidden');
    if (!isPromoEffective) classes.push('hidden');
    element.setAttribute('class', classes.join(' '));
  } });
  const replace = (selector: string, text: string) => rewriter.on(selector, { element: element => element.setInnerContent(text, { html: true }) });
  replace('[data-price-card-line]', card);
  replace('[data-price-card-line-short], .sticky-price strong', price ? `${price.installments}x ${month}` : unavailable);
  replace('[data-price-pix-val]', price ? formatBRL(price.pixTotal) : unavailable);
  replace('[data-price-per-month], [data-price-digits]', month);
  replace('[data-price-sr]', price ? `${month} por mês` : unavailable);
  replace('[data-price-old-val]', price ? formatBRL(price.full) : unavailable);
  replace('[data-price-card-total]', price ? formatBRL(price.cardTotal) : unavailable);
  replace('[data-price-mode-line]', price ? `em ${price.installments}x no cartão de crédito` : 'Tente novamente em instantes.');
  if (isPromoEffective && price) {
    replace('[data-price-save-line]', `— você economiza <span data-price-savings>${formatBRL(savings)}</span>`);
  } else if (price && savings > 0) {
    replace('[data-price-save-line]', `— você economiza <span data-price-savings>${formatBRL(savings)}</span> no Pix`);
  }
  replace('[data-price-savings]', savings > 0 ? formatBRL(savings) : '');
  if (price?.promoterName) {
    replace('[data-promoter-name]', price.promoterName);
  }
  replace('#pricing-title', isPromoEffective && price ? `Menos de ${formatBRL(Math.ceil(price.perMonth / 100) * 100)} por mês.` : 'Invista no seu futuro com segurança.');
  rewriter.on('body', { element(element) {
    element.setAttribute('data-pricing-state', price ? 'available' : 'unavailable');
    if (payload) element.append(`<script id="sb-pricing" type="application/json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`, { html: true });
  } });
  let json = '';
  rewriter.on('script[type="application/ld+json"]', { text(chunk) {
    json += chunk.text;
    chunk.remove();
    if (chunk.lastInTextNode) {
      try { chunk.after(JSON.stringify(updateStructuredPrices(JSON.parse(json), price)).replace(/</g, '\\u003c')); } catch { /* Drop malformed structured data. */ }
      json = '';
    }
  } });
  return rewriter.transform(response);
}
