<script lang="ts">
	import { onMount } from 'svelte'
	export let icon: string = ''
	export let href: string = ''

	$: src = href || `/icons/${icon}.svg`

	let html = null

	onMount(async () => {
		html = await fetch(src).then((res) => res.text())
	})
</script>

{#if html === null}
	<img on:click {...$$restProps} {src} alt={icon} />
{:else}
	<div on:click {...$$restProps}>
		{@html html}
	</div>
{/if}

<style>
	img,
	div {
		display: inline-block;
		contain: strict;
		box-sizing: content-box;
	}
	div > :global(svg) {
		display: block;
		fill: currentColor;
	}
</style>
