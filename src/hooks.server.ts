import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import {
	DEFAULT_COOKIE_DOMAIN,
	DEFAULT_LOCALE,
	DEFAULT_THEME_NAME,
	STORE_LOCALE,
	STORE_ORGANIZATION_ID,
	STORE_THEME_NAME,
} from "$lib/constants";
import type { Database } from "$lib/database.types";
import { boxHelper } from "$lib/helpers/box.helper";
import { statusHelper } from "$lib/helpers/status.helper";
import type { SystemStatus } from "$lib/models/system-status";
import { m } from "$lib/paraglide/messages";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { getDualDummy } from "$lib/queries/general/get-dual-dummy.query";
import { getDefaultOrganization } from "$lib/queries/organizations/get-default-organization.query";
import { getOrganizationById } from "$lib/queries/organizations/get-organization-by-id.query";
import { getOrganizationSettings } from "$lib/queries/organizations/get-organization-settings.query";
import { getOrganizationThemes } from "$lib/queries/organizations/get-organization-themes.query";
import IsHelper from "@deebeetech/is-helper";
import * as Sentry from "@sentry/sveltekit";
import { supabaseIntegration } from "@supabase/sentry-js-integration";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { type Handle, isRedirect, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import type { SerializeOptions } from "cookie";

// List of paths that are completely devoid of logic
const fullBypassPaths = [
	"/images",
	"/styles",
	"/robots.txt",
	"/favicon.ico",
];

let cookieDomain = DEFAULT_COOKIE_DOMAIN;
let cookieSecure = true;

export const handle: Handle = sequence(
	Sentry.sentryHandle(),
	({ event, resolve }) =>
		// Handle paraglide
		paraglideMiddleware(
			event.request,
			({ request: localizedRequest, locale }) => {
				// Override localized request
				event.request = localizedRequest;

				// Setup locale
				event.locals.locale = locale;
				event.cookies.set(
					STORE_LOCALE,
					boxHelper().box(DEFAULT_LOCALE),
					getCookieOptions(),
				);

				return resolve(event);
			},
		),
	// Main middleware
	async ({ event, resolve }) => {
		// Check the root and redirect to app space
		if (event.url.pathname === "/") {
			redirect(307, "/app");
		}

		// Check the root system and redirect to status
		if (event.url.pathname === "/system") {
			redirect(307, "/system/status");
		}

		// Drop out if you're on a full bypass path
		if (
			fullBypassPaths.some((path) => event.url.pathname.startsWith(path))
		) {
			return resolve(event);
		}

		// Get cookie opts
		cookieDomain = event.url.hostname;
		event.locals.cookieDomain = cookieDomain;
		cookieSecure = event.url.protocol.includes("https");
		event.locals.cookieSecure = cookieSecure;

		// Setup theme variables
		event.locals.themeName =
			boxHelper().unbox<string>(event.cookies.get(STORE_THEME_NAME))
				.value;

		if (
			IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(
				event.locals.themeName,
			)
		) {
			event.locals.themeName = DEFAULT_THEME_NAME;
			event.cookies.set(
				STORE_THEME_NAME,
				boxHelper().box(DEFAULT_THEME_NAME),
				getCookieOptions(),
			);
		}

		// Check environment variables
		const systemStatus: SystemStatus[] = [];
		systemStatus.push(...statusHelper().getEnvironmentStatus());

		// Setup Supabase
		try {
			event.locals.supabasePublishable = createServerClient(
				publicEnv.PUBLIC_SUPABASE_URL ?? "",
				publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
				{
					cookies: {
						getAll: () => event.cookies.getAll(),
						setAll: (cookiesToSet) => {
							cookiesToSet.forEach(({ name, value, options }) => {
								event.cookies.set(name, value, {
									...options,
									path: "/",
								});
							});
						},
					},
					db: { schema: "deebee_dms" },
				},
			);

			event.locals.supabaseSecret = createClient(
				publicEnv.PUBLIC_SUPABASE_URL ?? "",
				privateEnv.SUPABASE_SECRET_KEY ?? "",
				{
					db: { schema: "deebee_dms" },
				},
			);

			// Initialize Sentry if enabled
			if (
				!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(
					publicEnv.PUBLIC_SENTRY_DSN,
				) &&
				publicEnv.PUBLIC_SENTRY_ENABLED === "true" &&
				!Sentry.isInitialized()
			) {
				Sentry.init({
					dsn: publicEnv.PUBLIC_SENTRY_DSN,
					tracesSampleRate: 1,
					environment: publicEnv.PUBLIC_SENTRY_ENVIRONMENT ??
						"development",
					integrations: [
						supabaseIntegration(
							event.locals.supabaseSecret,
							Sentry,
							{
								tracing: true,
								breadcrumbs: true,
								errors: true,
							},
						),
						Sentry.nativeNodeFetchIntegration({
							breadcrumbs: true,
							ignoreOutgoingRequests: (url) => {
								return url.startsWith(
									`${publicEnv.PUBLIC_SUPABASE_URL}/rest`,
								);
							},
						}),
					],
				});
			}

			event.locals.safeGetSession = async () => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				/**@ts-expect-error */
				event.locals.supabasePublishable.auth.suppressGetSessionWarning =
					true;

				const {
					data: { session },
				} = await event.locals.supabasePublishable.auth.getSession();

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				/**@ts-expect-error */
				event.locals.supabasePublishable.auth.suppressGetSessionWarning =
					false;

				if (!session) {
					return { session: null, user: null };
				}

				const {
					data: { user },
					error,
				} = await event.locals.supabasePublishable.auth.getUser();

				if (error) {
					// JWT validation has failed
					return { session: null, user: null };
				}

				return { session, user };
			};

			const { session, user } = await event.locals.safeGetSession();
			event.locals.session = session;
			event.locals.user = user;

			// Drop out if you're on the auth path
			if (event.url.pathname.startsWith("/auth")) {
				return resolve(event);
			}

			// Run a database connection test
			const dbTest = await getDualDummy(
				event.locals.supabaseSecret,
			);

			if (IsHelper.isNullOrUndefined(dbTest) || dbTest !== "X") {
				throw new Error(
					m["system.errors.supabase_connect"](),
				);
			}

			systemStatus.push({
				area: m["system.phrases.database_connections"](),
				itemName: m["system.phrases.dms_database"](),
				status: "ok",
				errorMessages: [],
			});
		} catch (error) {
			if (isRedirect(error)) throw error;
			systemStatus.push({
				area: m["system.phrases.database_connections"](),
				itemName: m["system.phrases.dms_database"](),
				status: "error",
				errorMessages: [(error as Error).message],
			});
		}

		event.locals.systemStatus = systemStatus;

		// Redirect to status if there is an environment or connection problem
		if (systemStatus.some((status) => status.status === "error")) {
			if (event.url.pathname !== "/system/status") {
				redirect(303, "/system/status");
			}

			return resolve(event);
		}

		// Drop out if you're already on the system route
		if (event.url.pathname.startsWith("/system")) {
			return resolve(event);
		}

		// Test if user is confirmed
		if (
			!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(
				event.locals.user?.id,
			) && (
				(event.locals.user?.identities?.some((i) =>
					i.provider === "email"
				) &&
					IsHelper.isNullOrUndefined(
						event.locals.user.email_confirmed_at,
					)) ||
				(event.locals.user?.identities?.some((i) =>
					i.provider === "phone" &&
					IsHelper.isNullOrUndefined(
						event.locals.user?.phone_confirmed_at,
					)
				))
			)
		) {
			redirect(
				303,
				`/auth/user-confirmation?id=${event.locals.user.id}`,
			);
		}

		// Get active organization
		const orgId = boxHelper().unbox<number | undefined>(
			event.cookies.get(STORE_ORGANIZATION_ID),
		).value;

		let org:
			| Database["deebee_dms"]["Tables"]["organizations"]["Row"]
			| undefined = undefined;

		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(orgId)) {
			const defaultOrg = await getDefaultOrganization(
				event.locals.supabaseSecret,
			);

			if (!IsHelper.isNullOrUndefined(defaultOrg)) {
				org = defaultOrg;
			}
		} else {
			const orgById = await getOrganizationById(
				orgId,
				event.locals.supabaseSecret,
			);

			if (!IsHelper.isNullOrUndefined(orgById)) {
				org = orgById;
			}
		}

		if (!IsHelper.isNullOrUndefined(org)) {
			// Set active organization
			event.locals.organization = org;
			event.cookies.set(
				STORE_ORGANIZATION_ID,
				boxHelper().box(org?.id),
				getCookieOptions(),
			);

			// Get active organization settings
			const orgSettings = await getOrganizationSettings(
				org.id,
				event.locals.supabaseSecret,
			);

			event.locals.organizationSettings = orgSettings ?? [];

			// Get active organization themes
			const orgThemes = await getOrganizationThemes(
				org.id,
				event.locals.supabaseSecret,
			);

			event.locals.organizationThemes = orgThemes ?? [];
		}

		// Final
		return resolve(event);
	},
	async ({ event, resolve }) => {
		if (
			IsHelper.isNullOrUndefined(event.locals.user) &&
			!fullBypassPaths.some((path) => event.url.pathname.startsWith(path)) &&
			!event.url.pathname.startsWith("/auth") &&
			!event.url.pathname.startsWith("/system")
		) {
			redirect(
				303,
				`/auth/sign-in?backTo=${event.url.pathname}${event.url.search}`,
			);
		}

		return resolve(event, {
			filterSerializedResponseHeaders(name) {
				return name === "content-range" ||
					name === "x-supabase-api-version";
			},
			transformPageChunk({ html }) {
				return html.replace(
					/<html lang="%paraglide.lang%">/,
					`<html lang="${event.locals.locale}" data-theme="${
						event.locals.themeName ?? DEFAULT_THEME_NAME
					}">`,
				);
			},
		});
	},
);

const getCookieOptions = (): SerializeOptions & { path: string } => {
	return {
		path: "/",
		httpOnly: false,
		sameSite: "lax",
		secure: cookieSecure,
		domain: cookieDomain,
	};
};
export const handleError = Sentry.handleErrorWithSentry();
