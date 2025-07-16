<script lang="ts" module>
	import { type Snippet } from "svelte";
	import type { Action } from "svelte/action";
	import type { HTMLFormAttributes } from "svelte/elements";

	export type FormProps = HTMLFormAttributes & {
		children: Snippet;
		superformEnhance?: Action<HTMLFormElement> | undefined;
	};
</script>

<script lang="ts">
	import { twclsx } from "$lib/helpers/style.helper";
	import IsHelper from "@deebeetech/is-helper";

	let { class: className, children, superformEnhance, ...formProps }: FormProps = $props();
</script>

{#if IsHelper.isNullOrUndefined(superformEnhance)}
	<form {...formProps} class={twclsx("grid", className)}>
		{#if !IsHelper.isNullOrUndefined(children)}
			{@render children()}
		{/if}
	</form>
{:else}
	<form {...formProps} class={twclsx("grid", className)} use:superformEnhance>
		{#if !IsHelper.isNullOrUndefined(children)}
			{@render children()}
		{/if}
	</form>
{/if}
