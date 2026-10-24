<script lang="ts">
  import type { Testimonial } from '../../data/testimonials';

  interface Props {
    testimonials: Testimonial[];
    autoplay?: boolean;
    className?: string;
  }

  let { testimonials = [], autoplay = true, className = '' }: Props = $props();

  let active = $state(0);
  let isPaused = $state(false);

  function handleNext() {
    if (testimonials.length === 0) return;
    active = (active + 1) % testimonials.length;
  }

  function handlePrev() {
    if (testimonials.length === 0) return;
    active = (active - 1 + testimonials.length) % testimonials.length;
  }

  function isActive(index: number) {
    return index === active;
  }

  const angles = [-6, 4, -3, 5, -5, 3];
  function getRotateY(index: number) {
    return angles[index % angles.length];
  }

  let current = $derived(testimonials[active] || testimonials[0]);

  $effect(() => {
    if (typeof window === 'undefined') return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (autoplay && !isPaused && !prefersReducedMotion && testimonials.length > 1) {
      const interval = setInterval(handleNext, 6000);
      return () => clearInterval(interval);
    }
  });
</script>

<div
  class="mx-auto max-w-5xl px-4 py-6 md:px-8 font-sans {className}"
  role="region"
  aria-label="Depoimentos de alunos"
  onmouseenter={() => (isPaused = true)}
  onmouseleave={() => (isPaused = false)}
  onfocusin={() => (isPaused = true)}
  onfocusout={() => (isPaused = false)}
>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
    <!-- Coluna 1: Imagem com efeito 3D em leque -->
    <div class="w-full flex justify-center">
      <div class="relative w-full max-w-[360px] h-[360px] sm:h-[400px]">
        {#each testimonials as testimonial, index (testimonial.src)}
          {@const activeCard = isActive(index)}
          <div
            class="testimonial-card absolute inset-0 origin-bottom"
            style:opacity={activeCard ? 1 : 0.65}
            style:transform="scale({activeCard ? 1 : 0.92}) rotate({activeCard ? 0 : getRotateY(index)}deg)"
            style:z-index={activeCard ? 40 : testimonials.length + 2 - index}
            style:pointer-events={activeCard ? 'auto' : 'none'}
            aria-hidden={!activeCard}
          >
            <div class="relative h-full w-full rounded-3xl overflow-hidden shadow-none border-0 bg-neutral-900">
              <img
                src={testimonial.src}
                alt="Foto de {testimonial.name}"
                width="500"
                height="500"
                loading="lazy"
                decoding="async"
                draggable="false"
                class="h-full w-full object-cover object-center"
              />
              {#if testimonial.badge}
                <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-sm font-semibold text-yellow-400">
                  {testimonial.badge}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Coluna 2: Citação, autor e controles -->
    <div class="flex flex-col justify-between py-2 text-left">
      <div>
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-8 h-8 text-yellow-400 opacity-80" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          {#if current?.outcome}
            <span class="text-sm font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {current.outcome}
            </span>
          {/if}
        </div>

        {#if current}
          {#key active}
            <div class="quote-content-wrapper">
              <h3 class="text-2xl font-bold text-white tracking-tight">
                {current.name}
              </h3>
              <p class="text-sm text-neutral-400 mt-0.5 font-medium">
                {current.designation}
              </p>

              <p class="mt-6 text-base sm:text-lg text-neutral-200 leading-relaxed font-normal">
                {#each current.quote.split(' ') as word, i (`${word}-${i}`)}
                  <span class="inline-block quote-word" style="animation-delay: {i * 15}ms">{word}&nbsp;</span>
                {/each}
              </p>
            </div>
          {/key}
        {/if}
      </div>

      <!-- Controles de Navegação -->
      <div class="flex items-center gap-4 pt-8">
        <button
          onclick={handlePrev}
          type="button"
          aria-label="Depoimento anterior"
          class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/90 border border-white/10 text-neutral-300 transition-[color,background-color,border-color,transform] duration-200 hover:bg-neutral-700 hover:text-white hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 cursor-pointer touch-manipulation"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          onclick={handleNext}
          type="button"
          aria-label="Próximo depoimento"
          class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/90 border border-white/10 text-neutral-300 transition-[color,background-color,border-color,transform] duration-200 hover:bg-neutral-700 hover:text-white hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 cursor-pointer touch-manipulation"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
        <span class="text-sm text-neutral-400 ml-2 tabular-nums">
          {active + 1} / {testimonials.length}
        </span>
      </div>
    </div>
  </div>
</div>

<style>
  .testimonial-card {
    transition: transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease-in-out;
    will-change: transform, opacity;
  }

  .quote-content-wrapper {
    animation: fadeInContent 0.25s ease-in-out;
  }

  @keyframes fadeInContent {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .quote-word {
    animation: wordIn 0.2s ease-out both;
    will-change: transform, opacity, filter;
  }

  @keyframes wordIn {
    from {
      opacity: 0;
      filter: blur(6px);
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .testimonial-card,
    .quote-content-wrapper,
    .quote-word {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
