import type { Database } from "$lib/database.types";
import { m } from "$lib/paraglide/messages";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getOrganizationSettings = async (
   orgId: number,
   supabase: SupabaseClient<Database>,
): Promise<
   | Database["deebee_dms"]["Tables"]["organization_settings"]["Row"][]
   | undefined
> => {
   const { data, error } = await supabase.from(
      "organization_settings",
   ).select("*").eq("organization_id", orgId);

   if (error) {
      throw new Error(
         `${
            m["general.errors.supabase_error"]()
         }: getOrganizationSettings => ${error.message}`,
      );
   }

   return data as Database["deebee_dms"]["Tables"]["organization_settings"][
      "Row"
   ][];
};
