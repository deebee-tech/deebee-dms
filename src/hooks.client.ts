import { env as publicEnv } from "$env/dynamic/public";
import IsHelper from "@deebeetech/is-helper";
import * as Sentry from "@sentry/sveltekit";
import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit";
import { supabaseIntegration } from "@supabase/sentry-js-integration";
import { createBrowserClient } from "@supabase/ssr";

if (
	!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(
		publicEnv.PUBLIC_SENTRY_DSN,
	) &&
	publicEnv.PUBLIC_SENTRY_ENABLED === "true" && !Sentry.isInitialized()
) {
	const supabaseSentryBrowserClient = createBrowserClient(
		publicEnv.PUBLIC_SUPABASE_URL ?? "",
		publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
		{
			db: {
				schema: "deebee_dms",
			},
			global: {
				fetch,
			},
		},
	);

	Sentry.init({
		dsn: publicEnv.PUBLIC_SENTRY_DSN,

		tracesSampleRate: 1.0,

		// This sets the sample rate to be 10%. You may want this to be 100% while
		// in development and sample at a lower rate in production
		replaysSessionSampleRate: 0.1,

		// If the entire session is not sampled, use the below sample rate to sample
		// sessions when an error occurs.
		replaysOnErrorSampleRate: 1.0,

		// If you don't want to use Session Replay, just remove the line below:
		integrations: [
			replayIntegration(),

			supabaseIntegration(supabaseSentryBrowserClient, Sentry, {
				tracing: true,
				breadcrumbs: true,
				errors: true,
			}),
			Sentry.browserTracingIntegration({
				shouldCreateSpanForRequest: (url) => {
					return !url.startsWith(
						`${publicEnv.PUBLIC_SUPABASE_URL}/rest`,
					);
				},
			}),
		],

		environment: publicEnv.PUBLIC_SENTRY_ENVIRONMENT ?? "development",
	});
}

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
