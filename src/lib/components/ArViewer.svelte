<script lang="ts">
	import { onMount } from 'svelte';
	import { loadScript } from '$lib/load-script';
	import { teardownAr } from '$lib/teardown-ar';

	let { targetsUrl, overlayUrl }: { targetsUrl: string; overlayUrl: string } = $props();

	let container: HTMLDivElement;

	onMount(() => {
		let active = true;

		void (async () => {
			await loadScript('https://aframe.io/releases/1.6.0/aframe.min.js');
			if (!active) return;

			await loadScript(
				'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js'
			);
			if (!active) return;

			// @ts-expect-error AFRAME is loaded globally from CDN
			if (!AFRAME.components['fade-in-on-found']) {
				// @ts-expect-error AFRAME is loaded globally from CDN
				AFRAME.registerComponent('fade-in-on-found', {
					schema: { dur: { type: 'number', default: 1000 } },
					init: function (this: {
						el: Element;
						data: { dur: number };
						rafId: number | null;
					}) {
						const el = this.el;
						const parent = el.parentElement;
						if (!parent) return;

						this.rafId = null;

						parent.addEventListener('targetFound', () => this.fadeIn());
						parent.addEventListener('targetLost', () => this.fadeOut());
					},
					fadeIn: function (this: {
						el: Element;
						data: { dur: number };
						rafId: number | null;
						cancelFade: () => void;
					}) {
						this.cancelFade();
						const el = this.el;
						const dur = this.data.dur;
						const start = performance.now();

						el.setAttribute('material', 'opacity', 0);

						const tick = (now: number) => {
							const t = Math.min((now - start) / dur, 1);
							const opacity = t * t;
							el.setAttribute('material', 'opacity', opacity);
							if (t < 1) {
								this.rafId = requestAnimationFrame(tick);
							} else {
								this.rafId = null;
							}
						};
						this.rafId = requestAnimationFrame(tick);
					},
					fadeOut: function (this: {
						el: Element;
						rafId: number | null;
						cancelFade: () => void;
					}) {
						this.cancelFade();
						this.el.setAttribute('material', 'opacity', 0);
					},
					cancelFade: function (this: { rafId: number | null }) {
						if (this.rafId !== null) {
							cancelAnimationFrame(this.rafId);
							this.rafId = null;
						}
					},
					remove: function (this: { cancelFade: () => void }) {
						this.cancelFade();
					}
				});
			}

			if (!active) return;

			document.body.style.overflow = 'hidden';

			// A-Frame custom elements must be mounted outside Svelte's DOM reconciliation
			// eslint-disable-next-line svelte/no-dom-manipulating -- MindAR requires imperative scene setup
			container.innerHTML = `
				<a-scene
					embedded
					mindar-image="imageTargetSrc: ${targetsUrl};"
					color-space="sRGB"
					renderer="colorManagement: true, physicallyCorrectLights"
					vr-mode-ui="enabled: false"
					device-orientation-permission-ui="enabled: false"
				>
					<a-assets timeout="10000">
						<img id="overlayImage" src="${overlayUrl}" />
					</a-assets>
					<a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
					<a-entity mindar-image-target="targetIndex: 0">
						<a-plane
							src="#overlayImage"
							position="0 0 0.01"
							width="1"
							height="0.7382"
							material="transparent: true; opacity: 0"
							fade-in-on-found
						></a-plane>
					</a-entity>
				</a-scene>
			`;
		})();

		return () => {
			active = false;
			teardownAr(container);
		};
	});
</script>

<div bind:this={container} class="ar-viewer"></div>

<style>
	.ar-viewer {
		position: fixed;
		inset: 0;
		margin: 0;
		overflow: hidden;
		width: 100%;
		height: 100%;
		z-index: 0;
	}

	.ar-viewer :global(a-scene) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.ar-viewer :global(.a-canvas),
	.ar-viewer :global(video) {
		position: absolute !important;
		inset: 0 !important;
		width: 100% !important;
		height: 100% !important;
		object-fit: cover;
	}
</style>
