<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'

	export const load: Load = async ({ params }) => {
		return {
			props: params,
		}
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte'
	import { t } from 'svelte-intl-precompile'

	import type { NotePublic } from '$lib/api'
	import { get, info } from '$lib/api'
	import { decrypt, getKeyFromString } from '$lib/crypto'
	import Button from '$lib/ui/Button.svelte'
	import ShowNote from '$lib/ui/ShowNote.svelte'

	export let id: string

	let password: string
	let note: NotePublic | null = null
	let exists = false

	let loading = true
	let error = false

	onMount(async () => {
		try {
			loading = true
			error = false
			password = window.location.hash.slice(1)
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
			loading = true
			const data = note || (await get(id)) // Don't get the content twice on wrong password.
			const key = await getKeyFromString(password)
			data.contents = await decrypt(data.contents, key)
			note = data
		} catch {
			error = true
		} finally {
			loading = false
		}
	}
</script>

{#if !loading}
	{#if !exists}
		<p class="error-text">{$t('show.errors.not_found')}</p>
	{:else if note && !error}
		<ShowNote {note} />
	{:else}
		<form on:submit|preventDefault={show}>
			<fieldset>
				<p>{$t('show.explanation')}</p>
				<Button type="submit">{$t('show.show_note')}</Button>
				{#if error}
					<br />
					<p class="error-text">
						{$t('show.errors.decryption_failed')}
						<br />
					</p>
				{/if}
			</fieldset>
		</form>
	{/if}
{/if}
{#if loading}
	<p>{$t('common.loading')}</p>
{/if}
