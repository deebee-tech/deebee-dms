import type { Database } from "$lib/database.types";
import { m } from "$lib/paraglide/messages";
import IsHelper from "@deebeetech/is-helper";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getDualDummy = async (
   supabase: SupabaseClient<Database>,
): Promise<string | undefined> => {
   const { data, error } = await supabase.from("dual").select(
      "dummy",
   ).eq("dummy", "X");

   if (error) {
      throw new Error(
         `${
            m["general.errors.supabase_error"]()
         }: getDualDummy => ${error.message}`,
      );
   }

   if (IsHelper.isNullOrUndefined(data)) {
      return undefined;
   }

   if (data.length === 0) {
      return undefined;
   }

   const row = data[0];
   return row.dummy ?? null;
};
