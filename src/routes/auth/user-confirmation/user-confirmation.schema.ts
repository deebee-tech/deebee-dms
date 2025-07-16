import * as v from "valibot";

export const userConfirmationFormSchema = v.pipe(
   v.object({
      backTo: v.string(),
      id: v.string(),
      channel: v.picklist(["email", "phone"]),
   }),
);
