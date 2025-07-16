<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<div>App</div>
<button onclick={() => data.supabasePublishable.auth.signOut()}>Sign Out</button>
