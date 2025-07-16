<script lang="ts">
	import { LOCALE_LIST } from "$lib/constants";
	import type { AvailableLocales } from "$lib/models/available-locales";
	import { m } from "$lib/paraglide/messages";
	import { setLocale } from "$lib/paraglide/runtime";
	import { globalStore } from "$lib/stores/global.svelte";
	import Check from "@lucide/svelte/icons/check";
	import IsHelper from "@deebeetech/is-helper";

	const onSelectLocale = (key: AvailableLocales) => {
		globalStore.locale = key;
		setLocale(key);

		const popover = document.getElementById("popover-locale-selector");

		if (IsHelper.isNullOrUndefined(popover)) {
			return;
		}

		popover.hidePopover();
	};
</script>

<button
	class="bg-base-200 hover:bg-neutral btn btn-soft"
	popovertarget="popover-locale-selector"
	style="anchor-name:--anchor-locale-selector"
	aria-label={m["general.phrases.select_locale"]().toLocaleLowerCase()}
>
	<div><span class={`fi fi-${LOCALE_LIST.filter((l) => l.key === globalStore.locale)[0].flag}`}></span></div>
</button>
<div
	class="bg-base-200 shadow-sm border border-base-content/10 rounded-lg w-60 dropdown dropdown-end menu"
	popover
	id="popover-locale-selector"
	style="position-anchor:--anchor-locale-selector"
>
	<div class="mt-2 mb-2 w-full divider">
		{m["general.phrases.select_locale"]()}
	</div>
	<ul class="mb-2">
		{#each LOCALE_LIST as locale (locale.key)}
			<li class="flex flex-row justify-center items-center">
				<button class="w-full text-xs" onclick={() => onSelectLocale(locale.key)} aria-label={locale.name}>
					<div class="flex flex-row justify-center items-center bg-base-300 shadow-sm p-1.5 rounded-lg">
						<div><span class={`fi fi-${locale.flag}`}></span></div>
					</div>
					<div>{locale.name}</div>
					<div class="ml-auto">
						{#if globalStore.locale === locale.key}<Check size={20} strokeWidth={1} />{/if}
					</div>
				</button>
			</li>
		{/each}
	</ul>
</div>
