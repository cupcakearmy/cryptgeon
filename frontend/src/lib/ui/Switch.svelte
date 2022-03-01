<script lang="ts">
	export let label: string = ''
	export let value: boolean
	export let color = true
</script>

<div {...$$restProps}>
	<label class="switch">
		<small>{label}</small>
		<input type="checkbox" bind:checked={value} />
		<span class:color class="slider" />
	</label>
</div>

<style>
	div {
		height: 3.75rem;
	}

	.switch {
		position: relative;
		display: inline-block;
		width: 4rem;
		height: 2.5rem;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border: 2px solid var(--ui-bg-1);
		background-color: var(--ui-bg-0);
		transition: var(--ui-anim);
		transform: translateY(1.2rem);
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
