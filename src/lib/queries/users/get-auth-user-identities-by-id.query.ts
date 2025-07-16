import type { Database } from "$lib/database.types";
import type { AuthUserIdentity } from "$lib/models/auth-user-identity";
import { m } from "$lib/paraglide/messages";
import IsHelper from "@deebeetech/is-helper";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAuthUserIdentitiesById(
   userId: string,
   supabase: SupabaseClient<Database>,
): Promise<AuthUserIdentity[]> {
   const { data: identityData, error: identityError } = await supabase.rpc(
      "get_auth_user_identities_by_id",
      {
         v_user_id: userId,
      },
   );

   if (identityError) {
      throw new Error(
         `${
            m["general.errors.supabase_error"]()
         }: getAuthUserIdentities => ${identityError.message}`,
      );
   }

   if (IsHelper.isNullOrUndefined(identityData)) {
      return [];
   }

   return identityData as AuthUserIdentity[];
}
