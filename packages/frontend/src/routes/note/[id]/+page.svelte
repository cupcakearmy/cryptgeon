<script lang="ts">
	import { AES, Hex } from 'occulto'
	import { onMount } from 'svelte'
	import { t } from 'svelte-intl-precompile'

	import Button from '$lib/ui/Button.svelte'
	import Loader from '$lib/ui/Loader.svelte'
	import ShowNote, { type DecryptedNote } from '$lib/ui/ShowNote.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import { Adapters, API, type NoteMeta } from 'cryptgeon/shared'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	let id = data.id
	let password: string | null = $state<string | null>(null)
	let note: DecryptedNote | null = $state(null)
	let exists = $state(false)
	let meta: NoteMeta | null = $state(null)

	let loading: string | null = $state(null)
	let error: string | null = $state(null)

	let valid = $derived(!!password?.length)

	onMount(async () => {
		// Check if note exists
		try {
			loading = $t('common.loading')
			password = window.location.hash.slice(1)
			const note = await API.info(id)
			meta = note.meta
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
	async function show(e: SubmitEvent) {
		e.preventDefault()
		try {
			if (!valid) {
				error = $t('show.errors.no_password')
				return
			}

			// Load note
			error = null
			loading = $t('common.downloading')
			const data = await API.get(id)
			loading = $t('common.decrypting')
			const derived = meta?.derivation && (await AES.derive(password!, meta.derivation))
			const key = derived ? derived[0] : Hex.decode(password!)
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
		<form onsubmit={show}>
			<fieldset>
				<p>{$t('show.explanation')}</p>
				{#if meta?.derivation}
					<TextInput
						data-testid="show-note-password"
						type="password"
						bind:value={password}
						label={$t('common.password')}
					/>
				{/if}
				<Button disabled={!valid} data-testid="show-note-button" type="submit"
					>{$t('show.show_note')}</Button
				>
				{#if error}
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

	fieldset {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
