<script lang="ts">
	import { DEFAULT_THEME_NAME } from "$lib/constants";
	import type { Database } from "$lib/database.types";
	import { globalStore } from "$lib/stores/global.svelte";
	import IsHelper from "@deebeetech/is-helper";
	import { type Snippet } from "svelte";

	const {
		organizationThemes,
		children,
	}: {
		organizationThemes: Database["deebee_dms"]["Tables"]["organization_themes"]["Row"][] | undefined;
		children: Snippet;
	} = $props();

	let defaultFavicon = `/images/deebee-favicon.png`;

	// Watch the theme name and set the html attributes
	$effect(() => {
		document.documentElement.setAttribute("data-theme", globalStore.themeName ?? DEFAULT_THEME_NAME);
	});

	// Watch dark mode and the active organization and set the favicon
	$effect(() => {
		const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;

		// Handle bad favicon
		if (IsHelper.isNullOrUndefined(favicon)) {
			return;
		}

		if (!globalStore.organizationHasCustomFavicon) {
			favicon.href = defaultFavicon;
		} else {
			favicon.href = `${globalStore.organization?.favicon_url ?? defaultFavicon}`;
		}
	});
</script>

<svelte:head>
	{#if !IsHelper.isNullOrUndefined(organizationThemes)}
		{#each organizationThemes as theme (theme.id)}
			{@html `<` + `style` + ` id="deebee-dms-theme-stylesheet-${theme.theme_name}"` + ` type="stylesheet"` + `>`}
			{@html theme.css_text}
			{@html `</` + `style` + `>`}
		{/each}
	{/if}

	{#if globalStore.organizationHasCustomFavicon}
		<link rel="icon" type="image/png" href={globalStore.organization?.favicon_url ?? defaultFavicon} />
	{:else}
		<link rel="icon" type="image/png" href={defaultFavicon} />
	{/if}
</svelte:head>

{@render children()}
