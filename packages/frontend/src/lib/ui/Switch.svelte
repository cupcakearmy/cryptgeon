<script lang="ts">
	export let label: string = ''
	export let value: boolean
	export let color = true
</script>

<label {...$$restProps}>
	<small>{label}</small>
	<input type="checkbox" bind:checked={value} />
	<span class:color class="slider" />
</label>

<style>
	label {
		position: relative;
		display: inline-block;
	}

	label input {
		display: none;
	}

	small {
		display: block;
		width: max-content;
	}

	.slider {
		display: block;
		width: 4rem;
		height: 2.5rem;
		position: relative;
		cursor: pointer;
		border: 2px solid var(--ui-bg-1);
		background-color: var(--ui-bg-0);
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 2rem;
		width: 1.25rem;
		left: 0.125rem;
		bottom: 0.125rem;
		background-color: var(--ui-bg-1);
		-webkit-transition: 0.4s;
		transition: var(--ui-anim);
	}

	input:checked + .slider.color:before {
		background-color: var(--ui-clr-primary);
	}

	input:checked + .slider:before {
		transform: translateX(calc(2.25rem - 1px));
	}
</style>
