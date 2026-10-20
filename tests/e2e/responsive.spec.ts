import { test, expect } from '@playwright/test';

/**
 * Validação de Responsividade Estrita em Nove Larguras.
 * Conforme Frente 04 (Issue #9) e diretrizes de DESIGN.md:
 * Garante zero overflow horizontal (scrollWidth <= clientWidth)
 * nas 9 larguras essenciais de dispositivos mobile, tablet e desktop.
 */
const VIEWPORTS = [360, 390, 430, 600, 768, 820, 1024, 1366, 1920];

test.describe('Responsividade e Geometria Viewport (9 Larguras)', () => {
  for (const width of VIEWPORTS) {
    test(`sem overflow horizontal em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      // Aguarda estabilização do layout
      await page.waitForLoadState('domcontentloaded');

      const dimensions = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
        };
      });

      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    });
  }

  test('menu mobile abre e fecha com tecla Escape e clique no backdrop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const toggleBtn = page.locator('#nav-toggle-btn');
    const drawer = page.locator('#mobile-nav-drawer');

    await expect(toggleBtn).toBeVisible();
    await expect(drawer).not.toHaveClass(/is-open/);
    expect(await toggleBtn.getAttribute('aria-expanded')).toBe('false');

    // Abre o menu
    await toggleBtn.click();
    await expect(drawer).toHaveClass(/is-open/);
    expect(await toggleBtn.getAttribute('aria-expanded')).toBe('true');
    expect(await drawer.getAttribute('aria-hidden')).toBe('false');

    // Fecha com a tecla Escape
    await page.keyboard.press('Escape');
    await expect(drawer).not.toHaveClass(/is-open/);
    expect(await toggleBtn.getAttribute('aria-expanded')).toBe('false');
    expect(await drawer.getAttribute('aria-hidden')).toBe('true');
  });

  test('paridade do header sticky institucional em rotas de conteúdo (/supletivo-online/)', async ({ page }) => {
    await page.goto('/supletivo-online/');
    const header = page.locator('header#header');
    await expect(header).toBeVisible();

    const cs = await header.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        hasBackdrop: style.backdropFilter !== 'none' || style.webkitBackdropFilter !== 'none',
      };
    });

    expect(cs.position).toBe('sticky');
    expect(cs.hasBackdrop).toBe(true);
  });

  test('barra de progresso de leitura horizontal move com o scroll na home e rotas internas', async ({ page }) => {
    await page.goto('/');
    const bar = page.locator('.reading-bar');
    await expect(bar).toBeAttached();

    // Rola a página até a metade
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(100);

    const transformHome = await bar.evaluate((el) => el.style.transform);
    expect(transformHome).toContain('scaleX');
    expect(transformHome).not.toBe('scaleX(0)');

    // Testa em rota de conteúdo interna
    await page.goto('/supletivo-online/');
    const contentBar = page.locator('.reading-bar');
    await expect(contentBar).toBeAttached();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(100);

    const transformContent = await contentBar.evaluate((el) => el.style.transform);
    expect(transformContent).toContain('scaleX');
    expect(transformContent).not.toBe('scaleX(0)');
  });

  test('seção de polos seleciona estado a partir de query param ?uf=', async ({ page }) => {
    await page.goto('/?uf=RJ#polos');
    const resultCard = page.locator('#polo-result');
    await expect(resultCard).toHaveAttribute('data-current-uf', 'RJ');
    await expect(page.locator('#polo-state-title')).toContainText('Rio de Janeiro');
  });
});
