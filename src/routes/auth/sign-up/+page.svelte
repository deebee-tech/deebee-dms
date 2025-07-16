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
	import { signUpFormSchema } from "./sign-up.schema";

	let { data }: { data: PageData } = $props();

	const signUpForm = superForm(data.signUpForm, {
		id: "sign-up",
		validators: valibotClient(signUpFormSchema),
		resetForm: false,
		onSubmit: ({ formData }) => {
			formData.set("backTo", data.backTo ?? DEFAULT_REDIRECT_URL);
			formData.set("phoneState", data.phoneProvider === true ? "required" : "optional");
		},
		onUpdated: ({ form }) => {
			toastHelper().formMessage(form.message);
		},
	});

	const {
		form: signUpFormData,
		enhance: signUpEnhance,
		delayed: signUpDelayed,
		submitting: signUpSubmitting,
	} = signUpForm;

	let signUpFormLoading = $derived($signUpSubmitting === true || $signUpDelayed === true);

	const onOauthClick = (provider: string) => {
		data.supabasePublishable.auth.signInWithOAuth({
			provider: provider as Provider,
			options: { redirectTo: `${publicEnv.PUBLIC_DMS_ROOT_URL}/auth/callback`, scopes: "email" },
		});
	};
</script>

{#snippet oauth(name: string)}
	<div class="tooltip">
		<div class="text-xs tooltip-content">
			{m["auth.phrases.sign_up_with"]()}
			{stringHelper().capitalizeEachWord(name)}
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
				DeeBee DMS {m["auth.phrases.sign_up"]()}
			</div>
		</div>
		<PageSection title={m["auth.phrases.email_and_phone_with_password"]()}>
			<Form name="sign-up" method="POST" action="?/signUp" superformEnhance={signUpEnhance} class="gap-2 grid">
				<FormField superform={signUpForm} field="email">
					{#snippet control(props)}
						<InputText label={m["auth.field_names.email"]()} bind:value={$signUpFormData.email} {...props} />
					{/snippet}
				</FormField>
				<FormField superform={signUpForm} field="phone">
					{#snippet control(props)}
						<InputPhone
							label={m["auth.field_names.phone"]()}
							bind:value={$signUpFormData.phone}
							{...props}
							required={data.phoneProvider}
						/>
					{/snippet}
				</FormField>
				<FormField superform={signUpForm} field="password">
					{#snippet control(props)}
						<InputPassword
							label={m["auth.field_names.password"]()}
							mode="new"
							bind:value={$signUpFormData.password}
							{...props}
						/>
					{/snippet}
				</FormField>
				<FormField superform={signUpForm} field="confirmPassword">
					{#snippet control(props)}
						<InputPassword
							label={m["auth.field_names.confirm_password"]()}
							mode="confirm"
							bind:confirmValue={$signUpFormData.password}
							bind:value={$signUpFormData.confirmPassword}
							{...props}
						/>
					{/snippet}
				</FormField>
				<div class="m-auto mt-2">
					<Button type="submit" variant="regular" loading={signUpFormLoading}>{m["auth.phrases.sign_up"]()}</Button
					>
				</div>
			</Form>
		</PageSection>
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
				>{#if data.from === "sign-in"}{m["auth.phrases.back_to"]()}{:else}{m["auth.phrases.go_to"]()}{/if}&nbsp;<a
					href={`/auth/sign-in?backTo=${data.backTo}`}
					class="underline">{m["auth.phrases.sign_in"]()}</a
				>.</span
			>
		</div>
	</div>
</SystemPage>
