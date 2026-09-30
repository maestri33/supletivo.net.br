import { chromium } from '@playwright/test';

async function run() {
  console.log('🚀 Iniciando teste real do funil em https://supletivo.net.br...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => console.log(`[BROWSER CONSOLE ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => console.error(`[BROWSER PAGEERROR] ${err.message}`));
  page.on('requestfailed', (req) => console.error(`[REQUEST FAILED] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`));
  page.on('response', (resp) => {
    if (resp.url().includes('/api/v1/')) {
      console.log(`[API RESPONSE] ${resp.status()} ${resp.url()}`);
    }
  });

  try {
    console.log('1. Acessando https://supletivo.net.br...');
    await page.goto('https://supletivo.net.br', { waitUntil: 'networkidle', timeout: 30000 });

    console.log('2. Clicando no CTA do Hero...');
    const cta = page.locator('a[data-cta="hero"]').first();
    await cta.click();

    console.log('3. Aguardando modal abrir...');
    const modal = page.locator('#lead-capture-modal');
    await modal.waitFor({ state: 'visible', timeout: 5000 });

    console.log('4. Preenchendo telefone 42998171770...');
    const phoneInput = page.locator('#lead-input-phone');
    await phoneInput.pressSequentially('42998171770', { delay: 40 });

    console.log('5. Aguardando campo de CPF...');
    const cpfInput = page.locator('#lead-input-cpf');
    await cpfInput.waitFor({ state: 'visible', timeout: 15000 });
    console.log('✓ Campo de CPF visível!');

    console.log('6. Preenchendo CPF 07461638947...');
    await cpfInput.pressSequentially('07461638947', { delay: 40 });

    console.log('7. Aguardando campo de e-mail e conferindo nome na credencial...');
    const emailInput = page.locator('#lead-input-email');
    await emailInput.waitFor({ state: 'visible', timeout: 15000 });

    const credName = await page.locator('#credential-student-name').textContent();
    console.log(`✓ Nome na credencial: "${credName}"`);

    console.log('8. Preenchendo e-mail v7maestri@gmail.com...');
    await emailInput.pressSequentially('v7maestri@gmail.com', { delay: 40 });

    console.log('9. Aguardando redirecionamento para OTP...');
    await page.waitForURL('**/autenticacao/otp**', { timeout: 25000 });
    console.log(`🎉 Sucesso absoluto! URL final: ${page.url()}`);

  } catch (err) {
    console.error('❌ ERRO NO TESTE:', err);
    await page.screenshot({ path: 'test-failure.png' });
    console.log('Screenshot salva em test-failure.png');
  } finally {
    await browser.close();
  }
}

run();
