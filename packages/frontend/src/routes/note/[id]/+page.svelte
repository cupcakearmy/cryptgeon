<script lang="ts">
	import { Hex } from 'occulto'
	import { onMount } from 'svelte'
	import { t } from 'svelte-intl-precompile'

	import Button from '$lib/ui/Button.svelte'
	import Loader from '$lib/ui/Loader.svelte'
	import ShowNote, { type DecryptedNote } from '$lib/ui/ShowNote.svelte'
	import { Adapters, get, info } from '@cryptgeon/shared'
	import type { PageData } from './$types'

	export let data: PageData

	let id = data.id
	let password: string
	let note: DecryptedNote | null = null
	let exists = false

	let loading: string | null = null
	let error: string | null = null

	onMount(async () => {
		// Check if note exists
		try {
			loading = $t('common.loading')
			password = window.location.hash.slice(1)
			await info(id)
			exists = true
		} catch {
			exists = false
		} finally {
			loading = null
		}
	})

	/**
	 * Get the actual contents of the note and decrypt it.
	 */
	async function show() {
		try {
			error = null
			loading = $t('common.downloading')
			const data = await get(id)
			loading = $t('common.decrypting')
			const key = Hex.decode(password)
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
			loading = null
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
				<Button data-testid="show-note-button" type="submit">{$t('show.show_note')}</Button>
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
	<p class="loader">{loading} <Loader /></p>
{/if}

<style>
	.loader {
		text-align: center;
	}
</style>
