<script lang="ts">
	import { base } from '$app/paths';
	import { tick } from 'svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import MappaDialog from '$lib/components/MappaDialog.svelte';
	import { getAllCaselle, getCasella, type Casella } from '$lib/caselle/caselle';

	const caselle = getAllCaselle();
	const titoloColore = getCasella('01')!.colore;

	let mappaDialog = $state<HTMLDialogElement | null>(null);
	let activeMappa = $state<{ embedUrl: string; title: string } | null>(null);

	function isMobileViewport(): boolean {
		return window.matchMedia('(max-width: 768px)').matches;
	}

	function openMappa(casella: Casella) {
		if (isMobileViewport()) {
			window.open(casella.mappa, '_blank', 'noopener,noreferrer');
			return;
		}

		activeMappa = {
			embedUrl: casella.mappaEmbed,
			title: `Mappa — Casella ${casella.id}`
		};

		void tick().then(() => mappaDialog?.showModal());
	}
</script>

<main class="mx-auto flex w-full max-w-2xl flex-col">
	<h1 class="px-10 pt-10 text-center font-sans text-3xl font-bold">Il gioco di Geconia</h1>

	{#each caselle as casella (casella.id)}
		<div class="flex flex-col px-10 pt-10 pb-4" style:background-color={casella.colore}>
			<img src={casella.svgUrl} alt="Casella {casella.id}" class="block w-full" />

			<div class="mt-4 flex justify-end gap-2">
				<ActionButton aria-label="Apri mappa" onclick={() => openMappa(casella)}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-5 w-5"
						aria-hidden="true"
					>
						<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
						<circle cx="12" cy="10" r="3" />
					</svg>
				</ActionButton>

				{#if casella.hasAr}
					<ActionButton href="{base}/{casella.id}/" aria-label="Vai alla scansione AR">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-5 w-5"
							aria-hidden="true"
						>
							<path d="M5 12h14" />
							<path d="m12 5 7 7-7 7" />
						</svg>
					</ActionButton>
				{/if}
			</div>
		</div>
	{/each}
</main>

{#if activeMappa}
	<MappaDialog
		bind:dialog={mappaDialog}
		embedUrl={activeMappa.embedUrl}
		title={activeMappa.title}
	/>
{/if}
