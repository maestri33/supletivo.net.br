import type { CropBox } from './supletivo-data';
import {
  HEADLINE_TEXT,
  HERO_CARD_ORDER,
  HERO_CARD_START_TIMES,
} from './supletivo-data';

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function eOutCubic(t: number): number {
  const x = clamp(t, 0, 1);
  return 1 - Math.pow(1 - x, 3);
}

export function eInOut(t: number): number {
  const x = clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Cubic-bezier(0.25, 0.75, 0.2, 1) evaluated accurately via Newton-Raphson.
 */
export function eGlide(t: number): number {
  const x = clamp(t, 0, 1);
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const x1 = 0.25;
  const y1 = 0.75;
  const x2 = 0.2;
  const y2 = 1.0;

  let u = x;
  for (let i = 0; i < 6; i++) {
    const inv = 1 - u;
    const bx = 3 * inv * inv * u * x1 + 3 * inv * u * u * x2 + u * u * u;
    const dbx =
      3 * inv * inv * x1 + 6 * inv * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(dbx) < 1e-6) break;
    u = clamp(u - (bx - x) / dbx, 0, 1);
  }
  const inv = 1 - u;
  return 3 * inv * inv * u * y1 + 3 * inv * u * u * y2 + u * u * u;
}

export function eBackOut(t: number, overshoot = 1.15): number {
  const x = clamp(t, 0, 1);
  const c1 = overshoot;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

export function dampFactor(weightPerFrame: number, dtMs: number): number {
  const frames = clamp(dtMs, 0, 100) / 16.67;
  return 1 - Math.pow(1 - weightPerFrame, frames);
}

export interface ViewportMetrics {
  W: number;
  H: number;
  mob: boolean;
  u: number;
  n: number;
  hfs: number;
  ic: number;
  pfs: number;
  sfs: number;
  mfs: number;
  camw: number;
  cw: number;
  navH: number;
}

export function computeMetrics(W: number, H: number): ViewportMetrics {
  const mob = W < 820 && W < H * 1.1;
  const u = Math.min(W / 1440, H / 800);
  const n = mob ? Math.min(1, W / 560) : clamp(W / 1440, 0.68, 1.2);
  const hfs = mob
    ? Math.min(W * 0.11, H * 0.082)
    : Math.min(W * 0.068, H * 0.122);
  const ic = hfs * 0.62;
  const pfs = mob
    ? Math.min(W * 0.078, 36)
    : Math.min(W * 0.032, H * 0.058);
  const sfs = mob
    ? Math.min(W * 0.086, 40)
    : Math.min(W * 0.04, H * 0.074);
  const mfs = mob
    ? Math.min(W * 0.1, H * 0.072)
    : Math.min(W * 0.048, H * 0.095);
  const camw = mob
    ? Math.min(W * 0.56, H * 0.3)
    : Math.min(W * 0.21, H * 0.36);
  const cw = mob
    ? Math.min(W * 0.29, H * 0.19)
    : Math.min(W / 1440, H / 780) * 204;

  return {
    W,
    H,
    mob,
    u,
    n,
    hfs,
    ic,
    pfs,
    sfs,
    mfs,
    camw,
    cw,
    navH: 82 * n,
  };
}

export interface SpriteStyle {
  backgroundSize: string;
  backgroundPosition: string;
  aspectRatio: number;
}

export function computeSpriteStyle(crop: CropBox): SpriteStyle {
  const [x0, y0, x1, y1] = crop;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const sizeX = (100 / dx).toFixed(4);
  const sizeY = (100 / dy).toFixed(4);
  const posX = dx >= 1 ? '0' : ((x0 / (1 - dx)) * 100).toFixed(4);
  const posY = dy >= 1 ? '0' : ((y0 / (1 - dy)) * 100).toFixed(4);
  return {
    backgroundSize: `${sizeX}% ${sizeY}%`,
    backgroundPosition: `${posX}% ${posY}%`,
    aspectRatio: dx / dy,
  };
}

export interface CardPose {
  x: number;
  y: number;
  rot: number;
  scale: number;
  opacity: number;
}

export function arcStepRad(cw: number, R: number): number {
  const ratio = clamp((1.05 * cw) / (2 * R), 0, 0.999);
  return 2 * Math.asin(ratio);
}

const DESKTOP_SCATTER: readonly [number, number, number][] = [
  [0.08, 0.46, -20],
  [0.2, 0.86, -12],
  [0.8, 0.84, 14],
  [0.38, 1.04, -8],
  [0.92, 0.42, 16],
  [0.62, 1.04, 9],
];

const MOBILE_SCATTER: readonly [number, number, number][] = [
  [0.06, 0.62, -20],
  [0.45, 0.68, 12],
  [0.94, 0.62, 16],
  [0.22, 0.93, -14],
  [0.72, 0.96, 9],
  [0.5, 1.3, 0],
];

export function computeFanPose(i: number, m: ViewportMetrics): CardPose {
  if (i >= 6) {
    return { x: m.W * 0.5, y: m.H * 1.4, rot: 0, scale: 1, opacity: 0 };
  }
  const R = m.mob ? m.W * 1.35 : (1250 * m.W) / 1440;
  const step = arcStepRad(m.cw, R);
  const theta = (i - 2.5) * step;
  const cx = m.mob ? m.W * 0.5 : m.W * 0.53;
  // Slightly lower arc center so above-the-fold CTA has clean breathing room
  const cy = (m.mob ? m.H * 0.9 : m.H * 0.885) + R;
  const x = cx + R * Math.sin(theta) - (m.mob ? 0 : m.W * 0.02);
  const y = cy - R * Math.cos(theta) + (m.mob ? m.cw * 0.18 : 0);
  const rot = (theta * 180) / Math.PI;
  return { x, y, rot, scale: 1, opacity: 1 };
}

export function computeScatterPose(i: number, m: ViewportMetrics): CardPose {
  if (i >= 6) {
    return { x: m.W * 0.5, y: m.H * 1.4, rot: 0, scale: 1, opacity: 0 };
  }
  const table = m.mob ? MOBILE_SCATTER : DESKTOP_SCATTER;
  const [xf, rawYf, rot] = table[i];
  let yf = rawYf;
  if (m.H < 500 && yf < 0.1) {
    yf += 0.08;
  }
  return {
    x: m.W * xf,
    y: m.H * yf,
    rot,
    scale: 1,
    opacity: 1,
  };
}

export function computePilePose(i: number, m: ViewportMetrics): CardPose {
  const x = m.W * 0.5 + ((i % 3) - 1) * m.cw * 0.08;
  const y = m.H * 0.62 + (((i * 7) % 5) - 2) * m.cw * 0.04;
  const sign = i % 2 === 0 ? 1 : -1;
  const rot = sign * (4 + i * 1.3);
  return { x, y, rot, scale: 1, opacity: 1 };
}

export function computeWheelPose(
  i: number,
  m: ViewportMetrics,
  wheelProgress: number
): CardPose {
  const rotSlots = -3 * wheelProgress;
  const slot = ((((i + rotSlots) % 12) + 12) % 12) - 5.5;
  const R = m.mob ? m.W * 1.2 : (900 * m.W) / 1440;
  const step = arcStepRad(m.cw, R);
  const angleRad = slot * step;
  const angleDeg = (angleRad * 180) / Math.PI;
  const cx = m.W * 0.5;
  const cy = (m.mob ? m.H * 0.78 : m.H * 0.84) + R;
  const x = cx + R * Math.sin(angleRad);
  const y = cy - R * Math.cos(angleRad);
  const opacity = Math.abs(angleDeg) < 62 ? 1 : 0;
  return { x, y, rot: angleDeg, scale: 1, opacity };
}

export function blendPose(a: CardPose, b: CardPose, t: number): CardPose {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    rot: lerp(a.rot, b.rot, t),
    scale: lerp(a.scale, b.scale, t),
    opacity: lerp(a.opacity, b.opacity, t),
  };
}

