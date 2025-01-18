<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		title: string
		children?: Snippet
	}

	let { title, children }: Props = $props()
</script>

<p>
	<b>▶ {title}</b>
	{@render children?.()}
</p>

<style>
	b {
		display: block;
		margin-bottom: 0.25rem;
	}

	p > :global(span) {
		padding-left: 1.25em;
	}
</style>
