<script lang="ts" module>
	import type { BaseInputProps } from "./input-base.svelte";

	export type PasswordInputProps = Omit<BaseInputProps, "type"> & {
		mode: "entry" | "new" | "confirm";
		confirmValue?: string;
	};
</script>

<script lang="ts">
	import IsHelper from "@deebeetech/is-helper";
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleDot from "@lucide/svelte/icons/circle-dot";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import Eye from "@lucide/svelte/icons/eye";
	import EyeOff from "@lucide/svelte/icons/eye-off";
	import type { HTMLInputTypeAttribute } from "svelte/elements";
	import { v4 as uuidv4 } from "uuid";
	import BaseInput from "./input-base.svelte";

	let { id, value = $bindable(), confirmValue = $bindable(), mode = "entry", ...rest }: PasswordInputProps = $props();

	let passwordHelperId = $state<string>(uuidv4());
	let passwordHelperContentId = $state<string>(uuidv4());
	let obfuscated = $state<boolean>(true);

	let characterLengthMet = $derived<boolean>(value.length >= 16);
	let lowercaseMet = $derived<boolean>(/[a-z]/.test(value));
	let uppercaseMet = $derived<boolean>(/[A-Z]/.test(value));
	let numberMet = $derived<boolean>(/\d/.test(value));
	let specialCharacterMet = $derived<boolean>(/[!@#$%^&*(),.?":{}|<>]/.test(value));
	let inputType = $derived<HTMLInputTypeAttribute>(obfuscated === true ? "password" : "text");
	let confirmationMatch = $derived<boolean>(
		mode === "confirm" &&
			typeof value === "string" &&
			!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(value) &&
			!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(confirmValue) &&
			value === confirmValue,
	);
	let gradualMatch = $derived<boolean>(
		mode === "confirm" &&
			typeof value === "string" &&
			!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(value) &&
			!IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(confirmValue) &&
			confirmValue !== value &&
			confirmValue.startsWith(value),
	);

	$effect(() => {
		const el = document.getElementById(id ?? "") as HTMLInputElement;
		if (IsHelper.isNullOrUndefined(el)) {
			return;
		}

		if (obfuscated === true && el.type === "text") {
			el.type = "password";
		}

		if (obfuscated === false && el.type === "password") {
			el.type = "text";
		}
	});
</script>

{#snippet input()}
	<BaseInput {id} bind:value {...rest} bind:type={inputType}>
		{#snippet commandAfter()}
			<button class="mt-1.5 mr-3" type="button" tabindex="-1" onclick={() => (obfuscated = !obfuscated)}>
				{#if obfuscated === true}
					<EyeOff size={20} style="stroke: var(--color-neutral);" aria-label="hide password" />
				{:else}
					<Eye size={20} style="stroke: var(--color-neutral-content);" aria-label="show password" />
				{/if}
			</button>
		{/snippet}
	</BaseInput>
{/snippet}

{#if mode === "new" || mode === "confirm"}
	<div id={`password-helper-${passwordHelperId}`} style="width: 100%">
		<div id={`password-helper-content-${passwordHelperContentId}`} class="hidden text-xs">
			<div class="flex flex-col gap-1 p-3">
				{#if mode === "new"}
					<div class="flex items-center gap-2">
						<div>
							{#if characterLengthMet === true}
								<CircleCheck class="text-success" size={18} />
							{:else}
								<CircleX class="text-error" size={18} />
							{/if}
						</div>
						<div>16 characters minimum</div>
					</div>
					<div class="flex items-center gap-2">
						<div>
							{#if lowercaseMet === true}
								<CircleCheck class="text-success" size={18} />
							{:else}
								<CircleX class="text-error" size={18} />
							{/if}
						</div>
						<div>1 lowercase character</div>
					</div>
					<div class="flex items-center gap-2">
						<div>
							{#if uppercaseMet === true}
								<CircleCheck class="text-success" size={18} />
							{:else}
								<CircleX class="text-error" size={18} />
							{/if}
						</div>
						<div>1 uppercase character</div>
					</div>
					<div class="flex items-center gap-2">
						<div>
							{#if numberMet === true}
								<CircleCheck class="text-success" size={18} />
							{:else}
								<CircleX class="text-error" size={18} />
							{/if}
						</div>
						<div>1 number</div>
					</div>
					<div class="flex items-center gap-2">
						<div>
							{#if specialCharacterMet === true}
								<CircleCheck class="text-success" size={18} />
							{:else}
								<CircleX class="text-error" size={18} />
							{/if}
						</div>
						<div>
							1 special:
							&#33;&#64;&#35;&#36;&#37;&#94;&#38;&#42;&#40;&#41&#59;&#44;&#46;&#63;&#34;&#58;&#123;&#125;&#124;&#60;&#62;
						</div>
					</div>
				{:else}
					<div class="flex items-center gap-2">
						<div>
							{#if gradualMatch === true}
								<CircleDot class="text-warning" size={18} />
							{:else if confirmationMatch === true}
								<CircleCheck class="text-success" size={18} />
							{:else}
								<CircleX class="text-error" size={18} />
							{/if}
						</div>
						<div>Password and Confirmation Match</div>
					</div>
				{/if}
			</div>
		</div>
		<div
			onfocusin={() => {
				const tooltip = document.getElementById(`password-helper-${passwordHelperId}`);
				const tooltipContent = document.getElementById(`password-helper-content-${passwordHelperContentId}`);
				tooltip?.classList.add("tooltip", "tooltip-open");
				tooltipContent?.classList.add("tooltip-content");
				tooltipContent?.classList.remove("hidden");
			}}
			onfocusout={() => {
				const tooltip = document.getElementById(`password-helper-${passwordHelperId}`);
				const tooltipContent = document.getElementById(`password-helper-content-${passwordHelperContentId}`);
				tooltip?.classList.remove("tooltip", "tooltip-open");
				tooltipContent?.classList.remove("tooltip-content");
				tooltipContent?.classList.add("hidden");
			}}
		>
			{@render input()}
		</div>
	</div>
{:else}
	{@render input()}
{/if}
