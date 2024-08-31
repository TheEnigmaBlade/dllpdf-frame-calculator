export const ExtrusionTypes = {
	DLLPDF2020: "DLLPDF-2020",
	Misumi2020: "Misumi-2020",
}

const rateTable = new Map([
	[ExtrusionTypes.DLLPDF2020, 0.03],
	[ExtrusionTypes.DLLPDF2020, 0.05],
]);
const holeRate = 0.5;

/**
 * @param {string} type
 * @param {int} length
 * @param {{side1: [int], side2: [int]}} holes
 * @returns {number}
 */
export function calcExtrusionCost(type, length, holes) {
	if (!rateTable.has(type)) {
		console.warn(`Unknown extrusion type in calcExtrusion: ${type}`);
		return 0;
	}
	const numHoles = (holes.side1?.length || 0) + (holes.side2?.length || 0);
	return (rateTable.get(type) * length) + (numHoles * holeRate);
}
