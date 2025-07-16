import type { Database } from "$lib/database.types";
import { m } from "$lib/paraglide/messages";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getOrganizationById = async (
   id: number,
   supabase: SupabaseClient<Database>,
): Promise<
   Database["deebee_dms"]["Tables"]["organizations"]["Row"] | undefined
> => {
   const { data, error } = await supabase.from(
      "organizations",
   ).select("*").eq("id", id);

   if (error) {
      throw new Error(
         `${
            m["general.errors.supabase_error"]()
         }: getOrganizationById => ${error.message}`,
      );
   }

   if (data.length === 0) {
      return undefined;
   }

   return data[0];
};
