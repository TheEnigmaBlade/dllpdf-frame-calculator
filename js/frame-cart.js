import {compile} from "ejs";
import {CartItem} from "./types.js";
import {setExtrusionState} from "./extrusion-designer.js";

import cartItemTemplateRaw from "/views/frame_cart_item.ejs?raw";
import holePopupTemplateRaw from "/views/frame_cart_hole_popup.ejs?raw";
const cartItemTemplate = compile(cartItemTemplateRaw);
const holePopupTemplate = compile(holePopupTemplateRaw);

/**
 * @return {CartItem[]}
 */
export function exportCartState() {
	let cartElem = document.getElementById("frame-cart");
	let items = [];
	for (let itemElem of cartElem.getElementsByClassName("frame-cart-item")) {
		items.push(new CartItem(JSON.parse(itemElem.getAttribute("data-specs"))));
	}
	return items;
}

/**
 * @param items {CartItem[]}
 */
export function importCartState(items) {
	for (let itemData of items) {
		addCartItem(itemData, false);
	}
	addCartItem(undefined, true);
}


/**
 * @param itemData {CartItem}
 * @param refresh {boolean}
 */
export function addCartItem(itemData, refresh = true) {
	// itemData is optional for the sole reason of allowing this function to be called to perform global cart updates
	if (itemData) {
		// Create row element
		let itemElem = document.createElement("div");
		itemElem.innerHTML = cartItemTemplate({
			item: itemData,
			data: JSON.stringify(itemData),
		});
		itemElem = itemElem.children[0];
		itemElem.querySelector(".item-holes-dialog").innerHTML = holePopupTemplate({ holes: itemData.holes, formatSideSlotKey });
		
		let cart = document.getElementById("frame-cart");
		cart.appendChild(itemElem);
		
		// Update money values
		refreshItem(itemElem, itemData);
		setItemEvents(itemElem);
	}
	
	if (refresh) {
		refreshCart();
	}
}

export function editCartItem(itemData) {
	let cartElem = document.getElementById("frame-cart");
	
	// Find the existing item by matching data-specs
	let itemElem = cartElem.querySelector(`.frame-cart-item[data-id="${itemData.id}"]`);
	if (itemElem) {
		// Retrieve the quantity from the cart listing, as it may have been user-edited prior to saving
		const oldData = JSON.parse(itemElem.getAttribute("data-specs"));
		itemData.quantity = oldData.quantity;
		
		// Update cart UI with modified values
		itemElem.setAttribute("data-specs", JSON.stringify(itemData));
		itemElem.querySelector(".item-length").textContent = `${itemData.length} mm`;
		itemElem.querySelector(".item-holes .value").textContent = `${itemData.holeCount}`;
		itemElem.querySelector(".item-holes-dialog").innerHTML = holePopupTemplate({ holes: itemData.holes, formatSideSlotKey });

		// Update money values
		refreshItem(itemElem, itemData);
	}
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
	itemElem.querySelector(".item-unit-cost").textContent = formatMoney(itemData.unitCost);
	itemElem.querySelector(".item-total-cost").textContent = formatMoney(itemData.totalCost);
}

function refreshCart() {
	console.debug("Refresh cart");
	
	// Calculate cart total
	const cartElem = document.getElementById("frame-cart");
	let cartCost = 0;
	let cartCount = 0;
	for (let itemElem of cartElem.getElementsByClassName("frame-cart-item")) {
		let data = new CartItem(JSON.parse(itemElem.getAttribute("data-specs")));
		cartCost += data.totalCost;
		cartCount += data.quantity;
	}
	console.debug(`  cartTotal = ${cartCost}`);
	
	// Update cart total element
	const costElem = document.getElementById("frame-cart-cost");
	const countElem = document.getElementById("frame-cart-count");
	costElem.textContent = formatMoney(cartCost);
	countElem.textContent = cartCount.toString();
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
	
	const elem = event.target.closest(".frame-cart-item");
	const item = new CartItem(JSON.parse(elem.getAttribute("data-specs")));
	setExtrusionState(item);
	
	// Update UI
	document.getElementById("save-edit").disabled = false;
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

// Misc. utilities

/**
 * @param money {number}
 */
function formatMoney(money) {
	return money.toLocaleString("en-EN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

/**
 * @param side {string} Should be a single numeric digit, 0-9, as a string.
 * @param slot {string} Should be a single numeric digit, 0-9, as a string.
 * @returns {string}
 */
function formatSideSlotKey(side, slot) {
	side = (parseInt(side) + 10).toString(36).toUpperCase();
	slot = (parseInt(slot) + 1).toString();
	return `${side}${slot}`;
}
