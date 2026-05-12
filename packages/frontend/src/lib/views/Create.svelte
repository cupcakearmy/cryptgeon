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
	
	// Image paste functionality
	let pastedImages: { preview: string; file: File }[] = $state([])
	let isPasting = $state(false)
	let pasteIndicator = $state<HTMLDivElement | null>(null)

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
		// Use the standard DataTransfer API to access pasted content
		const items = e.clipboardData?.items
		if (!items || items.length === 0) return

		isPasting = true

		const imagePromises: Promise<File | null>[] = []
		for (let i = 0; i < items.length; i++) {
			const item = items[i]
			if (item.kind === 'file' && item.type.startsWith('image/')) {
				const file = item.getAsFile()
				if (file) {
					const extension = file.type.split('/')[1] || 'png'
					const renamed = new File(
						[file],
						`pasted-image-${Date.now()}-${Math.round(Math.random() * 1000)}.${extension}`,
						{ type: file.type },
					)
					imagePromises.push(Promise.resolve(renamed))
				}
			}
		}
		
		try {
			const results = await Promise.all(imagePromises)
			const imageFiles = results.filter((file): file is File => file !== null)
			
			if (imageFiles.length > 0) {
				// Switch to file mode if not already
				if (!isFile) {
					isFile = true
				}
				
				// Process each image for preview and add to files
				for (const imageFile of imageFiles) {
					// Create preview URL
					const previewURL = URL.createObjectURL(imageFile)
					
					// Add to pasted images for preview
					pastedImages = [...pastedImages, { preview: previewURL, file: imageFile }]
					
					// Convert to FileDTO and add to files array
					const arrayBuffer = await imageFile.arrayBuffer()
					const fileDTO: FileDTO = {
						name: imageFile.name,
						size: imageFile.size,
						type: imageFile.type,
						contents: new Uint8Array(arrayBuffer)
					}
					
					// Add to files if not already present
					if (!files.some(f => f.name === imageFile.name && f.size === imageFile.size)) {
						files = [...files, fileDTO]
					}
				}
			}
		} catch (error) {
			console.error('Error processing pasted image:', error)
		} finally {
			isPasting = false
		}
	}

	function removePastedImage(index: number) {
		const removed = pastedImages.splice(index, 1)[0]
		// Revoke the object URL to free memory
		URL.revokeObjectURL(removed.preview)
		
		// Also remove from files array
		files = files.filter(file => !(file.name === removed.file.name && file.size === removed.file.size))
		
		// If no more pasted images and no other files, switch back to text mode
		if (pastedImages.length === 0 && files.length === 0) {
			isFile = false
		}
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
			<div class="paste-indicator" bind:this={pasteIndicator}>
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
				
				{#if pastedImages.length > 0}
					<div class="pasted-images-preview">
						<h4>{$t('home.pasted_images')}</h4>
						<div class="images-grid">
							{#each pastedImages as image, index}
								<div class="image-preview">
									<img src={image.preview} class="preview-img" />
									<div class="image-actions">
										<Button 
											onclick={() => removePastedImage(index)} 
										>
											{$t('home.remove')}
										</Button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

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

	/* Paste indicator styles */
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
		to { transform: rotate(360deg); }
	}

	.pasted-images-preview {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px dashed #ccc;
		border-radius: 4px;
		background-color: #fafafa;
	}

	.pasted-images-preview h4 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.images-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.image-preview {
		position: relative;
		text-align: center;
	}

	.preview-img {
		max-width: 150px;
		max-height: 150px;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.image-actions {
		margin-top: 0.5rem;
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.pasted-images-preview {
			margin-top: 0.5rem;
			padding: 0.5rem;
		}
		
		.preview-img {
			max-width: 120px;
			max-height: 120px;
		}
		
		.images-grid {
			gap: 0.5rem;
		}
	}
</style>
