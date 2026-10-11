import { describe, expect, it } from 'vitest';
import { parseCommercialPrice } from '../../src/lib/commercial-pricing';

const quote = { pix: '1615.00', card: { installments: 12, installment: '159.90', total: '1918.80' },
  promo_pix: '999.00', promo_card: { installments: 12, installment: '99.00', total: '1188.00' }, anchor_full: '1615.00', has_discount: false };

describe('backend commercial quote contract', () => {
  it('keeps regular prices when an invalid referral is supplied', () => {
    expect(parseCommercialPrice(quote, true).pixTotal).toBe(1615);
  });
  it('uses referral prices only after backend acceptance', () => {
    expect(parseCommercialPrice({ ...quote, has_discount: true }, true).perMonth).toBe(99);
    expect(parseCommercialPrice({ ...quote, has_discount: true }, false).perMonth).toBe(159.9);
  });
  it('rejects missing fields and conflicting card totals rather than inventing a price', () => {
    expect(() => parseCommercialPrice({ ...quote, card: { ...quote.card, total: '1000' } })).toThrow();
    expect(() => parseCommercialPrice({ pix: '999' })).toThrow();
  });
});
