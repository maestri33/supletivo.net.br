<script lang="ts">
  interface Props {
    class?: string;
  }
  let { class: className = "size-10 text-[var(--green)]" }: Props = $props();
</script>

<svg
  class={className}
  viewBox="0 0 64 64"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Garantia de 7 Dias Artigo 49 CDC"
>
  <!-- Escudo Heráldico Base -->
  <path
    d="M32 4L10 13v17.5c0 14.5 9.4 28 22 31.5 12.6-3.5 22-17 22-31.5V13L32 4Z"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linejoin="round"
    fill="rgba(0, 115, 77, 0.12)"
  />
  <!-- Linha de Segurança Interna Tracejada -->
  <path
    d="M32 9L15 16.5v14c0 11.5 7.3 22.3 17 25.2 9.7-2.9 17-13.7 17-25.2V16.5L32 9Z"
    stroke="var(--yellow, #ffc400)"
    stroke-width="1.2"
    stroke-dasharray="3 3"
    stroke-linejoin="round"
  />
  <!-- Número '7' em Destaque Archivo -->
  <text
    x="25"
    y="34"
    font-family="'Archivo Black', sans-serif"
    font-size="14"
    fill="var(--paper, #ffffff)"
  >7</text>
  <text
    x="34"
    y="31"
    font-family="'Inter', sans-serif"
    font-size="7"
    font-weight="900"
    fill="var(--yellow, #ffc400)"
  >DIAS</text>
  <!-- Checkmark Inferior -->
  <path
    d="M24 41l5.5 5.5L41 36"
    stroke="var(--green, #00734d)"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
