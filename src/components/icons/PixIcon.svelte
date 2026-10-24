<script lang="ts">
  interface Props {
    class?: string;
  }
  let { class: className = "size-6 text-[var(--green)]" }: Props = $props();
</script>

<svg
  class={className}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <path
    d="M9.13 4.25a2.5 2.5 0 0 1 3.54 0l1.41 1.41a.5.5 0 0 1-.7.71l-1.42-1.41a1.5 1.5 0 0 0-2.12 0L5.27 9.54a1.5 1.5 0 0 0 0 2.12l4.57 4.58a1.5 1.5 0 0 0 2.12 0l1.42-1.42a.5.5 0 0 1 .7.71l-1.41 1.41a2.5 2.5 0 0 1-3.54 0L4.56 12.37a2.5 2.5 0 0 1 0-3.54L9.13 4.25Z"
    fill="currentColor"
  />
  <path
    d="M14.87 19.75a2.5 2.5 0 0 1-3.54 0l-1.41-1.41a.5.5 0 0 1 .7-.71l1.42 1.41a1.5 1.5 0 0 0 2.12 0l4.57-4.58a1.5 1.5 0 0 0 0-2.12l-4.57-4.58a1.5 1.5 0 0 0-2.12 0l-1.42 1.42a.5.5 0 0 1-.7-.71l1.41-1.41a2.5 2.5 0 0 1 3.54 0l4.57 4.57a2.5 2.5 0 0 1 0 3.54l-4.57 4.57Z"
    fill="currentColor"
  />
</svg>
