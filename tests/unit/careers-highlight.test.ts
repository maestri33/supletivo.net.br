import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CAREERS_URL } from '../../src/config';

describe('Trabalhe Conosco — Destaque na Página e Botão Animado no Navbar', () => {
  const htmlPath = path.resolve(__dirname, '../../dist/index.html');
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : '';

  it('o arquivo dist/index.html foi gerado com sucesso', () => {
    expect(html.length).toBeGreaterThan(1000);
  });

  it('navbar contém o botão animado de Trabalhe Conosco e o beacon pulsante', () => {
    expect(html).toContain('class="header-careers-btn"');
    expect(html).toContain('class="careers-beacon"');
    expect(html).toContain('class="beacon-pulse"');
    expect(html).toContain('class="beacon-dot"');
    expect(html).toContain('href="#trabalhe-conosco"');
  });

  it('navbar mobile contém o link com beacon para Trabalhe Conosco', () => {
    expect(html).toContain('class="site-nav-careers-mobile"');
    expect(html).toContain('class="nav-beacon-dot"');
  });

  it('página principal possui a seção dedicada com id="trabalhe-conosco"', () => {
    expect(html).toContain('id="trabalhe-conosco"');
    expect(html).toContain('data-section="trabalhe-conosco"');
    expect(html).toContain('class="work-with-us');
  });

  it('seção destaca os pilares de remuneração (Pix Semanal, Remoto pelo celular, Painel do Promotor)', () => {
    expect(html).toContain('Pix Semanal');
    expect(html).toContain('R$ 100');
    expect(html).toContain('100% Remoto pelo Celular');
    expect(html).toContain('Painel em Tempo Real');
    expect(html).toContain('Polo Parceiro Autorizado');
  });

  it('botão de ação principal aponta para o portal oficial de promotores', () => {
    expect(html).toContain(`href="${CAREERS_URL}"`);
    expect(html).toContain('data-cta="work_with_us"');
  });
});
