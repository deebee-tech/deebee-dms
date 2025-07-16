<script lang="ts" module>
	export type FormFieldProps = {
		id: string;
		name: string;
		description?: string;
		required: boolean;
		errorMessages?: string[];
	};
</script>

<script lang="ts" generics="T extends Record<string, unknown>">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";
	import { formFieldProxy, type FormPathLeaves, type SuperForm } from "sveltekit-superforms";
	import { v4 as uuidv4 } from "uuid";

	type FieldProps = HTMLAttributes<HTMLDivElement> & {
		superform: SuperForm<T>;
		field: FormPathLeaves<T>;
		description?: string;
		control: Snippet<[FormFieldProps]>;
	};

	let { superform, field, description, control, ...divProps }: FieldProps = $props();
	const { constraints, errors } = formFieldProxy(superform, field);
</script>

<div {...divProps}>
	{@render control({
		id: uuidv4(),
		name: field,
		description,
		errorMessages: $errors,
		required: $constraints?.required ?? false,
	})}
</div>
