<script lang="ts">
	import { env as publicEnv } from "$env/dynamic/public";
	import PageSection from "$lib/components/layout/page-section.svelte";
	import SystemPage from "$lib/components/layout/system-page.svelte";
	import Button from "$lib/components/ui/button.svelte";
	import FormField from "$lib/components/ui/form-field.svelte";
	import Form from "$lib/components/ui/form.svelte";
	import InputPassword from "$lib/components/ui/input-password.svelte";
	import InputPhone from "$lib/components/ui/input-phone.svelte";
	import InputText from "$lib/components/ui/input-text.svelte";
	import { DEFAULT_REDIRECT_URL } from "$lib/constants";
	import { stringHelper } from "$lib/helpers/string.helper";
	import { toastHelper } from "$lib/helpers/toast.helper";
	import { m } from "$lib/paraglide/messages";
	import { globalStore } from "$lib/stores/global.svelte";
	import type { Provider } from "@supabase/supabase-js";
	import { superForm } from "sveltekit-superforms";
	import { valibotClient } from "sveltekit-superforms/adapters";
	import type { PageData } from "./$types";
	import { signInWithOtpFormSchema, signInWithPasswordFormSchema } from "./sign-in.schema";

	let { data }: { data: PageData } = $props();

	const signInWithPasswordForm = superForm(data.signInWithPasswordForm, {
		id: "sign-in-with-password",
		validators: valibotClient(signInWithPasswordFormSchema),
		resetForm: false,
		onSubmit: ({ formData }) => {
			formData.set("backTo", data.backTo ?? DEFAULT_REDIRECT_URL);
		},
		onUpdated: ({ form }) => {
			toastHelper().formMessage(form.message);
		},
	});

	const {
		form: signInWithPasswordFormData,
		enhance: signInWithPasswordEnhance,
		delayed: signInWithPasswordDelayed,
		submitting: signInWithPasswordSubmitting,
	} = signInWithPasswordForm;

	let signInWithPasswordLoading = $derived(
		$signInWithPasswordDelayed === true || $signInWithPasswordSubmitting === true,
	);

	const signInWithOtpForm = superForm(data.signInWithOtpForm, {
		id: "sign-in-with-otp",
		validators: valibotClient(signInWithOtpFormSchema),
		resetForm: false,
		onSubmit: ({ formData }) => {
			formData.set("backTo", data.backTo ?? "");
			formData.set("otpType", otpType);
		},
		onUpdated: ({ form }) => {
			toastHelper().formMessage(form.message);
		},
	});

	const {
		form: signInWithOtpFormData,
		enhance: signInWithOtpEnhance,
		delayed: signInWithOtpDelayed,
		submitting: signInWithOtpSubmitting,
	} = signInWithOtpForm;

	let signInWithOtpLoading = $derived($signInWithOtpDelayed === true || $signInWithOtpSubmitting === true);

	let otpType = $state<"email" | "phone">("email");

	const onOauthClick = (provider: string) => {
		data.supabasePublishable.auth.signInWithOAuth({
			provider: provider as Provider,
			options: { redirectTo: `${publicEnv.PUBLIC_DMS_ROOT_URL}/auth/callback`, scopes: "email" },
		});
	};
</script>

