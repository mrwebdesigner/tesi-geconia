import dati from './dati.json';

const svgs = import.meta.glob<string>('./*/casella.svg', {
	eager: true,
	query: '?url',
	import: 'default'
});

const minds = import.meta.glob<string>('./*/targets.mind', {
	eager: true,
	query: '?url',
	import: 'default'
});

const overlays = {
	...import.meta.glob<string>('./*/immagine-comparsa.png', {
		eager: true,
		query: '?url',
		import: 'default'
	}),
	...import.meta.glob<string>('./*/immagine-comparsa.jpg', {
		eager: true,
		query: '?url',
		import: 'default'
	})
};

export type Casella = {
	id: string;
	svgUrl: string;
	colore: string;
	mappa: string;
	mappaEmbed: string;
	targetsUrl?: string;
	overlayUrl?: string;
	hasAr: boolean;
};

function parseId(path: string): string {
	const match = path.match(/\.\/(\d+)\//);
	if (!match) throw new Error(`Invalid casella path: ${path}`);
	return match[1];
}

function buildCaselle(): Casella[] {
	const ids = new Set<string>();

	for (const path of Object.keys(svgs)) {
		ids.add(parseId(path));
	}

	return [...ids]
		.sort((a, b) => Number(a) - Number(b))
		.map((id) => {
			const svgPath = `./${id}/casella.svg`;
			const mindPath = `./${id}/targets.mind`;
			const overlayPath =
				`./${id}/immagine-comparsa.png` in overlays
					? `./${id}/immagine-comparsa.png`
					: `./${id}/immagine-comparsa.jpg`;

			const targetsUrl = minds[mindPath];
			const overlayUrl = overlays[overlayPath];
			const hasAr = Boolean(targetsUrl && overlayUrl);

			const meta = dati[id as keyof typeof dati];

			return {
				id,
				svgUrl: svgs[svgPath],
				colore: meta.colore,
				mappa: meta.mappa,
				mappaEmbed: meta.mappaEmbed,
				targetsUrl: hasAr ? targetsUrl : undefined,
				overlayUrl: hasAr ? overlayUrl : undefined,
				hasAr
			};
		});
}

const caselle = buildCaselle();

export function getAllCaselle(): Casella[] {
	return caselle;
}

export function getArCaselle(): Casella[] {
	return caselle.filter((c) => c.hasAr);
}

export function getCasella(id: string): Casella | undefined {
	return caselle.find((c) => c.id === id);
}
