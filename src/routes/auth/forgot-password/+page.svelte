<script lang="ts">
	import PageSection from "$lib/components/layout/page-section.svelte";
	import SystemPageWithHeader from "$lib/components/layout/system-page-with-header.svelte";
	import Button from "$lib/components/ui/button.svelte";
	import FormField from "$lib/components/ui/form-field.svelte";
	import Form from "$lib/components/ui/form.svelte";
	import InputPhone from "$lib/components/ui/input-phone.svelte";
	import InputText from "$lib/components/ui/input-text.svelte";
	import { DEFAULT_REDIRECT_URL } from "$lib/constants";
	import { toastHelper } from "$lib/helpers/toast.helper";
	import { m } from "$lib/paraglide/messages";
	import { superForm } from "sveltekit-superforms";
	import { valibotClient } from "sveltekit-superforms/adapters";
	import type { PageData } from "./$types";
	import { forgotPasswordFormSchema } from "./forgot-password.schema";

	let { data }: { data: PageData } = $props();

	const forgotPasswordForm = superForm(data.forgotPasswordForm, {
		id: "forgot-password",
		validators: valibotClient(forgotPasswordFormSchema),
		resetForm: false,
		onSubmit: ({ formData }) => {
			formData.set("backTo", data.backTo ?? DEFAULT_REDIRECT_URL);
		},
		onUpdated: ({ form }) => {
			toastHelper().formMessage(form.message);
		},
	});

	const {
		form: forgotPasswordFormData,
		enhance: forgotPasswordEnhance,
		delayed: forgotPasswordDelayed,
		submitting: forgotPasswordSubmitting,
	} = forgotPasswordForm;

	let forgotPasswordLoading = $derived($forgotPasswordDelayed === true || $forgotPasswordSubmitting === true);

	let otpType = $state<"email" | "phone">("email");
</script>

{#snippet otpLabel()}
	{#if data.emailProvider === true && data.phoneProvider === true}
		<select
			class="focus-visible:outline-0 select-ghost"
			onchange={(e) => {
				otpType = e.currentTarget.value as "email" | "phone";
				forgotPasswordFormData.set({ ...$forgotPasswordFormData, otpText: "" });
			}}
		>
			{#if otpType === "email"}
				<option value="email" selected>{m["auth.field_names.email"]()}</option>
			{:else}
				<option value="email">{m["auth.field_names.email"]()}</option>
			{/if}
			{#if otpType === "phone"}
				<option value="phone" selected>{m["auth.field_names.phone"]()}</option>
			{:else}
				<option value="phone">{m["auth.field_names.phone"]()}</option>
			{/if}
		</select>
	{:else if data.emailProvider === true && data.phoneProvider === false}
		{m["auth.field_names.email"]()}
	{:else if data.phoneProvider === true && data.emailProvider === false}
		{m["auth.field_names.phone"]()}
	{/if}
{/snippet}

<SystemPageWithHeader>
	<PageSection
		title={otpType === "email"
			? m["auth.phrases.magic_link_via_email"]()
			: m["auth.phrases.one_time_passcode_via_phone"]()}
	>
		<Form
			id="sign-in-with-otp"
			method="POST"
			action="?/forgotPassword"
			superformEnhance={forgotPasswordEnhance}
			class="gap-2 grid"
		>
			<FormField field="otpText" superform={forgotPasswordForm}>
				{#snippet control(props)}
					{#if otpType === "email"}
						<InputText bind:value={$forgotPasswordFormData.otpText} {...props}>
							{#snippet label()}
								{@render otpLabel()}
							{/snippet}
						</InputText>
					{:else}
						<InputPhone bind:value={$forgotPasswordFormData.otpText} {...props}>
							{#snippet label()}
								{@render otpLabel()}
							{/snippet}
						</InputPhone>
					{/if}
				{/snippet}
			</FormField>
			<div class="m-auto mt-2">
				<Button type="submit" variant="regular" loading={forgotPasswordLoading}>
					{#if otpType === "email"}
						{m["auth.phrases.send_magic_link"]()}
					{:else}
						{m["auth.phrases.send_one_time_passcode"]()}
					{/if}
				</Button>
			</div>
		</Form>
	</PageSection>
	<div class="p-5 text-neutral-content/70 text-sm text-center">
		{#if otpType === "email"}
			{m["auth.phrases.forgot_password_instructions_email"]()}
		{:else}
			{m["auth.phrases.forgot_password_instructions_phone"]()}
		{/if}
	</div>
	<div class="m-auto">
		<span class="text-sm"
			>{m["auth.phrases.back_to"]()}&nbsp;<a href={`/auth/sign-in?backTo=${data.backTo}`} class="underline"
				>{m["auth.phrases.sign_in"]()}</a
			>.</span
		>
	</div>
</SystemPageWithHeader>
