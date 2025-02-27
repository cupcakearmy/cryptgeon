<script lang="ts">
	import Icon from '$lib/ui/Icon.svelte'
	import { copy as copyFN } from '$lib/utils'
	import { getRandomBytes, Hex } from 'occulto'
	import type { HTMLInputAttributes } from 'svelte/elements'

	interface Props {
		label?: string
		value: any
		validate?: (value: any) => boolean | string
		copy?: boolean
		random?: boolean
	}

	let {
		label = '',
		value = $bindable(),
		validate = () => true,
		copy = false,
		random = false,
		...rest
	}: HTMLInputAttributes & Props = $props()

	const initialType = $state(rest.type)
	const isPassword = initialType === 'password'
	let hidden = $state(true)

	let valid = $derived(validate(value))
	let type = $derived(isPassword ? (hidden ? 'password' : 'text') : rest.type)

	function toggle() {
		console.debug('toggle')
		hidden = !hidden
	}

	async function randomFN() {
		value = Hex.encode(await getRandomBytes(32))
	}
</script>

<label>
	<small class:disabled={rest.disabled}>
		{label}
		{#if valid !== true}
			<span class="error-text">{valid}</span>
		{/if}
	</small>
	<input bind:value {...rest} {type} autocomplete="off" class:valid={valid === true} />
	<div class="icons">
		{#if isPassword}
			<Icon
				disabled={rest.disabled}
				class="icon"
				icon={hidden ? 'eye' : 'eye-off'}
				onclick={toggle}
			/>
		{/if}
		{#if random}
			<Icon disabled={rest.disabled} class="icon" icon="dice" onclick={randomFN} />
		{/if}
		{#if copy}
			<Icon
				disabled={rest.disabled}
				class="icon"
				icon="copy"
				onclick={() => copyFN(value.toString())}
			/>
		{/if}
	</div>
</label>

<style>
	label {
		position: relative;
		display: block;
		width: 100%;
	}

	label > small {
		display: block;
	}

	input {
		width: 100%;
		margin: 0;
		border: 2px solid var(--ui-bg-1);
		outline: none;
		padding: 0.5rem;
		height: 2.5rem;
	}
	input:hover,
	input:focus {
		border-color: var(--ui-clr-primary);
	}

	input:not(.valid) {
		border-color: var(--ui-clr-error);
	}

	.icons {
		border: 1px red;
		position: absolute;
		right: 0.3rem;
		bottom: 0.3rem;
		display: flex;
		color: var(--ui-clr-primary);
	}
	.icons > :global(.icon) {
		width: 1.5rem;
		height: 1.5rem;
		background-color: var(--ui-bg-1);
		border: 2px solid var(--ui-bg-2);
		padding: 1px;
		cursor: pointer;
		margin-left: 0.25rem;
	}
	.icons > :global(.icon:hover) {
		border-color: var(--ui-clr-primary);
	}
</style>
