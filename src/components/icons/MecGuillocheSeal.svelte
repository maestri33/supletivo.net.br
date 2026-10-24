<script lang="ts">
  interface Props {
    class?: string;
  }
  let { class: className = "size-14" }: Props = $props();
</script>

<svg
  class={className}
  viewBox="0 0 100 100"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Selo de Segurança MEC e SISTEC"
>
  <!-- Fundo Sutil de Alta Densidade -->
  <circle cx="50" cy="50" r="48" fill="rgba(0, 115, 77, 0.08)" />

  <!-- Guilhochê: Anéis Dentados e Linhas Geométricas Consecutivas -->
  <circle cx="50" cy="50" r="46" stroke="var(--green, #00734d)" stroke-width="1.5" />
  <circle
    cx="50"
    cy="50"
    r="43"
    stroke="var(--yellow, #ffc400)"
    stroke-width="1"
    stroke-dasharray="2 3"
    stroke-opacity="0.8"
  />
  <circle
    cx="50"
    cy="50"
    r="39"
    stroke="var(--green, #00734d)"
    stroke-width="0.75"
    stroke-dasharray="4 2"
  />

  <!-- Guilhochê Floral / Roseta Geométrica de Segurança -->
  <g stroke="var(--yellow, #ffc400)" stroke-width="0.65" stroke-opacity="0.45">
    <ellipse cx="50" cy="50" rx="36" ry="12" transform="rotate(0 50 50)" />
    <ellipse cx="50" cy="50" rx="36" ry="12" transform="rotate(30 50 50)" />
    <ellipse cx="50" cy="50" rx="36" ry="12" transform="rotate(60 50 50)" />
    <ellipse cx="50" cy="50" rx="36" ry="12" transform="rotate(90 50 50)" />
    <ellipse cx="50" cy="50" rx="36" ry="12" transform="rotate(120 50 50)" />
    <ellipse cx="50" cy="50" rx="36" ry="12" transform="rotate(150 50 50)" />
  </g>

  <!-- Anel Central Sólido -->
  <circle cx="50" cy="50" r="26" stroke="var(--green, #00734d)" stroke-width="1.8" fill="var(--ink, #0b1220)" />

  <!-- Emblema Heráldico Central: Livro Aberto da LDB e Estrela Nacional -->
  <path
    d="M37 54c4-2 9-2 13 1 4-3 9-3 13-1v-12c-4-2-9-2-13 1-4-3-9-3-13-1v12Z"
    stroke="var(--paper, #ffffff)"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="rgba(255,255,255,0.06)"
  />
  <path d="M50 43v12" stroke="var(--yellow, #ffc400)" stroke-width="1.4" stroke-linecap="round" />
  <path
    d="M50 34.5l1.2 2.5 2.7.4-2 1.9.5 2.7-2.4-1.3-2.4 1.3.5-2.7-2-1.9 2.7-.4z"
    fill="var(--yellow, #ffc400)"
  />

  <!-- Tipografia de Borda Microgravada -->
  <path id="mec-seal-text-path" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
  <text font-size="5" font-family="'Inter', sans-serif" font-weight="700" fill="var(--muted-on-dark, #b9c3db)" letter-spacing="1.2">
    <textPath href="#mec-seal-text-path" startOffset="50%" text-anchor="middle">
      VALIDADE NACIONAL · MEC / SISTEC
    </textPath>
  </text>
</svg>
