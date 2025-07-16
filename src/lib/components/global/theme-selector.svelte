<script lang="ts">
	import { THEME_LIST } from "$lib/constants";
	import { m } from "$lib/paraglide/messages";
	import { globalStore } from "$lib/stores/global.svelte";
	import Check from "@lucide/svelte/icons/check";
	import Palette from "@lucide/svelte/icons/palette";

	const onSelectTheme = (key: string) => {
		globalStore.themeName = key;
	};
</script>

<button
	class="bg-base-200 hover:bg-neutral btn btn-soft"
	popovertarget="popover-theme-selector"
	style="anchor-name:--anchor-theme-selector"
	aria-label={m["general.phrases.select_theme"]().toLocaleLowerCase()}
>
	<Palette size={20} strokeWidth={1} />
</button>
<div
	class="bg-base-200 border-base-content/10 dropdown dropdown-end menu w-60 rounded-lg border shadow-sm"
	popover
	id="popover-theme-selector"
	style="position-anchor:--anchor-theme-selector"
>
	<div class="divider mt-2 mb-2 w-full">
		{m["general.phrases.select_theme"]()}
	</div>
	<ul class="mb-2">
		{#each THEME_LIST as theme (theme.key)}
			<li class="flex flex-row items-center justify-center">
				<button class="w-full text-xs" onclick={() => onSelectTheme(theme.key)} aria-label={theme.name}>
					<div
						data-theme={theme.key}
						class="bg-base-300 flex flex-row items-center justify-center rounded-lg p-1.5 shadow-sm"
					>
						<div class="mr-1">
							<div class="bg-base-content mb-1.5 size-2 rounded-full"></div>
							<div class="bg-secondary size-2 rounded-full"></div>
						</div>
						<div class="flex-row">
							<div class="bg-primary mb-1.5 size-2 rounded-full"></div>
							<div class="bg-accent size-2 rounded-full"></div>
						</div>
					</div>
					<div>{theme.name}</div>
					<div>
						{#if globalStore.themeName === theme.key}<Check size={20} strokeWidth={1} />{/if}
					</div>
				</button>
			</li>
		{/each}
	</ul>
</div>
