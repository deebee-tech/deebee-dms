<script lang="ts" module>
	import { twclsx } from "$lib/helpers/style.helper";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { tv, type VariantProps } from "tailwind-variants";

	export const buttonVariants = tv({
		base: "btn",
		variants: {
			variant: {
				none: "",
				regular: "btn-primary bg-primary/40 border border-primary hover:bg-primary/70",
				secondary: "btn-secondary bg-secondary/40 border border-secondary hover:bg-secondary/70",
			},
			size: {
				xs: "btn-xs",
				sm: "btn-sm",
				md: "btn-md",
				lg: "btn-lg",
				xl: "btn-xl",
			},
		},
		defaultVariants: {
			variant: "regular",
			size: "sm",
		},
	});

	export type ButtonProps = HTMLButtonAttributes & {
		children?: Snippet;
		variant?: VariantProps<typeof buttonVariants>["variant"];
		size?: VariantProps<typeof buttonVariants>["size"];
		loading?: boolean;
	};
</script>

<script lang="ts">
	let {
		class: buttonClass,
		children,
		loading = false,
		variant = "regular",
		size = "sm",
		...buttonProps
	}: ButtonProps = $props();
</script>

<button class={twclsx(buttonVariants({ variant, size }), buttonClass)} {...buttonProps}>
	{#if loading === true}
		<LoaderCircle class="animate-spin" />
	{:else}
		{@render children?.()}
	{/if}
</button>
