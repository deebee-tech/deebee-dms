<script lang="ts">
	import LocaleSelector from "$lib/components/global/locale-selector.svelte";
	import type { Snippet } from "svelte";
	import ThemeSelector from "../global/theme-selector.svelte";

	const { children }: { children: Snippet } = $props();
</script>

<div class="absolute right-0 z-[100] mt-5 mr-5 flex gap-2">
	<div>
		<LocaleSelector />
	</div>
	<div>
		<ThemeSelector />
	</div>
</div>
<div
	class="deebee-background-gradient m-auto flex h-screen w-11/12 items-center justify-center md:w-2/3 lg:w-1/2 xl:w-1/3"
>
	<div class="flex w-full flex-col">
		{@render children()}
	</div>
</div>
