<script lang="ts">
  interface Props {
    class?: string;
  }
  let { class: className = "size-5 text-[var(--green)]" }: Props = $props();
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <!-- Arco do Cadeado -->
  <path
    d="M7 10V7a5 5 0 0 1 10 0v3"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Corpo do Cadeado -->
  <rect
    x="3"
    y="10"
    width="18"
    height="12"
    rx="3"
    stroke="currentColor"
    stroke-width="2"
    fill="rgba(0, 115, 77, 0.15)"
  />
  <!-- Buraco de Fechadura / Circuito de Criptografia -->
  <circle cx="12" cy="15" r="1.5" fill="var(--yellow, #ffc400)" />
  <path d="M12 16.5v2.5" stroke="var(--yellow, #ffc400)" stroke-width="1.5" stroke-linecap="round" />
  <!-- Micro-trilha de Circuito Lateral -->
  <path d="M6 16h2M16 16h2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.6" />
</svg>
