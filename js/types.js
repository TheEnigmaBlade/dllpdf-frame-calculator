import {calcExtrusionCost} from "./rates.js";


/**
 * @typedef {Object} DesignerState
 * @property {string} [id] - The unique identifier (UUID).
 * @property {string} [name] - The name of the item, optional.
 * @property {string} type - The type of the item.
 * @property {number} length - The length of the item.
 * @property {number} [quantity] - The quantity of the item.
 * @property {Object<string, Object<string, Array<number>>>} holes - An object describing holes with nested structure.
 */

/**
 * 
 */
export class CartItem {
	constructor(rawItem) {
		/** @type string */
		this.id = rawItem.id || crypto.randomUUID();
		/** @type string|undefined */
		this.name = rawItem.name;
		/** @type string */
		this.type = rawItem.type;
		/** @type int */
		this.length = rawItem.length;
		/** @type int */
		this.quantity = rawItem.quantity || 1;
		/** @type {{string: {string: [int]}}} */
		this.holes = rawItem.holes;
	}
	
	get holeCount() {
		return Object.values(this.holes).reduce((acc, innerObj) => {
			return acc + Object.values(innerObj).reduce((innerAcc, arr) => innerAcc + arr.length, 0);
		}, 0);
	}
	
	/**
	 * @returns {number}
	 */
	get unitCost() {
		return calcExtrusionCost(this.type, this.length, this.holes);
	}
	
	/**
	 * @returns {number}
	 */
	get totalCost() {
		return this.unitCost * this.quantity;
	}
}
