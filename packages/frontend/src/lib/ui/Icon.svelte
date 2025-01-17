<script lang="ts" module>
	import IconContrast from '$lib/icons/IconContrast.svelte'
	import IconCopy from '$lib/icons/IconCopy.svelte'
	import IconDice from '$lib/icons/IconDice.svelte'
	import IconEye from '$lib/icons/IconEye.svelte'
	import IconEyeOff from '$lib/icons/IconEyeOff.svelte'
	import type { HTMLButtonAttributes } from 'svelte/elements'

	const map = {
		contrast: IconContrast,
		copy: IconCopy,
		dice: IconDice,
		eye: IconEye,
		'eye-off': IconEyeOff,
	}
</script>

<script lang="ts">
	interface Props {
		icon: keyof typeof map
	}

	let { icon, ...rest }: HTMLButtonAttributes & Props = $props()
</script>

<button type="button" {...rest}>
	{#if map[icon]}
		{@const SvelteComponent = map[icon]}
		<SvelteComponent />
	{/if}
</button>

<style>
	button {
		display: inline-block;
		contain: strict;
		box-sizing: content-box;
	}
	button > :global(svg) {
		display: block;
		fill: currentColor;
	}
</style>
