<script lang="ts" context="module">
	import IconContrast from '$lib/icons/IconContrast.svelte'
	import IconCopy from '$lib/icons/IconCopy.svelte'
	import IconDice from '$lib/icons/IconDice.svelte'
	import IconEye from '$lib/icons/IconEye.svelte'
	import IconEyeOff from '$lib/icons/IconEyeOff.svelte'

	const map = {
		contrast: IconContrast,
		copy: IconCopy,
		dice: IconDice,
		eye: IconEye,
		'eye-off': IconEyeOff,
	}
</script>

<script lang="ts">
	export let icon: keyof typeof map
</script>

<button type="button" on:click {...$$restProps}>
	{#if map[icon]}
		<svelte:component this={map[icon]} />
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
