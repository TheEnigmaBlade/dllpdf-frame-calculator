import "/css/reset.css";
import "/css/style.css";

import {initExtrusionEditor, getExtrusionState} from "./extrusion-designer.js";
import {CartItem, addCartItem} from "./frame-cart.js";

//
// Functionality
//

function addExtrusion() {
	const designerElem = document.getElementById("extrusion_designer");
	const designerState = getExtrusionState(designerElem);
	
	// Validate the state, ex. make sure a length was entered
	if (isNaN(designerState.length) || designerState.length <= 0) {
		// TODO: report error
		return;
	}
	
	addCartItem(new CartItem(designerState));
}

//
// UI events
//

/**
 * @param event {Event}
 */
function addFrameEvent(event) {
	console.debug("Add frame event");
	addExtrusion();
}

/**
 * @param event {Event}
 */
function addCopyFrameEvent(event) {
	console.debug("Add copy frame event");
	addExtrusion();
}

function dumpState(event) {
	console.debug("Dumping state");
	const designerState = getExtrusionState(document.getElementById("extrusion_designer"));
	document.getElementById("dev-state").value = JSON.stringify(designerState, null, 2);
}

//
// Initialization
//

initExtrusionEditor(document.getElementById("extrusion_designer"));
document.getElementById("add-frame").addEventListener("click", addFrameEvent);
document.getElementById("add-copy-frame").addEventListener("click", addCopyFrameEvent);
document.getElementById("dump-state").addEventListener("click", dumpState);
