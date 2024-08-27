<script lang="ts">
	import Icon from '$lib/ui/Icon.svelte'
	import { copy as copyFN } from '$lib/utils'
	import { getRandomBytes, Hex } from 'occulto'

	export let label: string = ''
	export let value: any
	export let validate: (value: any) => boolean | string = () => true
	export let copy: boolean = false
	export let random: boolean = false

	const initialType = $$restProps.type
	const isPassword = initialType === 'password'
	let hidden = true

	$: valid = validate(value)

	$: if (isPassword) {
		value
		$$restProps.type = hidden ? initialType : 'text'
	}

	function toggle() {
		hidden = !hidden
	}

	async function randomFN() {
		value = Hex.encode(await getRandomBytes(32))
	}
</script>

<label>
	<small class:disabled={$$restProps.disabled}>
		{label}
		{#if valid !== true}
			<span class="error-text">{valid}</span>
		{/if}
	</small>
	<input bind:value {...$$restProps} class:valid={valid === true} />
	<div class="icons">
		{#if isPassword}
			<Icon
				disabled={$$restProps.disabled}
				class="icon"
				icon={hidden ? 'eye' : 'eye-off'}
				on:click={toggle}
			/>
		{/if}
		{#if random}
			<Icon disabled={$$restProps.disabled} class="icon" icon="dice" on:click={randomFN} />
		{/if}
		{#if copy}
			<Icon
				disabled={$$restProps.disabled}
				class="icon"
				icon="copy"
				on:click={() => copyFN(value.toString())}
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
