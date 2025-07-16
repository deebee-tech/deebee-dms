import type { CountryCode } from "libphonenumber-js";
import type { MaskOptions } from "maska";

export type PhoneFormat = {
   countryCode: CountryCode;
   callingPrefix: string;
   countryName: string;
   flag: string;
   inputPlaceholder: string;
   maskOptions: MaskOptions;
};
