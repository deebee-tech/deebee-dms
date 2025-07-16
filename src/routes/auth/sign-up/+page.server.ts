import { env as publicEnv } from "$env/dynamic/public";
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
import { signUpFormSchema } from "./sign-up.schema";

export const load: PageServerLoad = async ({ url, depends }) => {
   depends("paraglide:lang");

   const backTo = url.searchParams.get("backTo");
   const from = url.searchParams.get("from");

   return {
      backTo,
      from: IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(from)
         ? ""
         : from,
      signUpForm: await superValidate(valibot(signUpFormSchema)),
      title: stringHelper().capitalizeEachWord(
         m["auth.phrases.sign_up"](),
      ),
   };
};

export const actions: Actions = {
   signUp: async (
      { request, locals: { supabasePublishable, supabaseSecret } },
   ) => {
      // Validate form
      const form = await superValidate(
         request,
         valibot(signUpFormSchema),
         { id: "sign-up" },
      );

      if (!form.valid) {
         return fail(400, { form });
      }

      // Check if email or phone is already in use
      const [emailUser, phoneUser, identities] = await Promise.all([
         getAuthUserByEmail(
            form.data.email ?? "",
            supabaseSecret,
         ),
         getAuthUserByPhone(
            form.data.phone ?? "",
            supabaseSecret,
         ),
         getAuthUserIdentitiesByEmail(
            form.data.email ?? "",
            supabaseSecret,
         ),
      ]);

      // Email already in use
      if (!IsHelper.isNullOrUndefined(emailUser)) {
         form.message = {
            type: "error",
            body: stringHelper().capitalizeEachWord(
               m["auth.errors.email_in_use"](),
            ),
         };

         return fail(400, { form });
      }

      // E-Mail in use in identities
      const socialIdentities: AuthUserIdentity[] = [];

      socialIdentities.push(
         ...identities.filter(
            (identity) =>
               identity.provider !== "email" &&
               identity.provider !== "phone",
         ) ?? [],
      );

      if (socialIdentities.length > 0) {
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

      // Phone already in use
      if (
         !IsHelper.isNullOrUndefined(phoneUser) &&
         form.data.phoneState === "required"
      ) {
         form.message = {
            type: "error",
            body: stringHelper().capitalizeEachWord(
               m["auth.errors.phone_in_use"](),
            ),
         };

         return fail(400, { form });
      }

      // Attempt sign-up
      const signUpResponse = await supabasePublishable.auth.signUp({
         email: form.data.email,
         password: form.data.password,
         options: {
            emailRedirectTo: `${publicEnv.PUBLIC_DMS_ROOT_URL}/auth/confirm`,
         },
      });

      // If sign-up fails, return error message
      if (signUpResponse.error) {
         console.error(signUpResponse.error);
         form.message = {
            type: "error",
            body: stringHelper().capitalizeEachWord(
               signUpResponse.error.message,
            ),
         };

         return fail(400, { form });
      }

      // Update phone if sign-in successful and phone is provided
      if (!IsHelper.isNullOrUndefined(form.data.phone)) {
         const updateUserResponse = await supabaseSecret.auth.admin
            .updateUserById(
               signUpResponse.data.user?.id ?? "",
               { phone: form.data.phone },
            );

         if (updateUserResponse.error) {
            console.error(updateUserResponse.error);
            form.message = {
               type: "error",
               body: stringHelper().capitalizeEachWord(
                  updateUserResponse.error.message,
               ),
            };

            return fail(400, { form });
         }
      }

      // Redirect to user confirmation screen
      redirect(
         303,
         `/auth/user-confirmation?id=${signUpResponse.data.user?.id}&backTo=${form.data.backTo}`,
      );
   },
};
