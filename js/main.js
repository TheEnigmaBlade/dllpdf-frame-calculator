import "/css/reset.css";
import "/css/style.css";

import {getExtrusionState, initExtrusionEditor} from "./extrusion-designer.js";
import {addCartItem, editCartItem, exportCartState, importCartState} from "./frame-cart.js";
import {exportCsv, importCsv} from "./import-export.js";
import {CartItem} from "./types.js";

//
// Functionality
//

function addExtrusion() {
	const designerState = getExtrusionState();
	
	// Validate the state, ex. make sure a length was entered
	if (isNaN(designerState.length) || designerState.length <= 0) {
		return "Enter a length";
	}
	
	addCartItem(new CartItem(designerState));
	
	// Update UI
	document.getElementById("save-edit").disabled = true;
	
	return null;
}

function editExtrusion() {
	const designerState = getExtrusionState(false);
	
	// Validate the state, ex. make sure a length was entered
	if (isNaN(designerState.length) || designerState.length <= 0) {
		return "Enter a length";
	}
	
	editCartItem(new CartItem(designerState));
	return null;
}

/**
 * @param event {Event}
 * @param error {string}
 */
function setError(event, error) {
	let errorElem = event.target.closest(".designer-controls").getElementsByClassName("control-error")[0];
	errorElem.textContent = error;
}

//
// UI events
//

/**
 * @param event {Event}
 */
function addFrameEvent(event) {
	console.debug("Add frame event");
	const err = addExtrusion();
	setError(event, err);
}

/**
 * @param event {Event}
 */
function saveEditEvent(event) {
	console.debug("Save edit event");
	const err = editExtrusion();
	setError(event, err);
}

function dumpDesignerState(_event) {
	console.debug("Dumping designer state");
	const designerState = getExtrusionState();
	document.getElementById("dev-state").value = JSON.stringify(designerState, null, 2);
}

/**
 * @param event {Event}
 */
export function importFrame(event) {
	console.debug("Import frame event");
	let filePath = event.target.files[0];
	if (!filePath) {
		console.debug("No file selected");
		return;
	}
	
	let reader = new FileReader();
	reader.onload = function (loadEvent) {
		console.info("Loaded file for import");
		document.getElementById("dev-state").value = loadEvent.target.result;
		try {
			importCartState(importCsv(loadEvent.target.result));
		}
		catch (e) {
			console.error("Error importing CSV", e);
		}
		console.debug("Import complete");
	};
	reader.readAsText(filePath);
}

/**
 * @param _event {Event}
 */
export function exportFrame(_event) {
	console.debug("Export frame event");
	const exportContents = exportCsv(exportCartState());
	let devElem = document.getElementById("dev-state");
	devElem.value = exportContents;
	const now = new Date();
	
	let element = document.createElement("a");
	element.setAttribute("href", "data:text/plain;charset=utf8," + encodeURIComponent(exportContents));
	element.setAttribute("download", `dllpdf_frame_${now.toISOString()}.csv`);
	element.hidden = true;
	document.body.appendChild(element);
	
	element.click();
	
	document.body.removeChild(element);
}

export function dumpCartCsv(_event) {
	console.debug("Dumping cart CSV");
	document.getElementById("dev-state").value = exportCsv(exportCartState());
}

//
// Initialization
//

initExtrusionEditor(document.getElementById("extrusion_designer"));
document.getElementById("add-frame").addEventListener("click", addFrameEvent);
document.getElementById("save-edit").addEventListener("click", saveEditEvent);
document.getElementById("dump-state").addEventListener("click", dumpDesignerState);
document.getElementById("dump-csv").addEventListener("click", dumpCartCsv);
document.getElementById("frame-import-input").addEventListener("change", importFrame);
document.getElementById("frame-export").addEventListener("click", exportFrame);
