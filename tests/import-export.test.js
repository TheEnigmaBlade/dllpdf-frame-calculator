import test from 'ava';
import {exportCsv, importCsv} from "../js/import-export.js";
import {CartItem} from "../js/types.js";

// Tests

test('exportCsv correctly generates a CSV with multiple items', (t) => {
	const items = [
		new CartItem({
			name: "Frame A",
			type: "Type1",
			length: 200,
			holes: {
				side1: { 1: [1, 2, 3] },
				side2: { 2: [4, 5] },
			},
			quantity: 10,
		}),
		new CartItem({
			name: "Frame B",
			type: "Type2",
			length: 150,
			holes: undefined, // No holes
			quantity: 5,
		}),
		new CartItem({
			name: "",
			type: "Type3",
			length: 100,
			holes: {
				side1: { 1: [9], 2: [10] },
			},
			quantity: 2,
		}),
	];
	
	const result = exportCsv(items);
	const expected = `!Name,Type,Length,Holes,Quantity\n` +
		`Frame A,Type1,200,side11=1-2-3;side22=4-5,10\n` +
		`Frame B,Type2,150,,5\n` +
		`,Type3,100,side11=9;side12=10,2\n`;
	t.is(result, expected);
});

test('exportCsv handles empty cart state', (t) => {
	// Override exportCartState to simulate an empty cart
	const items = [];
	
	const result = exportCsv(items);
	const expected = "!Name,Type,Length,Holes,Quantity\n";
	
	t.is(result, expected);
});

test('exportCsv handles item with no holes', (t) => {
	// Override exportCartState to return an item with no holes
	const items = [
		new CartItem({
			name: "Frame C",
			type: "Type4",
			length: 300,
			holes: undefined,
			quantity: 7,
		}),
		new CartItem({
			name: "Frame D",
			type: "Type4",
			length: 300,
			holes: null,
			quantity: 8,
		}),
		new CartItem({
			name: "Frame E",
			type: "Type4",
			length: 300,
			holes: [],
			quantity: 9,
		}),
	];
	
	const result = exportCsv(items);
	const expected = "!Name,Type,Length,Holes,Quantity\n" +
		"Frame C,Type4,300,,7\n" +
		"Frame D,Type4,300,,8\n" +
		"Frame E,Type4,300,,9\n";
	
	t.is(result, expected);
});

test('exportCsv handles item with an empty name', (t) => {
	// Override exportCartState to return an item with an empty name
	const items = [
		new CartItem({
			name: "",
			type: "Type5",
			length: 400,
			holes: {
				side3: { 1: [6, 7, 8] },
			},
			quantity: 3,
		}),
	];
	
	const result = exportCsv(items);
	const expected = "!Name,Type,Length,Holes,Quantity\n" +
		",Type5,400,side31=6-7-8,3\n";
	
	t.is(result, expected);
});

//
// importCsv()
//

function normalizeCartItems(items, keysToIgnore = ['id']) {
	return items.map((item) => {
		const normalizedItem = { ...item }; // Create a shallow copy
		for (const key of keysToIgnore) {
			delete normalizedItem[key]; // Remove unwanted keys
		}
		return normalizedItem;
	});
}

test('importCsv correctly parses a CSV with multiple items', (t) => {
	const input = `!Name,Type,Length,Holes,Quantity
Frame A,Type1,200,side11=1-2-3;side22=4-5,10
Frame B,Type2,150,,5
,Type3,100,side11=9;side12=10,2`;
	
	const result = importCsv(input);
	
	const expected = [
		new CartItem({
			name: 'Frame A',
			type: 'Type1',
			length: 200,
			holes: {
				side1: { 1: [1, 2, 3] },
				side2: { 2: [4, 5] },
			},
			quantity: 10,
		}),
		new CartItem({
			name: 'Frame B',
			type: 'Type2',
			length: 150,
			holes: undefined,
			quantity: 5,
		}),
		new CartItem({
			name: undefined,
			type: 'Type3',
			length: 100,
			holes: {
				side1: { 1: [9], 2: [10] },
			},
			quantity: 2,
		}),
	];
	
	t.deepEqual(normalizeCartItems(result), normalizeCartItems(expected));
});

test('importCsv handles empty input correctly', (t) => {
	const input = "!Name,Type,Length,Holes,Quantity\n";
	const result = importCsv(input);
	t.deepEqual(result, []); // Expect an empty array as there’s no data
});

test('importCsv handles items with no holes', (t) => {
	const input = `!Name,Type,Length,Holes,Quantity
Frame A,Type1,200,,10
Frame B,Type2,150,,5`;
	
	const result = importCsv(input);
	
	const expected = [
		new CartItem({
			name: 'Frame A',
			type: 'Type1',
			length: 200,
			holes: undefined, // No holes
			quantity: 10,
		}),
		new CartItem({
			name: 'Frame B',
			type: 'Type2',
			length: 150,
			holes: undefined, // No holes
			quantity: 5,
		}),
	];
	
	t.deepEqual(normalizeCartItems(result), normalizeCartItems(expected));
});

test('importCsv handles items with special holes structure', (t) => {
	const input = `!Name,Type,Length,Holes,Quantity
Frame A,Type1,200,side11=1;side22=,10`;
	
	const result = importCsv(input);
	
	const expected = [
		new CartItem({
			name: 'Frame A',
			type: 'Type1',
			length: 200,
			holes: {
				side1: { 1: [1] }
			},
			quantity: 10,
		}),
	];
	
	t.deepEqual(normalizeCartItems(result), normalizeCartItems(expected));
});

test('importCsv handles CSV without a header', (t) => {
	const input = `Frame A,Type1,200,side11=1-2-3;side22=4-5,10
Frame B,Type2,150,,5`;
	
	const result = importCsv(input);
	
	const expected = [
		new CartItem({
			name: 'Frame A',
			type: 'Type1',
			length: 200,
			holes: {
				side1: { 1: [1, 2, 3] },
				side2: { 2: [4, 5] },
			},
			quantity: 10,
		}),
		new CartItem({
			name: 'Frame B',
			type: 'Type2',
			length: 150,
			holes: undefined,
			quantity: 5,
		}),
	];
	
	t.deepEqual(normalizeCartItems(result), normalizeCartItems(expected));
});

test('importCsv throws when rows are malformed', (t) => {
	const input = `!Name,Type,Length,Holes,Quantity
Frame A,Type1,200,side11=1-2-3,10
MalformedRow`; // Missing columns
	
	const error = t.throws(() => {
		importCsv(input);
	}, {instanceOf: Error});
	
	t.is(error.message, "Invalid CSV format: missing type or length");
});
