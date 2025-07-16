<script lang="ts">
	import PageSection from "$lib/components/layout/page-section.svelte";
	import SystemPageWithHeader from "$lib/components/layout/system-page-with-header.svelte";
	import { stringHelper } from "$lib/helpers/string.helper";
	import { m } from "$lib/paraglide/messages";
	import AlarmClockMinus from "@lucide/svelte/icons/alarm-clock-minus";
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import CircleX from "@lucide/svelte/icons/circle-x";
	import ArrayHelper from "@deebeetech/array-helper";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
</script>

<SystemPageWithHeader>
	{#each ArrayHelper.uniqBy(data.systemStatus, "area") as envArea (envArea.area)}
		<PageSection title={envArea.area} containerClass="mb-8">
			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th class="w-[10%]"></th>
						<th class="w-[70%]">{m["system.phrases.name"]()}</th>
						<th class="w-[20%] text-center">{m["system.phrases.status"]()}</th>
					</tr>
				</thead>
				<tbody>
					{#each data.systemStatus.filter((ss) => ss.area === envArea.area) as env, index (env.itemName)}
						<tr>
							<td>{index + 1}</td>
							<td class="break-all">{@html env.itemName.replaceAll("_", "_<wbr>")}</td>
							<td class="flex justify-center">
								{#if env.status === "ok"}
									<CircleCheck class="text-success" />
								{:else if env.status === "not-configured"}
									<div class="cursor-pointer tooltip">
										<div class="tooltip-content">
											<ul>
												<li>
													{stringHelper().capitalizeFirstLetter(m["system.phrases.not_configured"]())}
												</li>
											</ul>
										</div>
										<AlarmClockMinus class="text-warning" />
									</div>
								{:else if env.status === "error"}
									<div class="cursor-pointer tooltip">
										<div class="tooltip-content">
											<ul>
												{#each env.errorMessages as message (message)}
													<li>{message}</li>
												{/each}
											</ul>
										</div>
										<CircleX class="text-error" />
									</div>
								{/if}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</PageSection>
	{/each}
</SystemPageWithHeader>
