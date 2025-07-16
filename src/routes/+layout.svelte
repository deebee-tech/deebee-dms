<script lang="ts">
	import { page } from "$app/state";
	import GlobalStoreCookieProvider from "$lib/components/providers/global-store-cookie-provider.svelte";
	import ThemeProvider from "$lib/components/providers/theme-provider.svelte";
	import { globalStore } from "$lib/stores/global.svelte";
	import { type Snippet } from "svelte";
	import type { LayoutData } from "./$types";

	import ToastProvider from "$lib/components/providers/toast-provider.svelte";
	import "../app.css";

	const { data, children }: { data: LayoutData; children: Snippet } = $props();

	globalStore.organization = data.organization;
	globalStore.locale = data.locale;
	globalStore.themeName = data.themeName;
</script>

<svelte:head>
	<title>DeeBee DMS {page.data.title}</title>
</svelte:head>

<ToastProvider />

<GlobalStoreCookieProvider cookieDomain={data.cookieDomain} cookieSecure={data.cookieSecure}>
	<ThemeProvider organizationThemes={data.organizationThemes}>
		<div class="deebee-background-gradient min-h-screen">
			{@render children()}
		</div>
	</ThemeProvider>
</GlobalStoreCookieProvider>
