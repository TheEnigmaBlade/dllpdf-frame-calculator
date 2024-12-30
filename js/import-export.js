import {CartItem} from "./types.js";

/**
 * @param contents {string}
 * @returns {CartItem[]}
 */
export function importCsv(contents) {
	// Split the CSV into lines
	const lines = contents.trim().split('\n');
	
	// Check if the first row starts with '!' and remove it if true
	const rows = lines[0].startsWith('!') ? lines.slice(1) : lines;
	
	return rows.map((row) => {
		// Split each row by comma
		const [name, type, lengthStr, holesStr, quantityStr] = row.split(',');
		if (!type || lengthStr == null) {
			console.error(`Invalid CSV format: ${row}`);
			throw new Error('Invalid CSV format: missing type or length');
		}
		
		// Parse 'length' and 'quantity' as integers
		const length = parseInt(lengthStr || "0", 10);
		const quantity = parseInt(quantityStr || "0", 10);
		
		// Reconstruct the 'holes' object (if present)
		let holes = undefined;
		if (holesStr) {
			holes = {};
			const holeEntries = holesStr.split(';');
			for (let holeEntry of holeEntries) {
				const [key, value] = holeEntry.split('=');
				if (key && value) {
					const side = key.slice(0, -1); // Extract side (e.g., side1)
					const row = key.slice(-1);     // Extract row index (e.g., 1)
					
					// Ensure nested objects exist
					if (!holes[side]) {
						holes[side] = {};
					}
					
					// Split the value into an array of integers
					holes[side][row] = value.split('-').map(Number);
				}
			}
		}
		
		// Return a new CartItem instance
		return new CartItem({
			name: name || undefined,
			type,
			length,
			holes,
			quantity
		});
	});
}

/**
 * @param items {CartItem[]}
 * @return {string}
 */
export function exportCsv(items) {
	let contents = "!Name,Type,Length,Holes,Quantity\n";
	for (let item of items) {
		let holesStr = "";
		// Check if the item has holes and process them if present
		if (item.holes) {
			// Process each side (outer keys)
			const rows = Object.entries(item.holes).map(([sideKey, innerObj]) => {
				// Process each row (inner keys)
				return Object.entries(innerObj)
					.map(([rowIndex, holesArray]) =>
						`${sideKey}${rowIndex}=${holesArray.join('-')}`
					)
					.join(';'); // Join rows for a specific side with ;
			});
			// Join the rows for all sides with ;
			holesStr = rows.join(';');
		}
		contents += `${item.name || ""},${item.type},${item.length},${holesStr},${item.quantity}\n`;
	}
	return contents;
}

