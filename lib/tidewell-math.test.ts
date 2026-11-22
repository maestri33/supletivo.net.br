import test from 'node:test';
import assert from 'node:assert/strict';
import {
  arcStepRad,
  areCardsSettled,
  computeCardTargetPose,
  computeFanPose,
  computeHeroHeadlineOpacity,
  computeManifestoTrackX,
  computeMetrics,
  computePilePose,
  computeSkyState,
  computeSpriteStyle,
  computeWheelPose,
  eBackOut,
  eGlide,
  eInOut,
  eOutCubic,
  evalPlaneFlight,
  iconsRemainingForCharCount,
  PLANE_LAND_SEC,
  stepCardInertia,
} from './tidewell-math.ts';
import { HEADLINE_TEXT, SPRITE_CROPS } from './supletivo-data.ts';

test('easing functions hit boundary values and monotonic expectations', () => {
  assert.equal(eOutCubic(0), 0);
  assert.equal(eOutCubic(1), 1);
  assert.equal(eInOut(0), 0);
  assert.equal(eInOut(0.5), 0.5);
  assert.equal(eInOut(1), 1);
  assert.equal(eGlide(0), 0);
  assert.equal(eGlide(1), 1);
  assert.ok(eGlide(0.5) > 0.7 && eGlide(0.5) < 0.96);
  assert.equal(eBackOut(0), 0);
  assert.equal(eBackOut(1), 1);
  assert.ok(eBackOut(0.75) > 1);
});

test('computeMetrics separates mobile portrait from desktop and landscape', () => {
  const desktop = computeMetrics(1440, 900);
  assert.equal(desktop.mob, false);
  assert.ok(desktop.hfs > 85 && desktop.hfs < 110);

  const phonePortrait = computeMetrics(375, 812);
  assert.equal(phonePortrait.mob, true);
  assert.ok(phonePortrait.cw <= 120);

  const phoneLandscape = computeMetrics(812, 375);
  assert.equal(phoneLandscape.mob, false);
});

test('sprite crop formula produces exact percentage sizing and aspect ratio', () => {
  const plane = computeSpriteStyle(SPRITE_CROPS.plane);
  assert.ok(plane.aspectRatio > 1.4 && plane.aspectRatio < 1.5);
  assert.ok(plane.backgroundSize.includes('%'));
  assert.ok(plane.backgroundPosition.includes('%'));
});

test('iconsRemainingForCharCount tracks 13 non-space letters of Mas não acabou.', () => {
  assert.equal(iconsRemainingForCharCount(0, HEADLINE_TEXT), 7);
  assert.equal(iconsRemainingForCharCount(3, HEADLINE_TEXT), 6); // "Mas" (3 letters -> 10 left -> ceil(70/13)=6)
  assert.equal(iconsRemainingForCharCount(4, HEADLINE_TEXT), 6); // space doesn't consume an icon
  assert.equal(iconsRemainingForCharCount(HEADLINE_TEXT.length, HEADLINE_TEXT), 0);
});

test('evalPlaneFlight enters, lands on icon 0, and fades cleanly', () => {
  assert.equal(evalPlaneFlight(0.1, 1440, 900, 500, 300).visible, false);
  const mid = evalPlaneFlight(0.65, 1440, 900, 500, 300);
  assert.equal(mid.visible, true);
  assert.equal(mid.opacity, 1);

  const landed = evalPlaneFlight(PLANE_LAND_SEC, 1440, 900, 500, 300);
  assert.ok(Math.abs(landed.x - 500) < 0.01);
  assert.ok(Math.abs(landed.y - 300) < 0.01);

  const gone = evalPlaneFlight(PLANE_LAND_SEC + 0.1, 1440, 900, 500, 300);
  assert.equal(gone.visible, false);
});

