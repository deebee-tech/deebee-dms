<script lang="ts">
	import PageSection from "$lib/components/layout/page-section.svelte";
	import SystemPageWithHeader from "$lib/components/layout/system-page-with-header.svelte";
	import Button from "$lib/components/ui/button.svelte";
	import FormField from "$lib/components/ui/form-field.svelte";
	import Form from "$lib/components/ui/form.svelte";
	import InputText from "$lib/components/ui/input-text.svelte";
	import { DEFAULT_REDIRECT_URL } from "$lib/constants";
	import { toastHelper } from "$lib/helpers/toast.helper";
	import { m } from "$lib/paraglide/messages";
	import { superForm } from "sveltekit-superforms";
	import { valibotClient } from "sveltekit-superforms/adapters";
	import type { PageData } from "./$types";
	import { oneTimePasscodeFormSchema } from "./one-time-passcode.schema";

	let { data }: { data: PageData } = $props();

	const oneTimePasscodeForm = superForm(data.oneTimePasscodeForm, {
		id: "one-time-passcode",
		validators: valibotClient(oneTimePasscodeFormSchema),
		resetForm: false,
		onSubmit: ({ formData }) => {
			formData.set("backTo", data.backTo ?? DEFAULT_REDIRECT_URL);
			formData.set("channel", data.channel);
			formData.set("id", data.authUserId ?? "");
		},
		onUpdated: ({ form }) => {
			toastHelper().formMessage(form.message);
		},
	});

	const {
		form: oneTimePasscodeFormData,
		enhance: oneTimePasscodeEnhance,
		delayed: oneTimePasscodeDelayed,
		submitting: oneTimePasscodeSubmitting,
	} = oneTimePasscodeForm;

	let oneTimePasscodeLoading = $derived($oneTimePasscodeDelayed === true || $oneTimePasscodeSubmitting === true);
</script>

<SystemPageWithHeader>
	<PageSection title={m["auth.page_titles.one_time_passcode"]()}>
		<Form
			superformEnhance={oneTimePasscodeEnhance}
			id="one-time-passcode"
			action="?/oneTimePasscode"
			method="POST"
			class="gap-2 grid"
		>
			<FormField superform={oneTimePasscodeForm} field="code">
				{#snippet control(props)}
					<InputText
						label={m["auth.field_names.passcode"]()}
						bind:value={$oneTimePasscodeFormData.code}
						{...props}
					/>
				{/snippet}
			</FormField>
			<div class="m-auto mt-2">
				<Button type="submit" variant="regular" loading={oneTimePasscodeLoading}
					>{m["auth.phrases.verify_passcode"]()}
				</Button>
			</div>
		</Form>
	</PageSection>
</SystemPageWithHeader>
