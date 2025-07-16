export type SystemStatus = {
	area: string;
	itemName: string;
	status: "ok" | "error" | "not-configured";
	errorMessages: string[];
};
