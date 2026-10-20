import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const supletivoDist = path.resolve(__dirname, '../dist');
const promotorDist = path.resolve(__dirname, '../../promotor.supletivo.net.br/dist');

function checkFile(baseDir, relPath, tests) {
  const fullPath = path.join(baseDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`FAIL: File ${fullPath} does not exist`);
    return false;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  let ok = true;
  for (const t of tests) {
    if (t.forbidden) {
      if (content.includes(t.forbidden)) {
        console.error(`FAIL [${relPath}]: contains forbidden string "${t.forbidden}"`);
        ok = false;
      } else {
        console.log(`OK [${relPath}]: does NOT contain "${t.forbidden}"`);
      }
    }
    if (t.required) {
      if (!content.includes(t.required)) {
        console.error(`FAIL [${relPath}]: missing required string "${t.required}"`);
        ok = false;
      } else {
        console.log(`OK [${relPath}]: contains required "${t.required}"`);
      }
    }
    if (t.regexRequired) {
      if (!t.regexRequired.test(content)) {
        console.error(`FAIL [${relPath}]: missing required regex ${t.regexRequired}`);
        ok = false;
      } else {
        console.log(`OK [${relPath}]: matches required ${t.regexRequired}`);
      }
    }
    if (t.regexForbidden) {
      if (t.regexForbidden.test(content)) {
        console.error(`FAIL [${relPath}]: matches forbidden regex ${t.regexForbidden}`);
        ok = false;
      } else {
        console.log(`OK [${relPath}]: does NOT match ${t.regexForbidden}`);
      }
    }
  }
  return ok;
}

console.log('--- Verifying supletivo.net.br/dist ---');

const indexOk = checkFile(supletivoDist, 'index.html', [
  { forbidden: 'Desconto de Consultor Ativado' },
  { forbidden: 'Condição por Indicação Ativada' },
  { forbidden: 'Economia de R$ 0' },
  { forbidden: 'Matrícula Localizada' },
  { forbidden: 'Redirecionando para autenticação' },
  { forbidden: 'CANDIDATO OFICIAL' },
  { forbidden: 'DOCUMENTAÇÃO PENDENTE' },
  { forbidden: 'AGUARDANDO CONTATO' },
  { forbidden: 'data-platform-version' },
  { required: 'você economiza' },
  { required: '303,80' },
  { required: 'WhatsApp (11) 92006-2177' },
  { required: 'Colégio Brasil Interativo' },
  { required: 'Parecer CEE nº 412/2019' },
  { required: '<meta name="app-version"' },
  { required: '<meta name="version"' },
  { required: 'respira: <strong' },
  { regexRequired: />Você<\/span>[\s\n\r]*<span[^>]*>parou\.<\/span>/ },
  { regexRequired: />Mas<\/span>[\s\n\r]*<span[^>]*>não<\/span>/ },
]);

const supletivoOnlineOk = checkFile(supletivoDist, 'supletivo-online/index.html', [
  { forbidden: '12x de R$ 150' },
  { forbidden: '1.932' },
  { forbidden: '1.800' },
  { forbidden: '12x R$ 150' },
  { regexRequired: /12x de R\$[\s\u00a0]*159,90/ },
  { regexRequired: /12x R\$[\s\u00a0]*159,90/ },
  { required: '1.918,80' },
  { required: '1.615' },
  { required: 'WhatsApp (11) 92006-2177' },
]);

const terminarEnsinoMedioOk = checkFile(supletivoDist, 'terminar-ensino-medio/index.html', [
  { forbidden: 'credenciada ao MEC' },
  { required: 'autorizada pelo Conselho Estadual de Educação (CEE)' },
  { regexRequired: /12x de R\$[\s\u00a0]*159,90/ },
  { regexRequired: /12x R\$[\s\u00a0]*159,90/ },
  { required: '1.918,80' },
  { required: '1.615' },
  { required: '/ensino-fundamental/' },
  { required: 'Trabalhe conosco' },
  { required: 'WhatsApp (11) 92006-2177' },
]);

const ensinoFundamentalOk = checkFile(supletivoDist, 'ensino-fundamental/index.html', [
  { required: 'Ensino Fundamental' },
  { forbidden: 'credenciada ao MEC' },
  { regexRequired: /12x de R\$[\s\u00a0]*159,90/ },
  { regexRequired: /12x R\$[\s\u00a0]*159,90/ },
  { required: '1.615' },
  { required: 'WhatsApp (11) 92006-2177' },
]);

console.log('--- Verifying promotor.supletivo.net.br/dist ---');

const promotorIndexOk = checkFile(promotorDist, 'index.html', [
  { forbidden: 'Nada por aqui nesse filtro' },
  { forbidden: 'Promotor Já Cadastrado' },
  { forbidden: 'CREDENCIAL OFICIAL DE PROMOTOR' },
  { required: 'Validação e ativação rápida' },
  { required: '<meta name="version"' },
]);

// Verificação global contra strings proibidas em todos os arquivos html
let globalOk = true;
function scanDist(dir, label) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir, { recursive: true });
  for (const f of files) {
    if (typeof f === 'string' && f.endsWith('.html')) {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      if (content.includes('Economia de R$ 0')) {
        console.error(`FAIL [${label}/${f}]: found "Economia de R$ 0"`);
        globalOk = false;
      }
      if (content.includes('1.932')) {
        console.error(`FAIL [${label}/${f}]: found "1.932"`);
        globalOk = false;
      }
      if (/12x\s+(?:de\s+)?R\$\s*150/i.test(content)) {
        console.error(`FAIL [${label}/${f}]: found "12x R$ 150"`);
        globalOk = false;
      }
      if (content.includes('credenciada ao MEC')) {
        console.error(`FAIL [${label}/${f}]: found "credenciada ao MEC"`);
        globalOk = false;
      }
      if (content.includes('Matrícula Localizada')) {
        console.error(`FAIL [${label}/${f}]: found "Matrícula Localizada" in static HTML`);
        globalOk = false;
      }
      if (content.includes('Nada por aqui nesse filtro')) {
        console.error(`FAIL [${label}/${f}]: found "Nada por aqui nesse filtro" in static HTML`);
        globalOk = false;
      }
      // Checa se v0.0. aparece visível fora de tags meta/script
      const bodyOnly = content.match(/<body[\s\S]*?<\/body>/i)?.[0] || '';
      const bodyStripped = bodyOnly.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<template[\s\S]*?<\/template>/gi, '');
      if (/v0\.0\./.test(bodyStripped)) {
        console.error(`FAIL [${label}/${f}]: found "v0.0." visible in body`);
        globalOk = false;
      }
    }
  }
}

scanDist(supletivoDist, 'supletivo');
scanDist(promotorDist, 'promotor');

if (indexOk && supletivoOnlineOk && terminarEnsinoMedioOk && ensinoFundamentalOk && promotorIndexOk && globalOk) {
  console.log('\n>>> ALL SUPLETIVO BRASIL ECOSYSTEM CHECKS PASSED! <<<');
} else {
  console.error('\n>>> SOME CHECKS FAILED! <<<');
  process.exit(1);
}
