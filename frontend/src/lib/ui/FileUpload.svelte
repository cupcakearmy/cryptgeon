<script lang="ts">
	import type { FileDTO } from '$lib/api'
	import { Files } from '$lib/files'
	import { createEventDispatcher } from 'svelte'
	import { t } from 'svelte-intl-precompile'
	import MaxSize from './MaxSize.svelte'

	export let label: string = ''
	let files: File[] = []

	const dispatch = createEventDispatcher<{ file: string }>()

	async function onInput(e: Event) {
		const input = e.target as HTMLInputElement
		if (input.files.length) {
			files = Array.from(input.files)
			const data: FileDTO[] = await Promise.all(
				files.map(async (file) => ({
					name: file.name,
					type: file.type,
					size: file.size,
					contents: await Files.toString(file),
				}))
			)
			console.debug(
				'files',
				data.map((d) => d.contents.length)
			)
			dispatch('file', JSON.stringify(data))
		} else {
			dispatch('file', '')
		}
	}
</script>

<label>
	<small>
		{label}
	</small>
	<input type="file" on:change={onInput} multiple />
	<div class="box">
		{#if files.length}
			<div>
				<b>{$t('file_upload.selected_files')}</b>
				{#each files as file}
					<div class="file">
						{file.name}
					</div>
				{/each}
			</div>
		{:else}
			<div>
				<b>{$t('file_upload.no_files_selected')}</b>
				<br />
				<small>{$t('common.max')}: <MaxSize /></small>
			</div>
		{/if}
	</div>
</label>

<style>
	input {
		display: none;
	}

	.box {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}
</style>
