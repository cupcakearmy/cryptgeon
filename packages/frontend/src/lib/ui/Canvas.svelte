<script lang="ts">
	// @ts-ignore
	import QR from 'qrious'
	import { t } from 'svelte-intl-precompile'

	import { getCSSVariable } from '$lib/utils'

	interface Props {
		value: string
	}

	let { value }: Props = $props()

	let canvas: HTMLCanvasElement | null = $state(null)

	$effect(() => {
		new QR({
			value,
			level: 'Q',
			size: 800,
			background: getCSSVariable('--ui-bg-0'),
			foreground: getCSSVariable('--ui-text-0'),
			element: canvas,
		})
	})
</script>

<small>{$t('common.qr_code')}</small>
<div>
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	div {
		padding: 0.5rem;
		width: fit-content;
		border: 2px solid var(--ui-bg-1);
		background-color: var(--ui-bg-0);
		margin-top: 0.125rem;
	}

	canvas {
		width: 100%;
		height: auto;
	}
</style>
