'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Award, ChevronDown, Scale, ShieldCheck } from 'lucide-react';
import {
  HEADLINE_TEXT,
  PIXEL_ICONS,
  SPRITE_CROPS,
  STORY_CARDS,
  SUPLETIVO_ASSETS,
} from '@/lib/supletivo-data';
import {
  areCardsSettled,
  clamp,
  computeCardTargetPose,
  computeFanPose,
  computeHeroHeadlineOpacity,
  computeManifestoTrackX,
  computeMetrics,
  computeSkyState,
  computeSpriteStyle,
  dampFactor,
  eBackOut,
  eGlide,
  eOutCubic,
  evalPlaneFlight,
  iconsRemainingForCharCount,
  lerp,
  PLANE_LAND_SEC,
  stepCardInertia,
  type CardPose,
  type ViewportMetrics,
} from '@/lib/tidewell-math';
import {
  ArrowIcon,
  PixelIconSvg,
  SparkleIcon,
  SupletivoBrandMark,
} from './TidewellIcons';
import {
  StoryCardExplorerModal,
  SupletivoConversionSections,
} from './SupletivoSections';

const PLANE_SPRITE = computeSpriteStyle(SPRITE_CROPS.plane);

type NavTarget =
  | 'top'
  | 'process'
  | 'wheel'
  | 'diploma'
  | 'manifesto'
  | 'requisitos'
  | 'como-funciona'
  | 'preco'
  | 'duvidas'
  | 'matricula';

const NAV_ITEMS: readonly { id: string; label: string; target: NavTarget }[] = [
  { id: 'como-funciona', label: 'Como funciona', target: 'process' },
  { id: 'historias', label: 'Histórias', target: 'wheel' },
  { id: 'requisitos', label: 'Requisitos', target: 'requisitos' },
  { id: 'preco', label: 'Preço', target: 'preco' },
  { id: 'duvidas', label: 'Dúvidas', target: 'duvidas' },
] as const;

const CHAPTERS: readonly { id: string; label: string; target: NavTarget }[] = [
  { id: 'inicio', label: 'Início', target: 'top' },
  { id: 'ritmo', label: 'No seu ritmo', target: 'process' },
  { id: 'historias', label: '12 etapas', target: 'wheel' },
  { id: 'diploma', label: 'O diploma', target: 'diploma' },
  { id: 'manifesto', label: 'Manifesto', target: 'manifesto' },
  { id: 'matricula', label: 'Matrícula', target: 'requisitos' },
] as const;

const SKY_WORD_DELAYS = [0, 0.1, 0.22, 0.4, 0.52, 0.64, 0.76] as const;

