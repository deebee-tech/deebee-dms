import { encryptionBaseHelper } from "$lib/helpers/encryption-base.helper";
import { type BoxModel } from "$lib/models/box";
import IsHelper from "@deebeetech/is-helper";

export const boxHelper = () => {
	const box = <T>(value: T): string => {
		return encryptionBaseHelper().stringToBase64(
			JSON.stringify({ value: value }),
		);
	};

	const unbox = <T>(value: string | undefined): BoxModel<T | undefined> => {
		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(value)) {
			return { value: undefined } as BoxModel<T | undefined>;
		}

		return JSON.parse(
			encryptionBaseHelper().base64ToString(value),
		) as BoxModel<T | undefined>;
	};

	return {
		box,
		unbox,
	};
};
