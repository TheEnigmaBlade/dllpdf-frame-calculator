import "/css/reset.css";
import "/css/style.css";

import {initExtrusionEditor} from "./extrusion-designer.js";
import {CartItem, addCartItem} from "./frame-cart.js";

initExtrusionEditor(document.getElementById("extrusion_designer"));

function addFrameEvent(elem) {
	console.debug("Add frame event");
	console.debug("New debug!");
	addCartItem(new CartItem({
		name: "Test name",
		type: "DLLPDF-2020",
		length: 300,
		quantity: 1,
		holes: {
			side1: [],
			side2: []
		}
	}));
}
function editFrameEvent(elem) {
	console.debug("Edit frame event");
	// TODO
}

document.getElementById("add-frame").addEventListener("click", addFrameEvent);
document.getElementById("edit-frame").addEventListener("click", editFrameEvent);
