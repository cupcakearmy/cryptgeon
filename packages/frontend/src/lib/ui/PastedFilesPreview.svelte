<script lang="ts">
	import { t } from 'svelte-intl-precompile'
	import Button from '$lib/ui/Button.svelte'
	import type { FileDTO } from 'cryptgeon/shared'

	interface Props {
		files: FileDTO[]
	}

	let { files = $bindable([]) }: Props = $props()

	let previewUrls: string[] = $state([])

	$effect(() => {
		const urls = files.map((f) => URL.createObjectURL(new Blob([f.contents], { type: f.type })))
		previewUrls = urls
		return () => {
			for (const url of urls) URL.revokeObjectURL(url)
		}
	})

	function remove(index: number) {
		const removed = files[index]
		URL.revokeObjectURL(previewUrls[index])
		files = files.toSpliced(index, 1)
	}

	function isImage(type: string) {
		return type.startsWith('image/')
	}
</script>

{#if files.length > 0}
	<div class="pasted-files-preview">
		<h4>{$t('home.pasted_files')}</h4>
		<div class="files-grid">
			{#each files as entry, index}
				<div class="file-preview">
					{#if isImage(entry.type)}
						<img src={previewUrls[index]} class="preview-img" alt={entry.name} />
					{:else}
						<div class="file-icon">
							<div class="file-extension">
								{entry.name.split('.').pop()?.toUpperCase() || entry.type}
							</div>
						</div>
					{/if}
					<div class="file-name">{entry.name}</div>
					<div class="file-actions">
						<Button onclick={() => remove(index)}>
							{$t('home.remove')}
						</Button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.pasted-files-preview {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px dashed #ccc;
		border-radius: 4px;
		background-color: #fafafa;
	}

	.pasted-files-preview h4 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.files-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.file-preview {
		position: relative;
		text-align: center;
		width: 150px;
	}

	.preview-img {
		max-width: 150px;
		max-height: 150px;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.file-icon {
		width: 150px;
		height: 150px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		background: #f5f5f5;
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
	}

	.file-extension {
		font-size: 1.2rem;
		font-weight: bold;
		color: #666;
		padding: 0.25rem 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		background: white;
	}

	.file-name {
		font-size: 0.75rem;
		color: #666;
		margin-top: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 150px;
	}

	.file-actions {
		margin-top: 0.5rem;
	}

	@media (max-width: 640px) {
		.pasted-files-preview {
			margin-top: 0.5rem;
			padding: 0.5rem;
		}

		.preview-img, .file-icon {
			max-width: 120px;
			max-height: 120px;
			width: 120px;
			height: 120px;
		}

		.file-preview {
			width: 120px;
		}

		.file-name {
			max-width: 120px;
		}

		.files-grid {
			gap: 0.5rem;
		}
	}
</style>
