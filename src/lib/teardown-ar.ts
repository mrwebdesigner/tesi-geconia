type MindarSystem = {
	stop?: () => void;
};

type AFrameScene = HTMLElement & {
	systems?: Record<string, MindarSystem>;
	destroy?: () => void;
};

const MINDAR_UI_SELECTORS = [
	'.mindar-ui-overlay',
	'.mindar-ui-scanning',
	'.mindar-ui-loading',
	'.mindar-ui-compat'
].join(', ');

function stopVideoTracks(video: HTMLVideoElement) {
	const stream = video.srcObject;
	if (stream instanceof MediaStream) {
		for (const track of stream.getTracks()) {
			track.stop();
		}
	}
	video.srcObject = null;
}

export function teardownAr(container: HTMLElement | undefined) {
	const sceneEl = container?.querySelector('a-scene') as AFrameScene | null;

	if (sceneEl?.systems?.['mindar-image-system']?.stop) {
		sceneEl.systems['mindar-image-system'].stop?.();
	}

	for (const video of document.querySelectorAll('video')) {
		stopVideoTracks(video);
	}

	for (const el of document.querySelectorAll(MINDAR_UI_SELECTORS)) {
		el.remove();
	}

	if (sceneEl?.destroy) {
		sceneEl.destroy();
	} else {
		sceneEl?.remove();
	}

	if (container) {
		container.innerHTML = '';
	}

	document.body.style.overflow = '';
}
