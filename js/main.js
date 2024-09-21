import "/css/reset.css";
import "/css/style.css";

import {initExtrusionEditor, getExtrusionState} from "./extrusion-designer.js";
import {CartItem, addCartItem, exportCartState} from "./frame-cart.js";

//
// Functionality
//

function addExtrusion() {
	const designerElem = document.getElementById("extrusion_designer");
	const designerState = getExtrusionState(designerElem);
	
	// Validate the state, ex. make sure a length was entered
	if (isNaN(designerState.length) || designerState.length <= 0) {
		return "Enter a length";
	}
	
	addCartItem(new CartItem(designerState));
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

/**
 * @param contents {string}
 */
function importCsv(contents) {
	// TODO
}

/**
 * @return {string}
 */
function exportCsv() {
	let contents = "!Name,Type,Length,Holes,Quantity\n";
	for (let item of exportCartState()) {
		let holesStr = "";
		contents += `${item.name || ""},${item.type},${item.length},${holesStr},${item.quantity}\n`;
	}
	return contents;
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
function addCopyFrameEvent(event) {
	console.debug("Add copy frame event");
	const err = addExtrusion();
	setError(event, err);
}

/**
 * @param event {Event}
 */
function importFrame(event) {
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
		importCsv(loadEvent.target.result);
	};
	reader.readAsText(filePath);
}

/**
 * @param _event {Event}
 */
function exportFrame(_event) {
	console.debug("Export frame event");
	const exportContents = exportCsv();
	document.getElementById("dev-state").value = exportContents;
	const now = new Date();
	
	let element = document.createElement("a");
	element.setAttribute("href", "data:text/plain;charset=utf8," + encodeURIComponent(exportContents));
	element.setAttribute("download", `dllpdf_frame_${now.toISOString()}.csv`);
	element.hidden = true;
	document.body.appendChild(element);
	
	element.click();
	
	document.body.removeChild(element);
}

function dumpState(_event) {
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
document.getElementById("frame-import-input").addEventListener("change", importFrame);
document.getElementById("frame-export").addEventListener("click", exportFrame);
