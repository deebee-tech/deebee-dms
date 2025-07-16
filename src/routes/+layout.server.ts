import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ cookies, locals }) => {
	return {
		cookieDomain: locals.cookieDomain,
		cookies: cookies.getAll(),
		cookieSecure: locals.cookieSecure,
		locale: locals.locale,
		organization: locals.organization,
		organizationSettings: locals.organizationSettings,
		organizationThemes: locals.organizationThemes,
		session: locals.session,
		systemStatus: locals.systemStatus,
		themeName: locals.themeName,
		user: locals.user,
	};
};
