import type { AuthUserIdentity } from "./auth-user-identity";

export type AuthUser = {
   id: string;
   email: string | null;
   phone: string | null;
   email_confirmed: boolean;
   phone_confirmed: boolean;
   identities: AuthUserIdentity[];
};
