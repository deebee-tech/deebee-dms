<script lang="ts">
	import { page } from "$app/state";
	import { globalStore } from "$lib/stores/global.svelte";
</script>

<div class="mt-20 flex w-full flex-col items-center">
	<img
		src={`/images/deebee-logo-${globalStore.themeIsDarkMode === true ? "dark" : "light"}.png`}
		alt="Deebee Logo"
		width="96"
		height="96"
	/>
	<h1 class="mt-8 text-xl font-bold">{page.status}</h1>
	<h3 class="text-lg">{page.error?.message}</h3>
</div>
