import { env as publicEnv } from "$env/dynamic/public";
import { DEFAULT_REDIRECT_URL } from "$lib/constants";
import { stringHelper } from "$lib/helpers/string.helper";
import type { AuthUserIdentity } from "$lib/models/auth-user-identity";
import { m } from "$lib/paraglide/messages";
import { getAuthUserByEmail } from "$lib/queries/users/get-auth-user-by-email.query";
import { getAuthUserByPhone } from "$lib/queries/users/get-auth-user-by-phone.query";
import { getAuthUserIdentitiesByEmail } from "$lib/queries/users/get-auth-user-identities-by-email.query";
import ArrayHelper from "@deebeetech/array-helper";
import IsHelper from "@deebeetech/is-helper";
import { fail, redirect } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import {
   signInWithOtpFormSchema,
   signInWithPasswordFormSchema,
} from "./sign-in.schema";

export const load: PageServerLoad = async ({ url, depends }) => {
   depends("paraglide:lang");
   const backTo = url.searchParams.get("backTo") ?? DEFAULT_REDIRECT_URL;

   return {
      backTo,
      signInWithOtpForm: await superValidate(
         valibot(signInWithOtpFormSchema),
      ),
      signInWithPasswordForm: await superValidate(
         valibot(signInWithPasswordFormSchema),
      ),
      title: stringHelper().capitalizeEachWord(
         m["auth.phrases.sign_in"](),
      ),
   };
};

