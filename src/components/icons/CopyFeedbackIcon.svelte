<script lang="ts">
  interface Props {
    copied?: boolean;
    class?: string;
  }
  let { copied = false, class: className = "size-4" }: Props = $props();
</script>

<div class="relative inline-flex items-center justify-center {className}" aria-hidden="true">
  {#if !copied}
    <!-- Ícone de Duas Pranchetas (Copiar) -->
    <svg
      class="size-full transition-transform duration-200"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  {:else}
    <!-- Ícone de Checkmark Ativo com Pulso -->
    <svg
      class="size-full text-emerald-400 animate-[stamp_0.35s_cubic-bezier(0.18,0.89,0.32,1.28)_forwards]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  {/if}
</div>

<style>
  @keyframes stamp {
    0% {
      transform: scale(0.6);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
