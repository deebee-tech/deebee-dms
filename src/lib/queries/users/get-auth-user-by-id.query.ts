import type { Database } from "$lib/database.types";
import type { AuthUser } from "$lib/models/auth-user";
import { m } from "$lib/paraglide/messages";
import { getAuthUserIdentitiesById } from "$lib/queries/users/get-auth-user-identities-by-id.query";
import IsHelper from "@deebeetech/is-helper";
import { type SupabaseClient } from "@supabase/supabase-js";

export async function getAuthUserById(
   userId: string,
   supabase: SupabaseClient<Database>,
): Promise<AuthUser | undefined> {
   const { data: userData, error: userError } = await supabase.rpc(
      "get_auth_user_by_id",
      {
         v_id: userId,
      },
   );

   if (userError) {
      throw new Error(
         `${
            m["general.errors.supabase_error"]()
         }: getAuthUserById => ${userError.message}`,
      );
   }

   if (IsHelper.isNullOrUndefined(userData)) {
      return undefined;
   }

   if (userData.length === 0) {
      return undefined;
   }

   const user = userData[0] as AuthUser;
   user.identities = await getAuthUserIdentitiesById(user.id, supabase);

   return user;
}
