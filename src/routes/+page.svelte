<script lang="ts">
	import { getAllCaselle } from '$lib/caselle/caselle';

	const caselle = getAllCaselle();
</script>

<main class="flex flex-col">
	{#each caselle as casella (casella.id)}
		{#if casella.hasAr}
			<a href="/{casella.id}" class="block w-full">
				<img src={casella.svgUrl} alt="Casella {casella.id}" class="block w-full" />
			</a>
		{:else}
			<img src={casella.svgUrl} alt="Casella {casella.id}" class="block w-full" />
		{/if}
	{/each}
</main>
