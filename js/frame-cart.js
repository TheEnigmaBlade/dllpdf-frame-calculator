import {compile} from "ejs";
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

// const cartItemTemplate = compile('\
// 	<div class="frame-cart-item row" data-id="<%= item.id %>" data-specs="<%= data %>">\
// 	  <span class="col col-0">\
// 	  	<button class="cart-item-button delete-button"><img src="trash.svg" alt="Delete" width="18" height="18"/></button> \
// 	  	<button class="cart-item-button edit-button"><img src="pencil.svg" alt="Edit" width="18" height="18"/></button>\
// 	  </span> \
// 	  <span class="col col-1"><input class="name-input" type="text" value="<%= item.name %>" /></span>\
// 	  <span class="col col-2"><%= item.type %></span>\
// 	  <span class="col col-3"><%= item.length %> mm</span>\
// 	  <span class="col col-4"></span>\
// 	  <span class="col col-5"><input class="quantity-input" type="number" min="1" max="99" value="<%= item.quantity %>"/></span>\
// 	  <span class="col col-6"></span>\
// 	</div>');

import cartItemTemplateRaw from "/views/frame_cart_item.ejs?raw";
const cartItemTemplate = compile(cartItemTemplateRaw);

/**
 * @param itemData {CartItem}
 */
export function addCartItem(itemData) {
	// Create row element
	let elem = document.createElement("div");
	elem.innerHTML = cartItemTemplate({
		item: itemData,
		data: JSON.stringify(itemData),
	});
	elem = elem.children[0];
	
	let cart = document.getElementById("frame-cart");
	cart.appendChild(elem);
	refreshItem(elem, itemData);
	setItemEvents(elem);
	
	refreshCart();
}

/**
 * @param {HTMLElement} itemElem
 */
function setItemEvents(itemElem) {
	itemElem.getElementsByClassName("delete-button")[0].addEventListener("click", deleteItemEvent);
	itemElem.getElementsByClassName("edit-button")[0].addEventListener("click", editItemEvent);
	itemElem.getElementsByClassName("name-input")[0].addEventListener("change", changeNameEvent);
	itemElem.getElementsByClassName("quantity-input")[0].addEventListener("change", changeQuantityEvent);
}

function refreshItem(itemElem, itemData) {
	console.debug("Refresh item");
	console.debug(itemData);
	console.debug(`  unitCost = ${itemData.unitCost}`);
	console.debug(`  totalCost = ${itemData.totalCost}`);
	itemElem.getElementsByClassName("col-4")[0].textContent = itemData.unitCost.toLocaleString("en-EN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
	itemElem.getElementsByClassName("col-6")[0].textContent = itemData.totalCost.toLocaleString("en-EN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function refreshCart() {
	console.debug("Refresh cart");
	
	// Calculate cart total
	const cartElem = document.getElementById("frame-cart");
	let cartTotal = 0;
	for (let itemElem of cartElem.getElementsByClassName("frame-cart-item")) {
		let data = new CartItem(JSON.parse(itemElem.getAttribute("data-specs")));
		cartTotal += data.totalCost;
	}
	console.debug(`  cartTotal = ${cartTotal}`);
	
	// Update cart total element
	const totalElem = document.getElementById("frame-cart-total");
	totalElem.textContent = cartTotal.toLocaleString("en-EN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

// UI events

/**
 * @param {Event} event
 */
function deleteItemEvent(event) {
	console.debug(`Delete item event: id=${event.target["data-id"]}`);
	event.preventDefault();
	event.target.closest(".frame-cart-item").remove();
	refreshCart();
}

/**
 * @param {Event} event
 */
function editItemEvent(event) {
	console.debug("Edit item event");
	event.preventDefault();
	
	let elem = event.target.closest(".frame-cart-item");
	// TODO
	
	refreshCart();
}

/**
 * @param {Event} event
 */
function changeNameEvent(event) {
	console.debug("Change name event");
	event.preventDefault();
	
	let elem = event.target.closest(".frame-cart-item");
	let data = JSON.parse(elem.getAttribute("data-specs"));
	
	// Update data
	data.name = event.target.value || "";
	console.debug(`  new name = "${data.name}"`);
	
	elem.setAttribute("data-specs", JSON.stringify(data));
	refreshCart();
}

/**
 * @param {Event} event
 */
function changeQuantityEvent(event) {
	console.debug("Change quantity event");
	event.preventDefault();
	
	let elem = event.target.closest(".frame-cart-item");
	let data = JSON.parse(elem.getAttribute("data-specs"));
	
	data.quantity = Math.max(1, event.target.value || 0);
	console.debug(`  new quantity = ${data.quantity}`);
	refreshItem(elem, new CartItem(data));
	
	elem.setAttribute("data-specs", JSON.stringify(data));
	refreshCart();
}
