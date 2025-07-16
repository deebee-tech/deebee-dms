<script lang="ts" module>
	export type PageSectionProps = {
		children: Snippet;
		title?: string;
		containerClass?: string;
	};
</script>

<script lang="ts">
	import { twclsx } from "$lib/helpers/style.helper";
	import IsHelper from "@deebeetech/is-helper";
	import type { Snippet } from "svelte";

	let { children, title, containerClass }: PageSectionProps = $props();
</script>

<div class={twclsx("border-neutral-content/10 bg-base-300/90 w-full rounded-2xl border", containerClass)}>
	{#if !IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(title)}
		<div class="border-neutral-content/10 mb-2 border-b pt-2 pb-2 text-center">
			<h2 class="text-neutral-content/70 mt-1 mb-1 text-sm font-semibold">{title}</h2>
		</div>
	{/if}
	<div class="p-4 pt-2">
		{@render children()}
	</div>
</div>