export function computeCardTargetPose(
  i: number,
  p: number,
  m: ViewportMetrics,
  introSec: number,
  reducedMotion: boolean
): CardPose {
  const fan = computeFanPose(i, m);

  if (p <= 0.004) {
    if (reducedMotion || i >= 6) {
      return fan;
    }
    const orderIdx = HERO_CARD_ORDER.indexOf(
      i as (typeof HERO_CARD_ORDER)[number]
    );
    const startT = orderIdx >= 0 ? HERO_CARD_START_TIMES[orderIdx] : 0.4;
    const u = clamp((introSec - startT) / 0.65, 0, 1);
    if (u <= 0) {
      return {
        x: fan.x,
        y: m.H + m.cw * 1.2,
        rot: fan.rot + 8,
        scale: 1,
        opacity: 0,
      };
    }
    const eased = eBackOut(u, 1.15);
    return {
      x: fan.x,
      y: lerp(m.H + m.cw * 1.2, fan.y, eased),
      rot: lerp(fan.rot + 8, fan.rot, eased),
      scale: 1,
      opacity: clamp(u / 0.25, 0, 1),
    };
  }

  if (p <= 0.085) {
    const t = eInOut((p - 0.004) / (0.085 - 0.004));
    return blendPose(fan, computeScatterPose(i, m), t);
  }

  if (p <= 0.21) {
    return computeScatterPose(i, m);
  }

  if (p <= 0.31) {
    const t = eInOut((p - 0.21) / (0.31 - 0.21));
    const scatter = computeScatterPose(i, m);
    const pile = computePilePose(i, m);
    const blended = blendPose(scatter, pile, t);
    if (i >= 8) {
      blended.opacity = clamp((t - 0.15) / 0.85, 0, 1);
    }
    return blended;
  }

  if (p <= 0.41) {
    const t = eGlide((p - 0.31) / (0.41 - 0.31));
    return blendPose(computePilePose(i, m), computeWheelPose(i, m, 0), t);
  }

  if (p <= 0.57) {
    const wp = eInOut((p - 0.41) / (0.57 - 0.41));
    return computeWheelPose(i, m, wp);
  }

  return computeWheelPose(i, m, 1);
}

