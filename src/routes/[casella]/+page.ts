import { getArCaselle, getCasella } from '$lib/caselle/caselle';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = true;

export function entries() {
	return getArCaselle().map((c) => ({ casella: c.id }));
}

export const load: PageLoad = ({ params }) => {
	const casella = getCasella(params.casella);

	if (!casella?.hasAr) {
		error(404, 'Casella non trovata');
	}

	return { casella };
};
