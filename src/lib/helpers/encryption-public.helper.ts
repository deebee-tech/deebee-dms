import { encryptionBaseHelper } from "$lib/helpers/encryption-base.helper";
import { m } from "$lib/paraglide/messages";
import IsHelper from "@deebeetech/is-helper";

export const encryptionPublicHelper = (publicKey: string) => {
	const baseHelper = encryptionBaseHelper();
	const key = publicKey;

	const asymmetricEncrypt = async (plainText: string) => {
		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(key)) {
			throw new Error(
				`publicKey ${
					m["general.errors.string_required"]().toLocaleLowerCase()
				}`,
			);
		}

		const publicKey = await importAsymmetricKey(key, "public");
		const enc = new TextEncoder();
		const encodedText = enc.encode(plainText);
		const cipherText = await crypto.subtle.encrypt(
			{ name: "RSA-OAEP" },
			publicKey,
			encodedText,
		);
		return btoa(String.fromCharCode(...new Uint8Array(cipherText)));
	};

	const importAsymmetricKey = async (
		key: string,
		type: "public" | "private",
	) => {
		const binaryKey = Uint8Array.from(atob(key), (c) => c.charCodeAt(0));
		return crypto.subtle.importKey(
			type === "public" ? "spki" : "pkcs8",
			binaryKey,
			{
				name: "RSA-OAEP",
				hash: "SHA-256",
			},
			true,
			[type === "public" ? "encrypt" : "decrypt"],
		);
	};

	return {
		...baseHelper,
		asymmetricEncrypt,
		importAsymmetricKey,
	};
};
