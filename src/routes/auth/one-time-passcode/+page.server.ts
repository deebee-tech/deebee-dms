import { DEFAULT_REDIRECT_URL } from "$lib/constants";
import { stringHelper } from "$lib/helpers/string.helper";
import { m } from "$lib/paraglide/messages";
import { getAuthUserById } from "$lib/queries/users/get-auth-user-by-id.query";
import IsHelper from "@deebeetech/is-helper";
import { error, fail, redirect } from "@sveltejs/kit";
import { valibot } from "sveltekit-superforms/adapters";
import { superValidate } from "sveltekit-superforms/client";
import type { PageServerLoad } from "./$types";
import { oneTimePasscodeFormSchema } from "./one-time-passcode.schema";

export const load: PageServerLoad = async (
   { locals, url, depends },
) => {
   depends("paraglide:lang");

   const queryUserId = url.searchParams.get("id");
   const localsUserId = locals.user?.id;
   const backTo = url.searchParams.get("backTo") ?? DEFAULT_REDIRECT_URL;
   const channel = url.searchParams.get("channel");

   if (
      IsHelper.isNullOrUndefined(queryUserId) &&
      IsHelper.isNullOrUndefined(localsUserId)
   ) {
      redirect(303, `/auth/sign-in?backTo=${backTo}`);
   }

   if (
      (!IsHelper.isNullOrUndefined(queryUserId) &&
         !IsHelper.isNullOrUndefined(localsUserId) &&
         queryUserId !== localsUserId) ||
      (IsHelper.isNullOrUndefined(channel) ||
         channel !== "email" && channel !== "phone")
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

   return {
      authUserId,
      backTo,
      channel,
      title: stringHelper().capitalizeEachWord(
         m["auth.page_titles.one_time_passcode"](),
      ),
      oneTimePasscodeForm: await superValidate(
         valibot(oneTimePasscodeFormSchema),
         { id: "one-time-passcode" },
      ),
   };
};

export const actions = {
   oneTimePasscode: async (
      { request, locals: { supabasePublishable, supabaseSecret } },
   ) => {
      const form = await superValidate(
         request,
         valibot(oneTimePasscodeFormSchema),
         { id: "one-time-passcode" },
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
         const validate = await supabasePublishable.auth.verifyOtp({
            email: authUser.email ?? "",
            token: form.data.code ?? "",
            type: "email",
         });

         if (!IsHelper.isNullOrUndefined(validate.error)) {
            form.message = {
               type: "error",
               body: m["auth.errors.invalid_passcode"](),
            };

            return fail(400, { form });
         }
      }

      if (form.data.channel === "phone") {
         const validate = await supabasePublishable.auth.verifyOtp({
            phone: authUser.phone ?? "",
            token: form.data.code ?? "",
            type: "sms",
         });

         if (!IsHelper.isNullOrUndefined(validate.error)) {
            form.message = {
               type: "error",
               body: m["auth.errors.invalid_passcode"](),
            };

            return fail(400, { form });
         }

         await supabasePublishable
            .channel("auth")
            .send({
               type: "broadcast",
               event: `${validate.data.user?.id}:user-confirmation`,
               payload: { channel: "phone", confirmed: true },
            });
      }

      redirect(303, form.data.backTo ?? DEFAULT_REDIRECT_URL);
   },
};
