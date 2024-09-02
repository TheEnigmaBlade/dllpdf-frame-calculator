export const ExtrusionTypes = {
	DLLPDF1515: "DLLPDF-1515",
	DLLPDF2020: "DLLPDF-2020",
	DLLPDF1530: "DLLPDF-153030",
	DLLPDF2040: "DLLPDF-2040",
}

const rateTable = new Map([
	[ExtrusionTypes.DLLPDF1515, 0.02],
	[ExtrusionTypes.DLLPDF2020, 0.03],
	[ExtrusionTypes.DLLPDF1530, 0.06],
	[ExtrusionTypes.DLLPDF2040, 0.07],
]);
const holeRate = 1.0;

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
