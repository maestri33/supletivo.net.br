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
    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="2" />
  <circle cx="18" cy="9" r="0.8" fill="currentColor" />
</svg>
