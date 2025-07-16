<script lang="ts">
	import { STORE_LOCALE, STORE_ORGANIZATION_ID, STORE_THEME_NAME } from "$lib/constants";
	import { boxHelper } from "$lib/helpers/box.helper";
	import { globalStore } from "$lib/stores/global.svelte";
	import IsHelper from "@deebeetech/is-helper";
	import JSCookie from "js-cookie";
	import type { Snippet } from "svelte";

	const {
		cookieDomain,
		cookieSecure,
		children,
	}: { cookieDomain: string | undefined; cookieSecure: boolean | undefined; children: Snippet } = $props();

	const getCookieOptions = (): Cookies.CookieAttributes => {
		return {
			path: "/",
			httpOnly: false,
			sameSite: "lax",
			secure: cookieSecure ?? true,
			domain: cookieDomain ?? "",
		};
	};

	/* Cookie Effects */
	$effect(() => {
		if (IsHelper.isNullOrUndefined(globalStore.locale)) {
			JSCookie.remove(STORE_LOCALE, getCookieOptions());
			return;
		}

		JSCookie.set(STORE_LOCALE, boxHelper().box(globalStore.locale), getCookieOptions());
	});

	$effect(() => {
		if (IsHelper.isNullOrUndefined(globalStore.themeName)) {
			JSCookie.remove(STORE_THEME_NAME, getCookieOptions());
			return;
		}

		JSCookie.set(STORE_THEME_NAME, boxHelper().box(globalStore.themeName), getCookieOptions());
	});

	$effect(() => {
		if (IsHelper.isNullOrUndefined(globalStore.organization)) {
			JSCookie.remove(STORE_ORGANIZATION_ID, getCookieOptions());
			return;
		}

		JSCookie.set(STORE_ORGANIZATION_ID, boxHelper().box(globalStore.organization.id), getCookieOptions());
	});
</script>

{@render children()}
