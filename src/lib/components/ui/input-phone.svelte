<script lang="ts" module>
	import { PHONE_FORMATS } from "$lib/constants";
	import type { PhoneFormat } from "$lib/models/phone-format";
	import type { CountryCode } from "libphonenumber-js";
	import type { BaseInputProps } from "./input-base.svelte";

	export type PhoneInputProps = Omit<BaseInputProps, "type"> & {
		defaultCountryCode?: CountryCode;
	};
</script>

<script lang="ts">
	import { m } from "$lib/paraglide/messages";
	import Check from "@lucide/svelte/icons/check";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import IsHelper from "@deebeetech/is-helper";
	import { onMount } from "svelte";
	import { v4 as uuidv4 } from "uuid";
	import BaseInput from "./input-base.svelte";

	let { id, name, defaultCountryCode = "US", value = $bindable<string>(), ...textInput }: PhoneInputProps = $props();

	let randomId = $state<string>(uuidv4());
	let phoneFormat = $state<PhoneFormat>(PHONE_FORMATS.filter((pf) => pf.countryCode === defaultCountryCode)[0]);

	const getCleanPhone = (val: string) => {
		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(val)) {
			return "";
		}

		let clean = val.replace(/\D/g, "");
		clean = clean.replace(phoneFormat.callingPrefix, "");
		return clean;
	};

	const getE164Format = (val: string) => {
		if (IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(val)) {
			return "";
		}

		let clean = val.replace(/\D/g, "");
		const final = `+${phoneFormat.callingPrefix}${clean}`;
		return final;
	};

	const onSelectCountry = (callingPrefix: string) => {
		phoneFormat = PHONE_FORMATS.filter((pf) => pf.callingPrefix === callingPrefix)[0];

		const popover = document.getElementById(`popover-phone-${randomId}`);

		if (IsHelper.isNullOrUndefined(popover)) {
			return;
		}

		popover.hidePopover();

		resetInput("selectCountry");
	};

	const resetInput = (type: "mount" | "selectCountry") => {
		const el = document.getElementById(randomId) as HTMLInputElement;

		if (IsHelper.isNullOrUndefined(el) || IsHelper.isNullOrUndefined(el)) {
			return;
		}

		el.placeholder = phoneFormat?.inputPlaceholder ?? "";

		switch (type) {
			case "mount":
				el.value = getCleanPhone(value);
				break;
			case "selectCountry":
				el.value = "";
				value = "";
				break;
		}
	};

	onMount(() => {
		resetInput("mount");
	});
</script>

<input type="hidden" {id} {name} bind:value />

<BaseInput
	id={randomId}
	name={randomId}
	{...textInput}
	type="text"
	mask={phoneFormat?.maskOptions.mask?.toString()}
	placeholder={phoneFormat?.inputPlaceholder ?? ""}
	oninput={(e) => (value = getE164Format(e.currentTarget.value))}
>
	{#snippet commandBefore()}
		<div class="flex flex-row w-full">
			<div class="ml-auto">
				<button
					type="button"
					popovertarget={`popover-phone-${randomId}`}
					style={`anchor-name:--anchor-phone-${randomId}`}
					aria-label={m["general.phrases.select_country"]().toLocaleLowerCase()}
				>
					<div class="flex">
						<div>
							<span class={`fi fi-${phoneFormat?.flag}`}></span>
						</div>
						<div class="text-neutral-content/50">&nbsp;&nbsp;&nbsp;&#43;{phoneFormat?.callingPrefix}</div>
						<div class="flex justify-center items-center mt-0.5 ml-0.5">
							<ChevronDown size={16} style="stroke: oklch(from var(--color-neutral-content) l c h / 0.5);" />
						</div>
					</div>
				</button>
			</div>
		</div>
		<div
			class="bg-base-200 shadow-sm border border-base-content/10 rounded-lg w-60 dropdown dropdown-center menu"
			popover
			id={`popover-phone-${randomId}`}
			style={`position-anchor:--anchor-phone-${randomId}`}
		>
			<ul class="mb-2">
				{#each PHONE_FORMATS as format (format.countryCode)}
					<li class="flex flex-row justify-center items-center">
						<button
							class="w-full text-xs"
							onclick={(e) => {
								e.preventDefault();
								onSelectCountry(format.callingPrefix);
							}}
						>
							<div class="flex flex-row justify-center items-center bg-base-300 shadow-sm p-1.5 rounded-lg">
								<div><span class={`fi fi-${format.flag}`}></span></div>
							</div>
							<div>+{format.callingPrefix}&nbsp;&nbsp;{format.countryName}</div>
							<div class="mr-auto">
								{#if phoneFormat?.callingPrefix === format.callingPrefix}<Check
										size={20}
										strokeWidth={1}
									/>{/if}
							</div>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/snippet}
</BaseInput>
