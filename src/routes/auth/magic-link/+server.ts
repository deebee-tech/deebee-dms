import { stringHelper } from "$lib/helpers/string.helper";
import { m } from "$lib/paraglide/messages";
import IsHelper from "@deebeetech/is-helper";
import {
   redirect,
   type RequestEvent,
   type RequestHandler,
} from "@sveltejs/kit";

export const GET: RequestHandler = async (
   event: RequestEvent<Partial<Record<string, string>>, string | null>,
) => {
   const {
      url,
      locals: { supabasePublishable },
   } = event;

   const encodedUrlString = url.searchParams.get("confirmation");

   if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(encodedUrlString)) {
      throw new Error(m["auth.errors.unknown_auth_error"]());
   }

   const decodedUrlString = decodeURIComponent(encodedUrlString);
   const decodedUrl = new URL(decodedUrlString);

   const code = decodedUrl.searchParams.get("code") as string;
   const next = decodedUrl.searchParams.get("next") ?? "/";

   if (code) {
      const response = await supabasePublishable.auth.exchangeCodeForSession(
         code,
      );

      if (!response.error) {
         throw redirect(303, `/${next.slice(1)}`);
      }

      console.error(response.error);
      throw new Error(
         stringHelper().capitalizeEachWord(response.error.message),
      );
   }

   throw new Error(m["auth.errors.unknown_auth_error"]());
};
