<script lang="ts">
	import { create, Note, PayloadToLargeError } from '$lib/api'
	import { encrypt, getKeyFromString, getRandomBytes, Hex } from '$lib/crypto'
	import Button from '$lib/ui/Button.svelte'
	import FileUpload from '$lib/ui/FileUpload.svelte'
	import MaxSize from '$lib/ui/MaxSize.svelte'
	import Switch from '$lib/ui/Switch.svelte'
	import TextArea from '$lib/ui/TextArea.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'
	import { blur } from 'svelte/transition'

	let note: Note = {
		contents: '',
		meta: { type: 'text' },
		views: 1,
		expiration: 60,
	}
	let result: { password: string; id: string } | null = null
	let advanced = false
	let file = false
	let type = false
	let message = ''
	let loading = false
	let error: string | null = null

	$: if (!advanced) {
		note.views = 1
		type = false
	}

	$: {
		let fraction: string
		fraction = type ? `${note.expiration} minutes` : `${note.views} views`
		message = 'the note will expire and be destroyed after ' + fraction
	}

	$: note.meta.type = file ? 'file' : 'text'

	$: if (!file) {
		note.contents = ''
	}

	async function submit() {
		try {
			error = null
			loading = true
			const password = Hex.encode(getRandomBytes(32))
			const key = await getKeyFromString(password)
			const data: Note = {
				contents: await encrypt(note.contents, key),
				meta: note.meta,
			}
			// @ts-ignore
			if (type) data.expiration = parseInt(note.expiration)
			// @ts-ignore
			else data.views = parseInt(note.views)

			const response = await create(data)
			result = {
				password: password,
				id: response.id,
			}
		} catch (e) {
			if (e instanceof PayloadToLargeError) {
				error = 'could not create not. note is to big'
			} else {
				error = 'could not create note. please try again.'
			}
		} finally {
			loading = false
		}
	}

	function reset() {
		window.location.reload()
	}
</script>

{#if result}
	<TextInput
		type="text"
		readonly
		label="share link"
		value="{window.location.origin}/note/{result.id}#{result.password}"
		copy
		data-testid="note-share-link"
	/>
	<br />
	<p>
		<b>availability:</b>
		<br />
		the note is not guaranteed to be stored as everything is kept in ram, if it fills up the oldest notes
		will be removed.
		<br />
		(you probably will be fine, just be warned.)
	</p>
	<br />
	<Button on:click={reset}>new note</Button>
{:else}
	<p>
		Easily send <i>fully encrypted</i>, secure notes or files with one click. Just create a note and
		share the link.
	</p>
	<form on:submit|preventDefault={submit}>
		<fieldset disabled={loading}>
			{#if file}
				<FileUpload label="file" on:file={(f) => (note.contents = f.detail)} />
			{:else}
				<TextArea
					label="note"
					bind:value={note.contents}
					placeholder="..."
					data-testid="input-note"
				/>
			{/if}

			<div class="bottom">
				<Switch class="file" label="file" bind:value={file} />
				<Switch label="advanced" bind:value={advanced} />
				<div class="grow" />
				<div class="tr">
					<small>max: <MaxSize /> </small>
					<br />
					<Button type="submit" data-testid="button-create">create</Button>
				</div>
			</div>

			{#if error}
				<div class="error-text">{error}</div>
			{/if}

			<p>
				<br />
				{#if loading}
					loading...
				{:else}
					{message}
				{/if}
			</p>

			{#if advanced}
				<div transition:blur={{ duration: 250 }}>
					<br />
					<div class="fields">
						<TextInput
							type="number"
							label="views"
							bind:value={note.views}
							disabled={type}
							max={100}
						/>
						<div class="middle-switch">
							<Switch label="mode" bind:value={type} color={false} />
						</div>
						<TextInput
							type="number"
							label="minutes"
							bind:value={note.expiration}
							disabled={!type}
							max={360}
						/>
					</div>
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

	.middle-switch {
		margin: 0 1rem;
	}

	.error-text {
		margin-top: 0.5rem;
	}

	.fields {
		display: flex;
	}
</style>
