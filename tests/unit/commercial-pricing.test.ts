import { describe, expect, it } from 'vitest';
import { parseCommercialPrice } from '../../src/lib/commercial-pricing';

const quote = { pix: '1615.00', card: { installments: 12, installment: '159.90', total: '1918.80' },
  promo_pix: '999.00', promo_card: { installments: 12, installment: '99.00', total: '1188.00' }, anchor_full: '1615.00', has_discount: false };

describe('backend commercial quote contract', () => {
  it('keeps regular prices on direct access without referral', () => {
    const directPrice = parseCommercialPrice(quote, false);
    expect(directPrice.hasDiscount).toBe(false);
    expect(directPrice.pixTotal).toBe(1615);
    expect(directPrice.perMonth).toBe(159.9);
  });
  it('applies promotional prices (12x R$ 99 / R$ 999 Pix) when referral is present', () => {
    const promoPrice = parseCommercialPrice(quote, true);
    expect(promoPrice.hasDiscount).toBe(true);
    expect(promoPrice.perMonth).toBe(99);
    expect(promoPrice.pixTotal).toBe(999);
    expect(promoPrice.full - promoPrice.pixTotal).toBe(616);
  });
  it('rejects missing fields and conflicting card totals rather than inventing a price', () => {
    expect(() => parseCommercialPrice({ ...quote, card: { ...quote.card, total: '1000' } })).toThrow();
    expect(() => parseCommercialPrice({ pix: '999' })).toThrow();
  });
});
