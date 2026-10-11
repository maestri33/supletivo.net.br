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

/** "R$ 1.615" — NBSP entre símbolo e número, sem casas quando inteiro */
export function brl(value: number): string {
  return formatBRL(value);
}

export const perMonthBRL = brl(PRICE.perMonth);
export const pixBRL = brl(PRICE.pixTotal);
export const fullBRL = brl(PRICE.full);
export const cardTotalBRL = brl(PRICE.cardTotal);
export const savingsBRL = brl(savings);

/** "12x de R$ 99" */
export const cardLine = `${PRICE.installments}x de ${perMonthBRL}`;
/** "12x R$ 99" (versão curta, sticky) */
export const cardLineShort = `${PRICE.installments}x ${perMonthBRL}`;
/** "Menos de R$ 100" — teto de marketing arredondando a parcela pra cima */
export const underPerMonthBRL = brl(Math.ceil(PRICE.perMonth / 100) * 100);
