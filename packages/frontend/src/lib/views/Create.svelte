<script lang="ts">
	import { AES, Hex } from 'occulto'
	import { t } from 'svelte-intl-precompile'
	import { blur } from 'svelte/transition'

	import { status } from '$lib/stores/status'
	import { notify } from '$lib/toast'
	import AdvancedParameters from '$lib/ui/AdvancedParameters.svelte'
	import Button from '$lib/ui/Button.svelte'
	import FileUpload from '$lib/ui/FileUpload.svelte'
	import Loader from '$lib/ui/Loader.svelte'
	import MaxSize from '$lib/ui/MaxSize.svelte'
	import PastedFilesPreview from '$lib/ui/PastedFilesPreview.svelte'
	import Result, { type NoteResult } from '$lib/ui/NoteResult.svelte'
	import Switch from '$lib/ui/Switch.svelte'
	import TextArea from '$lib/ui/TextArea.svelte'
	import { Adapters, API, PayloadToLargeError, type FileDTO, type Note } from 'cryptgeon/shared'

	let note: Note = $state({
		contents: '',
		meta: { type: 'text' },
		views: 1,
		expiration: 60,
	})
	let files: FileDTO[] = $state([])
	let result: NoteResult | null = $state(null)
	let advanced = $state(false)
	let isFile = $state(false)
	let timeExpiration = $state(false)
	let customPassword: string | null = $state(null)
	let description = $state('')
	let loading: string | null = $state(null)
	let isPasting = $state(false)

	$effect(() => {
		if (!advanced) {
			note.views = 1
			timeExpiration = false
		}
	})

	$effect(() => {
		description = $t('home.explanation', {
			values: {
				type: $t(timeExpiration ? 'common.minutes' : 'common.views', {
					values: { n: (timeExpiration ? note.expiration : note.views) ?? '?' },
				}),
			},
		})
	})

	$effect(() => {
		note.meta.type = isFile ? 'file' : 'text'
	})

	$effect(() => {
		if (!isFile) {
			note.contents = ''
		}
	})

	async function handlePaste(e: ClipboardEvent) {
		const data = e.clipboardData
		if (!data) return

		const raw: File[] = []

		if (data.files.length) {
			raw.push(...Array.from(data.files))
		}

		for (let i = 0; i < data.items.length; i++) {
			const item = data.items[i]
			if (item.kind === 'file') {
				const file = item.getAsFile()
				if (file) raw.push(file)
			}
		}

		if (raw.length === 0) return
		e.preventDefault()

		const seen = new Set<string>()
		const pasted: File[] = []
		for (const f of raw) {
			const key = `${f.name}|${f.size}`
			if (!seen.has(key)) {
				seen.add(key)
				pasted.push(f)
			}
		}

		isPasting = true

		const dtos: FileDTO[] = await Promise.all(
			pasted.map(async (file) => {
				const ext = file.name.includes('.') ? '' : `.${file.type.split('/')[1] || 'bin'}`
				const name =
					file.name || `pasted-file-${Date.now()}-${Math.round(Math.random() * 1000)}${ext}`
				const renamed = new File([file], name, { type: file.type })
				return {
					name: renamed.name,
					size: renamed.size,
					type: renamed.type,
					contents: new Uint8Array(await renamed.arrayBuffer()),
				}
			})
		)

		if (dtos.length > 0) {
			if (!isFile) isFile = true
			files = [...files, ...dtos]
		}

		isPasting = false
	}

	class EmptyContentError extends Error {}

	async function submit(e: SubmitEvent) {
		e.preventDefault()
		try {
			loading = $t('common.encrypting')

			const derived = customPassword && (await AES.derive(customPassword))
			const key = derived ? derived[0] : await AES.generateKey()

			const data: Note = {
				contents: '',
				meta: note.meta,
			}
			if (derived) data.meta.derivation = derived[1]
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
			const response = await API.create(data)
			result = {
				id: response.id,
				password: customPassword ? undefined : Hex.encode(key),
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
	<form onsubmit={submit} onpaste={handlePaste}>
		<fieldset disabled={loading !== null}>
			<div class="paste-indicator">
				{#if isPasting}
					<div class="pasting-overlay">
						<div class="pasting-spinner"></div>
						<span>{$t('home.pasting')}</span>
					</div>
				{/if}
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

				<PastedFilesPreview bind:files />
			</div>

			<div class="bottom">
				{#if $status?.allow_files}
					<Switch
						data-testid="switch-file"
						class="file"
						label={$t('common.file')}
						bind:value={isFile}
					/>
				{/if}
				{#if $status?.allow_advanced}
					<Switch
						data-testid="switch-advanced"
						label={$t('common.advanced')}
						bind:value={advanced}
					/>
				{/if}
				<div class="grow"></div>
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
				<div transition:blur|global={{ duration: 250 }}>
					<hr />
					<AdvancedParameters bind:note bind:timeExpiration bind:customPassword />
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

	.paste-indicator {
		position: relative;
		min-height: 200px;
	}

	.pasting-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		z-index: 10;
	}

	.pasting-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top: 2px solid white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 0.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
