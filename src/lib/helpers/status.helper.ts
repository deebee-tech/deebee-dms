import { env as privateEnv } from "$env/dynamic/private";
import { env as publicEnv } from "$env/dynamic/public";
import { SUPABASE_AUTH_PROVIDERS_ARRAY } from "$lib/constants";
import type { SystemStatus } from "$lib/models/system-status";
import { m } from "$lib/paraglide/messages";
import IsHelper from "@deebeetech/is-helper";
import * as v from "valibot";

export const statusHelper = () => {
	const validateAuthProviders = (stringToCheck: string | undefined) => {
		const authProviderSchema = v.pipe(
			v.string(m["general.errors.string_required"]()),
			v.nonEmpty(m["general.errors.string_required"]()),
			v.check(
				(c) => {
					const authArray = c.split("|");

					if (IsHelper.isEmptyArray(authArray)) {
						return false;
					}

					const isValid = authArray.every((auth) =>
						SUPABASE_AUTH_PROVIDERS_ARRAY.includes(auth)
					);

					return isValid;
				},
				m["system.errors.auth_provider_entries"](),
			),
		);

		return v.safeParse(authProviderSchema, stringToCheck);
	};

	const validateBooleanString = (stringToCheck: string | undefined) => {
		const booleanStringSchema = v.pipe(
			v.string(m["general.errors.string_required"]()),
			v.nonEmpty(m["general.errors.string_required"]()),
			v.check(
				(c) => {
					return IsHelper.isBoolean(c);
				},
				m["general.errors.boolean_string"](),
			),
		);

		return v.safeParse(booleanStringSchema, stringToCheck);
	};

	const validateEmail = (stringToCheck: string | undefined) => {
		const emailSchema = v.pipe(
			v.string(m["general.errors.string_required"]()),
			v.nonEmpty(m["general.errors.string_required"]()),
			v.rfcEmail(m["general.errors.email_invalid"]()),
		);

		return v.safeParse(emailSchema, stringToCheck);
	};

	const validateNonEmptyString = (stringToCheck: string | undefined) => {
		const nonEmptyStringSchema = v.pipe(
			v.string(m["general.errors.string_required"]()),
			v.nonEmpty(m["general.errors.string_required"]()),
		);

		return v.safeParse(nonEmptyStringSchema, stringToCheck);
	};

	const validateUrl = (supabaseUrl: string | undefined) => {
		const supabaseUrlSchema = v.pipe(
			v.string(m["general.errors.string_required"]()),
			v.nonEmpty(m["general.errors.string_required"]()),
			v.url(m["general.errors.url_invalid"]()),
		);

		return v.safeParse(supabaseUrlSchema, supabaseUrl);
	};

	return {
		getEnvironmentStatus(): SystemStatus[] {
			const statusList: SystemStatus[] = [];

			// PUBLIC_DMS_ROOT_URL
			const dmsRootUrlValidation = validateUrl(
				publicEnv.PUBLIC_DMS_ROOT_URL,
			);

			statusList.push({
				area: m["system.phrases.general_environment_variables"](),
				itemName: "PUBLIC_DMS_ROOT_URL",
				status: dmsRootUrlValidation.success ? "ok" : "error",
				errorMessages: dmsRootUrlValidation.issues?.map((error) =>
					error.message
				) || [],
			});

			// PUBLIC_SUPABASE_AUTH_PROVIDERS
			const supabaseAuthProvidersValidation = validateAuthProviders(
				publicEnv.PUBLIC_SUPABASE_AUTH_PROVIDERS,
			);

			statusList.push({
				area: m["system.phrases.general_environment_variables"](),
				itemName: "PUBLIC_SUPABASE_AUTH_PROVIDERS",
				status: supabaseAuthProvidersValidation.success ? "ok" : "error",
				errorMessages:
					supabaseAuthProvidersValidation.issues?.map((error) =>
						error.message
					) || [],
			});

			// PUBLIC_SUPABASE_PUBLISHABLE_KEY
			const supabasePublishableKeyValidation = validateNonEmptyString(
				publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
			);

			statusList.push({
				area: m["system.phrases.general_environment_variables"](),
				itemName: "PUBLIC_SUPABASE_PUBLISHABLE_KEY",
				status: supabasePublishableKeyValidation.success ? "ok" : "error",
				errorMessages:
					supabasePublishableKeyValidation.issues?.map((error) =>
						error.message
					) || [],
			});

			// PUBLIC_SUPABASE_URL
			const supabaseUrlValidation = validateUrl(
				publicEnv.PUBLIC_SUPABASE_URL,
			);

			statusList.push({
				area: m["system.phrases.general_environment_variables"](),
				itemName: "PUBLIC_SUPABASE_URL",
				status: supabaseUrlValidation.success ? "ok" : "error",
				errorMessages: supabaseUrlValidation.issues?.map((error) =>
					error.message
				) || [],
			});

			// DEEBEE_DMS_ADMIN_EMAIL
			const deebeeAdminEmailValidation = validateEmail(
				privateEnv.DEEBEE_DMS_ADMIN_EMAIL,
			);

			statusList.push({
				area: m["system.phrases.general_environment_variables"](),
				itemName: "DEEBEE_DMS_ADMIN_EMAIL",
				status: deebeeAdminEmailValidation.success ? "ok" : "error",
				errorMessages: deebeeAdminEmailValidation.issues?.map((error) =>
					error.message
				) || [],
			});

			// SUPABASE_SECRET_KEY
			const supabaseSecretKeyValidation = validateNonEmptyString(
				privateEnv.SUPABASE_SECRET_KEY,
			);

			statusList.push({
				area: m["system.phrases.general_environment_variables"](),
				itemName: "SUPABASE_SECRET_KEY",
				status: supabaseSecretKeyValidation.success ? "ok" : "error",
				errorMessages: supabaseSecretKeyValidation.issues?.map((error) =>
					error.message
				) || [],
			});

			// SENTRY
			const sentryDsnExists = !IsHelper
				.isNullOrUndefinedOrEmptyStringOrWhitespace(
					publicEnv.PUBLIC_SENTRY_DSN,
				);

			const sentryEnabledExists = !IsHelper
				.isNullOrUndefinedOrEmptyStringOrWhitespace(
					publicEnv.PUBLIC_SENTRY_ENABLED,
				);

			const sentryEnvironmentExists = !IsHelper
				.isNullOrUndefinedOrEmptyStringOrWhitespace(
					publicEnv.PUBLIC_SENTRY_ENVIRONMENT,
				);

			const sentryOrgExists = !IsHelper
				.isNullOrUndefinedOrEmptyStringOrWhitespace(
					privateEnv.SENTRY_ORG,
				);

			const sentryProjectExists = !IsHelper
				.isNullOrUndefinedOrEmptyStringOrWhitespace(
					privateEnv.SENTRY_PROJECT,
				);

			const sentryDsnValidation = validateUrl(
				publicEnv.PUBLIC_SENTRY_DSN,
			);

			const sentryEnabledValidation = validateBooleanString(
				publicEnv.PUBLIC_SENTRY_ENABLED,
			);

			const sentryEnvironmentValidation = validateNonEmptyString(
				publicEnv.PUBLIC_SENTRY_ENVIRONMENT,
			);

			const sentryOrgValidation = validateNonEmptyString(
				privateEnv.SENTRY_ORG,
			);

			const sentryProjectValidation = validateNonEmptyString(
				privateEnv.SENTRY_PROJECT,
			);

			const sentryIsConfigured = sentryDsnExists &&
				sentryEnabledExists &&
				sentryEnvironmentExists &&
				sentryOrgExists &&
				sentryProjectExists;

			statusList.push({
				area: m["system.phrases.sentry_configuration"](),
				itemName: "PUBLIC_SENTRY_DSN",
				status: !sentryIsConfigured
					? "not-configured"
					: sentryDsnValidation.success
					? "ok"
					: "error",
				errorMessages: !sentryIsConfigured
					? []
					: sentryDsnValidation.issues?.map((error) => error.message) ||
						[],
			});

			statusList.push({
				area: m["system.phrases.sentry_configuration"](),
				itemName: "PUBLIC_SENTRY_ENABLED",
				status: !sentryIsConfigured
					? "not-configured"
					: sentryEnabledValidation.success
					? "ok"
					: "error",
				errorMessages: !sentryIsConfigured
					? []
					: sentryEnabledValidation.issues?.map((error) =>
						error.message
					) || [],
			});

			statusList.push({
				area: m["system.phrases.sentry_configuration"](),
				itemName: "PUBLIC_SENTRY_ENVIRONMENT",
				status: !sentryIsConfigured
					? "not-configured"
					: sentryEnvironmentValidation.success
					? "ok"
					: "error",
				errorMessages: !sentryIsConfigured
					? []
					: sentryEnvironmentValidation.issues?.map((error) =>
						error.message
					) || [],
			});

			statusList.push({
				area: m["system.phrases.sentry_configuration"](),
				itemName: "SENTRY_ORG",
				status: !sentryIsConfigured
					? "not-configured"
					: sentryOrgValidation.success
					? "ok"
					: "error",
				errorMessages: !sentryIsConfigured
					? []
					: sentryOrgValidation.issues?.map((error) => error.message) ||
						[],
			});

			statusList.push({
				area: m["system.phrases.sentry_configuration"](),
				itemName: "SENTRY_PROJECT",
				status: !sentryIsConfigured
					? "not-configured"
					: sentryProjectValidation.success
					? "ok"
					: "error",
				errorMessages: !sentryIsConfigured
					? []
					: sentryProjectValidation.issues?.map((error) =>
						error.message
					) || [],
			});

			return statusList;
		},
	};
};
