export const ExtrusionTypes = {
	DLLPDF1515: "DLLPDF-1515",
	DLLPDF2020: "DLLPDF-2020",
	DLLPDF1530: "DLLPDF-153030",
	MISUMI2040: "Misumi-2040",
	MISUMI4040: "Misumi-4040",
	MISUMI2020: "Misumi-2020",
}

const rateTable = [
    { type: ExtrusionTypes.DLLPDF1515, rate: 0.0048, labor: 1 },
    { type: ExtrusionTypes.DLLPDF2020, rate: 0.0156, labor: 1 },
    { type: ExtrusionTypes.DLLPDF1530, rate: 0.0222, labor: 4 },
    { type: ExtrusionTypes.MISUMI2040, rate: 0.0252, labor: 2 },
    { type: ExtrusionTypes.MISUMI4040, rate: 0.0330, labor: 4 },
    { type: ExtrusionTypes.MISUMI2020, rate: 0.0192, labor: 1 }
];
const laborAdj = 150/60;

/**
 * @param {string} type
 * @param {int} length
 * @param {{side1: [int], side2: [int]}} holes
 * @returns {number}
 */
export function calcExtrusionCost(type, length, holes) {
	// Get rate
	let rateEntry = rateTable.find(value => value.type === type);
	if (rateEntry == null) {
		console.warn(`Unknown extrusion type in calcExtrusion: ${type}`);
		return 0;
	}
	const numHoles = (holes.side1?.length || 0) + (holes.side2?.length || 0);
	return (rateEntry.rate * length) + (numHoles * rateEntry.labor * laborAdj);
}
