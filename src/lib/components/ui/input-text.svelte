<script lang="ts" module>
	export type TextInputProps = Omit<BaseInputProps, "type">;
</script>

<script lang="ts">
	import type { BaseInputProps } from "./input-base.svelte";
	import BaseInput from "./input-base.svelte";

	let { value = $bindable(), ...textInput }: TextInputProps = $props();
</script>

<BaseInput bind:value type="text" {...textInput} />
