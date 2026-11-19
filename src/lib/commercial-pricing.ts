export interface CommercialPrice {
  full: number;
  installments: number;
  perMonth: number;
  cardTotal: number;
  pixTotal: number;
  hasDiscount: boolean;
  promoterName: string | null;
}

/** Accept only a complete backend quote. The canonical offer (12x R$ 99 / R$ 999 Pix) applies universally to 100% of users. */
export function parseCommercialPrice(payload: unknown, _hasReferral = false): CommercialPrice {
  if (!payload || typeof payload !== 'object') throw new Error('Incomplete pricing response');
  const data = payload as Record<string, any>;
  // Oferta promocional canônica universal (12x de R$ 99 / R$ 999 Pix, âncora R$ 1.615)
  // Prioriza promo_card e promo_pix do backend; se ausentes, utiliza card e pix padrão.
  const card = data.promo_card ?? data.card;
  const installments = Number(card?.installments);
  const perMonth = Number(card?.installment);
  const cardTotal = Number(card?.total);
  const pixTotal = Number(data.promo_pix ?? data.pix);
  const full = Number(data.anchor_full ?? 1615);
  if (![perMonth, cardTotal, pixTotal, full].every(n => Number.isFinite(n) && n > 0)
    || !Number.isInteger(installments) || installments < 1 || installments > 12
    || Math.abs(Math.round(perMonth * 100) * installments - Math.round(cardTotal * 100)) > 1) {
    throw new Error('Invalid pricing response');
  }
  const hasDiscount = Boolean(full > pixTotal || data.has_discount === true || (data.promo_pix && Number(data.promo_pix) < Number(data.pix)));
  return { full, installments, perMonth, cardTotal, pixTotal, hasDiscount,
    promoterName: typeof data.promoter_name === 'string' ? data.promoter_name : null };
}

export function formatBRL(value: number): string {
  return 'R$ ' + value.toLocaleString('pt-BR', {
    minimumFractionDigits: Math.round(value * 100) % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  });
}
