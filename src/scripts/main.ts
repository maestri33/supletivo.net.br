/**
 * Entry único do client: atribuição, eventos e animações.
 * Tudo é progressive enhancement — a página funciona sem este arquivo.
 */
import { initAttribution, decorateCtas, ATTR_KEYS } from './attribution';
import { initDynamicPricing } from './dynamic-pricing';
import { track } from './track';
import { initAntigravityTilt } from './antigravity-tilt';
import { setupLeadCaptureTrigger } from './lead-capture';

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initAntigravityTilt();
setupLeadCaptureTrigger();
const attr = initAttribution();
decorateCtas(attr);
void initDynamicPricing(attr);

const attrPayload: Record<string, unknown> = {};
if (attr) {
  for (const key of ATTR_KEYS) if (attr[key]) attrPayload[key] = attr[key];
}
track('page_view', attrPayload);

let ctaClickedInSession = false;
try {
  ctaClickedInSession = sessionStorage.getItem('sb_cta_clicked') === '1';
} catch {}

document.addEventListener('click', (e) => {
  const target = e.target as Element | null;
  const cta = target?.closest<HTMLAnchorElement>('a[data-cta]');
  if (cta) {
    const value = Number(cta.dataset.ctaValue) || undefined;
    const isFirstInSession = !ctaClickedInSession;
    if (isFirstInSession) {
      ctaClickedInSession = true;
      try {
        sessionStorage.setItem('sb_cta_clicked', '1');
      } catch {}
    }
    track('cta_click', {
      position: cta.dataset.cta,
      value,
      currency: 'BRL',
      first_interaction: isFirstInSession,
    });
  }
});

document.querySelectorAll<HTMLDetailsElement>('details[data-faq]').forEach((details) => {
  details.addEventListener('toggle', () => {
    const question = details.querySelector('summary')?.textContent?.trim() ?? '';
    track(details.open ? 'faq_open' : 'faq_close', { question });
  });
});

const sections = document.querySelectorAll<HTMLElement>('[data-section]');
if (sections.length > 0 && 'IntersectionObserver' in window) {
  const sectionIo = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          track('section_view', { section: (entry.target as HTMLElement).dataset.section });
          sectionIo.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.35 }
  );
  sections.forEach((el) => sectionIo.observe(el));
}

window.addEventListener('error', (e) => {
  track('js_error', { message: String(e.message ?? 'erro').slice(0, 150) });
});
window.addEventListener('unhandledrejection', (e) => {
  track('js_error', { message: `unhandledrejection: ${String(e.reason ?? '')}`.slice(0, 150) });
});

const depthMarks = [25, 50, 75, 100];
const fired = new Set<number>();
function checkDepth(): void {
  const doc = document.documentElement;
  const viewport = window.innerHeight || doc.clientHeight;
  const depth = ((doc.scrollTop + viewport) / doc.scrollHeight) * 100;
  for (const mark of depthMarks) {
    if (depth >= mark && !fired.has(mark)) {
      fired.add(mark);
      track('scroll_depth', { depth: mark });
    }
  }
  if (fired.size === depthMarks.length) {
    window.removeEventListener('scroll', checkDepth);
  }
}
window.addEventListener('scroll', checkDepth, { passive: true });
checkDepth();

function typeName(el: Element): void {
  const full = el.getAttribute('data-type') ?? '';
  if (!full) return;
  let i = 0;
  el.textContent = '';
  const tick = (): void => {
    i += 1;
    el.textContent = full.slice(0, i);
    if (i < full.length) setTimeout(tick, 45);
  };
  setTimeout(tick, 1000);
}

const revealEls = document.querySelectorAll('[data-reveal], [data-seal], [data-cert]');
if (REDUCED || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('in-view'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          if (entry.target.hasAttribute('data-cert')) {
            const name = entry.target.querySelector('[data-type]');
            if (name) typeName(name);
          }
          io.unobserve(entry.target);
        }
      }
    },
    // pré-dispara 120px antes de entrar: rolagem rápida no mobile não
    // encontra seção "apagada" esperando o observer
    { threshold: 0.05, rootMargin: '0px 0px 120px 0px' }
  );
  // página pode carregar já rolada (restauração de scroll/âncora): o que
  // ficou acima do viewport aparece direto. Leituras de layout em lote
  // ANTES das escritas para não forçar reflow a cada elemento.
  const aboveViewport: Element[] = [];
  const toObserve: Element[] = [];
  revealEls.forEach((el) => {
    (el.getBoundingClientRect().bottom < 0 ? aboveViewport : toObserve).push(el);
  });
  aboveViewport.forEach((el) => el.classList.add('in-view'));
  toObserve.forEach((el) => io.observe(el));
}

const litEls = document.querySelectorAll('[data-lit]');
if (litEls.length > 0) {
  if (REDUCED || !('IntersectionObserver' in window)) {
    litEls.forEach((el) => el.classList.add('lit'));
  } else {
    const litIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('lit');
            litIo.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '-28% 0px -28% 0px' }
    );
    litEls.forEach((el) => litIo.observe(el));
  }
}