{#snippet otpLabel()}
	{#if data.emailProvider === true && data.phoneProvider === true}
		<select
			class="focus-visible:outline-0 select-ghost"
			onchange={(e) => {
				otpType = e.currentTarget.value as "email" | "phone";
				signInWithOtpFormData.set({ ...$signInWithOtpFormData, otpText: "" });
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

{#snippet oauth(name: string)}
	<div class="tooltip">
		<div class="text-xs tooltip-content">
			{m["auth.phrases.login_with"]()}
			{stringHelper().capitalizeFirstLetter(name)}
		</div>
		<Button type="button" variant="secondary" size="md" onclick={() => onOauthClick(name)}>
			<img src={`/images/auth-icons/${name}-icon.svg`} alt={`${name} login`} width={24} height={24} />
		</Button>
	</div>
{/snippet}

<SystemPage>
	<div class="flex flex-col gap-6">
		<div class="flex justify-center items-center gap-4">
			<div>
				<img
					src={`/images/deebee-logo-${globalStore.themeIsDarkMode === true ? "dark" : "light"}.png`}
					alt="deebee logo"
					class="h-15"
				/>
			</div>
			<div class="font-semibold text-2xl">
				DeeBee DMS {m["auth.phrases.sign_in"]()}
			</div>
		</div>
		<PageSection title={m["auth.phrases.email_and_password"]()}>
			<Form
				id="sign-in-with-password"
				method="POST"
				action="?/signInWithPassword"
				superformEnhance={signInWithPasswordEnhance}
				class="gap-2 grid"
			>
				<FormField field="email" superform={signInWithPasswordForm}>
					{#snippet control(props)}
						<InputText
							label={m["auth.field_names.email"]()}
							bind:value={$signInWithPasswordFormData.email}
							{...props}
						/>
					{/snippet}
				</FormField>
				<FormField field="password" superform={signInWithPasswordForm}>
					{#snippet control(props)}
						<InputPassword
							label={m["auth.field_names.password"]()}
							mode="entry"
							bind:value={$signInWithPasswordFormData.password}
							{...props}
						/>
					{/snippet}
				</FormField>
				<div class="m-auto mt-2">
					<Button variant="regular" type="submit" loading={signInWithPasswordLoading}
						>{m["auth.phrases.sign_in"]()}</Button
					>
				</div>
				<div class="m-auto">
					<a href={`/auth/forgot-password?backTo=${data.backTo}`} class="text-xs underline"
						>{m["auth.phrases.forgot_password"]()}</a
					>
				</div>
			</Form>
		</PageSection>
		{#if data.phoneProvider === true || data.emailProvider === true}
			<PageSection
				title={otpType === "email"
					? m["auth.phrases.magic_link_via_email"]()
					: m["auth.phrases.one_time_passcode_via_phone"]()}
			>
				<Form
					id="sign-in-with-otp"
					method="POST"
					action="?/signInWithOtp"
					superformEnhance={signInWithOtpEnhance}
					class="gap-2 grid"
				>
					<FormField field="otpText" superform={signInWithOtpForm}>
						{#snippet control(props)}
							{#if otpType === "email"}
								<InputText bind:value={$signInWithOtpFormData.otpText} {...props}>
									{#snippet label()}
										{@render otpLabel()}
									{/snippet}
								</InputText>
							{:else}
								<InputPhone bind:value={$signInWithOtpFormData.otpText} {...props}>
									{#snippet label()}
										{@render otpLabel()}
									{/snippet}
								</InputPhone>
							{/if}
						{/snippet}
					</FormField>
					<div class="m-auto mt-2">
						<Button type="submit" variant="regular" loading={signInWithOtpLoading}>
							{#if otpType === "email"}
								{m["auth.phrases.send_magic_link"]()}
							{:else}
								{m["auth.phrases.send_one_time_passcode"]()}
							{/if}
						</Button>
					</div>
				</Form>
			</PageSection>
		{/if}
		{#if data.oauthProviders.length > 0}
			<PageSection title={m["auth.phrases.social_login"]()}>
				<div class="flex justify-center items-center gap-2">
					{#each data.oauthProviders as provider (provider)}
						{@render oauth(provider)}
					{/each}
				</div>
			</PageSection>
		{/if}
		<div class="m-auto">
			<span class="text-sm"
				>{m["auth.phrases.dont_have_an_account"]()}&nbsp;&nbsp;<a
					href={`/auth/sign-up?backTo=${data.backTo}&from=sign-in`}
					class="underline">{m["auth.phrases.sign_up"]()}</a
				>.</span
			>
		</div>
	</div>
</SystemPage>