export function stepCardInertia(
  current: CardPose,
  target: CardPose,
  index: number,
  dtMs: number,
  immediate: boolean,
  W: number
): CardPose {
  if (immediate) {
    return { ...target };
  }
  const hugeJump = Math.abs(target.x - current.x) > W * 0.75;
  if (hugeJump && (target.opacity < 0.05 || current.opacity < 0.05)) {
    return { ...target };
  }
  const w = 0.072 + (index % 4) * 0.01;
  const k = dampFactor(w, dtMs);
  return {
    x: lerp(current.x, target.x, k),
    y: lerp(current.y, target.y, k),
    rot: lerp(current.rot, target.rot, k),
    scale: lerp(current.scale, target.scale, k),
    opacity: lerp(current.opacity, target.opacity, k),
  };
}

export function areCardsSettled(
  currents: readonly CardPose[],
  targets: readonly CardPose[]
): boolean {
  for (let i = 0; i < targets.length; i++) {
    const c = currents[i];
    const t = targets[i];
    if (!c) return false;
    if (t.opacity < 0.05 && c.opacity < 0.05) continue;
    const dist = Math.hypot(c.x - t.x, c.y - t.y);
    const dRot = Math.abs(c.rot - t.rot);
    if (dist > 3 || dRot > 1) {
      return false;
    }
  }
  return true;
}

// Conversion-tuned Catmull-Rom flight path (0.20s -> 1.05s)
const PLANE_WAYPOINTS: readonly [number, number, number][] = [
  [0.2, -3, 62],
  [0.32, 4, 58],
  [0.44, 13, 52],
  [0.54, 22, 43],
  [0.64, 30, 34],
  [0.72, 31.5, 37.5],
  [0.79, 25, 37.5],
  [0.86, 21, 34.5],
  [0.93, 22, 39],
  [0.99, 26, 39],
];

function catmullRom1D(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  u: number
): number {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * u +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * u3)
  );
}

export interface PlaneState {
  visible: boolean;
  x: number;
  y: number;
  angleDeg: number;
  scale: number;
  opacity: number;
}

function samplePlanePoint(
  t: number,
  pts: readonly { t: number; x: number; y: number }[]
): { x: number; y: number } {
  if (t <= pts[0].t) return { x: pts[0].x, y: pts[0].y };
  const last = pts.length - 1;
  if (t >= pts[last].t) return { x: pts[last].x, y: pts[last].y };

  let seg = 0;
  for (let i = 0; i < last; i++) {
    if (t >= pts[i].t && t <= pts[i + 1].t) {
      seg = i;
      break;
    }
  }
  const p0 = pts[Math.max(0, seg - 1)];
  const p1 = pts[seg];
  const p2 = pts[seg + 1];
  const p3 = pts[Math.min(last, seg + 2)];
  const u = (t - p1.t) / Math.max(1e-5, p2.t - p1.t);
  return {
    x: catmullRom1D(p0.x, p1.x, p2.x, p3.x, u),
    y: catmullRom1D(p0.y, p1.y, p2.y, p3.y, u),
  };
}

export const PLANE_LAND_SEC = 1.05;

export function evalPlaneFlight(
  t: number,
  W: number,
  H: number,
  landX: number,
  landY: number
): PlaneState {
  if (t < 0.2 || t > PLANE_LAND_SEC + 0.06) {
    return { visible: false, x: landX, y: landY, angleDeg: 0, scale: 1, opacity: 0 };
  }

  const pts = [
    ...PLANE_WAYPOINTS.map(([wt, xPct, yPct]) => ({
      t: wt,
      x: (xPct / 100) * W,
      y: (yPct / 100) * H,
    })),
    { t: PLANE_LAND_SEC, x: landX, y: landY },
  ];

  const clampedT = Math.min(t, PLANE_LAND_SEC);
  const pos = samplePlanePoint(clampedT, pts);
  const prev = samplePlanePoint(Math.max(0.2, clampedT - 0.008), pts);
  const next = samplePlanePoint(Math.min(PLANE_LAND_SEC, clampedT + 0.008), pts);
  const angleDeg =
    (Math.atan2(next.y - prev.y, next.x - prev.x) * 180) / Math.PI + 18;

  if (t <= PLANE_LAND_SEC) {
    const fadeIn = clamp((t - 0.2) / 0.06, 0, 1);
    return {
      visible: true,
      x: pos.x,
      y: pos.y,
      angleDeg,
      scale: 1,
      opacity: fadeIn,
    };
  }

  const fadeOut = clamp((t - PLANE_LAND_SEC) / 0.06, 0, 1);
  return {
    visible: true,
    x: landX,
    y: landY,
    angleDeg,
    scale: lerp(1, 0.6, fadeOut),
    opacity: 1 - fadeOut,
  };
}

