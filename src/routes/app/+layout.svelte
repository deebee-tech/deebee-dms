<script lang="ts">
	import { invalidate } from "$app/navigation";
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import type { LayoutData } from "./$types";

	const { data, children }: { data: LayoutData; children: Snippet } = $props();
	let { session, supabasePublishable } = $derived(data);

	onMount(() => {
		const { data } = supabasePublishable.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth");
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

{@render children()}
