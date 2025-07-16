import {
	passwordValidation,
	phoneNumberValidation,
} from "$lib/helpers/validation.helper";
import { m } from "$lib/paraglide/messages";
import * as v from "valibot";

const signUpFormBaseSchema = v.pipe(
	v.object({
		backTo: v.string(),
		email: v.pipe(
			v.string(m["general.errors.email_required"]()),
			v.rfcEmail(m["general.errors.email_invalid"]()),
		),
		phone: v.pipe(
			v.string(m["general.errors.phone_required"]()),
			phoneNumberValidation,
		),
		password: v.pipe(
			v.string(m["general.errors.password_required"]()),
			v.nonEmpty(m["general.errors.password_required"]()),
			passwordValidation,
		),
		confirmPassword: v.pipe(
			v.string(m["general.errors.confirm_password_required"]()),
			v.nonEmpty(m["general.errors.confirm_password_required"]()),
			passwordValidation,
		),
	}),
	v.forward(
		v.partialCheck(
			[["password"], ["confirmPassword"]],
			(input) => input.password === input.confirmPassword,
			m["general.errors.confirm_password_match"](),
		),
		["confirmPassword"],
	),
);

export const signUpFormSchema = v.variant("phoneState", [
	v.object({
		...signUpFormBaseSchema.entries,
		phoneState: v.literal("required"),
		phone: v.pipe(
			v.string(m["general.errors.phone_required"]()),
			phoneNumberValidation,
		),
	}),
	v.object({
		...signUpFormBaseSchema.entries,
		phoneState: v.literal("optional"),
		phone: v.optional(v.string()),
	}),
]);
