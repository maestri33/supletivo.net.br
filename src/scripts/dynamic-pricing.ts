/**
 * Motor de precificação dinâmica por indicação (?ref=) — progressive enhancement.
 *
 * REGRA DE NEGÓCIO:
 * - Sem ?ref=: Exibe o preço normal/cheio oficial (12x de R$ 161 ou R$ 1.615 no Pix),
 *   sem badges de desconto, sem preço riscado e sem alertas de escassez promocional.
 * - Com ?ref=: Desbloqueia o Lote 01 Promocional exclusivo (12x de R$ 99 ou R$ 999 no Pix,
 *   economia de R$ 616), exibe o preço âncora riscado, a barra de escassez das 100 vagas
 *   e ativa o alerta flutuante de consultor.
 */
import { initAttribution, type Attribution } from './attribution';
import { track } from './track';

interface PricingResponse {
  pix: string;
  card: {
    installments: number;
    installment: string;
    total: string;
  };
  promo_pix?: string;
  promo_card?: {
    installments: number;
    installment: string;
    total: string;
  };
  has_discount?: boolean;
  promoter_name?: string | null;
  anchor_full?: string | null;
}

const BACKEND_URL =
  import.meta.env.PUBLIC_BACKEND_URL ??
  (import.meta.env.DEV ? 'http://localhost:8001' : 'https://api.supletivo.net.br');

// Preços padrão oficiais
const REGULAR_PRICE = {
  installments: 12,
  installment: 161,
  pix: 1615,
  anchor: 1932,
};

const PROMO_PRICE = {
  installments: 12,
  installment: 99,
  pix: 999,
  anchor: 1615,
};

