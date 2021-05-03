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
	export let password: string

	let note: NotePublic | null = null
	let exists = false

	let loading = true
	let error = false

	onMount(async () => {
		try {
			loading = true
			error = null
			await info(id)
			exists = true
		} catch {
			exists = false
		} finally {
			loading = false
		}
	})

	async function show() {
		try {
			error = false
			const data = note || (await get(id)) // Don't get the content twice on wrong password.
			const key = await getKeyFromString(password)
			data.contents = await decrypt(data.contents, key)
			note = data
		} catch {
			error = true
		}
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
			<Button type="submit">show note</Button>
			{#if error}
				<br />
				<p class="error-text">
					wrong password. could not decipher. probably a broken link. note was destroyed.
					<br />
				</p>
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