test('wheel cards maintain 1.05 * cw chord spacing between adjacent visible cards', () => {
  const m = computeMetrics(1440, 900);
  const c4 = computeWheelPose(4, m, 0.5);
  const c5 = computeWheelPose(5, m, 0.5);
  const chord = Math.hypot(c5.x - c4.x, c5.y - c4.y);
  assert.ok(Math.abs(chord - 1.05 * m.cw) < 1.0, `chord=${chord}, target=${1.05 * m.cw}`);
  assert.ok(arcStepRad(m.cw, 900) > 0);
});

test('card inertia snaps off-screen wraps instead of streaking across viewport', () => {
  const m = computeMetrics(1440, 900);
  const cur = { x: -300, y: 800, rot: -70, scale: 1, opacity: 0 };
  const target = { x: 1740, y: 800, rot: 70, scale: 1, opacity: 0 };
  const next = stepCardInertia(cur, target, 0, 16.67, false, m.W);
  assert.equal(next.x, target.x);
});

test('settling check requires visible cards within 3px and 1deg', () => {
  const m = computeMetrics(1440, 900);
  const targets = Array.from({ length: 12 }, (_, i) => computePilePose(i, m));
  const settled = targets.map((t) => ({ ...t, x: t.x + 1.5, rot: t.rot + 0.5 }));
  const unsettled = targets.map((t, i) =>
    i === 0 ? { ...t, x: t.x + 10 } : { ...t }
  );
  assert.equal(areCardsSettled(settled, targets), true);
  assert.equal(areCardsSettled(unsettled, targets), false);
});

test('computeSkyState gates zoom until sky panel is open and blacks out before dark nav', () => {
  const m = computeMetrics(1440, 900);
  const closed = computeSkyState(0.95, 0.2, m, 1, false);
  assert.equal(closed.zoomQ, 0);
  assert.equal(closed.blackoutOpacity, 0);

  const openFull = computeSkyState(0.8, 1, m, 1, false);
  assert.equal(openFull.skyWordsTrigger, true);
  assert.equal(openFull.darkNav, false);

  const endZoom = computeSkyState(0.99, 1, m, 1, false);
  assert.equal(endZoom.blackoutOpacity, 1);
  assert.equal(endZoom.darkNav, true);
});

test('hero headline fades before touching nav and manifesto track spans full track', () => {
  const m = computeMetrics(1440, 900);
  assert.equal(computeHeroHeadlineOpacity(0, m), 1);
  assert.equal(computeHeroHeadlineOpacity(300, m), 0);

  const startX = computeManifestoTrackX(0, 4200, 1440, false);
  const endX = computeManifestoTrackX(1, 4200, 1440, false);
  assert.ok(startX > 0);
  assert.ok(endX < -2000);
});

test('card target pose transitions cleanly through hero fan, scatter, pile, and wheel', () => {
  const m = computeMetrics(1440, 900);
  const fan0 = computeFanPose(0, m);
  assert.equal(fan0.opacity, 1);
  const fanHidden = computeCardTargetPose(7, 0, m, 5, false);
  assert.equal(fanHidden.opacity, 0);
  const pile7 = computeCardTargetPose(7, 0.31, m, 5, false);
  assert.equal(pile7.opacity, 1);
});

test('computeCardScrollParallax creates depth-separated vertical offsets during story scroll and zeroes at rest/reducedMotion', () => {
  const rest = computeCardScrollParallax(2, 0, 900, false, 0, false);
  assert.equal(rest.dy, 0);
  assert.equal(rest.dScale, 0);

  const reduced = computeCardScrollParallax(2, 0.25, 900, false, 0.8, true);
  assert.equal(reduced.dy, 0);
  assert.equal(reduced.dScale, 0);

  const bg = computeCardScrollParallax(0, 0.22, 900, false, 0.4, false);
  const fg = computeCardScrollParallax(2, 0.22, 900, false, 0.4, false);
  assert.ok(fg.depth > 0 && bg.depth < 0);
  assert.ok(Math.abs(fg.dy - bg.dy) > 25, 'foreground and background cards should diverge vertically');
  assert.ok(fg.dScale > 0 && bg.dScale < 0);

  const skyDone = computeCardScrollParallax(2, 0.78, 900, false, 0, false);
  assert.equal(skyDone.dy, 0);
});

