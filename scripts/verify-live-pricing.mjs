import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  console.log('--- 1. Testando https://supletivo.net.br (Sem Indicação) ---');
  const pageNoRef = await context.newPage();
  await pageNoRef.goto('https://supletivo.net.br', { waitUntil: 'networkidle' });
  await pageNoRef.waitForTimeout(2000);

  const noRefData = await pageNoRef.evaluate(() => {
    const card = document.querySelector('.price-card');
    return {
      title: document.querySelector('#pricing-title')?.textContent?.trim(),
      cardDigits: card?.querySelector('[data-price-digits]')?.textContent?.trim(),
      cardPix: card?.querySelector('[data-price-pix-val]')?.textContent?.trim(),
      cardOld: card?.querySelector('[data-price-old-val]')?.textContent?.trim(),
      oldHidden: card?.querySelector('[data-price-old]')?.classList.contains('hidden'),
      hasConsultantDiscountClass: card?.classList.contains('has-consultant-discount'),
      stampHidden: card?.querySelector('[data-card-stamp]')?.classList.contains('hidden'),
      aletaHidden: card?.querySelector('[data-card-aleta]')?.classList.contains('hidden'),
      heroCard: document.querySelector('.hero [data-price-card-line]')?.textContent?.trim(),
      heroPix: document.querySelector('.hero [data-price-pix-val]')?.textContent?.trim(),
    };
  });
  console.log('Dados Sem Ref:', JSON.stringify(noRefData, null, 2));
  await pageNoRef.locator('#preco').scrollIntoViewIfNeeded();
  await pageNoRef.waitForTimeout(500);
  await pageNoRef.screenshot({ path: 'screenshots/live_sem_ref_card.png' });

  console.log('\n--- 2. Testando https://supletivo.net.br/84be099b-502e-4b38-8b47-83fc94aedfdc (Com Indicação via Path) ---');
  const pagePathRef = await context.newPage();
  await pagePathRef.goto('https://supletivo.net.br/84be099b-502e-4b38-8b47-83fc94aedfdc', { waitUntil: 'networkidle' });
  await pagePathRef.waitForTimeout(2000);

  const pathRefData = await pagePathRef.evaluate(() => {
    const card = document.querySelector('.price-card');
    return {
      finalUrl: window.location.href,
      title: document.querySelector('#pricing-title')?.textContent?.trim(),
      cardDigits: card?.querySelector('[data-price-digits]')?.textContent?.trim(),
      cardPix: card?.querySelector('[data-price-pix-val]')?.textContent?.trim(),
      cardOld: card?.querySelector('[data-price-old-val]')?.textContent?.trim(),
      cardSavings: card?.querySelector('[data-price-savings]')?.textContent?.trim(),
      oldHidden: card?.querySelector('[data-price-old]')?.classList.contains('hidden'),
      hasConsultantDiscountClass: card?.classList.contains('has-consultant-discount'),
      stampHidden: card?.querySelector('[data-card-stamp]')?.classList.contains('hidden'),
      promoterBanner: document.querySelector('[data-promoter-name]')?.textContent?.trim(),
      aletaText: card?.querySelector('.aleta-text')?.textContent?.trim(),
      heroCard: document.querySelector('.hero [data-price-card-line]')?.textContent?.trim(),
      heroPix: document.querySelector('.hero [data-price-pix-val]')?.textContent?.trim(),
      ctaHref: card?.querySelector('a.btn')?.getAttribute('href'),
    };
  });
  console.log('Dados Com Ref (via Path):', JSON.stringify(pathRefData, null, 2));
  await pagePathRef.locator('#preco').scrollIntoViewIfNeeded();
  await pagePathRef.waitForTimeout(500);
  await pagePathRef.screenshot({ path: 'screenshots/live_com_ref_card.png' });

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
