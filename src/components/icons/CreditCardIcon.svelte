<script lang="ts">
  interface Props {
    class?: string;
  }
  let { class: className = "size-6 text-white" }: Props = $props();
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <!-- Corpo do Cartão -->
  <rect
    x="2"
    y="4"
    width="20"
    height="16"
    rx="3"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
  />
  <!-- Tarja Magnética / Detalhe Superior -->
  <path d="M2 9h20" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.4" />
  <!-- Chip EMV Metálico com contatos -->
  <rect
    x="5"
    y="12"
    width="4.5"
    height="3.5"
    rx="0.8"
    stroke="var(--yellow, #ffc400)"
    stroke-width="1.2"
    fill="rgba(255, 196, 0, 0.2)"
  />
  <path d="M5 13.8h4.5M7.2 12v3.5" stroke="var(--yellow, #ffc400)" stroke-width="1" />
  <!-- Ondas de Aproximação Contactless (NFC) -->
  <path
    d="M12.5 12.5a2.5 2.5 0 0 1 0 3M14.5 11.2a4.5 4.5 0 0 1 0 5.6M16.5 10a6.5 6.5 0 0 1 0 8"
    stroke="currentColor"
    stroke-width="1.3"
    stroke-linecap="round"
    stroke-opacity="0.85"
  />
</svg>
