<script lang="ts">
	export let label: string = ''
	export let value: string
</script>

<label>
	<small>
		{label}
	</small>
	<textarea {...$$restProps} bind:value />
</label>

<style>
	textarea {
		width: 100%;
		min-height: calc(100vh - 30rem);
		margin: 0;
		border: 2px solid var(--ui-bg-1);
		resize: vertical;
		outline: none;
		padding: 0.5rem;
	}

	@media screen and (max-width: 30rem) {
		textarea {
			min-height: calc(100vh - 25rem);
		}
	}

	textarea:hover,
	textarea:focus {
		border-color: var(--ui-clr-primary);
	}
</style>
