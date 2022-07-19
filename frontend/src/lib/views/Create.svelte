<script lang="ts">
	import { t } from 'svelte-intl-precompile'
	import { blur } from 'svelte/transition'

	import { Adapters } from '$lib/adapters'
	import type { FileDTO, Note } from '$lib/api'
	import { create, PayloadToLargeError } from '$lib/api'
	import { Crypto, Hex } from '$lib/crypto'
	import { status } from '$lib/stores/status'
	import AdvancedParameters from '$lib/ui/AdvancedParameters.svelte'
	import Button from '$lib/ui/Button.svelte'
	import FileUpload from '$lib/ui/FileUpload.svelte'
	import Loader from '$lib/ui/Loader.svelte'
	import MaxSize from '$lib/ui/MaxSize.svelte'
	import Result, { type NoteResult } from '$lib/ui/NoteResult.svelte'
	import Switch from '$lib/ui/Switch.svelte'
	import TextArea from '$lib/ui/TextArea.svelte'

	let note: Note = {
		contents: '',
		meta: { type: 'text' },
		views: 1,
		expiration: 60,
	}
	let files: FileDTO[]
	let result: NoteResult | null = null
	let advanced = false
	let isFile = false
	let timeExpiration = false
	let description = ''
	let loading: string | null = null
	let error: string | null = null

	$: if (!advanced) {
		note.views = 1
		timeExpiration = false
	}

	$: {
		description = $t('home.explanation', {
			values: {
				type: $t(timeExpiration ? 'common.minutes' : 'common.views', {
					values: { n: (timeExpiration ? note.expiration : note.views) ?? '?' },
				}),
			},
		})
	}

	$: note.meta.type = isFile ? 'file' : 'text'

	$: if (!isFile) {
		note.contents = ''
	}

	class EmptyContentError extends Error {}

	async function submit() {
		try {
			error = null
			loading = $t('common.encrypting')

			const password = Hex.encode(Crypto.getRandomBytes(32))
			const key = await Crypto.getKeyFromString(password)

			const data: Note = {
				contents: '',
				meta: note.meta,
			}
			if (isFile) {
				if (files.length === 0) throw new EmptyContentError()
				data.contents = await Adapters.Files.encrypt(files, key)
			} else {
				if (note.contents === '') throw new EmptyContentError()
				data.contents = await Adapters.Text.encrypt(note.contents, key)
			}
			if (timeExpiration) data.expiration = parseInt(note.expiration as any)
			else data.views = parseInt(note.views as any)

			loading = $t('common.uploading')
			const response = await create(data)
			result = {
				password: password,
				id: response.id,
			}
		} catch (e) {
			if (e instanceof PayloadToLargeError) {
				error = $t('home.errors.note_to_big')
			} else if (e instanceof EmptyContentError) {
				error = $t('home.errors.empty_content')
			} else {
				console.error(e)
				error = $t('home.errors.note_error')
			}
		} finally {
			loading = null
		}
	}
</script>

{#if result}
	<Result {result} />
{:else}
	<p>
		{@html $status?.theme_text || $t('home.intro')}
	</p>
	<form on:submit|preventDefault={submit}>
		<fieldset disabled={loading !== null}>
			{#if isFile}
				<FileUpload label={$t('common.file')} bind:files />
			{:else}
				<TextArea label={$t('common.note')} bind:value={note.contents} placeholder="..." />
			{/if}

			<div class="bottom">
				<Switch class="file" label={$t('common.file')} bind:value={isFile} />
				{#if $status?.allow_advanced}
					<Switch label={$t('common.advanced')} bind:value={advanced} />
				{/if}
				<div class="grow" />
				<div class="tr">
					<small>{$t('common.max')}: <MaxSize /> </small>
					<br />
					<Button type="submit">{$t('common.create')}</Button>
				</div>
			</div>

			{#if error}
				<div class="error-text">{error}</div>
			{/if}

			<p>
				<br />
				{#if loading}
					{loading} <Loader />
				{:else}
					{description}
				{/if}
			</p>

			{#if advanced}
				<div transition:blur={{ duration: 250 }}>
					<br />
					<AdvancedParameters bind:note bind:timeExpiration />
				</div>
			{/if}
		</fieldset>
	</form>
{/if}

<style>
	.bottom {
		display: flex;
		align-items: flex-end;
		margin-top: 0.5rem;
	}

	.bottom :global(.file) {
		margin-right: 0.5rem;
	}

	.grow {
		flex: 1;
	}

	.error-text {
		margin-top: 0.5rem;
	}
</style>
