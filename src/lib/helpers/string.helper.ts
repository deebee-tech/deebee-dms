import { PHONE_FORMATS } from "$lib/constants";
import { m } from "$lib/paraglide/messages";
import IsHelper from "@deebeetech/is-helper";

export const stringHelper = () => {
	const capitalizeEachWord = (phrase: string): string => {
		if (!phrase) return phrase;
		return phrase
			.split(" ")
			.map((word) =>
				word
					.split("-")
					.map((part) => capitalizeFirstLetter(part))
					.join("-")
			)
			.join(" ");
	};

	const capitalizeFirstLetter = (input: string): string => {
		if (!input) return input;
		return input.charAt(0).toLocaleUpperCase() + input.slice(1);
	};

	const camelCase = (input: string): string => {
		return input.toLocaleLowerCase().replace(
			/[^a-zA-Z0-9]+(.)/g,
			(_, char) => char.toLocaleUpperCase(),
		);
	};

	const getE164PhoneNumber = (phone: string): string => {
		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(phone)) {
			return "";
		}

		let cleaned = phone.replace(/\D/g, "");

		const validFormats = PHONE_FORMATS.map((format) => format.callingPrefix);
		const startsWithValidCode = validFormats.some((code) =>
			cleaned.startsWith(code)
		);

		if (!startsWithValidCode) {
			throw new Error(m["general.errors.phone_invalid"]());
		}

		if (!cleaned.startsWith("+")) {
			cleaned = `+${cleaned}`;
		}

		return cleaned;
	};

	return {
		capitalizeEachWord,
		capitalizeFirstLetter,
		camelCase,
		getE164PhoneNumber,
	};
};
