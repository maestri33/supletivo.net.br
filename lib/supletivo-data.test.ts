import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateEligibility,
  FAQ_ITEMS,
  formatBrazilPhone,
  HEADLINE_TEXT,
  PIXEL_ICONS,
  STORY_CARDS,
  validateEnrollmentForm,
} from './supletivo-data.ts';

test('HEADLINE_TEXT has 15 chars and 13 non-space letters matching 7-icon morph', () => {
  assert.equal(HEADLINE_TEXT.length, 15);
  const nonSpace = Array.from(HEADLINE_TEXT).filter((c) => c !== ' ').length;
  assert.equal(nonSpace, 13);
});

test('all 7 educational pixel icons are strictly 9x9 grids', () => {
  assert.equal(PIXEL_ICONS.length, 7);
  for (const icon of PIXEL_ICONS) {
    assert.equal(icon.rows.length, 9, `${icon.id} must have 9 rows`);
    for (const row of icon.rows) {
      assert.equal(row.length, 9, `${icon.id} row must have 9 cols`);
    }
  }
});

test('STORY_CARDS defines 12 unique cards across all 3 categories', () => {
  assert.equal(STORY_CARDS.length, 12);
  const ids = new Set(STORY_CARDS.map((c) => c.id));
  assert.equal(ids.size, 12);
  const categories = new Set(STORY_CARDS.map((c) => c.category));
  assert.deepEqual(
    [...categories].sort(),
    ['historias', 'passos', 'seguranca']
  );
  assert.ok(FAQ_ITEMS.length >= 6);
});

test('evaluateEligibility enforces Brazilian LDB age requirements (15 and 18)', () => {
  const adult = evaluateEligibility('18plus');
  assert.equal(adult.eligible, true);
  assert.equal(adult.recommendedStage, 'medio');

  const teen = evaluateEligibility('15to17');
  assert.equal(teen.eligible, true);
  assert.equal(teen.recommendedStage, 'fundamental');

  const child = evaluateEligibility('under15');
  assert.equal(child.eligible, false);
  assert.equal(child.recommendedStage, null);
});

test('formatBrazilPhone formats 10 and 11 digit numbers cleanly', () => {
  assert.equal(formatBrazilPhone('11987654321'), '(11) 98765-4321');
  assert.equal(formatBrazilPhone('1134567890'), '(11) 3456-7890');
  assert.equal(formatBrazilPhone('11'), '11');
});

test('validateEnrollmentForm catches invalid fields and accepts valid input', () => {
  const invalid = validateEnrollmentForm({
    name: 'Jo',
    whatsapp: '11999',
    email: 'invalido',
    stage: 'medio',
    payment: 'parcelado',
    state: 'XX',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.whatsapp);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.state);

  const valid = validateEnrollmentForm({
    name: 'Camila Rodrigues',
    whatsapp: '(11) 98765-4321',
    email: 'camila@exemplo.com.br',
    stage: 'medio',
    payment: 'pix',
    state: 'SP',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('narrative copy avoids phone-only completion claims for EJA compliance', () => {
  const allCopy = [
    ...PIXEL_ICONS.map((i) => `${i.id} ${i.label}`),
    ...STORY_CARDS.map((c) => `${c.title} ${c.subtitle} ${c.summary} ${c.metricValue} ${c.detailPoints.join(' ')}`),
    ...FAQ_ITEMS.map((f) => `${f.question} ${f.answer}`),
    evaluateEligibility('18plus').explanation,
    evaluateEligibility('15to17').explanation,
  ].join(' ');

  assert.equal(/celular|smartphone/i.test(allCopy), false);
});

