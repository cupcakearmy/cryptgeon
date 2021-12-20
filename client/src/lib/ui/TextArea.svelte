<script lang="ts">
	export let label: string = ''
	export let value: string
</script>

<label>
	<small>
		{label}
	</small>
	<textarea class="box" {...$$restProps} bind:value />
</label>
