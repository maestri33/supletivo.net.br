import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Captura Inteligente de Alunos (SofiaLeadCapture)', () => {
  test('renderiza o componente de captação da Sofia no Hero com campo de WhatsApp', async ({ page }) => {
    await page.goto('/');
    const phoneInput = page.locator('#phone-input');
    await expect(phoneInput).toBeVisible();
    await expect(page.locator('.hero-capture').getByRole('heading', { name: 'Sofia' })).toBeVisible();
    await expect(page.locator('.hero-capture').getByText('República Federativa do Brasil')).toBeVisible();
  });

  test('auto-avanço no 11º dígito de telefone e navegação via breadcrumb', async ({ page }) => {
    await page.goto('/');
    const phoneInput = page.locator('#phone-input');

    // Digita celular com DDD válido (11 dígitos)
    await phoneInput.fill('11987654321');
    await expect(phoneInput).toHaveValue('(11) 98765-4321');

    // Aguarda o auto-avanço para o CPF
    const cpfInput = page.locator('#cpf-input');
    await expect(cpfInput).toBeVisible({ timeout: 2000 });

    // Breadcrumb deve estar visível com o telefone formatado
    const phoneBreadcrumb = page.locator('button[title="Editar WhatsApp"]');
    await expect(phoneBreadcrumb).toBeVisible();
    await expect(phoneBreadcrumb).toContainText('(11) 98765-4321');

    // Clica no breadcrumb para retornar ao telefone
    await phoneBreadcrumb.click();
    await expect(page.locator('#phone-input')).toBeVisible();
  });

  test('validação de CPF Módulo 11 atualiza a Credencial 3D e avança para e-mail', async ({ page }) => {
    await page.goto('/');

    // Avança telefone
    await page.locator('#phone-input').fill('11987654321');
    const cpfInput = page.locator('#cpf-input');
    await expect(cpfInput).toBeVisible({ timeout: 2000 });

    // CPF válido (Módulo 11)
    await cpfInput.fill('52998224725');
    await expect(cpfInput).toHaveValue('529.982.247-25');

    // Avança para a etapa de e-mail e enriquece nome
    const emailInput = page.locator('#email-input');
    await expect(emailInput).toBeVisible({ timeout: 2500 });
    await expect(page.locator('.hero-capture').getByText('MARIA APARECIDA DA SILVA')).toBeVisible();
  });

  test('chips inteligentes de e-mail avançam para pagamento', async ({ page }) => {
    await page.goto('/');

    // Avança telefone e CPF
    await page.locator('#phone-input').fill('11987654321');
    await expect(page.locator('#cpf-input')).toBeVisible({ timeout: 2000 });
    await page.locator('#cpf-input').fill('52998224725');

    // Chega ao e-mail
    const emailInput = page.locator('#email-input');
    await expect(emailInput).toBeVisible({ timeout: 2500 });
    await emailInput.fill('aluno.teste');

    // Clica no chip @gmail.com
    await page.getByRole('button', { name: '@gmail.com' }).click();

    // Deve avançar para a tela de pagamento
    const capture = page.locator('.hero-capture');
    await expect(capture.getByText('PIX À Vista')).toBeVisible({ timeout: 2000 });
    await expect(capture.getByText('Cartão de Crédito')).toBeVisible();
  });

  test('seleção de pagamento e cópia de Pix', async ({ page }) => {
    await page.goto('/');

    // Avança telefone, CPF e e-mail
    await page.locator('#phone-input').fill('11987654321');
    await expect(page.locator('#cpf-input')).toBeVisible({ timeout: 2000 });
    await page.locator('#cpf-input').fill('52998224725');
    await expect(page.locator('#email-input')).toBeVisible({ timeout: 2500 });
    await page.locator('#email-input').fill('aluno.teste');
    await page.getByRole('button', { name: '@gmail.com' }).click();

    const capture = page.locator('.hero-capture');

    // Na tela de pagamento, testa alternância para Cartão de Crédito
    await expect(capture.getByText('PIX À Vista')).toBeVisible({ timeout: 2000 });
    await capture.getByRole('button', { name: /Cartão de Crédito/i }).click();
    await expect(capture.getByText('12x de').first()).toBeVisible();

    // Volta para Pix e clica em Copiar Chave Pix
    await capture.getByRole('button', { name: /PIX À Vista/i }).click();
    const copyButton = capture.locator('button:has-text("Copiar Chave Pix")');
    await expect(copyButton).toBeVisible();
  });

  test('detecção acolhedora de CPF já existente com outro contato', async ({ page }) => {
    await page.goto('/');

    // Avança telefone
    await page.locator('#phone-input').fill('11987654321');
    await expect(page.locator('#cpf-input')).toBeVisible({ timeout: 2000 });

    // Testa preenchimento com CPF inválido
    await page.locator('#cpf-input').fill('00000000000');
    // Como é inválido, não deve avançar para e-mail
    await expect(page.locator('#email-input')).not.toBeVisible();
  });

  test('acessibilidade do fluxo de captação (Axe-core WCAG 2A/AA)', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .include('.hero-capture')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
