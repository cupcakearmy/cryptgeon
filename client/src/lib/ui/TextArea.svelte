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
		min-height: 8rem;
		margin: 0;
		padding: 0;
		border: 2px solid var(--ui-bg-1);
		resize: vertical;
		outline: none;
		padding: 0.5rem;
	}

	textarea:hover,
	textarea:focus {
		border-color: var(--ui-clr-primary);
	}
</style>
