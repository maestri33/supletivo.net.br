<script lang="ts">
  interface Props {
    class?: string;
    className?: string;
  }
  let { class: classProp, className = "size-5" }: Props = $props();
  const appliedClass = classProp ?? className;
</script>

<svg
  class={appliedClass}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
  <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 7 20l1.15-1.15" />
</svg>
