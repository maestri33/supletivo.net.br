import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

function checkFile(relPath, tests) {
  const fullPath = path.join(distDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`FAIL: File ${relPath} does not exist`);
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

const indexOk = checkFile('index.html', [
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
  { required: '<meta name="app-version"' },
]);

const supletivoOnlineOk = checkFile('supletivo-online/index.html', [
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

const terminarEnsinoMedioOk = checkFile('terminar-ensino-medio/index.html', [
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

const ensinoFundamentalOk = checkFile('ensino-fundamental/index.html', [
  { required: 'Ensino Fundamental' },
  { regexRequired: /12x de R\$[\s\u00a0]*159,90/ },
  { regexRequired: /12x R\$[\s\u00a0]*159,90/ },
  { required: '1.615' },
  { required: 'WhatsApp (11) 92006-2177' },
]);

if (indexOk && supletivoOnlineOk && terminarEnsinoMedioOk && ensinoFundamentalOk) {
  console.log('\n>>> ALL SUPLETIVO.NET.BR CHECKS PASSED! <<<');
} else {
  console.error('\n>>> SOME CHECKS FAILED! <<<');
  process.exit(1);
}
