<script lang="ts">
	interface Props {
		label?: string
		value: string
		[key: string]: any
	}

	let { label = '', value = $bindable(), ...rest }: Props = $props()
</script>

<label>
	<small>
		{label}
	</small>
	<textarea class="box" {...rest} bind:value></textarea>
</label>