const certWrap = document.querySelector<HTMLElement>('[data-cert]');
if (certWrap && !REDUCED && window.matchMedia('(pointer: fine)').matches) {
  certWrap.addEventListener('pointermove', (e) => {
    const rect = certWrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    certWrap.style.transform = `perspective(950px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(y * -7).toFixed(2)}deg)`;
  });
  certWrap.addEventListener('pointerleave', () => {
    certWrap.style.transform = '';
  });
}

const priceCard = document.querySelector<HTMLElement>('[data-price]');
if (priceCard && !REDUCED && window.matchMedia('(pointer: fine)').matches) {
  priceCard.addEventListener('pointermove', (e) => {
    const rect = priceCard.getBoundingClientRect();
    priceCard.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    priceCard.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
}

// Sticky CTA: exibido quando a rolagem ultrapassa o hero e nenhum CTA inline está visível no viewport.
const sticky = document.querySelector<HTMLElement>('.sticky-cta');
if (sticky && 'IntersectionObserver' in window) {
  const hero = document.querySelector('#hero');
  const inlineCtas = document.querySelectorAll('a[data-cta]:not([data-cta="sticky"])');

  let pastHero = !hero;
  const ctasOnScreen = new Set<Element>();
  const updateSticky = (): void => {
    sticky.classList.toggle('visible', pastHero && ctasOnScreen.size === 0);
  };

  if (hero) {
    new IntersectionObserver(
      ([entry]) => {
        pastHero = !entry.isIntersecting;
        updateSticky();
      },
      { rootMargin: '-64px 0px 0px 0px' }
    ).observe(hero);
  }

  const ctaIo = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) ctasOnScreen.add(entry.target);
        else ctasOnScreen.delete(entry.target);
      }
      updateSticky();
    },
    { threshold: 0.4 }
  );
  inlineCtas.forEach((el) => ctaIo.observe(el));
  updateSticky();
} else {
  sticky?.classList.add('visible');
}

const readingTrack = document.querySelector<HTMLElement>('.reading-track');
if (
  readingTrack &&
  !(typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline', 'scroll()'))
) {
  let ticking = false;
  let cachedMax = 1;
  const updateMetrics = (): void => {
    const doc = document.documentElement;
    cachedMax = Math.max(1, doc.scrollHeight - window.innerHeight);
  };
  const onScroll = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        const ratio = Math.min(1, Math.max(0, (window.scrollY || document.documentElement.scrollTop) / cachedMax));
        readingTrack.style.setProperty('--progress-scale', ratio.toFixed(4));
        ticking = false;
      });
    }
  };
  updateMetrics();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateMetrics, { passive: true });
}

const legalBtn = document.querySelector<HTMLButtonElement>('#legal-info-btn');
const legalContainer = document.querySelector<HTMLElement>('.legal-info-container');
if (legalBtn && legalContainer) {
  legalBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = legalContainer.classList.toggle('is-open');
    legalBtn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (!legalContainer.contains(e.target as Node)) {
      legalContainer.classList.remove('is-open');
      legalBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && legalContainer.classList.contains('is-open')) {
      legalContainer.classList.remove('is-open');
      legalBtn.setAttribute('aria-expanded', 'false');
      legalBtn.focus();
    }
  });
}

document.querySelector('[data-close-promo-alert]')?.addEventListener('click', () => {
  sessionStorage.setItem('sb_promo_dismissed', '1');
  const alertEl = document.querySelector<HTMLElement>('[data-floating-promo]');
  if (alertEl) {
    alertEl.classList.remove('is-visible');
    alertEl.classList.add('hidden');
  }
});

const precoSection = document.getElementById('preco');
const floatingPromo = document.querySelector<HTMLElement>('[data-floating-promo]');
if (precoSection && floatingPromo && 'IntersectionObserver' in window) {
  const promoSectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          floatingPromo.classList.add('hidden-by-section');
        } else {
          floatingPromo.classList.remove('hidden-by-section');
        }
      }
    },
    { threshold: 0.1 }
  );
  promoSectionObserver.observe(precoSection);
}

// No mobile/tablet, esconde o alerta flutuante na dobra inicial do Hero para evitar bloquear o CTA principal
if (floatingPromo) {
  const updateMobileHeroVisibility = () => {
    if (window.innerWidth <= 899) {
      if (window.scrollY < 90) {
        floatingPromo.classList.add('hidden-by-hero');
      } else {
        floatingPromo.classList.remove('hidden-by-hero');
      }
    } else {
      floatingPromo.classList.remove('hidden-by-hero');
    }
  };
  updateMobileHeroVisibility();
  window.addEventListener('scroll', updateMobileHeroVisibility, { passive: true });
  window.addEventListener('resize', updateMobileHeroVisibility, { passive: true });
}

