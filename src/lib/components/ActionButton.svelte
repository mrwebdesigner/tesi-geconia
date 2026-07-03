<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		href?: string;
		'aria-label': string;
		class?: string;
		onclick?: HTMLButtonAttributes['onclick'];
		type?: HTMLButtonAttributes['type'];
		children: Snippet;
	};

	let {
		href,
		'aria-label': ariaLabel,
		class: className = '',
		onclick,
		type = 'button',
		children
	}: Props = $props();

	const baseClass =
		'flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition hover:bg-white';
</script>

{#if href}
	<a {href} class="{baseClass} {className}" aria-label={ariaLabel}>
		{@render children()}
	</a>
{:else}
	<button {type} class="{baseClass} {className}" aria-label={ariaLabel} {onclick}>
		{@render children()}
	</button>
{/if}
