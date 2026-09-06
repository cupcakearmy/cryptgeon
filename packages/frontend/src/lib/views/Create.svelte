<script lang="ts">
	import {
		deriveKey, generateKey, encrypt, randomBytes,
		bytesToHex, encode, compress,
		create as apiCreate,
		type FileDTO, type ServerNote
	} from '@cryptgeon/shared'
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

	let note: { views: number; expiration: number } = $state({ views: 1, expiration: 60 })
	let files: FileDTO[] = $state([])
	let result: NoteResult | null = $state(null)
	let advanced = $state(false)
	let isFile = $state(false)
	let timeExpiration = $state(false)
	let customPassword: string | null = $state(null)
	let description = $state('')
	let loading: string | null = $state(null)
	let isPasting = $state(false)
	let textContent = $state('')

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
		if (!isFile) textContent = ''
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
				const data = new Uint8Array(await renamed.arrayBuffer())
				return {
					name: renamed.name,
					mime: renamed.type,
					size: renamed.size,
					data,
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

			const salt = customPassword ? randomBytes(16) : null
			const key = customPassword
				? deriveKey(customPassword, salt!)
				: generateKey()

			let inner: Uint8Array
			if (isFile) {
				if (files.length === 0) throw new EmptyContentError()
				inner = encode({ type: 'files', data: files })
			} else {
				if (textContent === '') throw new EmptyContentError()
				inner = encode({ type: 'text', data: textContent })
			}

			const originalSize =inner.byteLength
			const compressed = compress(inner)
			const compresseedSize= compressed.byteLength
			console.debug({originalSize, compresseedSize, ratio: originalSize/compresseedSize})

			const data = encrypt(compress(inner), key)
			const extra = customPassword
				? encode({ salt: salt!, N: 32768, r: 8, p: 1 })
				: new Uint8Array()
			const serverNote: ServerNote = {
				meta: {
					...(timeExpiration ? { expiration: parseInt(note.expiration as any) } : { views: parseInt(note.views as any) }),
					extra,
				},
				data,
			}

			loading = $t('common.uploading')
			const response = await apiCreate(serverNote)
			result = {
				id: response.id,
				password: customPassword ? undefined : bytesToHex(key),
			}
			notify.success($t('home.messages.note_created'))
		} catch (e) {
			console.error(e)
			notify.error($t('home.errors.note_error'))
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
						bind:value={textContent}
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
