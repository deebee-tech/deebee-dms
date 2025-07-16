import { env as publicEnv } from "$env/dynamic/public";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
   const allAuthProviders = (publicEnv.PUBLIC_SUPABASE_AUTH_PROVIDERS ?? "")
      .split(
         "|",
      );

   const emailProvider = allAuthProviders.some(
      (provider) => provider === "email",
   );
   const phoneProvider = allAuthProviders.some(
      (provider) => provider === "phone",
   );
   const oauthProviders = allAuthProviders.filter((provider) =>
      provider !== "email" && provider !== "phone"
   );

   return {
      allAuthProviders,
      emailProvider,
      phoneProvider,
      oauthProviders,
   };
};
