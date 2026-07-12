<script lang="ts">
	import { deriveKey, hexToBytes, decrypt, decode, info, get as apiGet, type FileDTO } from '@cryptgeon/shared'
	import { onMount } from 'svelte'
	import { t } from 'svelte-intl-precompile'

	import Button from '$lib/ui/Button.svelte'
	import Loader from '$lib/ui/Loader.svelte'
	import ShowNote, { type DecryptedNote } from '$lib/ui/ShowNote.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import type { PageData } from './$types'

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	let id = $derived(data.id)
	let password: string | null = $state<string | null>(null)
	let note: DecryptedNote | null = $state(null)
	let exists = $state(false)
	let hasExtra = $state(false)

	let loading: string | null = $state(null)
	let error: string | null = $state(null)

	let valid = $derived(!!password?.length)

	onMount(async () => {
		try {
			loading = $t('common.loading')
			password = window.location.hash.slice(1)
			const meta = await info(id)
			if (meta) {
				hasExtra = !!meta.extra?.length
				exists = true
			} else {
				exists = false
			}
		} catch {
			exists = false
		} finally {
			loading = null
		}
	})

	async function show(e: SubmitEvent) {
		e.preventDefault()
		try {
			if (!valid) {
				error = $t('show.errors.no_password')
				return
			}

			error = null
			loading = $t('common.downloading')
			const serverNote = await apiGet(id)
			if (!serverNote) {
				error = $t('show.errors.not_found')
				return
			}

			loading = $t('common.decrypting')
			let key: Uint8Array
			if (hasExtra && serverNote.meta.extra && serverNote.meta.extra.length > 0) {
				const derivation = decode(serverNote.meta.extra) as any
				key = deriveKey(password!, new Uint8Array(derivation.salt))
			} else {
				key = hexToBytes(password!)
			}

			const decrypted = decrypt(serverNote.data, key)
			const content = decode(decrypted) as any

			switch (content.type) {
				case 'text':
					note = {
						meta: { type: 'text' },
						contents: content.data,
					}
					break
case 'files':
    const files = (content.data as any[]).map((f: any) => ({
        ...f,
        data: f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data as any),
    }))
    note = {
        meta: { type: 'file' },
        contents: files,
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
				{#if hasExtra}
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