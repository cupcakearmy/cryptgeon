<script lang="ts">
	import { AES, Hex } from 'occulto'
	import { t } from 'svelte-intl-precompile'
	import { blur } from 'svelte/transition'

	import { Adapters } from '$lib/adapters'
	import type { FileDTO, Note } from '$lib/api'
	import { create, PayloadToLargeError } from '$lib/api'
	import { status } from '$lib/stores/status'
	import { notify } from '$lib/toast'
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
			loading = $t('common.encrypting')

			const key = await AES.generateKey()
			const password = await Hex.encode(key)

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
			notify.success($t('home.messages.note_created'))
		} catch (e) {
			if (e instanceof PayloadToLargeError) {
				notify.error($t('home.errors.note_to_big'))
			} else if (e instanceof EmptyContentError) {
				notify.error($t('home.errors.empty_content'))
			} else {
				console.error(e)
				notify.error($t('home.errors.note_error'))
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
				<FileUpload data-testid="file-upload" label={$t('common.file')} bind:files />
			{:else}
				<TextArea
					data-testid="text-field"
					label={$t('common.note')}
					bind:value={note.contents}
					placeholder="..."
				/>
			{/if}

			<div class="bottom">
				<Switch
					data-testid="switch-file"
					class="file"
					label={$t('common.file')}
					bind:value={isFile}
				/>
				{#if $status?.allow_advanced}
					<Switch
						data-testid="switch-advanced"
						label={$t('common.advanced')}
						bind:value={advanced}
					/>
				{/if}
				<div class="grow" />
				<div class="tr">
					<small>{$t('common.max')}: <MaxSize /> </small>
					<br />
					<Button type="submit">{$t('common.create')}</Button>
				</div>
			</div>

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
</style>
