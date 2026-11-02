<script lang="ts">
	import { getCSSVariable } from '$lib/utils'
	import { t } from 'svelte-intl-precompile'
	import { renderSVG } from 'uqr'

	interface Props {
		value: string
	}

	let { value }: Props = $props()

	let qr: string | null = $state(null)

	$effect(() => {
		qr = renderSVG(value, {
			ecc: 'Q',
			blackColor: getCSSVariable('--ui-bg-0'),
			whiteColor: getCSSVariable('--ui-text-0'),
		})
	})
</script>

<small>{$t('common.qr_code')}</small>
<div>
	{#if qr}
		{@html qr}
	{/if}
</div>

<style>
	div {
		padding: 0.25rem;
		width: fit-content;
		border: 2px solid var(--ui-bg-1);
		background-color: var(--ui-bg-0);
		margin-top: 0.125rem;
		overflow: hidden;
		aspect-ratio: 1;
	}

	div :global(svg) {
		width: 100%;
		height: auto;
	}
</style>
