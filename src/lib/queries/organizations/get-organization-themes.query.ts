import type { Database } from "$lib/database.types";
import { m } from "$lib/paraglide/messages";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getOrganizationThemes = async (
   orgId: number,
   supabase: SupabaseClient<Database>,
): Promise<
   Database["deebee_dms"]["Tables"]["organization_themes"]["Row"][] | undefined
> => {
   const { data, error } = await supabase.from(
      "organization_themes",
   ).select("*").eq("organization_id", orgId);

   if (error) {
      throw new Error(
         `${
            m["general.errors.supabase_error"]()
         }: getOrganizationThemes => ${error.message}`,
      );
   }

   return data as Database["deebee_dms"]["Tables"]["organization_themes"][
      "Row"
   ][];
};