export const actions: Actions = {
   signInWithPassword: async (
      { request, locals: { supabasePublishable, supabaseSecret } },
   ) => {
      // Validate the form
      const form = await superValidate(
         request,
         valibot(signInWithPasswordFormSchema),
         { id: "sign-in-with-password" },
      );

      if (!form.valid) {
         return fail(400, { form });
      }

      // Get the user by email and also check if any identities exist for any user with that email
      const [authUser, userIdentities] = await Promise.all([
         getAuthUserByEmail(
            form.data.email ?? "",
            supabaseSecret,
         ),
         getAuthUserIdentitiesByEmail(
            form.data.email ?? "",
            supabaseSecret,
         ),
      ]);

      // Build if the user has password or social identities
      const passwordIdentities: AuthUserIdentity[] = [];
      const socialIdentities: AuthUserIdentity[] = [];

      passwordIdentities.push(
         ...authUser?.identities.filter(
            (identity) =>
               identity.provider === "email" || identity.provider === "phone",
         ) ?? [],
      );

      passwordIdentities.push(
         ...userIdentities.filter(
            (identity) =>
               identity.provider === "email" || identity.provider === "phone",
         ) ?? [],
      );

      socialIdentities.push(
         ...authUser?.identities.filter(
            (identity) =>
               identity.provider !== "email" && identity.provider !== "phone",
         ) ?? [],
      );

      socialIdentities.push(
         ...userIdentities.filter(
            (identity) =>
               identity.provider !== "email" && identity.provider !== "phone",
         ) ?? [],
      );

      // Return an error if the user has no password identities and only social identities --OR--
      // any of the user identity user id's do not match the auth user id
      if (
         (passwordIdentities.length === 0 && socialIdentities.length > 0) ||
         socialIdentities.some(
            (identity) => identity.user_id !== authUser?.id,
         )
      ) {
         const providerList: string[] = [];

         ArrayHelper.orderBy(ArrayHelper.uniqBy(socialIdentities, "provider"), [
            "provider",
         ], ["asc"]).forEach((identity) => {
            providerList.push(
               stringHelper().capitalizeEachWord(identity.provider),
            );
         });

         form.message = {
            type: "error",
            body: `${m["auth.errors.email_wrong_provider"]()} ${
               providerList.join(", ")
            }`,
         };

         return fail(400, { form });
      }

      // If no user is found, return an error message
      // This is done after the social identity check to ensure that
      // we don't return an error if the user has social identities only
      if (IsHelper.isNullOrUndefined(authUser)) {
         form.message = {
            type: "error",
            body: m["auth.errors.email_not_found"](),
         };

         return fail(400, { form });
      }

      // Try signing in to test if the email and password are correct
      const { error } = await supabasePublishable.auth.signInWithPassword({
         email: form.data.email ?? "",
         password: form.data.password ?? "",
      });

      // If there is an error, return an error message
      if (error) {
         // If the error is email not confirmed, redirect to user confirmation
         if (error.code === "email_not_confirmed") {
            redirect(
               303,
               `/auth/user-confirmation?id=${authUser.id}&backTo=${form.data.backTo}`,
            );
         }

         // Otherwise, return the error message
         console.error(error);
         form.message = {
            type: "error",
            body: stringHelper().capitalizeEachWord(error.message),
         };

         return fail(400, { form });
      }

      // If the user has not confirmed their email or phone, redirect to user confirmation
      if (
         authUser.email_confirmed === false ||
         authUser.phone_confirmed === false
      ) {
         redirect(
            303,
            `/auth/user-confirmation?id=${authUser.id}&backTo=${form.data.backTo}`,
         );
      }

      // Full success, redirect to the backTo URL
      redirect(303, form.data.backTo);
   },

   signInWithOtp: async (
      { request, locals: { supabasePublishable, supabaseSecret } },
   ) => {
      // Validate form
      const form = await superValidate(
         request,
         valibot(signInWithOtpFormSchema),
         { id: "sign-in-with-otp" },
      );

      if (!form.valid) {
         return fail(400, { form });
      }

      // E-mail OTP type selected
      if (form.data.otpType === "email") {
         // Get the user by email and also check if any identities exist for any user with that email
         const [authUser, userIdentities] = await Promise.all([
            getAuthUserByEmail(
               form.data.otpText ?? "",
               supabaseSecret,
            ),
            getAuthUserIdentitiesByEmail(
               form.data.otpText ?? "",
               supabaseSecret,
            ),
         ]);

         // Build if the user has password or social identities
         const passwordIdentities: AuthUserIdentity[] = [];
         const socialIdentities: AuthUserIdentity[] = [];

         passwordIdentities.push(
            ...authUser?.identities.filter(
               (identity) =>
                  identity.provider === "email" ||
                  identity.provider === "phone",
            ) ?? [],
         );

         passwordIdentities.push(
            ...userIdentities.filter(
               (identity) =>
                  identity.provider === "email" ||
                  identity.provider === "phone",
            ) ?? [],
         );

         socialIdentities.push(
            ...authUser?.identities.filter(
               (identity) =>
                  identity.provider !== "email" &&
                  identity.provider !== "phone",
            ) ?? [],
         );

         socialIdentities.push(
            ...userIdentities.filter(
               (identity) =>
                  identity.provider !== "email" &&
                  identity.provider !== "phone",
            ) ?? [],
         );

         // Return an error if the user has no password identities and only social identities --OR--
         // any of the user identity user id's do not match the auth user id
         if (
            (passwordIdentities.length === 0 && socialIdentities.length > 0) ||
            socialIdentities.some(
               (identity) => identity.user_id !== authUser?.id,
            )
         ) {
            const providerList: string[] = [];

            ArrayHelper.orderBy(
               ArrayHelper.uniqBy(socialIdentities, "provider"),
               [
                  "provider",
               ],
               ["asc"],
            ).forEach((identity) => {
               providerList.push(
                  stringHelper().capitalizeEachWord(identity.provider),
               );
            });

            form.message = {
               type: "error",
               body: `${m["auth.errors.email_wrong_provider"]()} ${
                  providerList.join(", ")
               }`,
            };

            return fail(400, { form });
         }

         // If no user is found, return an error message
         // This is done after the social identity check to ensure that
         // we don't return an error if the user has social identities only
         if (IsHelper.isNullOrUndefined(authUser)) {
            form.message = {
               type: "error",
               body: m["auth.errors.email_not_found"](),
            };

            return fail(400, { form });
         }

         // Attempt sign-in with OTP
         const emailAuth = await supabasePublishable.auth.signInWithOtp({
            email: form.data.otpText ?? "",
            options: {
               emailRedirectTo:
                  `${publicEnv.PUBLIC_DMS_ROOT_URL}/auth/magic-link`,
            },
         });

         // If there is an error, return an error message
         if (emailAuth.error) {
            // If the error is email not confirmed, redirect to user confirmation
            if (emailAuth.error.code === "email_not_confirmed") {
               redirect(
                  303,
                  `/auth/user-confirmation?id=${authUser.id}&backTo=${form.data.backTo}`,
               );
            }

            // Otherwise, return the error message
            console.error(emailAuth.error);
            form.message = {
               type: "error",
               body: stringHelper().capitalizeEachWord(
                  emailAuth.error.message,
               ),
            };

            return fail(400, { form });
         }

         // Full success, return info message
         form.message = {
            type: "info",
            body: m["auth.phrases.magic_link_sent_email"](),
         };

         return { form };
      }

      // Phone OTP type selected
      if (form.data.otpType === "phone") {
         // Check and see if a user exists with the provided phone number
         const phoneUser = await getAuthUserByPhone(
            form.data.otpText ?? "",
            supabaseSecret,
         );

         // If no user is found, return an error message
         if (IsHelper.isNullOrUndefined(phoneUser)) {
            form.message = {
               type: "error",
               body: m["auth.errors.phone_not_found"](),
            };

            return fail(400, { form });
         }

         // Try signing in to test if the phone number is associated with the user
         const phoneAuth = await supabasePublishable.auth.signInWithOtp({
            phone: form.data.otpText ?? "",
         });

         // If there is an error, return an error message
         if (phoneAuth.error) {
            // If the error is phone not confirmed, redirect to user confirmation
            if (phoneAuth.error.code === "phone_not_confirmed") {
               redirect(
                  303,
                  `/auth/user-confirmation?id=${phoneUser.id}&backTo=${form.data.backTo}`,
               );
            }

            // Otherwise, return the error message
            console.error(phoneAuth.error);
            form.message = {
               type: "error",
               body: stringHelper().capitalizeEachWord(
                  phoneAuth.error.message,
               ),
            };

            return fail(400, { form });
         }

         // Sending OTP to phone, redirect to one-time passcode page
         redirect(
            303,
            `/auth/one-time-passcode?id=${phoneUser.id}&channel=phone&backTo=${form.data.backTo}`,
         );
      }
   },
};
