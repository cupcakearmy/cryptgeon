<script lang="ts">
	import type { Note } from '$lib/api'
	import { create } from '$lib/api'
	import { getKeyFromString, encrypt, Hex, getRandomBytes } from '$lib/crypto'

	import Button from '$lib/ui/Button.svelte'
	import Switch from '$lib/ui/Switch.svelte'
	import TextArea from '$lib/ui/TextArea.svelte'
	import TextInput from '$lib/ui/TextInput.svelte'

	let note: Note = {
		contents: '',
		views: 1,
		expiration: 60,
	}
	let result: { password: string; id: string } | null = null
	let advanced = false
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

	async function submit() {
		try {
			error = null
			loading = true
			const password = Hex.encode(getRandomBytes(32))
			const key = await getKeyFromString(password)
			const data: Note = {
				contents: await encrypt(note.contents, key),
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
		} catch {
			error = 'could not create note.'
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
		value="{window.location.origin}/note/{result.id}/{result.password}"
		copy
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
	<form on:submit|preventDefault={submit}>
		<fieldset disabled={loading}>
			<TextArea label="note" bind:value={note.contents} placeholder="..." />

			<div class="bottom">
				<Switch label="advanced" bind:value={advanced} />
				<Button type="submit">create</Button>
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

			<div class="advanced" class:hidden={!advanced}>
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

			<style>
				.fields {
					display: flex;
				}
				.spacer {
					width: 3rem;
				}
			</style>
		</fieldset>
	</form>
{/if}

<style>
	.bottom {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-top: 0.5rem;
	}

	.middle-switch {
		margin: 0 1rem;
	}

	.advanced {
		max-height: 14em;
		overflow: hidden;
		transition: var(--ui-anim);
	}

	.advanced.hidden {
		max-height: 0;
	}
</style>
