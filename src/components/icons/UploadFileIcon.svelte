<script lang="ts">
  interface Props {
    class?: string;
  }
  let { class: className = "size-5 text-white" }: Props = $props();
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <path
    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <polyline
    points="17 8 12 3 7 8"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <line
    x1="12"
    y1="3"
    x2="12"
    y2="15"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
