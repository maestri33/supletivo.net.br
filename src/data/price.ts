/**
 * Build snapshot from the canonical backend. Invalid/unavailable quotes stop the build.
 * The Worker replaces monetary displays with a fresh quote on every HTML request.
 */
import { BACKEND_URL } from '../config';
import { parseCommercialPrice, formatBRL } from '../lib/commercial-pricing';

const ENDPOINT = `${BACKEND_URL}/api/v1/clients/pricing`;


export interface Price {
  /** preço cheio, riscado ("de R$ X") — âncora de marketing */
  full: number;
  /** número de parcelas no cartão */
  installments: number;
  /** valor de cada parcela no cartão */
  perMonth: number;
  /** total no cartão (parcelas × valor) */
  cardTotal: number;
  /** total à vista no Pix */
  pixTotal: number;
}

async function loadPrice(): Promise<Price> {
    const res = await fetch(ENDPOINT, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseCommercialPrice(await res.json());
}

export const PRICE: Price = await loadPrice();

/** economia do Pix vs. preço cheio (>= 0) */
export const savings = Math.max(0, PRICE.full - PRICE.pixTotal);

/** Economia padrão do Pix vs. parcelado no cartão (12x R$ 159,90 = R$ 1.918,80 vs R$ 1.615 = R$ 303,80) */
export const standardPixSavings = Math.max(0, Math.round((PRICE.cardTotal - PRICE.pixTotal) * 100) / 100);

/** "R$ 1.615" — NBSP entre símbolo e número, sem casas quando inteiro */
export function brl(value: number): string {
  return formatBRL(value);
}

export const perMonthBRL = brl(PRICE.perMonth);
export const pixBRL = brl(PRICE.pixTotal);
export const fullBRL = brl(PRICE.full);
export const cardTotalBRL = brl(PRICE.cardTotal);
export const savingsBRL = brl(savings);
export const standardPixSavingsBRL = brl(standardPixSavings);

/** Condição Promocional Oficial de Indicação (?ref=) */
export const PROMO_PRICE = {
  installments: 12,
  perMonth: 99,
  cardTotal: 1188,
  pixTotal: 999,
  full: 1615,
};
export const promoSavings = PROMO_PRICE.full - PROMO_PRICE.pixTotal; // R$ 616
export const promoSavingsBRL = brl(promoSavings); // "R$ 616"
export const promoPerMonthBRL = brl(PROMO_PRICE.perMonth);
export const promoPixBRL = brl(PROMO_PRICE.pixTotal);
export const promoCardTotalBRL = brl(PROMO_PRICE.cardTotal);
export const promoCardLine = `${PROMO_PRICE.installments}x de ${promoPerMonthBRL}`;

/** "12x de R$ 159,90" */
export const cardLine = `${PRICE.installments}x de ${perMonthBRL}`;
/** "12x R$ 159,90" (versão curta, sticky) */
export const cardLineShort = `${PRICE.installments}x ${perMonthBRL}`;
/** "Menos de R$ 200" — teto de marketing arredondando a parcela pra cima */
export const underPerMonthBRL = brl(Math.ceil(PRICE.perMonth / 100) * 100);
