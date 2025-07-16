export const encryptionBaseHelper = () => {
	const stringToBase64 = (value: string): string => {
		return btoa(value);
	};

	const base64ToString = (value: string): string => {
		return atob(value);
	};

	return {
		stringToBase64,
		base64ToString,
	};
};
