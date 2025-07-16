import { m } from "$lib/paraglide/messages";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ depends }) => {
	depends("paraglide:lang");
	return {
		title: m["system.page_titles.system_status"](),
	};
};
