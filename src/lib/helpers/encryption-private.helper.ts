import { encryptionPublicHelper } from "$lib/helpers/encryption-public.helper";
import { m } from "$lib/paraglide/messages";
import IsHelper from "@deebeetech/is-helper";

export const encryptionPrivateHelper = (
	publicKey: string,
	privateKey: string,
	hmacSecret: string,
) => {
	const publicHelper = encryptionPublicHelper(publicKey);
	const priv = privateKey;
	const hmac = hmacSecret;

	const asymmetricDecrypt = async (cipherText: string) => {
		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(priv)) {
			throw new Error(
				`privateKey ${
					m["general.errors.string_required"]().toLocaleLowerCase()
				}`,
			);
		}

		const privateKey = await publicHelper.importAsymmetricKey(
			priv,
			"private",
		);
		const dec = new TextDecoder();
		const decodedCipherText = new Uint8Array(
			atob(cipherText)
				.split("")
				.map((char) => char.charCodeAt(0)),
		);
		const plainText = await crypto.subtle.decrypt(
			{ name: "RSA-OAEP" },
			privateKey,
			decodedCipherText,
		);

		return dec.decode(plainText);
	};

	const hmacGenerate = async <T>(input: T) => {
		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(hmac)) {
			throw new Error(
				`hmacSecret ${
					m["general.errors.string_required"]().toLocaleLowerCase()
				}`,
			);
		}

		const key = await importHmacKey(hmac);
		const enc = new TextEncoder();
		const encodedInput = enc.encode(JSON.stringify(input));
		const signature = await crypto.subtle.sign("HMAC", key, encodedInput);
		return btoa(String.fromCharCode(...new Uint8Array(signature)));
	};

	const hmacValidate = async (input: string, hmac: string) => {
		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(hmac)) {
			throw new Error(
				`hmacSecret ${
					m["general.errors.string_required"]().toLocaleLowerCase()
				}`,
			);
		}

		const key = await importHmacKey(hmac);
		const enc = new TextEncoder();
		const encodedInput = enc.encode(input);
		const decodedHmac = new Uint8Array(
			atob(hmac)
				.split("")
				.map((char) => char.charCodeAt(0)),
		);
		const isValid = await crypto.subtle.verify(
			"HMAC",
			key,
			decodedHmac,
			encodedInput,
		);
		return isValid;
	};

	const importHmacKey = async (key: string) => {
		const binaryKey = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
		return crypto.subtle.importKey(
			"raw",
			binaryKey,
			{ name: "HMAC", hash: { name: "SHA-256" } },
			false,
			[
				"sign",
				"verify",
			],
		);
	};

	return {
		...publicHelper,
		asymmetricDecrypt,
		hmacGenerate,
		hmacValidate,
	};
};
