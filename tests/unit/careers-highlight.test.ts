import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Remoção Definitiva de Promotor, Carreiras e Renda Extra', () => {
  const htmlPath = fs.existsSync(path.resolve(__dirname, '../../dist/client/index.html')) ? path.resolve(__dirname, '../../dist/client/index.html') : path.resolve(__dirname, '../../dist/index.html');
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : '';

  it('o arquivo dist/index.html foi gerado com sucesso', () => {
    expect(html.length).toBeGreaterThan(1000);
  });

  it('navbar NÃO contém o botão ou link de Trabalhe Conosco / Renda Extra', () => {
    expect(html).not.toContain('class="header-careers-btn"');
    expect(html).not.toContain('class="careers-beacon"');
    expect(html).not.toContain('Trabalhe conosco');
    expect(html).not.toContain('Renda Extra');
    expect(html).not.toContain('https://promotor.supletivo.net.br');
  });

  it('navbar mobile NÃO contém o link ou card para Trabalhe Conosco / Programa de Promotores', () => {
    expect(html).not.toContain('class="mobile-careers-card"');
    expect(html).not.toContain('Programa de Promotores');
  });

  it('footer NÃO contém o botão de destaque para Trabalhe Conosco ou Promotores', () => {
    expect(html).not.toContain('class="footer-careers-btn"');
    expect(html).not.toContain('class="footer-careers-beacon"');
    expect(html).not.toContain('class="footer-careers-badge"');
    expect(html).not.toContain('Programa oficial de promotores e polos');
  });

  it('não há componente de banner ou menção residual de promotores/afiliados na landing page', () => {
    expect(html).not.toContain('id="promoter-banner"');
    expect(html).not.toContain('data-promoter-banner');
    expect(html).not.toContain('id="trabalhe-conosco"');
    expect(html).not.toContain('data-section="trabalhe-conosco"');
  });
});
