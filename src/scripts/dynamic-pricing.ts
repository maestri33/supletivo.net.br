/** Commercial displays use only the canonical backend quote, including referral acceptance. */
import { initAttribution, type Attribution } from './attribution';
import { track } from './track';
import { BACKEND_URL } from '../config';
import { parseCommercialPrice } from '../lib/commercial-pricing';

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
  const totalCard = installment * installments;
  const underPerMonth = installment < 10 ? brl(Math.max(1, Math.ceil(installment))) : brl(Math.ceil(installment / 100) * 100);
  const savings = isPromo ? Math.max(0, anchor - pix) : Math.max(0, Math.round((totalCard - pix) * 100) / 100);

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
  if (saveLine) {
    if (isPromo && savings > 0) {
      saveLine.innerHTML = `— você economiza <span data-price-savings>${brl(savings)}</span>`;
      saveLine.classList.remove('hidden');
    } else if (!isPromo && savings > 0) {
      saveLine.innerHTML = `— você economiza <span data-price-savings>${brl(savings)}</span> no Pix`;
      saveLine.classList.remove('hidden');
    } else {
      saveLine.classList.add('hidden');
    }
  } else {
    document.querySelectorAll<HTMLElement>('[data-price-savings]').forEach((el) => {
      el.textContent = brl(savings);
    });
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
  document.querySelectorAll<HTMLElement>('[data-price-card-line-short]').forEach((el) => {
    el.textContent = `${installments}x ${perMonthStr}`;
  });
  document.querySelectorAll<HTMLElement>('[data-price-card-total]').forEach(el => {
    el.textContent = brl(installment * installments);
  });

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
    if (isPromo && savings > 0 && !isDismissed) {
      const promoSavingsText = brl(savings);
      floatingAlert.innerHTML = `
  <div class="promo-alert-card">
    <div class="promo-alert-header">
      <div class="promo-alert-pill">
        <span class="pulse-dot" aria-hidden="true"></span>
        <span class="promo-alert-pill-text">Condição por Indicação Ativada</span>
      </div>
      <button
        type="button"
        class="promo-alert-close"
        data-close-promo-alert
        aria-label="Fechar aviso promocional"
        title="Dispensar aviso"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="promo-alert-body">
      <div class="promo-alert-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
        </svg>
      </div>

      <div class="promo-alert-content">
        <p class="promo-alert-headline">
          Economia de <span class="promo-highlight" data-price-savings>${promoSavingsText}</span> aplicada
        </p>
        <p class="promo-alert-sub">
          Por <strong data-price-card-line>${cardLine}</strong> ou <strong data-price-pix-val>${pixStr}</strong> no Pix
        </p>
      </div>
    </div>

    <div class="promo-alert-footer">
      <a href="#preco" class="promo-alert-cta" data-cta="floating-alert" aria-label="Ver condição especial de preço">
        <span>Aproveitar condição</span>
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="7 13 12 18 17 13"></polyline>
          <line x1="12" y1="6" x2="12" y2="18"></line>
        </svg>
      </a>
      <span class="promo-alert-micro">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#00e699" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Consultor Autorizado Supletivo Brasil
      </span>
    </div>
  </div>`;
      floatingAlert.querySelector('[data-close-promo-alert]')?.addEventListener('click', () => {
        sessionStorage.setItem('sb_promo_dismissed', '1');
        floatingAlert.classList.remove('is-visible');
        floatingAlert.classList.add('hidden');
      });
      floatingAlert.classList.remove('hidden');
      floatingAlert.classList.add('is-visible');
    } else {
      floatingAlert.classList.remove('is-visible');
      floatingAlert.classList.add('hidden');
      floatingAlert.innerHTML = '';
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
  if (cardAleta) {
    if (isPromo) {
      cardAleta.innerHTML = `
        <div class="aleta-flag">
          <span class="aleta-dot" aria-hidden="true"></span>
          <span class="aleta-text">CONDIÇÃO PROMOCIONAL ATIVA · LINK VERIFICADO <span data-aleta-promoter>${promoterName ? `· CONSULTOR: ${promoterName}` : ''}</span></span>
        </div>`;
      cardAleta.classList.remove('hidden');
    } else {
      cardAleta.innerHTML = '';
      cardAleta.classList.add('hidden');
    }
  }

  // 9. Carimbo Grande Físico no Card de Preços com Cores Fortes
  const cardStamp = document.querySelector<HTMLElement>('[data-card-stamp]');
  const priceCard = document.querySelector<HTMLElement>('.price-card');
  if (cardStamp) {
    if (isPromo) {
      cardStamp.innerHTML = `
        <div class="stamp-seal">
          <div class="stamp-seal-inner">
            <span class="stamp-seal-tag">★ SUPLETIVO BRASIL · CEE / LDB ★</span>
            <strong class="stamp-seal-title">DESCONTO APLICADO</strong>
            <span class="stamp-seal-sub">CONSULTOR AUTORIZADO · LOTE 01</span>
          </div>
        </div>`;
      cardStamp.classList.remove('hidden');
      cardStamp.classList.add('is-stamped');
      if (priceCard) priceCard.classList.add('has-consultant-discount');
    } else {
      cardStamp.innerHTML = '';
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
  if (topBanner) {
    if (isPromo && savings > 0) {
      const name = promoterName || 'seu consultor';
      topBanner.innerHTML = `
  <div class="container promoter-banner-inner">
    <div class="promoter-badge">
      <svg class="promoter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="width: 16px; height: 16px; min-width: 16px; max-width: 16px; display: inline-block; vertical-align: middle; flex-shrink: 0;">
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="currentColor"
        />
      </svg>
      <span class="promoter-pill">Desconto de Consultor Ativado</span>
    </div>
    <p class="promoter-text">
      Você foi indicado(a) por <strong data-promoter-name>${name}</strong>!
      O valor promocional exclusivo foi aplicado em todos os planos.
    </p>
  </div>`;
      topBanner.classList.remove('hidden');
      topBanner.classList.add('is-visible');
    } else {
      topBanner.classList.remove('is-visible');
      topBanner.classList.add('hidden');
      topBanner.innerHTML = '';
    }
  }
}

export async function initDynamicPricing(resolvedAttr?: Attribution | null): Promise<void> {
  const urlRef = new URL(window.location.href).searchParams.get('ref');
  const attr = resolvedAttr !== undefined ? resolvedAttr : initAttribution();
  const hasRef = resolvedAttr !== undefined ? Boolean(resolvedAttr?.ref) : Boolean(urlRef && urlRef.trim().length > 0);

  // The Worker embeds its live backend quote. Static previews use the canonical backend.
  try {
    const embedded = document.querySelector('#sb-pricing')?.textContent;
    let payload: unknown;
    if (embedded) payload = JSON.parse(embedded);
    else {
      if (document.body.dataset.pricingState === 'unavailable') return;
      const endpoint = import.meta.env.DEV ? `${BACKEND_URL}/api/v1/clients/pricing` : '/api/pricing';
      const url = hasRef ? `${endpoint}?ref=${encodeURIComponent(attr.ref!)}` : endpoint;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) throw new Error('Pricing unavailable');
      payload = await res.json();
    }
    const price = parseCommercialPrice(payload, hasRef);
    applyPricingToDom({
      installment: price.perMonth,
      installments: price.installments,
      pix: price.pixTotal,
      anchor: price.full,
      isPromo: price.hasDiscount,
      promoterName: price.promoterName,
    });

    if (price.hasDiscount && attr?.ref) {
      track('promoter_discount_applied', {
        ref: attr.ref,
        promoter: price.promoterName,
      });
    }
  } catch {
    if (hasRef) {
      applyPricingToDom({
        installment: 99,
        installments: 12,
        pix: 999,
        anchor: 1615,
        isPromo: true,
        promoterName: null,
      });
    } else {
      applyPricingToDom({
        installment: 159.9,
        installments: 12,
        pix: 1615,
        anchor: 1615,
        isPromo: false,
        promoterName: null,
      });
      document.querySelectorAll<HTMLElement>('[data-promo-scarcity], [data-price-old], [data-card-stamp], [data-floating-promo], [data-promoter-banner]').forEach(el => el.classList.add('hidden'));
    }
  }
}
