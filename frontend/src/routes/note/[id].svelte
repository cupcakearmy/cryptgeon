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

	import { Adapters } from '$lib/adapters'
	import { get, info } from '$lib/api'
	import { Crypto } from '$lib/crypto'
	import Button from '$lib/ui/Button.svelte'
	import ShowNote, { type DecryptedNote } from '$lib/ui/ShowNote.svelte'

	export let id: string

	let password: string
	let note: DecryptedNote | null = null
	let exists = false

	let loading = true
	let error: string | null = null

	onMount(async () => {
		// Check if note exists
		try {
			loading = true
			password = window.location.hash.slice(1)
			await info(id)
			exists = true
		} catch {
			exists = false
		} finally {
			loading = false
		}
	})

	/**
	 * Get the actual contents of the note and decrypt it.
	 */
	async function show() {
		try {
			error = null
			loading = true
			const data = await get(id)
			const key = await Crypto.getKeyFromString(password)
			switch (data.meta.type) {
				case 'text':
					note = {
						meta: { type: 'text' },
						contents: await Adapters.Text.decrypt(data.contents, key),
					}
					break
				case 'file':
					note = {
						meta: { type: 'file' },
						contents: await Adapters.Files.decrypt(data.contents, key),
					}
					break
				default:
					error = $t('show.errors.unsupported_type')
					return
			}
		} catch {
			error = $t('show.errors.decryption_failed')
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
						{error}
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
