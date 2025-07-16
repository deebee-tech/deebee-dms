<script lang="ts">
	import { twclsx } from "$lib/helpers/style.helper";
	import { toastStore } from "$lib/stores/toast.svelte";
	import IsHelper from "@deebeetech/is-helper";
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import Info from "@lucide/svelte/icons/info";
	import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
	import { fly } from "svelte/transition";

	let timers = $state<{ id: string; timer: NodeJS.Timeout }[]>([]);

	const timerLoop = (id: string) => {
		const toast = toastStore.toasts.find((t) => t.id === id);
		const timer = timers.find((t) => t.id === id);

		if (IsHelper.isNullOrUndefined(toast)) {
			if (!IsHelper.isNullOrUndefined(timer)) {
				clearInterval(timer.timer);
				timers = timers.filter((t) => t.id !== id);
			}

			return;
		}

		if (toast.duration <= 0) {
			toastStore.removeToast(id);

			if (!IsHelper.isNullOrUndefined(timer)) {
				clearInterval(timer.timer);
				timers = timers.filter((t) => t.id !== id);
			}

			return;
		}

		toastStore.setTimerDuration(id, toast.duration - 1000);
	};

	const pauseTimer = (id: string) => {
		const timer = timers.find((t) => t.id === id);
		if (!IsHelper.isNullOrUndefined(timer)) {
			clearInterval(timer.timer);
			timers = timers.filter((t) => t.id !== id);
		}
	};

	const resumeOrStartTimer = (id: string) => {
		const toast = toastStore.toasts.find((t) => t.id === id);
		if (!timers.some((t) => t.id === id) && !IsHelper.isNullOrUndefined(toast) && toast.duration > 0) {
			const timer = setInterval(() => {
				timerLoop(id);
			}, 1000);

			timers.push({ id, timer });
		}
	};

	$effect(() => {
		toastStore.toasts.forEach((toast) => {
			resumeOrStartTimer(toast.id);
		});
	});
</script>

<div role="alert" class="toast toast-end">
	{#each toastStore.toasts as toast (toast.id)}
		<div
			id={`toast-${toast.id}`}
			class={twclsx("alert", toast.type !== "generic" ? `alert-${toast.type}` : "")}
			out:fly={{ x: 64, duration: 300 }}
			onmouseenter={() => pauseTimer(toast.id)}
			onmouseleave={() => resumeOrStartTimer(toast.id)}
			role="alert"
		>
			<div class="flex items-center gap-2">
				{#if toast.type === "info"}
					<Info />
				{:else if toast.type === "success"}
					<CircleCheck />
				{:else if toast.type === "warning"}
					<TriangleAlert />
				{:else if toast.type === "error"}
					<CircleX />
				{/if}
				{#if typeof toast.body === "string"}
					<div>{toast.body}</div>
				{:else}
					{@render toast.body()}
				{/if}
			</div>
		</div>
	{/each}
</div>
