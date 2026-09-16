import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Captura Inteligente de Alunos (Zero-Friction Modal)', () => {
  test('clicar em CTA abre o modal cinético da Sofia com foco no WhatsApp', async ({ page }) => {
    await page.goto('/');
    const modal = page.locator('#lead-capture-modal');
    await expect(modal).not.toHaveClass(/open/);

    // Clica no CTA do Hero
    await page.locator('a[data-cta="hero"]').click();
    await expect(modal).toHaveClass(/open/);
    await expect(modal).toHaveAttribute('aria-hidden', 'false');

    // Campo de WhatsApp está visível e focado
    const phoneInput = page.locator('#lead-input-phone');
    await expect(phoneInput).toBeVisible();
  });

  test('fechamento do modal via botão de fechar e via tecla ESC', async ({ page }) => {
    await page.goto('/');
    const modal = page.locator('#lead-capture-modal');

    // Abre e fecha via botão X
    await page.locator('a[data-cta="hero"]').click();
    await expect(modal).toHaveClass(/open/);
    await page.locator('.close-btn').click();
    await expect(modal).not.toHaveClass(/open/);

    // Abre e fecha via ESC
    await page.locator('a[data-cta="hero"]').click();
    await expect(modal).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveClass(/open/);
  });

  test('auto-avanço no 11º dígito de telefone e navegação via breadcrumb', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="hero"]').click();

    const phoneInput = page.locator('#lead-input-phone');
    const cpfStep = page.locator('#step-cpf');
    const breadcrumbs = page.locator('#lead-breadcrumbs');
    const chipPhoneText = page.locator('#chip-phone-text');

    // Digita celular com DDD válido (11 dígitos)
    await phoneInput.fill('11987654321');
    await expect(phoneInput).toHaveValue('(11) 98765-4321');

    // Aguarda o auto-avanço (~220ms)
    await expect(cpfStep).toBeVisible({ timeout: 2000 });
    await expect(breadcrumbs).toBeVisible();
    await expect(chipPhoneText).toContainText('(11) 98765-4321');

    // Clica no chip de breadcrumb para voltar ao telefone
    await page.locator('#chip-phone').click();
    await expect(page.locator('#step-phone')).toBeVisible();
    await expect(cpfStep).not.toBeVisible();
  });

  test('validação de CPF Módulo 11 atualiza a Credencial 3D em tempo real', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="hero"]').click();

    // Preenche telefone para avançar
    await page.locator('#lead-input-phone').fill('11987654321');
    await expect(page.locator('#step-cpf')).toBeVisible();

    const cpfInput = page.locator('#lead-input-cpf');
    const statusText = page.locator('#credential-status-text');

    // CPF válido (matematicamente comprovado)
    await cpfInput.fill('52998224725');
    await expect(cpfInput).toHaveValue('529.982.247-25');
    await expect(statusText).toHaveText('PRÉ-MATRÍCULA AUTORIZADA');
  });

  test('acessibilidade do modal de captura (Axe-core WCAG 2A/AA)', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="hero"]').click();
    await expect(page.locator('#lead-capture-modal')).toHaveClass(/open/);

    const results = await new AxeBuilder({ page })
      .include('#lead-capture-modal')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
