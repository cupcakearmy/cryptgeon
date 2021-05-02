<script context="module" lang="ts">
	export async function load({ page }) {
		return {
			props: page.params,
		}
	}
</script>

<script lang="ts">
	import type { NotePublic } from '$lib/api'
	import { info, get } from '$lib/api'
	import { decrypt, getKeyFromString } from '$lib/crypto'
	import Button from '$lib/ui/Button.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import copy from 'copy-to-clipboard'

	import { onMount } from 'svelte'

	export let id: string
	let needPassword = false
	let password: string = ''
	let note: NotePublic | null = null
	let exists = false

	let loading = true
	let error = false

	onMount(async () => {
		try {
			loading = true
			error = null
			const data = await info(id)
			needPassword = data.password
			exists = true
		} catch {
			exists = false
		} finally {
			loading = false
		}
	})

	async function show() {
		const data = await get(id)
		if (needPassword) {
			try {
				const key = await getKeyFromString(password)
				data.contents = await decrypt(data.contents, key)
				error = false
			} catch {
				error = true
			}
		}
		note = data
	}
</script>

{#if !loading}
	{#if !exists}
		<p class="error-text">note was not found or was already deleted.</p>
	{:else if note && !error}
		<p class="error-text">you will not get the chance to see the note again.</p>
		<div class="note">
			{note.contents}
		</div>
		<br />
		<Button on:click={() => copy(note.contents)}>copy to clipboard</Button>
	{:else}
		<form on:submit|preventDefault={show}>
			<p>click below to show and delete the note if the counter has reached it's limit</p>
			{#if needPassword}
				<TextInput type="password" label="password" bind:value={password} />
				<br />
			{/if}
			<Button type="submit">show note</Button>
			{#if error}
				<br />
				<p class="error-text">wrong password. could not decipher.</p>
			{/if}
		</form>
	{/if}
{/if}

<style>
	.note {
		width: 100%;
		margin: 0;
		padding: 0;
		border: 2px solid var(--ui-bg-1);
		outline: none;
		padding: 0.5rem;
		white-space: pre;
		overflow: auto;
	}
</style>
