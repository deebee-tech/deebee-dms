import {
	CUSTOM_THEME_NAME_PREFIX,
	DEFAULT_LOCALE,
	DEFAULT_THEME_NAME,
} from "$lib/constants";
import type { Database } from "$lib/database.types";
import type { AvailableLocales } from "$lib/models/available-locales";
import IsHelper from "@deebeetech/is-helper";

const createGlobalStore = () => {
	/* State */
	let localeState = $state<AvailableLocales>(DEFAULT_LOCALE);
	let organizationState = $state<
		Database["deebee_dms"]["Tables"]["organizations"]["Row"] | undefined
	>(undefined);
	let themeNameState = $state<string | undefined>(DEFAULT_THEME_NAME);

	/* Derived */
	const organizationHasCustomFavicon = $derived(() => {
		return (
			!IsHelper.isNullOrUndefined(organizationState) &&
			!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(
				organizationState.favicon_url,
			)
		);
	});

	const organizationHasCustomLogo = $derived(() => {
		return (
			!IsHelper.isNullOrUndefined(organizationState) &&
			!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(
				organizationState.logo_url,
			)
		);
	});

	const usingCustomTheme = $derived(() => {
		return themeNameState?.startsWith(CUSTOM_THEME_NAME_PREFIX);
	});

	const themeIsDarkMode = $derived(() => {
		return themeNameState?.endsWith("dark") ?? true;
	});

	return {
		get locale() {
			return localeState;
		},
		set locale(value: AvailableLocales) {
			localeState = value;
		},
		get organization() {
			return organizationState;
		},
		set organization(
			value:
				| Database["deebee_dms"]["Tables"]["organizations"]["Row"]
				| undefined,
		) {
			organizationState = value;
		},
		get organizationHasCustomFavicon() {
			return organizationHasCustomFavicon();
		},
		get organizationHasCustomLogo() {
			return organizationHasCustomLogo();
		},
		get themeIsDarkMode() {
			return themeIsDarkMode();
		},
		get themeName() {
			return themeNameState;
		},
		set themeName(value: string | undefined) {
			themeNameState = value;
		},
		get usingCustomTheme() {
			return usingCustomTheme();
		},
	};
};

export const globalStore = createGlobalStore();