function brl(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return (
    'R$ ' +
    value.toLocaleString('pt-BR', {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

function applyPricingToDom(config: {
  installment: number;
  installments: number;
  pix: number;
  anchor: number;
  isPromo: boolean;
  promoterName?: string | null;
}): void {
  const { installment, installments, pix, anchor, isPromo, promoterName } = config;
  const perMonthStr = brl(installment);
  const pixStr = brl(pix);
  const cardLine = `${installments}x de ${perMonthStr}`;
  const underPerMonth = brl(Math.ceil(installment / 100) * 100);
  const savings = Math.max(0, anchor - pix);

  // 1. Título da seção de preços
  const titleEl = document.querySelector<HTMLElement>('#pricing-title');
  if (titleEl) {
    titleEl.textContent = isPromo ? `Menos de ${underPerMonth} por mês.` : `Invista no seu futuro com segurança.`;
  }

  // 2. Dígitos animados e acessibilidade
  const srOnly = document.querySelector<HTMLElement>('[data-price-sr]');
  if (srOnly) srOnly.textContent = `${perMonthStr} por mês`;

  const digitsContainer = document.querySelector<HTMLElement>('[data-price-digits]');
  if (digitsContainer) {
    digitsContainer.innerHTML = '';
    perMonthStr.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'digit';
      span.style.setProperty('--g', String(i));
      span.textContent = ch;
      digitsContainer.appendChild(span);
    });
  }

  // 3. Preço antigo riscado
  const oldWrap = document.querySelector<HTMLElement>('[data-price-old]');
  const oldVal = document.querySelector<HTMLElement>('[data-price-old-val]');
  if (oldVal) oldVal.textContent = brl(anchor);
  if (oldWrap) {
    if (isPromo) {
      oldWrap.classList.remove('hidden');
    } else {
      oldWrap.classList.add('hidden');
    }
  }

  // 4. Valores Pix e economia
  document.querySelectorAll<HTMLElement>('[data-price-pix-val]').forEach((el) => {
    el.textContent = pixStr;
  });

  const saveLine = document.querySelector<HTMLElement>('[data-price-save-line]');
  document.querySelectorAll<HTMLElement>('[data-price-savings]').forEach((el) => {
    el.textContent = brl(savings);
  });
  if (saveLine) {
    if (isPromo && savings > 0) {
      saveLine.classList.remove('hidden');
    } else {
      saveLine.classList.add('hidden');
    }
  }

  // 5. Linhas de parcelamento
  document.querySelectorAll<HTMLElement>('[data-price-card-line]').forEach((el) => {
    el.textContent = cardLine;
  });

  document.querySelectorAll<HTMLElement>('[data-price-per-month]').forEach((el) => {
    el.textContent = perMonthStr;
  });

  const modeLineEl = document.querySelector<HTMLElement>('[data-price-mode-line]');
  if (modeLineEl) {
    modeLineEl.textContent = `em ${installments}x no cartão de crédito`;
  }

  const stickyStrong = document.querySelector<HTMLElement>('.sticky-price strong');
  if (stickyStrong) {
    stickyStrong.textContent = `${installments}x ${perMonthStr}`;
  }

  // 6. Barra de escassez das 100 vagas
  const scarcityBlock = document.querySelector<HTMLElement>('[data-promo-scarcity]');
  if (scarcityBlock) {
    if (isPromo) {
      scarcityBlock.classList.remove('hidden');
    } else {
      scarcityBlock.classList.add('hidden');
    }
  }

  // 7. Alerta flutuante de indicação (?ref=)
  const floatingAlert = document.querySelector<HTMLElement>('[data-floating-promo]');
  if (floatingAlert) {
    const isDismissed = sessionStorage.getItem('sb_promo_dismissed') === '1';
    if (isPromo && !isDismissed) {
      floatingAlert.classList.remove('hidden');
      floatingAlert.classList.add('is-visible');
    } else {
      floatingAlert.classList.remove('is-visible');
      floatingAlert.classList.add('hidden');
    }
  }

  const promoBadge = document.querySelector<HTMLElement>('[data-promo-badge]');
  if (promoBadge) {
    if (isPromo && promoterName) {
      promoBadge.classList.remove('hidden');
      promoBadge.textContent = `Indicação de Consultor (${promoterName})`;
    } else if (isPromo) {
      promoBadge.classList.remove('hidden');
      promoBadge.textContent = `Condição Exclusiva por Indicação`;
    } else {
      promoBadge.classList.add('hidden');
    }
  }

  // 8. Aleta de Alerta no Card de Preços
  const cardAleta = document.querySelector<HTMLElement>('[data-card-aleta]');
  const aletaPromoter = document.querySelector<HTMLElement>('[data-aleta-promoter]');
  if (cardAleta) {
    if (isPromo) {
      cardAleta.classList.remove('hidden');
      if (aletaPromoter) {
        aletaPromoter.textContent = promoterName ? `· CONSULTOR: ${promoterName}` : '';
      }
    } else {
      cardAleta.classList.add('hidden');
      if (aletaPromoter) aletaPromoter.textContent = '';
    }
  }

  // 9. Carimbo Grande Físico no Card de Preços com Cores Fortes
  const cardStamp = document.querySelector<HTMLElement>('[data-card-stamp]');
  const priceCard = document.querySelector<HTMLElement>('.price-card');
  if (cardStamp) {
    if (isPromo) {
      cardStamp.classList.remove('hidden');
      cardStamp.classList.add('is-stamped');
      if (priceCard) priceCard.classList.add('has-consultant-discount');
    } else {
      cardStamp.classList.remove('is-stamped');
      cardStamp.classList.add('hidden');
      if (priceCard) priceCard.classList.remove('has-consultant-discount');
    }
  }

  // 10. Carimbo flutuante opcional (caso presente na página)
  const stampEl = document.querySelector<HTMLElement>('[data-promo-stamp]');
  if (stampEl) {
    if (isPromo) {
      stampEl.classList.remove('hidden', 'is-fading');
      stampEl.classList.add('is-stamping');

      setTimeout(() => {
        stampEl.classList.remove('is-stamping');
        stampEl.classList.add('is-fading');
        setTimeout(() => {
          stampEl.classList.remove('is-fading');
          stampEl.classList.add('hidden');
        }, 800);
      }, 5000);
    } else {
      stampEl.classList.remove('is-stamping', 'is-fading');
      stampEl.classList.add('hidden');
    }
  }

  // 9. Banner de topo de consultor (opcional)
  const topBanner = document.querySelector<HTMLElement>('[data-promoter-banner]');
  const topName = document.querySelector<HTMLElement>('[data-promoter-name]');
  if (topName && promoterName) topName.textContent = promoterName;
  if (topBanner) {
    if (isPromo && promoterName) {
      topBanner.classList.remove('hidden');
      topBanner.classList.add('is-visible');
    } else {
      topBanner.classList.add('hidden');
    }
  }
}

export async function initDynamicPricing(resolvedAttr?: Attribution | null): Promise<void> {
  const attr = resolvedAttr !== undefined ? resolvedAttr : initAttribution();
  const hasRef = Boolean(attr?.ref && attr.ref.trim().length > 0);

  // Sem ?ref=: renderiza imediatamente o preço padrão cheio e finaliza
  if (!hasRef) {
    applyPricingToDom({
      installment: REGULAR_PRICE.installment,
      installments: REGULAR_PRICE.installments,
      pix: REGULAR_PRICE.pix,
      anchor: REGULAR_PRICE.anchor,
      isPromo: false,
    });
    return;
  }

  // Com ?ref=: aplica de pronto o Lote Promocional (fallback garantido sem CLS)
  applyPricingToDom({
    installment: PROMO_PRICE.installment,
    installments: PROMO_PRICE.installments,
    pix: PROMO_PRICE.pix,
    anchor: PROMO_PRICE.anchor,
    isPromo: true,
    promoterName: null,
  });

  // Tenta refinar com a API do backend caso esteja online
  try {
    const url = `${BACKEND_URL}/api/v1/clients/pricing?ref=${encodeURIComponent(attr.ref!)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return;

    const data = (await res.json()) as PricingResponse;
    const usePromo = Boolean(data.has_discount || data.promo_card);
    const activeCard = usePromo && data.promo_card ? data.promo_card : data.card;
    const activePix = usePromo && data.promo_pix ? Number(data.promo_pix) : Number(data.pix);

    if (activeCard && Number.isFinite(Number(activeCard.installment)) && Number.isFinite(activePix)) {
      applyPricingToDom({
        installment: Number(activeCard.installment),
        installments: Number(activeCard.installments) || 12,
        pix: activePix,
        anchor: Number(data.anchor_full) || PROMO_PRICE.anchor,
        isPromo: true,
        promoterName: data.promoter_name || null,
      });

      track('promoter_discount_applied', {
        ref: attr.ref,
        promoter: data.promoter_name,
      });
    }
  } catch {
    // API offline/dev: mantém os valores de fallback promocionais já aplicados
  }
}
