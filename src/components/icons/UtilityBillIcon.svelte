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
  <!-- Folha da Fatura / Conta -->
  <path
    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <polyline
    points="14 2 14 8 20 8"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Raio / Símbolo de Consumo de Energia / Água -->
  <path
    d="M12 11l-2 3.5h3.5L11.5 18"
    stroke="var(--yellow, #ffc400)"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Código de Barras / Linhas de Endereço -->
  <line x1="8" y1="18" x2="8.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  <line x1="15" y1="18" x2="16" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
</svg>
