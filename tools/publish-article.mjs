#!/usr/bin/env node
/**
 * Gerador e Publicador Automático de Artigos Newsjacking no Edge
 * Uso:
 *   node tools/publish-article.mjs --slug="minha-noticia" --title="..." --description="..." --kicker="..." --content-file="caminho.md"
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Parsing de argumentos CLI
const args = process.argv.slice(2);
const params = {};
for (const arg of args) {
  if (arg.startsWith('--')) {
    const [key, ...values] = arg.slice(2).split('=');
    params[key] = values.join('=');
  }
}

const title = params.title;
const description = params.description;
const kicker = params.kicker || 'NOTÍCIAS & CARREIRA';
const slug = params.slug || (title ? title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : null);
const contentFile = params['content-file'];
let content = params.content;

if (!title || !description || (!content && !contentFile)) {
  console.error('Uso obrigatório: --title="..." --description="..." [--slug="..."] [--kicker="..."] (--content="..." | --content-file="...")');
  process.exit(1);
}

if (!content && contentFile && existsSync(contentFile)) {
  content = readFileSync(contentFile, 'utf-8');
}

const today = new Date();
const dateISO = today.toISOString().slice(0, 10);
const dateFormatted = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
kicker: "${kicker.replace(/"/g, '\\"')}"
date: "${dateISO}"
dateFormatted: "${dateFormatted}"
author: "Redação Supletivo Brasil"
---

${content}
`;

const targetMdPath = resolve(ROOT, 'src/content/artigos', `${slug}.md`);
writeFileSync(targetMdPath, frontmatter, 'utf-8');
console.log(`[1/3] Artigo salvo em: ${targetMdPath}`);

// Build do Astro
console.log('[2/3] Compilando Astro no edge...');
const nodeBin = '/opt/homebrew/opt/node/bin';
const env = { ...process.env, PATH: `${nodeBin}:${process.env.PATH}` };

execSync('pnpm run build', { cwd: ROOT, stdio: 'inherit', env });

// Deploy no Cloudflare
console.log('[3/3] Publicando no Cloudflare Workers...');
execSync('npx wrangler deploy', { cwd: ROOT, stdio: 'inherit', env });

const liveUrl = `https://supletivo.net.br/artigos/${slug}/`;
console.log('\n======================================================');
console.log(`🚀 ARTIGO PUBLICADO COM SUCESSO!`);
console.log(`URL Oficial: ${liveUrl}`);
console.log('======================================================');
