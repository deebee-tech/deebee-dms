import { PHONE_FORMATS } from "$lib/constants";
import type { PhoneFormat } from "$lib/models/phone-format";
import { m } from "$lib/paraglide/messages";
import IsHelper from "@deebeetech/is-helper";
import parsePhoneNumber, { type CountryCode } from "libphonenumber-js";
import * as v from "valibot";

export const passwordValidation = v.custom<string>((value) => {
   if (typeof value !== "string") {
      return false;
   }

   if (value.length < 16) {
      return false;
   }

   if (/[A-Z]/.test(value) === false) {
      return false;
   }

   if (/[a-z]/.test(value) === false) {
      return false;
   }

   if (/\d/.test(value) === false) {
      return false;
   }

   if (/[!@#$%^&*(),.?":{}|<>]/.test(value) === false) {
      return false;
   }

   return true;
}, m["general.errors.password_complexity"]());

export const phoneNumberValidation = v.custom<string>((value) => {
   if (typeof value !== "string") {
      return false;
   }

   let countryCode: CountryCode = "US";
   const phoneFormat: PhoneFormat | undefined = PHONE_FORMATS.find((pf) =>
      value.replace("+", "").startsWith(pf.callingPrefix)
   );

   if (!IsHelper.isNullOrUndefined(phoneFormat)) {
      countryCode = phoneFormat.countryCode;
   }

   const phoneNumber = parsePhoneNumber(value, {
      defaultCountry: countryCode,
   });

   if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(phoneNumber)) {
      return false;
   }

   return phoneNumber.isValid();
}, m["general.errors.phone_invalid"]());
