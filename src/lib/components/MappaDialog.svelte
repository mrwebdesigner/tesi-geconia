<script lang="ts">
	import ActionButton from '$lib/components/ActionButton.svelte';

	let {
		embedUrl,
		mapUrl,
		title,
		dialog = $bindable(null)
	}: {
		embedUrl: string;
		mapUrl: string;
		title: string;
		dialog?: HTMLDialogElement | null;
	} = $props();

	function close() {
		dialog?.close();
	}
</script>

<dialog
	bind:this={dialog}
	class="m-auto w-[min(92vw,48rem)] max-h-[85vh] overflow-hidden rounded-lg border-0 bg-white p-0 shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
	aria-labelledby="mappa-dialog-title"
>
	<div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
		<h2 id="mappa-dialog-title" class="text-sm font-medium text-gray-900">{title}</h2>
		<div class="flex items-center gap-2">
			<ActionButton
				aria-label="Apri in Google Maps"
				onclick={() => window.open(mapUrl, '_blank', 'noopener,noreferrer')}
			>
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
					<path d="M15 3h6v6" />
					<path d="M10 14 21 3" />
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
				</svg>
			</ActionButton>
			<ActionButton aria-label="Chiudi mappa" onclick={close}>
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
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
			</ActionButton>
		</div>
	</div>
	<iframe
		src={embedUrl}
		{title}
		class="aspect-[4/3] w-full border-0"
		loading="lazy"
		allowfullscreen
		referrerpolicy="no-referrer-when-downgrade"
	></iframe>
</dialog>
