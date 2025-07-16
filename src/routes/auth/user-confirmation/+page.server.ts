import { env as publicEnv } from "$env/dynamic/public";
import { DEFAULT_REDIRECT_URL } from "$lib/constants";
import { stringHelper } from "$lib/helpers/string.helper";
import { m } from "$lib/paraglide/messages";
import { getAuthUserById } from "$lib/queries/users/get-auth-user-by-id.query";
import ArrayHelper from "@deebeetech/array-helper";
import IsHelper from "@deebeetech/is-helper";
import { error, redirect } from "@sveltejs/kit";
import { fail, superValidate } from "sveltekit-superforms";
import { valibot } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "./$types";
import { userConfirmationFormSchema } from "./user-confirmation.schema";

export const load: PageServerLoad = async (
   { locals, url, depends, parent },
) => {
   depends("paraglide:lang");

   const backTo = url.searchParams.get("backTo") ?? DEFAULT_REDIRECT_URL;
   const queryUserId = url.searchParams.get("id");
   const localsUserId = locals.user?.id;
   const layoutData = await parent();

   if (
      IsHelper.isNullOrUndefined(queryUserId) &&
      IsHelper.isNullOrUndefined(localsUserId)
   ) {
      redirect(303, `/auth/sign-in?backTo=${backTo}`);
   }

   if (
      !IsHelper.isNullOrUndefined(queryUserId) &&
      !IsHelper.isNullOrUndefined(localsUserId) &&
      queryUserId !== localsUserId
   ) {
      throw error(404, "Not Found");
   }

   const authUserId = !IsHelper.isNullOrUndefined(queryUserId)
      ? queryUserId
      : localsUserId;

   const authUser = await getAuthUserById(
      authUserId ?? "",
      locals.supabaseSecret,
   );

   if (IsHelper.isNullOrUndefined(authUser)) {
      redirect(303, `/auth/sign-in?backTo=${backTo}`);
   }

   const identityMap: {
      id: string;
      name: string;
      metadata: string;
      confirmed: boolean;
   }[] = [];

   identityMap.push({
      id: "email",
      name: stringHelper().capitalizeEachWord(
         m["auth.phrases.email"](),
      ),
      metadata: authUser.email ?? "",
      confirmed: authUser.email_confirmed,
   });

   if (layoutData.phoneProvider === true) {
      identityMap.push({
         id: "phone",
         name: stringHelper().capitalizeEachWord(
            m["auth.phrases.phone"](),
         ),
         metadata: authUser.phone ?? "",
         confirmed: authUser.phone_confirmed,
      });
   }

   authUser.identities.filter((i) =>
      i.provider !== "email" && i.provider !== "phone"
   ).forEach((i) => {
      identityMap.push({
         id: i.provider_id,
         name: stringHelper().capitalizeEachWord(i.provider),
         metadata: "",
         confirmed: true,
      });
   });

   return {
      authUserId,
      backTo,
      identities: ArrayHelper.orderBy(identityMap, ["name"], ["asc"]),
      title: stringHelper().capitalizeEachWord(
         m["auth.page_titles.user_confirmation"](),
      ),
      userConfirmationForm: await superValidate(
         valibot(userConfirmationFormSchema),
      ),
   };
};

export const actions = {
   userConfirmation: async (
      { request, locals: { supabasePublishable, supabaseSecret } },
   ) => {
      const form = await superValidate(
         request,
         valibot(userConfirmationFormSchema),
         { id: "user-confirmation" },
      );

      if (!form.valid) {
         return fail(400, { form });
      }

      const authUser = await getAuthUserById(
         form.data.id ?? "",
         supabaseSecret,
      );

      if (IsHelper.isNullOrUndefined(authUser)) {
         form.message = {
            type: "error",
            body: m["auth.errors.user_not_found"](),
         };

         return fail(400, { form });
      }

      if (form.data.channel === "email") {
         const { error } = await supabasePublishable.auth.resend({
            type: "signup",
            email: authUser.email ?? "",
            options: {
               emailRedirectTo: `${publicEnv.PUBLIC_DMS_ROOT_URL}/auth/confirm`,
            },
         });

         if (!IsHelper.isNullOrUndefined(error)) {
            form.message = {
               type: "error",
               body: m
                  ["auth.errors.email_confirmation_send_error"](),
            };

            return fail(400, { form });
         }
      }

      if (form.data.channel === "phone") {
         const { error } = await supabasePublishable.auth.signInWithOtp({
            phone: stringHelper().getE164PhoneNumber(authUser.phone ?? ""),
            options: {
               shouldCreateUser: false,
               channel: "sms",
            },
         });

         if (!IsHelper.isNullOrUndefined(error)) {
            form.message = {
               type: "error",
               body: m
                  ["auth.errors.phone_confirmation_send_error"](),
            };

            return fail(400, { form });
         }
      }

      redirect(
         303,
         `/auth/one-time-passcode?id=${authUser.id}&channel=${form.data.channel}&backTo=${form.data.backTo}`,
      );
   },
};