/**
 * Icon count remaining after `charCount` characters of "Mas não acabou." have appeared.
 * Uses ceil(7 * lettersLeft / nonSpaceTotal) where nonSpaceTotal = 13.
 */
export function iconsRemainingForCharCount(
  charCount: number,
  text: string = HEADLINE_TEXT
): number {
  const clamped = clamp(charCount, 0, text.length);
  let totalNonSpace = 0;
  let nonSpaceRevealed = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== ' ') {
      totalNonSpace++;
      if (i < clamped) nonSpaceRevealed++;
    }
  }
  if (totalNonSpace === 0) return 0;
  const lettersLeft = Math.max(0, totalNonSpace - nonSpaceRevealed);
  return Math.ceil((7 * lettersLeft) / totalNonSpace);
}

export interface SkyRenderState {
  visible: boolean;
  opacity: number;
  clipPath: string;
  mediaScale: number;
  cameraScale: number;
  cameraYawDeg: number;
  cameraBobPx: number;
  zoomQ: number;
  blackoutOpacity: number;
  skyWordsTrigger: boolean;
  skyWordsOpacity: number;
  darkNav: boolean;
}

export function computeSkyState(
  p: number,
  skyDisp: number,
  m: ViewportMetrics,
  nowSec: number,
  inManifesto: boolean
): SkyRenderState {
  const eSky = eInOut(clamp(skyDisp, 0, 1));
  const top0 = m.mob ? 36 : 28;
  const bottom0 = m.mob ? 48 : 52;
  const side0 = m.mob ? 29 : 41.5;

  const top = top0 * (1 - eSky);
  const bottom = bottom0 * (1 - eSky);
  const side = side0 * (1 - eSky);
  const radius = 14 * (1 - eSky);

  const rawQ = Math.pow(clamp((p - 0.88) / 0.09, 0, 1), 1.6);
  const zoomGate = clamp((skyDisp - 0.9) / 0.1, 0, 1);
  const q = rawQ * zoomGate;

  const yawP = clamp((p - 0.74) / 0.14, 0, 1);
  const cameraYawDeg = lerp(-12, 12, yawP);
  const bobDamp = 1 - clamp(q / 0.25, 0, 1);
  const cameraBobPx = Math.sin(nowSec * 1.6) * 6 * m.n * bobDamp;

  const revealScale = lerp(0.55, 1, eSky);
  const zoomScale = 1 + q * q * 28;
  const blackoutOpacity = clamp((q - 0.45) / (0.85 - 0.45), 0, 1);
  const skyWordsOpacity = 1 - clamp((q - 0.02) / 0.18, 0, 1);

  return {
    visible: skyDisp > 0.001,
    opacity: clamp(skyDisp / 0.06, 0, 1),
    clipPath: `inset(${top.toFixed(3)}% ${side.toFixed(3)}% ${bottom.toFixed(
      3
    )}% ${side.toFixed(3)}% round ${radius.toFixed(2)}px)`,
    mediaScale: lerp(1.18, 1.03, eSky),
    cameraScale: revealScale * zoomScale,
    cameraYawDeg,
    cameraBobPx,
    zoomQ: q,
    blackoutOpacity,
    skyWordsTrigger: skyDisp >= 0.985,
    skyWordsOpacity,
    darkNav: p > 0.985 || inManifesto,
  };
}

export function computeHeroHeadlineOpacity(
  sy: number,
  m: ViewportMetrics
): number {
  const initialTopY = m.H * (m.mob ? 0.27 : 0.3) - m.hfs * 0.5;
  const topY = initialTopY - sy;
  const fadeStart = Math.min(initialTopY, m.navH + 1.5 * m.hfs);
  const fadeEnd = m.navH + 0.3 * m.hfs;
  if (fadeStart <= fadeEnd) {
    return sy <= 1 ? 1 : 0;
  }
  return clamp((topY - fadeEnd) / (fadeStart - fadeEnd), 0, 1);
}

export function computeManifestoTrackX(
  mp: number,
  trackWidth: number,
  W: number,
  mob: boolean
): number {
  const startX = mob ? W * 0.08 : W * 0.06;
  const endX = -(trackWidth - W * 0.9);
  return lerp(startX, Math.min(startX, endX), clamp(mp, 0, 1));
}
