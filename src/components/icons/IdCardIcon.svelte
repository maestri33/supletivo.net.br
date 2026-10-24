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
  <!-- Moldura do Documento -->
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
  <!-- Foto 3x4 do Aluno -->
  <rect
    x="4.5"
    y="7"
    width="5.5"
    height="6.5"
    rx="1"
    stroke="currentColor"
    stroke-width="1.4"
    fill="rgba(255, 255, 255, 0.08)"
  />
  <circle cx="7.25" cy="9.25" r="1.25" fill="currentColor" opacity="0.8" />
  <path
    d="M5.5 13c0-1 .8-1.5 1.75-1.5s1.75.5 1.75 1.5"
    stroke="currentColor"
    stroke-width="1.2"
    stroke-linecap="round"
  />
  <!-- Linhas de Dados do RG / CNH -->
  <path d="M12.5 8h6M12.5 11h6M12.5 14h4M5 16.5h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.75" />
</svg>
