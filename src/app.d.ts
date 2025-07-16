import type { Database } from "$lib/database.types";
import type { AvailableLocales } from "$lib/models/available-locales";
import type { MessageType } from "$lib/models/message-types";
import type { SystemStatus } from "$lib/models/system-status";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Snippet } from "svelte";
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			cookieDomain: string | undefined;
			cookieSecure: boolean | undefined;
			locale: AvailableLocales;
			organization:
				| Database["deebee_dms"]["Tables"]["organizations"]["Row"]
				| undefined;
			organizationSettings:
				| (Database["deebee_dms"]["Tables"]["organization_settings"][
					"Row"
				])[]
				| undefined;
			organizationThemes:
				| (Database["deebee_dms"]["Tables"]["organization_themes"]["Row"])[]
				| undefined;
			safeGetSession: () => Promise<
				{ session: Session | null; user: User | null }
			>;
			session: Session | null;
			supabasePublishable: SupabaseClient<Database>;
			supabaseSecret: SupabaseClient<Database>;
			systemStatus: SystemStatus[];
			themeName: string | undefined;
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
		namespace Superforms {
			type Message = {
				type: MessageType;
				body: string | Snippet;
			};
		}
	}
}

export {};
