<script lang="ts">
	import PageSection from "$lib/components/layout/page-section.svelte";
	import SystemPageWithHeader from "$lib/components/layout/system-page-with-header.svelte";
	import Button from "$lib/components/ui/button.svelte";
	import Form from "$lib/components/ui/form.svelte";
	import { DEFAULT_REDIRECT_URL } from "$lib/constants";
	import { toastHelper } from "$lib/helpers/toast.helper";
	import { m } from "$lib/paraglide/messages";
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import { onDestroy } from "svelte";
	import { superForm } from "sveltekit-superforms";
	import { valibotClient } from "sveltekit-superforms/adapters";
	import type { PageData } from "./$types";
	import { userConfirmationFormSchema } from "./user-confirmation.schema";

	let { data }: { data: PageData } = $props();

	let channel = $state<"email" | "phone">("email");
	let confirmations = $state<{ id: string; name: string; metadata: string; confirmed: boolean; isHovered: boolean }[]>(
		[],
	);

	data.identities.forEach((identity) => {
		confirmations.push({
			id: identity.id,
			name: identity.name,
			metadata: identity.metadata,
			confirmed: identity.confirmed,
			isHovered: false,
		});
	});

	const broadcast = data.supabasePublishable
		.channel("auth")
		.on("broadcast", { event: `${data.authUserId}:user-confirmation` }, (payload) => {
			console.log(JSON.stringify(payload));

			const { channel, confirmed } = payload;

			const confirmation = confirmations.find((c) => c.id === channel);

			if (confirmation) {
				confirmation.confirmed = confirmed;
			}
		})
		.subscribe();

	const userConfirmationForm = superForm(data.userConfirmationForm, {
		id: "user-confirmation",
		validators: valibotClient(userConfirmationFormSchema),
		resetForm: false,
		onSubmit: ({ formData }) => {
			formData.set("backTo", data.backTo ?? DEFAULT_REDIRECT_URL);
			formData.set("id", data.authUserId ?? "");
			formData.set("channel", channel);
		},
		onUpdated: ({ form }) => {
			toastHelper().formMessage(form.message);
		},
	});

	const {
		enhance: userConfirmationEnhance,
		delayed: userConfirmationDelayed,
		submitting: userConfirmationSubmitting,
	} = userConfirmationForm;

	let userConfirmationFormLoading = $derived(
		$userConfirmationSubmitting === true || $userConfirmationDelayed === true,
	);

	const resendConfirmation = (id: string) => {
		channel = id as "email" | "phone";
		userConfirmationForm.submit();
	};

	onDestroy(() => {
		broadcast.unsubscribe();
	});
</script>

<SystemPageWithHeader>
	<PageSection title={m["auth.page_titles.user_confirmation"]()}>
		<Form superformEnhance={userConfirmationEnhance} id="user-confirmation" action="?/userConfirmation" method="POST">
			<input type="hidden" name="id" value={data.authUserId ?? ""} />
			<input type="hidden" name="channel" bind:value={channel} />
			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th class="w-[10%]"></th>
						<th class="w-[60%]">{m["auth.phrases.provider"]()}</th>
						<th class="w-[30%] text-center">{m["auth.phrases.confirmation_status"]()}</th>
					</tr>
				</thead>
				<tbody>
					{#each confirmations as confirmation, index (confirmation.id)}
						<tr>
							<td>{index + 1}</td>
							<td>{confirmation.name}</td>
							<td class="flex justify-center">
								{#if confirmation.confirmed === true}
									<CircleCheck class="text-success" />
								{:else if confirmation.confirmed === false}
									<div
										role="button"
										tabindex={index}
										id={`${confirmation.id}`}
										onmouseenter={() => {
											const buttonState = confirmations.find((t) => t.id === confirmation.id);
											if (buttonState) {
												buttonState.isHovered = true;
											}
										}}
										onmouseleave={() => {
											const buttonState = confirmations.find((t) => t.id === confirmation.id);
											if (buttonState) {
												buttonState.isHovered = false;
											}
										}}
									>
										{#if confirmations.find((t) => t.id === confirmation.id)?.isHovered}
											<Button
												type="button"
												variant="regular"
												size="xs"
												class="cursor-pointer"
												onclick={() => resendConfirmation(confirmation.id)}
												loading={userConfirmationFormLoading}
											>
												{#if confirmation.id === "email"}
													{m["auth.phrases.send_magic_link"]()}
												{:else if confirmation.id === "phone"}
													{m["auth.phrases.send_otp"]()}
												{/if}
											</Button>
										{:else}
											<CircleX class="text-error" />
										{/if}
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</Form>
	</PageSection>
	<div class="p-5 text-neutral-content/70 text-sm text-center">
		{m["auth.phrases.user_confirmation_instructions"]()}
	</div>
</SystemPageWithHeader>
