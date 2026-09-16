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
});
