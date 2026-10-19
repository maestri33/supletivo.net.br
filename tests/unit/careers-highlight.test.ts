import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CAREERS_URL } from '../../src/config';

describe('Trabalhe Conosco — Botão Animado no Navbar e Destaque no Footer', () => {
  const htmlPath = path.resolve(__dirname, '../../dist/index.html');
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : '';

  it('o arquivo dist/index.html foi gerado com sucesso', () => {
    expect(html.length).toBeGreaterThan(1000);
  });

  it('navbar contém o botão animado de Trabalhe Conosco apontando diretamente para o portal de carreiras', () => {
    expect(html).toContain('class="header-careers-btn"');
    expect(html).toContain('class="careers-beacon"');
    expect(html).toContain('class="beacon-pulse"');
    expect(html).toContain('class="beacon-dot"');
    expect(html).toContain(`href="${CAREERS_URL}"`);
    expect(html).toContain('target="_blank"');
  });

  it('navbar mobile contém o link com beacon para Trabalhe Conosco', () => {
    expect(html).toContain('class="site-nav-careers-mobile"');
    expect(html).toContain('class="nav-beacon-dot"');
    expect(html).toContain(`href="${CAREERS_URL}"`);
  });

  it('footer contém o botão de destaque para Trabalhe Conosco', () => {
    expect(html).toContain('class="footer-careers-btn"');
    expect(html).toContain('class="footer-careers-beacon"');
    expect(html).toContain('class="footer-careers-badge"');
    expect(html).toContain(`href="${CAREERS_URL}"`);
    expect(html).toContain('target="_blank"');
  });

  it('a seção extra de página inteira NÃO existe (mantendo a página limpa e focada no aluno)', () => {
    expect(html).not.toContain('id="trabalhe-conosco"');
    expect(html).not.toContain('data-section="trabalhe-conosco"');
    expect(html).not.toContain('class="work-with-us');
  });
});