function ManifestoWord({ text, grey }: { text: string; grey?: boolean }) {
  return (
    <span
      className={`tw-m-item tw-m-word${grey ? ' tw-m-grey' : ''}`}
      data-m-reveal="word"
    >
      {Array.from(text).map((ch, idx) => (
        <span
          key={idx}
          className="tw-m-char"
          style={{ transitionDelay: `${idx * 28}ms` }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

function ManifestoPlane({
  widthEm,
  rotDeg,
  label,
}: {
  widthEm: number;
  rotDeg: number;
  label: string;
}) {
  return (
    <span
      className="tw-m-pop tw-obj"
      data-m-reveal="pop"
      role="img"
      aria-label={label}
      style={
        {
          '--rot': `${rotDeg}deg`,
          width: `${widthEm}em`,
          aspectRatio: `${PLANE_SPRITE.aspectRatio.toFixed(4)}`,
          backgroundImage: `url("${SUPLETIVO_ASSETS.planeSprite}")`,
          backgroundSize: PLANE_SPRITE.backgroundSize,
          backgroundPosition: PLANE_SPRITE.backgroundPosition,
        } as React.CSSProperties
      }
    />
  );
}

function ManifestoPhotoChip({
  url,
  col,
  row,
  rotDeg,
  label,
}: {
  url: string;
  col: 0 | 1;
  row: 0 | 1;
  rotDeg: number;
  label: string;
}) {
  return (
    <span
      className="tw-m-pop sb-manifesto-photo"
      data-m-reveal="pop"
      role="img"
      aria-label={label}
      style={
        {
          '--rot': `${rotDeg}deg`,
          backgroundImage: `url("${url}")`,
          backgroundPosition: `${col * 100}% ${row * 100}%`,
        } as React.CSSProperties
      }
    />
  );
}

export default function TidewellStory() {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [selectedStage, setSelectedStage] = useState<'medio' | 'fundamental'>(
    'medio'
  );
  const [selectedPayment, setSelectedPayment] = useState<'parcelado' | 'pix'>(
    'parcelado'
  );

  const modalOpenRef = useRef(false);
  useEffect(() => {
    modalOpenRef.current = explorerOpen;
    document.body.style.overflow = explorerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [explorerOpen]);

  const rootRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navLinkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const navCtaRef = useRef<HTMLButtonElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const storyRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroKickerRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const heroActionRef = useRef<HTMLDivElement>(null);
  const wordRowRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const planeRef = useRef<HTMLDivElement>(null);

  const processRef = useRef<HTMLDivElement>(null);
  const processWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const processSubRef = useRef<HTMLParagraphElement>(null);
  const processCtaRef = useRef<HTMLButtonElement>(null);

  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const skyRef = useRef<HTMLDivElement>(null);
  const skyPlateRef = useRef<HTMLDivElement>(null);
  const diplomaRef = useRef<HTMLDivElement>(null);
  const skyWordsTlRef = useRef<HTMLDivElement>(null);
  const skyWordsBrRef = useRef<HTMLDivElement>(null);
  const skyWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const blackoutRef = useRef<HTMLDivElement>(null);

  const manifestoRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const manifestoProgressRef = useRef<HTMLDivElement>(null);

  const scrollTargetRef = useRef<number>(0);
  const smoothedScrollRef = useRef<number>(0);
  const lastWheelTsRef = useRef<number>(0);
  const snapCardsRef = useRef<boolean>(false);
  const metricsRef = useRef<ViewportMetrics>(computeMetrics(1440, 900));

  const getDocTop = (el: HTMLElement) =>
    el.getBoundingClientRect().top + window.scrollY;

  const jumpToTarget = (target: NavTarget) => {
    const storyEl = storyRef.current;
    const manifestoEl = manifestoRef.current;
    const H = window.innerHeight;
    let dest = 0;

    if (target === 'top') {
      dest = 0;
    } else if (
      storyEl &&
      (target === 'process' || target === 'wheel' || target === 'diploma')
    ) {
      const storyTop = getDocTop(storyEl);
      const storySpan = Math.max(1, storyEl.offsetHeight - H);
      const frac =
        target === 'process' ? 0.16 : target === 'wheel' ? 0.44 : 0.78;
      dest = storyTop + storySpan * frac;
    } else if (manifestoEl && target === 'manifesto') {
      dest = getDocTop(manifestoEl);
    } else {
      const el = document.getElementById(target);
      if (el) {
        dest = Math.max(0, getDocTop(el) - 76);
      }
    }

    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    dest = clamp(dest, 0, maxScroll);
    scrollTargetRef.current = dest;
    smoothedScrollRef.current = dest;
    snapCardsRef.current = true;
    lastWheelTsRef.current = 0;
    window.scrollTo({ top: dest, behavior: 'auto' });
  };

  const openExplorerCard = (cardIdx: number) => {
    setActiveCardIndex(cardIdx);
    setExplorerOpen(true);
  };

  const handleStartFromCard = (
    stage: 'medio' | 'fundamental',
    _title: string
  ) => {
    setSelectedStage(stage);
    setExplorerOpen(false);
    setTimeout(() => jumpToTarget('matricula'), 60);
  };

  useEffect(() => {
    const rootEl = rootRef.current;
    const storyEl = storyRef.current;
    const manifestoEl = manifestoRef.current;
    if (!rootEl || !storyEl || !manifestoEl) return;

    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    let reducedMotion = reducedMotionQuery.matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    const params = new URLSearchParams(window.location.search);
    const autoStart = params.get('autostart') === '1';

    let charWidths: number[] = new Array(HEADLINE_TEXT.length).fill(0);
    let prefixWidths: number[] = new Array(HEADLINE_TEXT.length + 1).fill(0);
    let trackWidth = 4200;
    let storyTop = 0;
    let storyHeight = 7 * window.innerHeight;
    let manifestoTop = storyHeight;
    let manifestoHeight = 3.8 * window.innerHeight;

    const applyMetrics = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const m = computeMetrics(W, H);
      metricsRef.current = m;

      const rootStyle = rootEl.style;
      rootStyle.setProperty('--u', `${m.u.toFixed(4)}px`);
      rootStyle.setProperty('--n', `${m.n.toFixed(4)}px`);
      rootStyle.setProperty('--hfs', `${m.hfs.toFixed(2)}px`);
      rootStyle.setProperty('--ic', `${m.ic.toFixed(2)}px`);
      rootStyle.setProperty('--pfs', `${m.pfs.toFixed(2)}px`);
      rootStyle.setProperty('--sfs', `${m.sfs.toFixed(2)}px`);
      rootStyle.setProperty('--mfs', `${m.mfs.toFixed(2)}px`);
      rootStyle.setProperty('--camw', `${m.camw.toFixed(2)}px`);
      rootStyle.setProperty('--cw', `${m.cw.toFixed(2)}`);

      if (cardsContainerRef.current) {
        cardsContainerRef.current.style.setProperty('--cw', `${m.cw.toFixed(2)}`);
      }
      rootEl.dataset.mob = m.mob ? 'true' : 'false';

      const widths: number[] = [];
      const prefixes: number[] = [0];
      for (let i = 0; i < HEADLINE_TEXT.length; i++) {
        const el = charRefs.current[i];
        const w = el ? el.getBoundingClientRect().width : m.hfs * 0.5;
        widths.push(w);
        prefixes.push(prefixes[i] + w);
      }
      charWidths = widths;
      prefixWidths = prefixes;

      storyTop = storyEl.offsetTop;
      storyHeight = storyEl.offsetHeight;
      manifestoTop = manifestoEl.offsetTop;
      manifestoHeight = manifestoEl.offsetHeight;
      if (trackRef.current) {
        trackWidth = trackRef.current.scrollWidth;
      }
    };

    applyMetrics();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        applyMetrics();
      });
    }

    const cardCurrents: CardPose[] = Array.from({ length: 12 }, (_, i) =>
      computeCardTargetPose(
        i,
        0,
        metricsRef.current,
        reducedMotion || autoStart ? 10 : 0,
        reducedMotion
      )
    );

    scrollTargetRef.current = window.scrollY;
    smoothedScrollRef.current = window.scrollY;

    let skyDisp = 0;
    let processTriggered = false;
    let processStartSec = 0;
    let skyWordsTriggered = false;
    let skyWordsStartSec = 0;
    let darkNavActive = false;
    let lightGlassActive = false;
    let activeNavId = 'como-funciona';

    const manifestoRevealEls = Array.from(
      manifestoEl.querySelectorAll<HTMLElement>('[data-m-reveal]')
    );

    const onWheel = (e: WheelEvent) => {
      if (reducedMotion || !finePointer || modalOpenRef.current) return;
      e.preventDefault();
      let dy = e.deltaY;
      if (e.deltaMode === 1) {
        dy *= 32;
      } else if (e.deltaMode === 2) {
        dy *= window.innerHeight;
      }
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const now = performance.now();
      if (now - lastWheelTsRef.current > 250) {
        scrollTargetRef.current = window.scrollY;
      }
      scrollTargetRef.current = clamp(
        scrollTargetRef.current + dy * 0.85,
        0,
        maxScroll
      );
      lastWheelTsRef.current = now;
      window.scrollTo(0, scrollTargetRef.current);
    };

    const onResize = () => {
      applyMetrics();
    };

    const onReducedMotionChange = (ev: MediaQueryListEvent) => {
      reducedMotion = ev.matches;
      applyMetrics();
    };

    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let prevTrackX = 0;
    let trackSkew = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (reducedMotion || !finePointer) return;
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      pointerTargetX = clamp((e.clientX / w - 0.5) * 2, -1, 1);
      pointerTargetY = clamp((e.clientY / h - 0.5) * 2, -1, 1);
    };

    const onPointerLeave = () => {
      pointerTargetX = 0;
      pointerTargetY = 0;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);

    const startPerf = performance.now();
    let lastFramePerf = startPerf;
    let rafId = 0;

    const setActiveNav = (id: string) => {
      if (activeNavId === id) return;
      activeNavId = id;
      NAV_ITEMS.forEach((item, idx) => {
        const el = navLinkRefs.current[idx];
        if (el) {
          el.dataset.current = item.id === id ? 'true' : 'false';
        }
      });
    };

    const updateMorphAndPlane = (tSec: number, m: ViewportMetrics) => {
      const ic = m.ic;
      const icGap = 0.2 * ic;
      const groupGap = 1.5 * icGap;
      const totalChars = HEADLINE_TEXT.length;
      const fullTextW = prefixWidths[totalChars] || 0;

      const iconRowW = (count: number) =>
        count > 0 ? count * ic + (count - 1) * icGap : 0;
      const groupTotalW = (chars: number, icons: number) => {
        const tw = prefixWidths[chars] || 0;
        const iw = iconRowW(icons);
        const gap = chars > 0 && icons > 0 ? groupGap : 0;
        return tw + gap + iw;
      };

      const initial7W = iconRowW(7);
      const firstIconLeft = m.W * 0.5 - initial7W * 0.5;
      const firstIconCenterX = firstIconLeft + ic * 0.5;
      const firstIconCenterY = m.H * (m.mob ? 0.27 : 0.3);

      // Update paper plane flight
      const planeEl = planeRef.current;
      if (planeEl) {
        if (reducedMotion || autoStart) {
          planeEl.style.visibility = 'hidden';
          planeEl.style.opacity = '0';
        } else {
          const ps = evalPlaneFlight(
            tSec,
            m.W,
            m.H,
            firstIconCenterX,
            firstIconCenterY
          );
          if (!ps.visible) {
            planeEl.style.visibility = 'hidden';
            planeEl.style.opacity = '0';
          } else {
            planeEl.style.visibility = 'visible';
            planeEl.style.opacity = ps.opacity.toFixed(3);
            planeEl.style.transform = `translate3d(${ps.x.toFixed(
              2
            )}px, ${ps.y.toFixed(
              2
            )}px, 0) translate3d(-50%, -50%, 0) rotate(${ps.angleDeg.toFixed(
              2
            )}deg) scale(${ps.scale.toFixed(3)})`;
          }
        }
      }

      // Conversion-tuned fast morph: starts at 1.50s, completes at ~3.45s
      const morphStart = 1.5;
      const stepDur = 0.13;
      const morphEnd = morphStart + totalChars * stepDur;

      if (reducedMotion || autoStart || tSec >= morphEnd) {
        if (wordRowRef.current) {
          const left = m.W * 0.5 - fullTextW * 0.5;
          wordRowRef.current.style.transform = `translate3d(${left.toFixed(
            2
          )}px, -50%, 0)`;
        }
        for (let c = 0; c < totalChars; c++) {
          const el = charRefs.current[c];
          if (el) {
            el.style.opacity = '1';
            el.style.clipPath = 'none';
          }
        }
        for (let j = 0; j < 7; j++) {
          const el = iconRefs.current[j];
          if (el) {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
          }
        }
        return;
      }

      if (tSec < morphStart) {
        if (wordRowRef.current) {
          const left = m.W * 0.5 - initial7W * 0.5;
          wordRowRef.current.style.transform = `translate3d(${left.toFixed(
            2
          )}px, -50%, 0)`;
        }
        for (let c = 0; c < totalChars; c++) {
          const el = charRefs.current[c];
          if (el) {
            el.style.opacity = '0';
            el.style.clipPath = 'inset(0 100% 0 0)';
          }
        }

        for (let j = 0; j < 7; j++) {
          const el = iconRefs.current[j];
          if (!el) continue;
          const x = firstIconLeft + j * (ic + icGap);

          if (j === 0) {
            const vis = tSec >= PLANE_LAND_SEC;
            const op = vis ? clamp((tSec - PLANE_LAND_SEC) / 0.06, 0, 1) : 0;
            const sc = vis
              ? lerp(0.85, 1, eOutCubic(clamp((tSec - PLANE_LAND_SEC) / 0.14, 0, 1)))
              : 0;
            el.style.visibility = op > 0.001 ? 'visible' : 'hidden';
            el.style.opacity = op.toFixed(3);
            el.style.filter = 'none';
            el.style.transform = `translate3d(${x.toFixed(
              2
            )}px, -50%, 0) scale(${sc.toFixed(3)})`;
          } else {
            const popStart = PLANE_LAND_SEC + (0.02 + (j - 1) * 0.055);
            const su = clamp((tSec - popStart) / 0.28, 0, 1);
            const ou = clamp((tSec - popStart) / 0.1, 0, 1);
            const sc = su > 0 ? eBackOut(su, 1.15) : 0;
            el.style.visibility = ou > 0.001 ? 'visible' : 'hidden';
            el.style.opacity = ou.toFixed(3);
            el.style.filter = 'none';
            el.style.transform = `translate3d(${x.toFixed(
              2
            )}px, -50%, 0) scale(${sc.toFixed(3)})`;
          }
        }
        return;
      }

      const elapsed = tSec - morphStart;
      const step = clamp(Math.floor(elapsed / stepDur), 0, totalChars - 1);
      const u = clamp((elapsed - step * stepDur) / stepDur, 0, 1);
      const g = eGlide(u);

      const charsBefore = step;
      const charsAfter = step + 1;
      const iconsBefore = iconsRemainingForCharCount(charsBefore, HEADLINE_TEXT);
      const iconsAfter = iconsRemainingForCharCount(charsAfter, HEADLINE_TEXT);
      const firstAliveBefore = 7 - iconsBefore;
      const firstAliveAfter = 7 - iconsAfter;
      const consumedIdx = iconsAfter < iconsBefore ? firstAliveBefore : -1;

      const totalWBefore = groupTotalW(charsBefore, iconsBefore);
      const totalWAfter = groupTotalW(charsAfter, iconsAfter);
      const curTotalW = lerp(totalWBefore, totalWAfter, g);
      const textLeft = m.W * 0.5 - curTotalW * 0.5;

      if (wordRowRef.current) {
        wordRowRef.current.style.transform = `translate3d(${textLeft.toFixed(
          2
        )}px, -50%, 0)`;
      }

      for (let c = 0; c < totalChars; c++) {
        const el = charRefs.current[c];
        if (!el) continue;
        if (c < step) {
          el.style.opacity = '1';
          el.style.clipPath = 'inset(0 0% 0 0)';
        } else if (c === step) {
          const wipe = clamp((u - 0.3) / 0.6, 0, 1);
          el.style.opacity = u >= 0.3 ? '1' : '0';
          el.style.clipPath = `inset(0 ${((1 - wipe) * 100).toFixed(2)}% 0 0)`;
        } else {
          el.style.opacity = '0';
          el.style.clipPath = 'inset(0 100% 0 0)';
        }
      }

      const textLeftBefore = m.W * 0.5 - totalWBefore * 0.5;
      const textLeftAfter = m.W * 0.5 - totalWAfter * 0.5;
      const iconsStartBefore =
        textLeftBefore +
        (prefixWidths[charsBefore] || 0) +
        (charsBefore > 0 ? groupGap : 0);
      const iconsStartAfter =
        textLeftAfter +
        (prefixWidths[charsAfter] || 0) +
        (charsAfter > 0 && iconsAfter > 0 ? groupGap : 0);

      for (let j = 0; j < 7; j++) {
        const el = iconRefs.current[j];
        if (!el) continue;

        if (j < firstAliveBefore) {
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
        } else if (j === consumedIdx) {
          const xStart = iconsStartBefore;
          const xEnd =
            textLeft +
            (prefixWidths[charsBefore] || 0) +
            (charWidths[step] || 0) * 0.35;
          const cx = lerp(xStart, xEnd, clamp(u / 0.5, 0, 1));

          if (u <= 0.45) {
            const a = u / 0.45;
            const syVal = lerp(1, 0.16, a);
            const sxVal = lerp(1, 1.25, a);
            const rot = lerp(0, -28, a);
            const bright = lerp(1, 0, a);
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            el.style.filter = `brightness(${bright.toFixed(3)})`;
            el.style.transform = `translate3d(${cx.toFixed(
              2
            )}px, -50%, 0) rotate(${rot.toFixed(2)}deg) scale(${sxVal.toFixed(
              3
            )}, ${syVal.toFixed(3)})`;
          } else {
            const b = (u - 0.45) / 0.55;
            const rot = lerp(-28, -90, b);
            const op = 1 - b;
            el.style.visibility = op > 0.001 ? 'visible' : 'hidden';
            el.style.opacity = op.toFixed(3);
            el.style.filter = 'brightness(0)';
            el.style.transform = `translate3d(${cx.toFixed(
              2
            )}px, -50%, 0) rotate(${rot.toFixed(2)}deg) scale(1.25, 0.16)`;
          }
        } else {
          const prevX =
            iconsStartBefore + (j - firstAliveBefore) * (ic + icGap);
          const nextX = iconsStartAfter + (j - firstAliveAfter) * (ic + icGap);
          const cx = lerp(prevX, nextX, g);
          el.style.visibility = 'visible';
          el.style.opacity = '1';
          el.style.filter = 'none';
          el.style.transform = `translate3d(${cx.toFixed(2)}px, -50%, 0) scale(1)`;
        }
      }
    };

    const tick = (nowPerf: number) => {
      const dtMs = clamp(nowPerf - lastFramePerf, 0.5, 64);
      lastFramePerf = nowPerf;
      const nowSec = (nowPerf - startPerf) / 1000;
      const introSec = reducedMotion || autoStart ? 10 : nowSec;
      const m = metricsRef.current;

      // 1. Load intro for Nav
      if (logoRef.current) {
        const lu =
          reducedMotion || autoStart
            ? 1
            : eOutCubic(clamp((introSec - 0.08) / 0.22, 0, 1));
        logoRef.current.style.opacity = lu.toFixed(3);
      }

      NAV_ITEMS.forEach((_, i) => {
        const el = navLinkRefs.current[i];
        if (!el) return;
        const nu =
          reducedMotion || autoStart
            ? 1
            : eOutCubic(clamp((introSec - (0.12 + i * 0.03)) / 0.22, 0, 1));
        el.style.opacity = nu.toFixed(3);
        el.style.transform = `translate3d(0, ${((1 - nu) * 6).toFixed(2)}px, 0)`;
      });

      if (navCtaRef.current) {
        const cu =
          reducedMotion || autoStart
            ? 1
            : eOutCubic(clamp((introSec - 0.16) / 0.2, 0, 1));
        const leftInset = ((1 - cu) * 100).toFixed(2);
        navCtaRef.current.style.clipPath = `inset(0 0 0 ${leftInset}% round ${(
          12 * m.n
        ).toFixed(2)}px)`;
      }

      // 2. Smooth scroll tracking (snaps cleanly on programmatic / scrollbar jumps)
      if (reducedMotion || !finePointer) {
        scrollTargetRef.current = window.scrollY;
        smoothedScrollRef.current = window.scrollY;
      } else {
        const isIdleFromWheel = nowPerf - lastWheelTsRef.current > 200;
        if (isIdleFromWheel) {
          scrollTargetRef.current = window.scrollY;
          if (Math.abs(window.scrollY - smoothedScrollRef.current) > m.H * 0.9) {
            smoothedScrollRef.current = window.scrollY;
          }
        }
        const kScroll = dampFactor(0.1, dtMs);
        smoothedScrollRef.current +=
          (scrollTargetRef.current - smoothedScrollRef.current) * kScroll;
        if (Math.abs(scrollTargetRef.current - smoothedScrollRef.current) < 0.1) {
          smoothedScrollRef.current = scrollTargetRef.current;
        }
      }

      const sy = smoothedScrollRef.current;
      const storySpan = Math.max(1, storyHeight - m.H);
      const p = reducedMotion ? 0 : clamp((sy - storyTop) / storySpan, 0, 1);

      const totalDocSpan = Math.max(
        1,
        document.documentElement.scrollHeight - m.H
      );
      if (progressBarRef.current) {
        const docProg = clamp(sy / totalDocSpan, 0, 1);
        progressBarRef.current.style.transform = `scaleX(${docProg.toFixed(4)})`;
      }

      const inManifesto = !reducedMotion && sy >= manifestoTop - m.H * 0.12;
      const inConversion =
        !reducedMotion && sy >= manifestoTop + manifestoHeight - m.H * 0.35;

      let activeChapterIdx = 0;
      if (inConversion) {
        activeChapterIdx = 5;
        const comoEl = document.getElementById('como-funciona');
        const histEl = document.getElementById('historias');
        const precoEl = document.getElementById('preco');
        const duvidasEl = document.getElementById('duvidas');
        const comoTop = comoEl ? getDocTop(comoEl) : Infinity;
        const histTop = histEl ? getDocTop(histEl) : Infinity;
        const precoTop = precoEl ? getDocTop(precoEl) : Infinity;
        const duvidasTop = duvidasEl ? getDocTop(duvidasEl) : Infinity;
        if (sy >= duvidasTop - 220) {
          setActiveNav('duvidas');
        } else if (sy >= precoTop - 220) {
          setActiveNav('preco');
        } else if (sy >= histTop - 220) {
          setActiveNav('historias');
        } else if (sy >= comoTop - 220) {
          setActiveNav('como-funciona');
        } else {
          setActiveNav('requisitos');
        }
      } else if (inManifesto || p > 0.985) {
        setActiveNav('requisitos');
        activeChapterIdx = 4;
      } else if (p >= 0.62) {
        setActiveNav('historias');
        activeChapterIdx = 3;
      } else if (p >= 0.31) {
        setActiveNav('historias');
        activeChapterIdx = 2;
      } else if (p >= 0.08) {
        setActiveNav('como-funciona');
        activeChapterIdx = 1;
      } else {
        setActiveNav('como-funciona');
        activeChapterIdx = 0;
      }

      chapterRefs.current.forEach((btn, idx) => {
        if (btn) {
          btn.dataset.active = idx === activeChapterIdx ? 'true' : 'false';
        }
      });

      // 3. Hero headline morph, plane flight, kicker, and immediate above-the-fold CTA
      updateMorphAndPlane(introSec, m);

      if (heroRef.current && !reducedMotion) {
        const offset = window.scrollY - sy;
        heroRef.current.style.transform =
          Math.abs(offset) > 0.05
            ? `translate3d(0, ${offset.toFixed(2)}px, 0)`
            : 'none';
      }

      if (!reducedMotion) {
        const hOp = computeHeroHeadlineOpacity(sy, m);
        if (headlineRef.current) {
          headlineRef.current.style.opacity = hOp.toFixed(3);
        }
        if (heroKickerRef.current) {
          const ku =
            autoStart ? 1 : eOutCubic(clamp((introSec - 0.14) / 0.35, 0, 1));
          heroKickerRef.current.style.opacity = (hOp * ku).toFixed(3);
          heroKickerRef.current.style.transform = `translate3d(-50%, ${(
            (1 - ku) *
            8
          ).toFixed(2)}px, 0)`;
        }
        if (heroActionRef.current) {
          const au =
            autoStart ? 1 : eOutCubic(clamp((introSec - 0.26) / 0.45, 0, 1));
          const finalOp = hOp * au;
          heroActionRef.current.style.opacity = finalOp.toFixed(3);
          heroActionRef.current.style.pointerEvents =
            finalOp > 0.25 ? 'auto' : 'none';
          heroActionRef.current.style.transform = `translate3d(-50%, ${(
            (1 - au) *
            10
          ).toFixed(2)}px, 0)`;
        }
      }

      // 4. Process block reveal
      if (processRef.current && !reducedMotion) {
        if (p < 0.045) {
          processRef.current.style.opacity = '0';
          processRef.current.style.visibility = 'hidden';
          processRef.current.style.pointerEvents = 'none';
          if (processTriggered) {
            processTriggered = false;
            processWordRefs.current.forEach((el) => {
              if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translate3d(0, 0.35em, 0)';
                el.style.filter = 'blur(6px)';
              }
            });
            if (processSubRef.current) {
              processSubRef.current.style.opacity = '0';
              processSubRef.current.style.transform = 'translate3d(0, 8px, 0)';
            }
            if (processCtaRef.current) {
              processCtaRef.current.style.opacity = '0';
              processCtaRef.current.style.transform = 'translate3d(0, 8px, 0)';
            }
          }
        } else {
          const procOp = clamp((p - 0.045) / 0.025, 0, 1);
          processRef.current.style.opacity = procOp.toFixed(3);
          processRef.current.style.visibility = 'visible';
          processRef.current.style.pointerEvents = skyDisp < 0.3 ? 'auto' : 'none';

          if (p > 0.072 && !processTriggered) {
            processTriggered = true;
            processStartSec = nowSec;
          }

          if (processTriggered) {
            const elap = nowSec - processStartSec;
            processWordRefs.current.forEach((el, idx) => {
              if (!el) return;
              const wu = eOutCubic(clamp((elap - idx * 0.09) / 0.48, 0, 1));
              el.style.opacity = wu.toFixed(3);
              el.style.transform = `translate3d(0, ${((1 - wu) * 0.35).toFixed(
                3
              )}em, 0)`;
              el.style.filter =
                wu >= 0.999 ? 'none' : `blur(${((1 - wu) * 6).toFixed(2)}px)`;
            });

            if (processSubRef.current) {
              const su = eOutCubic(clamp((elap - 0.58) / 0.45, 0, 1));
              processSubRef.current.style.opacity = su.toFixed(3);
              processSubRef.current.style.transform = `translate3d(0, ${(
                (1 - su) *
                8
              ).toFixed(2)}px, 0)`;
            }
            if (processCtaRef.current) {
              const bu = eOutCubic(clamp((elap - 0.7) / 0.45, 0, 1));
              processCtaRef.current.style.opacity = bu.toFixed(3);
              processCtaRef.current.style.transform = `translate3d(0, ${(
                (1 - bu) *
                8
              ).toFixed(2)}px, 0)`;
            }
          }
        }
      }

      const kPtr = dampFactor(0.08, dtMs);
      pointerX += (pointerTargetX - pointerX) * kPtr;
      pointerY += (pointerTargetY - pointerY) * kPtr;

      // 5. Cards pose, per-card inertia, ambient breathing & pointer depth parallax
      const cardTargets: CardPose[] = [];
      const snapNow = snapCardsRef.current;
      snapCardsRef.current = false;
      const immediateCards = reducedMotion || p <= 0.004 || snapNow;
      const ptrInfluence = reducedMotion || m.mob ? 0 : 1 - clamp(skyDisp * 2, 0, 1);
      for (let i = 0; i < 12; i++) {
        const target = reducedMotion
          ? computeFanPose(i, m)
          : computeCardTargetPose(i, p, m, introSec, reducedMotion);
        cardTargets.push(target);
        cardCurrents[i] = stepCardInertia(
          cardCurrents[i],
          target,
          i,
          dtMs,
          immediateCards,
          m.W
        );
        const c = cardCurrents[i];
        const el = cardRefs.current[i];
        if (el) {
          if (c.opacity <= 0.002) {
            el.style.opacity = '0';
            el.style.visibility = 'hidden';
          } else {
            const depth = 0.55 + (i % 3) * 0.45;
            const breathY = reducedMotion
              ? 0
              : Math.sin(nowSec * 1.15 + i * 0.85) * 3.2 * ptrInfluence;
            const pxOff = pointerX * 14 * depth * ptrInfluence;
            const pyOff = pointerY * 9 * depth * ptrInfluence + breathY;
            const pRot = pointerX * 1.15 * depth * ptrInfluence;
            el.style.visibility = 'visible';
            el.style.opacity = c.opacity.toFixed(3);
            el.style.transform = `translate3d(${(c.x + pxOff).toFixed(2)}px, ${(
              c.y + pyOff
            ).toFixed(2)}px, 0) rotate(${(c.rot + pRot).toFixed(2)}deg) scale(${c.scale.toFixed(
              3
            )})`;
          }
        }
      }

      if (cardsContainerRef.current) {
        cardsContainerRef.current.style.pointerEvents =
          skyDisp > 0.1 ? 'none' : 'auto';
      }

      // 6. Gated Dawn-Sky Panel, 3D Diploma Folio & Navy Blackout
      if (!reducedMotion) {
        const wheelDone = p >= 0.57;
        const settled = areCardsSettled(cardCurrents, cardTargets);
        const rawSkyTarget = clamp((p - 0.62) / (0.74 - 0.62), 0, 1);
        const skyTarget =
          wheelDone && (settled || skyDisp > 0.02) ? rawSkyTarget : 0;

        const kSky = dampFactor(0.1, dtMs);
        if (p < 0.45) {
          skyDisp = 0;
        } else {
          skyDisp += (skyTarget - skyDisp) * kSky;
          if (Math.abs(skyTarget - skyDisp) < 0.0005) {
            skyDisp = skyTarget;
          }
        }

        const sky = computeSkyState(p, skyDisp, m, nowSec, inManifesto);

        if (skyRef.current) {
          if (!sky.visible) {
            skyRef.current.style.visibility = 'hidden';
            skyRef.current.style.opacity = '0';
          } else {
            skyRef.current.style.visibility = 'visible';
            skyRef.current.style.opacity = sky.opacity.toFixed(3);
            skyRef.current.style.clipPath = sky.clipPath;
          }
        }

        if (skyPlateRef.current) {
          const skyShiftX = m.mob ? 0 : -pointerX * 14;
          const skyShiftY = m.mob ? 0 : -pointerY * 10;
          skyPlateRef.current.style.transform = `translate3d(${skyShiftX.toFixed(
            2
          )}px, ${skyShiftY.toFixed(2)}px, 0) scale(${(
            sky.mediaScale + 0.03
          ).toFixed(4)})`;
        }

        if (diplomaRef.current) {
          const ptrYaw = m.mob ? 0 : pointerX * 9.5;
          const ptrPitch = m.mob ? 0 : -pointerY * 7.5;
          const sheenPct = 50 + pointerX * 36;
          diplomaRef.current.style.setProperty('--sheen-x', `${sheenPct.toFixed(1)}%`);
          diplomaRef.current.style.transform = `perspective(1100px) translate3d(${(
            pointerX * (m.mob ? 0 : 8)
          ).toFixed(2)}px, ${(
            sky.cameraBobPx +
            pointerY * (m.mob ? 0 : 6)
          ).toFixed(2)}px, 0) rotateX(${ptrPitch.toFixed(2)}deg) rotateY(${(
            sky.cameraYawDeg + ptrYaw
          ).toFixed(2)}deg) scale(${sky.cameraScale.toFixed(4)})`;
        }

        if (sky.skyWordsTrigger && !skyWordsTriggered) {
          skyWordsTriggered = true;
          skyWordsStartSec = nowSec;
        } else if (skyDisp < 0.25 && skyWordsTriggered) {
          skyWordsTriggered = false;
          skyWordRefs.current.forEach((el) => {
            if (el) {
              el.style.opacity = '0';
              el.style.transform = 'translate3d(0, 0.3em, 0)';
              el.style.filter = 'blur(6px)';
            }
          });
        }

        if (skyWordsTlRef.current) {
          skyWordsTlRef.current.style.opacity = sky.skyWordsOpacity.toFixed(3);
        }
        if (skyWordsBrRef.current) {
          skyWordsBrRef.current.style.opacity = sky.skyWordsOpacity.toFixed(3);
        }

        if (skyWordsTriggered) {
          const elap = nowSec - skyWordsStartSec;
          skyWordRefs.current.forEach((el, idx) => {
            if (!el) return;
            const delay = SKY_WORD_DELAYS[idx] ?? 0;
            const wu = eOutCubic(clamp((elap - delay) / 0.55, 0, 1));
            el.style.opacity = wu.toFixed(3);
            el.style.transform = `translate3d(0, ${((1 - wu) * 0.3).toFixed(
              3
            )}em, 0)`;
            el.style.filter =
              wu >= 0.999 ? 'none' : `blur(${((1 - wu) * 6).toFixed(2)}px)`;
          });
        }

        if (blackoutRef.current) {
          blackoutRef.current.style.opacity = sky.blackoutOpacity.toFixed(3);
        }

        const precoElForNav = document.getElementById('preco');
        const precoRect = precoElForNav?.getBoundingClientRect();
        const footerElForNav = document.querySelector('footer.ed-footer');
        const footerRect = footerElForNav?.getBoundingClientRect();
        const inDarkPrice = Boolean(
          precoRect && precoRect.top <= m.navH && precoRect.bottom > m.navH
        );
        const inDarkFooter = Boolean(
          footerRect && footerRect.top <= m.navH
        );
        const wantDarkNav =
          ((sky.darkNav || inManifesto) && !inConversion) ||
          inDarkPrice ||
          inDarkFooter;
        if (wantDarkNav !== darkNavActive) {
          darkNavActive = wantDarkNav;
          document.body.classList.toggle('dark-nav', darkNavActive);
        }

        const wantLightGlass = !wantDarkNav && sy > 56;
        if (wantLightGlass !== lightGlassActive) {
          lightGlassActive = wantLightGlass;
          document.body.classList.toggle('nav-light-glass', lightGlassActive);
        }

        // 7. Manifesto horizontal scroll, kinetic velocity skew & one-shot item reveals
        const manifestoSpan = Math.max(1, manifestoHeight - m.H);
        const mp = clamp((sy - manifestoTop) / manifestoSpan, 0, 1);
        const tx = computeManifestoTrackX(mp, trackWidth, m.W, m.mob);

        const rawTrackVel = clamp((tx - prevTrackX) / Math.max(8, dtMs), -2.5, 2.5);
        prevTrackX = tx;
        const targetSkew = m.mob ? 0 : clamp(rawTrackVel * 2.2, -3.6, 3.6);
        trackSkew += (targetSkew - trackSkew) * dampFactor(0.14, dtMs);

        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${tx.toFixed(
            2
          )}px, -50%, 0) skewX(${trackSkew.toFixed(2)}deg)`;
        }

        if (manifestoProgressRef.current) {
          manifestoProgressRef.current.style.transform = `scaleX(${mp.toFixed(4)})`;
        }

        const manifestoRectTop = manifestoTop - sy;
        if (manifestoRectTop <= m.H * 0.2) {
          const revealEdge = m.W * (m.mob ? 0.92 : 0.88);
          for (let i = 0; i < manifestoRevealEls.length; i++) {
            const el = manifestoRevealEls[i];
            if (el.classList.contains('is-revealed')) continue;
            const rect = el.getBoundingClientRect();
            if (rect.left <= revealEdge) {
              el.classList.add('is-revealed');
            }
          }
        }
      } else {
        const manRect = manifestoEl.getBoundingClientRect();
        const inManReduced =
          manRect.top <= m.navH && manRect.bottom > m.navH;
        if (inManReduced !== darkNavActive) {
          darkNavActive = inManReduced;
          document.body.classList.toggle('dark-nav', darkNavActive);
        }
        const wantLightReduced = !inManReduced && window.scrollY > 56;
        if (wantLightReduced !== lightGlassActive) {
          lightGlassActive = wantLightReduced;
          document.body.classList.toggle('nav-light-glass', lightGlassActive);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
      document.body.classList.remove('dark-nav');
      document.body.classList.remove('nav-light-glass');
    };
  }, []);

  return (
    <div ref={rootRef} className="tw-root" data-mob="false" suppressHydrationWarning>
      {/* 1. Strict 3-Zone Top Navigation */}
      <nav className="tw-nav" aria-label="Navegação principal">
        <a
          ref={logoRef}
          href="#top"
          className="tw-logo"
          aria-label="Supletivo Brasil — início"
          onClick={(e) => {
            e.preventDefault();
            jumpToTarget('top');
          }}
        >
          <SupletivoBrandMark />
        </a>

        <ul className="tw-nav-links">
          {NAV_ITEMS.map((item, idx) => (
            <li key={item.id}>
              <a
                ref={(el) => {
                  navLinkRefs.current[idx] = el;
                }}
                href={`#${item.id}`}
                className="tw-nav-link"
                data-current={idx === 0 ? 'true' : 'false'}
                onClick={(e) => {
                  e.preventDefault();
                  jumpToTarget(item.target);
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          ref={navCtaRef}
          type="button"
          className="tw-nav-cta"
          onClick={() => jumpToTarget('matricula')}
        >
          <span>Quero meu diploma</span>
          <ArrowIcon />
        </button>

        <div className="sb-scroll-track" aria-hidden="true">
          <div ref={progressBarRef} className="sb-scroll-progress" />
        </div>
      </nav>

      {/* Right-edge Story Chapter Rail */}
      <aside className="tw-chapter-rail" aria-label="Capítulos da página">
        {CHAPTERS.map((ch, idx) => (
          <button
            key={ch.id}
            ref={(el) => {
              chapterRefs.current[idx] = el;
            }}
            type="button"
            className="tw-chapter-dot"
            data-active={idx === 0 ? 'true' : 'false'}
            aria-label={ch.label}
            title={ch.label}
            onClick={() => jumpToTarget(ch.target)}
          >
            <span className="tw-chapter-pip" />
            <span className="tw-chapter-label">{ch.label}</span>
          </button>
        ))}
      </aside>

      {/* 2. Scroll-Story Section (700vh conversion-tuned) */}
      <main id="top">
        <section id="story" ref={storyRef} aria-label="História visual Supletivo Brasil">
          {/* Act 1: Hero (scrolls 1:1 away) */}
          <header ref={heroRef} className="tw-hero">
            <p ref={heroKickerRef} className="sb-hero-kicker">
              VOCÊ PAROU.
            </p>

            <div
              ref={headlineRef}
              className="tw-hero-headline"
              role="heading"
              aria-level={1}
              aria-label={`Você parou. ${HEADLINE_TEXT}`}
            >
              <div ref={wordRowRef} className="tw-word-row" aria-hidden="true">
                {Array.from(HEADLINE_TEXT).map((ch, idx) => (
                  <span
                    key={idx}
                    ref={(el) => {
                      charRefs.current[idx] = el;
                    }}
                    className="tw-char"
                  >
                    {ch}
                  </span>
                ))}
              </div>

              <div className="tw-icon-layer" aria-hidden="true">
                {PIXEL_ICONS.map((icon, idx) => (
                  <div
                    key={icon.id}
                    ref={(el) => {
                      iconRefs.current[idx] = el;
                    }}
                    className="tw-px-icon"
                  >
                    <PixelIconSvg iconIndex={idx} />
                  </div>
                ))}
              </div>
            </div>

            <div ref={heroActionRef} className="sb-hero-actions">
              <p className="sb-hero-sub">
                A vida pediu pausas que você não escolheu. Retome no seu ritmo, com preparação a distância estruturada, prova presencial oficial e diploma válido em todo o Brasil.
              </p>
              <div className="sb-hero-btn-row">
                <button
                  type="button"
                  className="sb-hero-primary-btn"
                  onClick={() => jumpToTarget('matricula')}
                >
                  <span>Quero meu diploma</span>
                  <ArrowIcon />
                </button>
                <button
                  type="button"
                  className="sb-hero-secondary-link"
                  onClick={() => jumpToTarget('requisitos')}
                >
                  Ver se tenho direito
                </button>
              </div>
              <div className="sb-hero-credentials" aria-label="Garantias institucionais">
                <span>
                  <Scale size={13} aria-hidden="true" />
                  Lei 9.394/96 (LDB)
                </span>
                <span className="sb-cred-sep" aria-hidden="true">·</span>
                <span>
                  <Award size={13} aria-hidden="true" />
                  Autorizado pelo CEE
                </span>
                <span className="sb-cred-sep" aria-hidden="true">·</span>
                <span>
                  <ShieldCheck size={13} aria-hidden="true" />
                  12x R$ 99 ou R$ 999 Pix
                </span>
              </div>
              <button
                type="button"
                className="sb-scroll-cue"
                onClick={() => jumpToTarget('process')}
              >
                <span>Role para conhecer a jornada</span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
            </div>

            <div
              ref={planeRef}
              className="tw-plane"
              aria-hidden="true"
              style={{
                backgroundImage: `url("${SUPLETIVO_ASSETS.planeSprite}")`,
                backgroundSize: PLANE_SPRITE.backgroundSize,
                backgroundPosition: PLANE_SPRITE.backgroundPosition,
              }}
            />
          </header>

          {/* Pinned Stage */}
          <div className="tw-stage">
            {/* Act 2: Process headline (z 4) */}
            <div ref={processRef} className="tw-process" data-testid="process-block">
              <h2 className="tw-process-title">
                <span className="tw-process-line">
                  <span
                    ref={(el) => {
                      processWordRefs.current[0] = el;
                    }}
                    className="tw-pw tw-pw-grey"
                  >
                    Da
                  </span>{' '}
                  <span
                    ref={(el) => {
                      processWordRefs.current[1] = el;
                    }}
                    className="tw-pw"
                  >
                    pausa
                  </span>{' '}
                  <span
                    ref={(el) => {
                      processWordRefs.current[2] = el;
                    }}
                    className="tw-pw tw-chip"
                    aria-hidden="true"
                    style={{
                      backgroundImage: `url("${SUPLETIVO_ASSETS.gridA}")`,
                    }}
                  />{' '}
                  <span
                    ref={(el) => {
                      processWordRefs.current[3] = el;
                    }}
                    className="tw-pw tw-pw-grey"
                  >
                    ao
                  </span>{' '}
                  <span
                    ref={(el) => {
                      processWordRefs.current[4] = el;
                    }}
                    className="tw-pw"
                  >
                    diploma
                  </span>
                </span>
                <span className="tw-process-line">
                  <span
                    ref={(el) => {
                      processWordRefs.current[5] = el;
                    }}
                    className="tw-pw tw-pw-grey"
                  >
                    no
                  </span>{' '}
                  <span
                    ref={(el) => {
                      processWordRefs.current[6] = el;
                    }}
                    className="tw-pw"
                  >
                    seu
                  </span>{' '}
                  <span
                    ref={(el) => {
                      processWordRefs.current[7] = el;
                    }}
                    className="tw-pw"
                  >
                    próprio
                  </span>{' '}
                  <span
                    ref={(el) => {
                      processWordRefs.current[8] = el;
                    }}
                    className="tw-pw"
                  >
                    tempo
                  </span>
                </span>
              </h2>
              <p ref={processSubRef} className="tw-process-sub">
                Preparação a distância no seu ritmo, avaliação presencial oficial em polo credenciado e certificação válida em todo o Brasil.
              </p>
              <button
                ref={processCtaRef}
                type="button"
                className="tw-process-cta"
                onClick={() => openExplorerCard(0)}
              >
                <span>Explorar as 12 etapas e histórias</span>
                <ArrowIcon />
              </button>
            </div>

            {/* 12 Clickable Editorial Photo Cards (z 2) */}
            <div ref={cardsContainerRef} className="tw-cards">
              {STORY_CARDS.map((card) => (
                <button
                  key={card.id}
                  ref={(el) => {
                    cardRefs.current[card.index] = el;
                  }}
                  type="button"
                  className="tw-card"
                  aria-label={`${card.title} — clique para ver detalhes`}
                  title={card.title}
                  onClick={() => openExplorerCard(card.index)}
                  style={{
                    backgroundImage: `url("${card.url}")`,
                    backgroundPosition: `${card.col * 100}% ${card.row * 100}%`,
                  }}
                >
                  <span className="tw-card-meta" aria-hidden="true">
                    <span className="tw-card-num">
                      {String(card.index + 1).padStart(2, '0')}
                    </span>
                    <span className="tw-card-label">{card.shortLabel}</span>
                  </span>
                </button>
              ))}
            </div>

            {/* Act 3: Gated Dawn-Sky Window + Floating 3D Diploma Folio (z 6) */}
            <div ref={skyRef} className="tw-sky" data-testid="sky-panel">
              <div
                ref={skyPlateRef}
                className="tw-sky-plate"
                style={{
                  backgroundImage: `url("${SUPLETIVO_ASSETS.dawnSky}")`,
                }}
              />
              <div className="tw-sky-veil" aria-hidden="true" />

              <div className="tw-camera-anchor">
                <div
                  ref={diplomaRef}
                  className="sb-diploma-folio"
                  role="img"
                  aria-label="Diploma oficial Supletivo Brasil em capa dura verde esmeralda e selo dourado"
                >
                  <div className="sb-folio-sheen" aria-hidden="true" />
                  <div className="sb-folio-frame">
                    <div className="sb-folio-header">
                      <span className="sb-folio-top">REPÚBLICA FEDERATIVA · EJA</span>
                      <span className="sb-folio-rule" aria-hidden="true" />
                    </div>
                    <div
                      className="sb-folio-seal"
                      style={{
                        backgroundImage: `url("${SUPLETIVO_ASSETS.diplomaSeal}")`,
                      }}
                    />
                    <div className="sb-folio-bottom">
                      <strong>CERTIFICADO OFICIAL</strong>
                      <span>LEI FEDERAL Nº 9.394/96 · CEE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={skyWordsTlRef} className="tw-sky-words tw-sky-words-tl">
                <div>
                  <span
                    ref={(el) => {
                      skyWordRefs.current[0] = el;
                    }}
                    className="tw-sw tw-sw-grey"
                  >
                    Não
                  </span>{' '}
                  <span
                    ref={(el) => {
                      skyWordRefs.current[1] = el;
                    }}
                    className="tw-sw tw-sw-grey"
                  >
                    é
                  </span>
                </div>
                <div>
                  <span
                    ref={(el) => {
                      skyWordRefs.current[2] = el;
                    }}
                    className="tw-sw"
                  >
                    só um papel.
                  </span>
                </div>
              </div>

              <div ref={skyWordsBrRef} className="tw-sky-words tw-sky-words-br">
                <div>
                  <span
                    ref={(el) => {
                      skyWordRefs.current[3] = el;
                    }}
                    className="tw-sw tw-sw-grey"
                  >
                    É
                  </span>{' '}
                  <span
                    ref={(el) => {
                      skyWordRefs.current[4] = el;
                    }}
                    className="tw-sw tw-sw-grey"
                  >
                    o
                  </span>{' '}
                  <span
                    ref={(el) => {
                      skyWordRefs.current[5] = el;
                    }}
                    className="tw-sw"
                  >
                    seu futuro
                  </span>
                </div>
                <div>
                  <span
                    ref={(el) => {
                      skyWordRefs.current[6] = el;
                    }}
                    className="tw-sw"
                  >
                    destravado.
                  </span>
                </div>
              </div>
            </div>

            {/* Navy Blackout Layer (z 8) */}
            <div ref={blackoutRef} className="tw-blackout" aria-hidden="true" />
          </div>
        </section>

        {/* Act 4: Dark Navy Horizontal Manifesto (380vh) */}
        <section
          id="manifesto"
          ref={manifestoRef}
          aria-label="Manifesto Supletivo Brasil"
        >
          <div className="tw-manifesto-stage">
            <div ref={trackRef} className="tw-track" data-testid="manifesto-track">
              <div className="tw-m-intro">
                <span
                  className="tw-m-pop tw-label-sm tw-intro-tag"
                  data-m-reveal="pop"
                  style={
                    {
                      '--rot': '-5deg',
                      backgroundColor: '#F6D57A',
                      top: 'calc(var(--mfs) * 0.72 * -0.92)',
                      left: 'calc(var(--mfs) * 0.72 * 0.6)',
                    } as React.CSSProperties
                  }
                >
                  LDB · Lei 9.394/96
                </span>

                <div className="tw-m-intro-row">
                  <ManifestoWord text="A vida" grey />
                  <ManifestoWord text="passou na frente." />
                </div>
                <div className="tw-m-intro-row">
                  <ManifestoWord text="A gente" />
                  <ManifestoWord text="entende." grey />
                </div>

                <span
                  className="tw-m-pop tw-label-sm tw-intro-tag"
                  data-m-reveal="pop"
                  style={
                    {
                      '--rot': '5deg',
                      backgroundColor: '#9BE0C4',
                      bottom: 'calc(var(--mfs) * 0.72 * -0.82)',
                      right: 'calc(var(--mfs) * 0.72 * 0.15)',
                    } as React.CSSProperties
                  }
                >
                  sem julgamento
                </span>
              </div>

              <ManifestoWord text="Trabalho, filhos, boletos." />

              <span
                className="tw-m-pop tw-label-lg"
                data-m-reveal="pop"
                style={
                  {
                    '--rot': '-3deg',
                    backgroundColor: '#BAD9E6',
                  } as React.CSSProperties
                }
              >
                <span className="tw-label-dot" aria-hidden="true" />
                estudo no seu tempo
              </span>

              <ManifestoWord text="Parar" />
              <ManifestoWord text="quase nunca" grey />
              <ManifestoWord text="é escolha." />

              <ManifestoPhotoChip
                url={SUPLETIVO_ASSETS.gridA}
                col={0}
                row={0}
                rotDeg={5}
                label="Estudante retomando seus estudos com tranquilidade"
              />

              <span className="tw-m-stack">
                <span
                  className="tw-m-pop tw-label-sm"
                  data-m-reveal="pop"
                  style={
                    {
                      '--rot': '5deg',
                      backgroundColor: '#F3D482',
                    } as React.CSSProperties
                  }
                >
                  12x de R$ 99
                </span>
                <span
                  className="tw-m-pop tw-label-sm"
                  data-m-reveal="pop"
                  style={
                    {
                      '--rot': '-4deg',
                      backgroundColor: '#E5DDD0',
                    } as React.CSSProperties
                  }
                >
                  sem mensalidades
                </span>
              </span>

              <ManifestoWord text="Aqui o" grey />
              <ManifestoWord text="capítulo em aberto" />

              <ManifestoPlane
                widthEm={1.32}
                rotDeg={-10}
                label="Avião de papel"
              />

              <ManifestoWord text="vira conquista real," />

              <ManifestoPhotoChip
                url={SUPLETIVO_ASSETS.gridB}
                col={0}
                row={0}
                rotDeg={-4}
                label="Orgulho da formatura em família"
              />

              <span
                className="tw-m-pop tw-label-lg"
                data-m-reveal="pop"
                style={
                  {
                    '--rot': '3deg',
                    backgroundColor: '#A7E3C9',
                  } as React.CSSProperties
                }
              >
                <span className="tw-label-dot" aria-hidden="true" />
                prova presencial oficial
              </span>

              <ManifestoWord text="com diploma" />
              <ManifestoWord text="válido em todo o Brasil." grey />

              <ManifestoPhotoChip
                url={SUPLETIVO_ASSETS.gridC}
                col={0}
                row={0}
                rotDeg={4}
                label="Diploma oficial com laço verde esmeralda e selo dourado"
              />

              <span
                className="tw-m-pop tw-sparkle"
                data-m-reveal="pop"
                style={{ '--rot': '0deg' } as React.CSSProperties}
              >
                <SparkleIcon />
              </span>

              <span className="tw-track-spacer" aria-hidden="true" />
            </div>

            <div className="sb-manifesto-hud">
              <div className="sb-manifesto-meter" aria-hidden="true">
                <span className="sb-manifesto-tag">ATO IV · O MANIFESTO</span>
                <span className="sb-manifesto-rail">
                  <span ref={manifestoProgressRef} className="sb-manifesto-fill" />
                </span>
              </div>

              <button
                type="button"
                className="sb-manifesto-skip"
                onClick={() => jumpToTarget('requisitos')}
              >
                <span>Continuar a história</span>
                <ArrowIcon />
              </button>
            </div>
          </div>
        </section>

        {/* Conversion Closing Flow (Eligibility -> 3 Steps & Proof -> Pricing -> FAQ -> Enrollment -> Legal Footer) */}
        <SupletivoConversionSections
          selectedStage={selectedStage}
          onChangeStage={setSelectedStage}
          selectedPayment={selectedPayment}
          onChangePayment={setSelectedPayment}
          onOpenExplorer={openExplorerCard}
          onJumpSection={jumpToTarget}
        />
      </main>

      {/* Interactive 12-Card Explorer Modal */}
      <StoryCardExplorerModal
        open={explorerOpen}
        activeIndex={activeCardIndex}
        onSelectIndex={setActiveCardIndex}
        onClose={() => setExplorerOpen(false)}
        onStartEnrollment={handleStartFromCard}
      />
    </div>
  );
}
