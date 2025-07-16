import { phoneNumberValidation } from "$lib/helpers/validation.helper";
import { m } from "$lib/paraglide/messages";
import * as v from "valibot";

export const forgotPasswordFormSchema = v.pipe(
   v.object({
      backTo: v.string(),
      otpType: v.picklist(["email", "phone"]),
      otpText: v.string(),
   }),
   v.rawCheck(({ dataset, addIssue }) => {
      if (!dataset.typed) {
         return;
      }

      if (dataset.value.otpText === "email") {
         if (dataset.value.otpText.length === 0) {
            addIssue({
               message: m["general.errors.email_required"](),
               path: [{
                  type: "object",
                  origin: "value",
                  input: dataset.value,
                  key: "otpText",
                  value: dataset.value.otpText,
               }],
            });
         }

         const emailParser = v.pipe(v.string(), v.nonEmpty(), v.rfcEmail());

         if (
            v.safeParse(emailParser, dataset.value.otpText).success === false
         ) {
            addIssue({
               message: m["general.errors.email_invalid"](),
               path: [{
                  type: "object",
                  origin: "value",
                  input: dataset.value,
                  key: "otpText",
                  value: dataset.value.otpText,
               }],
            });
         }
      }

      if (dataset.value.otpType === "phone") {
         if (dataset.value.otpText.length === 0) {
            addIssue({
               message: m["general.errors.phone_required"](),
               path: [{
                  type: "object",
                  origin: "value",
                  input: dataset.value,
                  key: "otpText",
                  value: dataset.value.otpText,
               }],
            });
         }

         const phoneParser = v.pipe(
            v.string(),
            v.nonEmpty(),
            phoneNumberValidation,
         );

         if (
            v.safeParse(phoneParser, dataset.value.otpText).success === false
         ) {
            addIssue({
               message: m["general.errors.phone_invalid"](),
               path: [{
                  type: "object",
                  origin: "value",
                  input: dataset.value,
                  key: "otpText",
                  value: dataset.value.otpText,
               }],
            });
         }
      }
   }),
);
