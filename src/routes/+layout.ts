import { env as publicEnv } from "$env/dynamic/public";
import {
   createBrowserClient,
   createServerClient,
   isBrowser,
} from "@supabase/ssr";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
   depends("supabase:auth");

   const { cookies } = data;

   const supabasePublishable = isBrowser()
      ? createBrowserClient(
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
      )
      : createServerClient(
         publicEnv.PUBLIC_SUPABASE_URL ?? "",
         publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
         {
            db: {
               schema: "deebee_dms",
            },
            global: {
               fetch,
            },
            cookies: {
               getAll() {
                  return cookies;
               },
            },
         },
      );

   return { ...data, supabasePublishable };
};
