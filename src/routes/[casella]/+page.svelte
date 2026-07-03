<script lang="ts">
	import ArViewer from '$lib/components/ArViewer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Geconia AR — Casella {data.casella.id}</title>
</svelte:head>

<a
	href="/"
	class="fixed top-4 left-4 z-20 rounded bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 shadow"
>
	← Home
</a>

<ArViewer targetsUrl={data.casella.targetsUrl!} overlayUrl={data.casella.overlayUrl!} />
