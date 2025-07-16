import type { AvailableLocales } from "$lib/models/available-locales";
import type { Locale } from "$lib/models/locale";
import type { PhoneFormat } from "$lib/models/phone-format";
import { m } from "$lib/paraglide/messages";

export const CUSTOM_THEME_NAME_PREFIX = "custom-";
export const DEFAULT_COOKIE_DOMAIN = "";
export const DEFAULT_LOCALE: AvailableLocales = "en";
export const DEFAULT_REDIRECT_URL = "/app";
export const DEFAULT_THEME_NAME = "dms_default_dark";
export const LOCALE_LIST: Locale[] = [
	{ key: "en", name: "English", flag: "us" },
	{ key: "es", name: "Spanish", flag: "es" },
	{ key: "zh", name: "Chinese", flag: "cn" },
];
export const PHONE_FORMATS: PhoneFormat[] = [
	{
		countryCode: "US",
		callingPrefix: "1",
		countryName: m["country_names.us"](),
		flag: "us",
		inputPlaceholder: "(999)999-9999",
		maskOptions: {
			mask: "(###)###-####",
			eager: true,
			number: { locale: "en" },
		},
	},
	{
		countryCode: "GB",
		callingPrefix: "44",
		countryName: m["country_names.gb"](),
		flag: "gb",
		inputPlaceholder: "9999 9999999",
		maskOptions: {
			mask: "#### #######",
			eager: true,
			number: { locale: "en" },
		},
	},
];
export const STORE_LOCALE = "deebee_dms_locale";
export const STORE_ORGANIZATION_ID = "deebee_dms_organization_id";
export const STORE_THEME_NAME = "deebee_dms_theme_name";
export const SUPABASE_AUTH_PROVIDERS = [
	"email",
	"phone",
	"saml",
	"apple",
	"azure",
	"bitbucket",
	"discord",
	"facebook",
	"figma",
	"github",
	"gitlab",
	"google",
	"kakao",
	"keycloak",
	"linkedin",
	"notion",
	"twitch",
	"twitter",
	"slack",
	"spotify",
	"workos",
	"zoom",
] as const;
export const SUPABASE_AUTH_PROVIDERS_ARRAY: string[] = Array.from(
	SUPABASE_AUTH_PROVIDERS,
);
export const THEME_LIST: { key: string; name: string }[] = [
	{ key: "dms_default_dark", name: "DMS Default Dark" },
	{ key: "dms_default_light", name: "DMS Default Light" },
];
