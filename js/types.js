import {calcExtrusionCost} from "./rates.js";

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
