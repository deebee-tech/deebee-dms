<script lang="ts" module>
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";

	export type BaseInputProps = Omit<HTMLInputAttributes, "size" | "width"> & {
		commandBefore?: Snippet;
		commandAfter?: Snippet;
		description?: string;
		errorMessages?: string[] | undefined;
		label: string | Snippet;
		mask?: string;
	};
</script>

<script lang="ts">
	import IsHelper from "@deebeetech/is-helper";
	import { maska } from "maska/svelte";

	let {
		id,
		name,
		required,
		class: containerClass,
		commandBefore,
		commandAfter,
		description,
		errorMessages,
		label,
		mask = $bindable(),
		type = $bindable(),
		value = $bindable(),
		...inputProps
	}: BaseInputProps = $props();

	const hasErrors = () => !IsHelper.isNullOrUndefined(errorMessages) && errorMessages.length > 0;
</script>

<div class={containerClass}>
	{#if !IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(description)}
		<div id={`${id}-description`} class="hidden">{description}</div>
	{/if}
	<label id={`${id}-label`} for={id} class="input focus-within:input-secondary relative h-13 w-full flex-col gap-0.5">
		<div class="text-neutral-content/50 mt-1 w-full !text-xs">
			{#if typeof label === "string"}
				<span>{label}</span>
				{#if required === true}
					<span class="text-primary dark:text-secondary">&nbsp;&nbsp;*</span>
				{/if}
			{:else}
				{@render label()}
			{/if}
		</div>
		<div class="flex w-full">
			{#if !IsHelper.isNullOrUndefined(commandBefore)}
				<div class="mr-2">
					{@render commandBefore()}
				</div>
			{/if}
			{#if IsHelper.isNullOrUndefined(mask)}
				<input
					{id}
					{name}
					bind:value
					aria-describedby={hasErrors()
						? `${id}-error`
						: !IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(description)
							? `${id}-description`
							: undefined}
					aria-labelledby={`${id}-label`}
					aria-invalid={hasErrors() ? "true" : "false"}
					aria-required={required === true ? "true" : "false"}
					aria-errormessage={`${id}-error`}
					{required}
					{...inputProps}
					class="!text-sm"
				/>
			{:else}
				<input
					{id}
					{name}
					bind:value
					aria-describedby={hasErrors()
						? `${id}-error`
						: !IsHelper.isNullOrUndefinedOrEmptyStringOrWhitespace(description)
							? `${id}-description`
							: undefined}
					aria-labelledby={`${id}-label`}
					aria-invalid={hasErrors() ? "true" : "false"}
					aria-required={required === true ? "true" : "false"}
					aria-errormessage={`${id}-error`}
					use:maska={mask}
					{required}
					{...inputProps}
					class="!text-sm"
				/>
			{/if}
		</div>
		{#if !IsHelper.isNullOrUndefined(commandAfter)}
			<div class="absolute top-1/2 right-0 -translate-y-1/2">
				{@render commandAfter()}
			</div>
		{/if}
	</label>
	{#if hasErrors()}
		<div id={`${id}-error`} class="text-error mt-1.5 ml-2 text-sm" aria-live="assertive">
			{#if hasErrors()}
				{#if errorMessages?.length === 1}
					{errorMessages[0]}
				{:else}
					<ol>
						{#each errorMessages ?? [] as err, index (index)}
							<li>{index + 1}.&nbsp;{err}</li>
						{/each}
					</ol>
				{/if}
			{/if}
		</div>
	{/if}
</div>
