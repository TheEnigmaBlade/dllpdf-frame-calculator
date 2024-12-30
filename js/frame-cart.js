import {compile} from "ejs";
import cartItemTemplateRaw from "/views/frame_cart_item.ejs?raw";
import {CartItem} from "./types.js";
import {setExtrusionState} from "./extrusion-designer.js";

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

const cartItemTemplate = compile(cartItemTemplateRaw);

/**
 * @param itemData {CartItem}
 * @param refresh {boolean}
 */
export function addCartItem(itemData, refresh = true) {
	// itemData is optional for the sole reason of allowing this function to be called to perform global cart updates
	if (itemData) {
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
		itemElem.setAttribute("data-specs", JSON.stringify(itemData));
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
	itemElem.getElementsByClassName("col-4")[0].textContent = itemData.unitCost.toLocaleString("en-EN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
	itemElem.getElementsByClassName("col-6")[0].textContent = itemData.totalCost.toLocaleString("en-EN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
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
	costElem.textContent = cartCost.toLocaleString("en-EN", {minimumFractionDigits: 2, maximumFractionDigits: 2});
	countElem.textContent = cartCount.toLocaleString("en-EN");
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
