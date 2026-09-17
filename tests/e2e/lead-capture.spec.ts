import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Captura Inteligente de Alunos (LeadCaptureModal)', () => {
  test('abre o modal de captação ao clicar no CTA do Hero com campo de WhatsApp', async ({ page }) => {
    await page.goto('/');
    const heroCta = page.locator('a[data-cta="hero"]');
    await expect(heroCta).toBeVisible();
    await heroCta.click();

    const modal = page.locator('#lead-capture-modal');
    await expect(modal).toBeVisible();
    const phoneInput = page.locator('#lead-input-phone');
    await expect(phoneInput).toBeVisible();
    await expect(page.locator('#lead-modal-title')).toContainText('plano acelerado');
  });

  test('auto-avanço no 11º dígito de telefone e navegação via breadcrumb', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="hero"]').click();

    const phoneInput = page.locator('#lead-input-phone');
    await expect(phoneInput).toBeVisible();

    // Digita celular com DDD válido (11 dígitos)
    await phoneInput.fill('11987654321');
    await expect(phoneInput).toHaveValue('(11) 98765-4321');

    // Aguarda o auto-avanço para o CPF
    const cpfInput = page.locator('#lead-input-cpf');
    await expect(cpfInput).toBeVisible({ timeout: 2000 });

    // Breadcrumb deve estar visível com o telefone formatado
    const phoneBreadcrumb = page.locator('#chip-phone');
    await expect(phoneBreadcrumb).toBeVisible();
    await expect(page.locator('#chip-phone-text')).toContainText('(11) 98765-4321');

    // Clica no breadcrumb para retornar ao telefone
    await phoneBreadcrumb.click();
    await expect(page.locator('#lead-input-phone')).toBeVisible();
  });

  test('validação de CPF Módulo 11 atualiza a Credencial 3D e avança para e-mail', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="hero"]').click();

    // Avança telefone
    await page.locator('#lead-input-phone').fill('11987654321');
    const cpfInput = page.locator('#lead-input-cpf');
    await expect(cpfInput).toBeVisible({ timeout: 2000 });

    // CPF válido (Módulo 11)
    await cpfInput.fill('52998224725');
    await expect(cpfInput).toHaveValue('529.982.247-25');

    // Valida credencial autorizada
    await expect(page.locator('#credential-status-text')).toContainText('PRÉ-MATRÍCULA AUTORIZADA');

    // Auto-avanço para o campo de e-mail (Zero-Button)
    const emailInput = page.locator('#lead-input-email');
    await expect(emailInput).toBeVisible({ timeout: 2000 });
  });

  test('fluxo completo zero-button: telefone -> cpf -> chip de email -> redirecionamento com cookie', async ({ page }) => {
    await page.goto('/?ref=PROMO123&utm_source=meta');
    await page.locator('a[data-cta="hero"]').click();

    // 1. Telefone
    await page.locator('#lead-input-phone').fill('11987654321');

    // 2. CPF (auto-avançado)
    const cpfInput = page.locator('#lead-input-cpf');
    await expect(cpfInput).toBeVisible({ timeout: 2000 });
    await cpfInput.fill('52998224725');

    // 3. E-mail (auto-avançado)
    const emailInput = page.locator('#lead-input-email');
    await expect(emailInput).toBeVisible({ timeout: 2000 });

    // Breadcrumbs vivos visíveis (Telefone e CPF)
    await expect(page.locator('#chip-phone')).toBeVisible();
    await expect(page.locator('#chip-cpf')).toBeVisible();

    // Clica no chip @gmail.com para autocompletar e disparar
    await emailInput.fill('aluno.supletivo');
    const gmailChip = page.locator('.domain-chip[data-domain="gmail.com"]');
    await expect(gmailChip).toBeVisible();
    await gmailChip.click();
    await expect(emailInput).toHaveValue('aluno.supletivo@gmail.com');

    // Verifica que cookie foi gravado e que o redirecionamento ocorre
    await page.waitForURL(/autenticacao\/otp/, { timeout: 4000 });
    const currentUrl = page.url();
    expect(currentUrl).toContain('tel=11987654321');
    expect(currentUrl).toContain('cpf=52998224725');
    expect(currentUrl).toContain('ref=PROMO123');

    // Verifica persistência do cookie supletivo.session
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find((c) => c.name === 'supletivo.session');
    expect(sessionCookie).toBeDefined();
  });

  test('detecção de CPF inválido mantém estado pendente sem avançar', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="hero"]').click();

    // Avança telefone
    await page.locator('#lead-input-phone').fill('11987654321');
    const cpfInput = page.locator('#lead-input-cpf');
    await expect(cpfInput).toBeVisible({ timeout: 2000 });

    // CPF inválido (todos dígitos iguais)
    await cpfInput.fill('00000000000');
    await expect(page.locator('#credential-status-text')).toContainText('AGUARDANDO VALIDAÇÃO');
    await expect(page.locator('#step-email')).toBeHidden();
  });

  test('acessibilidade do modal de captação (Axe-core WCAG 2A/AA)', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-cta="hero"]').click();

    const results = await new AxeBuilder({ page })
      .include('#lead-capture-modal')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
