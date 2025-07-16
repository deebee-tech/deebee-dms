import { m } from "$lib/paraglide/messages";
import * as v from "valibot";

export const oneTimePasscodeFormSchema = v.pipe(
   v.object({
      backTo: v.string(),
      id: v.string(),
      channel: v.picklist(["email", "phone"]),
      code: v.pipe(
         v.string(m["general.errors.password_required"]()),
         v.nonEmpty(m["general.errors.password_required"]()),
      ),
   }),
);
