<button {...$$restProps} on:click><slot /></button>

<style>
	button {
		width: auto;
		display: inline-block;
		padding: 0.25rem 2.5rem;
		border: 2px solid var(--ui-bg-2);
		background: var(--ui-bg-1);
		outline: none;
		cursor: pointer;
		height: 2.5rem;
	}

	button:hover {
		border-color: var(--ui-clr-primary);
	}
</style>
