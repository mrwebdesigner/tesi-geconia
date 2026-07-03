<script lang="ts">
	import { base } from '$app/paths';
	import ArViewer from '$lib/components/ArViewer.svelte';
	import ActionButton from '$lib/components/ActionButton.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Geconia AR — Casella {data.casella.id}</title>
</svelte:head>

<ActionButton href="{base}/" aria-label="Torna alla home" class="fixed top-4 left-4 z-20">
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
		<path d="m12 19-7-7 7-7" />
		<path d="M19 12H5" />
	</svg>
</ActionButton>

<ArViewer targetsUrl={data.casella.targetsUrl!} overlayUrl={data.casella.overlayUrl!} />
