import {compile} from "ejs";
import {ExtrusionTypes} from "./rates.js";

/**
 * @param elem {HTMLElement}
 */
export function initExtrusionEditor(elem) {
	initEvents(elem);
	
	// Set default extrusion type
	let selectElem = elem.getElementsByClassName("extrusion-type-select")[0]; 
	selectElem.value = ExtrusionTypes.DLLPDF2020;
	selectElem.dispatchEvent(new Event("change"));
}

/**
 * @param elem {HTMLElement}
 */
export function getExtrusionState(elem) {
	let extrusionType = elem.getElementsByClassName("extrusion-type-select")[0].value;
	let extrusionLength = elem.getElementsByClassName("designer-width-input")[0].valueAsNumber;
	
	let extrusionHoles = {};
	for (let sideElem of elem.getElementsByClassName("designer-side")) {
		let sideIndex = sideElem.getAttribute("data-side");
		let slotIndex = sideElem.getAttribute("data-slot");
		console.debug(`side=${sideIndex}, slot=${slotIndex}`);
		if (!extrusionHoles.hasOwnProperty(sideIndex)) {
			extrusionHoles[sideIndex] = {};
		}
		
		let holesElem = sideElem.getElementsByClassName("designer-holes-editor")[0];
		let slotHoles = [];
		for (let holeElem of holesElem.getElementsByClassName("designer-hole")) {
			slotHoles.push(convertHolePosition(holeElem, holesElem, extrusionLength, 1));
		}
		
		extrusionHoles[sideIndex][slotIndex] = slotHoles;
	}
	
	return {
		type: extrusionType,
		length: extrusionLength,
		holes: extrusionHoles,
	};
}

//
// Extrusion type setting
//

import csDllpdf1515 from "/dllpdf1515-web.svg?raw";
import csDllpdf2020 from "/dllpdf2020-web.svg?raw";
import csDllpdf153030 from "/dllpdf153030-web.svg?raw";
import csMisumi2040 from "/dllpdf2040-web.svg?raw";
import csMisumi4040 from "/hfs5_4040-web.svg?raw";
import csMisumi404020 from "/hfs5_404020-web.svg?raw";

/**
 * @param {string} type
 */
function setExtrusionType(type) {
	// Update extrusion images
	switch (type) {
		case ExtrusionTypes.DLLPDF1515:   setTypeImages(csDllpdf1515); break;
		case ExtrusionTypes.DLLPDF2020:   setTypeImages(csDllpdf2020); break;
		case ExtrusionTypes.DLLPDF153030: setTypeImages(csDllpdf153030); break;
		case ExtrusionTypes.MISUMI2040:   setTypeImages(csMisumi2040); break;
		case ExtrusionTypes.MISUMI4040:   setTypeImages(csMisumi4040); break;
		case ExtrusionTypes.MISUMI2020:   setTypeImages(csDllpdf2020); break;
		case ExtrusionTypes.MISUMI404020: setTypeImages(csMisumi404020); break;
		default: console.error(`Unknown extrusion type ${type}`);
	}
	
	// Update hole editor
	switch (type) {
		case ExtrusionTypes.DLLPDF1515:
		case ExtrusionTypes.DLLPDF2020:
		case ExtrusionTypes.MISUMI2020:
			setHoleEditorType([1, 1]);
			break;
			
		case ExtrusionTypes.DLLPDF153030:
		case ExtrusionTypes.MISUMI4040:
		case ExtrusionTypes.MISUMI404020:
			setHoleEditorType([2, 2]);
			break;
		
		case ExtrusionTypes.MISUMI2040:
			setHoleEditorType([2, 1]);
			break;
			
		default: console.error(`Unknown extrusion type ${type}`);
	}
}

function setTypeImages(extrusionImg) {
	for (let elem of document.getElementsByClassName("extrusion-cross-section")) {
		elem.innerHTML = extrusionImg; 
	}
}

import editorTemplateRaw from "/views/hole_editor.ejs?raw";
const editorTemplate = compile(editorTemplateRaw);

/**
 * @param {number[]} editorLayout	Array of sides, where the value is the number of slots in that side.
 */
function setHoleEditorType(editorLayout) {
	console.debug(`Setting editor layout: ${editorLayout}`);
	
	// Clear parent
	let parent = document.getElementById("extrusion_designer_sides");
	parent.innerHTML = "";
	
	// Add each side to the parent
	let slotLabel = "A";
	for (let [sideIndex, slotCount] of editorLayout.entries()) {
		for (let slotIndex = 0; slotIndex < slotCount; slotIndex++) {
			let elem = document.createElement("div");
			elem.innerHTML = editorTemplate({
				sideIndex: sideIndex,
				maxSlots: slotCount,
				slotIndex: slotIndex,
				slotLabel: slotLabel,
			});
			
			elem = parent.appendChild(elem.children[0]);
			setHoleEditorClickable(elem);
			
			slotLabel = String.fromCharCode(slotLabel.charCodeAt(0) + 1);
		}
	}
}

//
// Functionality
//

/**
 * @param pos {number}
 * @param parent {HTMLElement|undefined}
 */
function addHole(pos, parent) {
	if (parent == null) {
		parent = document.getElementById("designer_holes_editor");
	}
	
	let holeElem = document.createElement("i");
	holeElem.className = "designer-hole";
	holeElem.style.left = `${pos}px`;
	holeElem.setAttribute("data-pos", pos.toString());
	
	parent.appendChild(holeElem);
	setHoleDraggable(holeElem);
}

function convertHolePosition(holeElem, parentElem, extrusionLength, fractionDigits) {
	let pxPos = parseInt(holeElem.getAttribute("data-pos"));
	let pxWidth = parentElem.getBoundingClientRect().width.toFixed(0) - 2;
	let mmPos = (pxPos / pxWidth) * extrusionLength;
	return mmPos.toFixed(fractionDigits || 0)
}

//
// UI Events
//

/**
 * @param parentElem {HTMLElement}
 */
function initEvents(parentElem) {
	// Extrusion type selection
	for (let elem of parentElem.getElementsByClassName("extrusion-type-select")) {
		elem.addEventListener("change", selectExtrusionChange);
	}
	// Reset button
	for (let elem of parentElem.getElementsByClassName("reset-frame-button")) {
		elem.addEventListener("click", resetFrameEvent);
	}
}

// Controls

/**
 * @param event {Event}
 */
function selectExtrusionChange(event) {
	event.preventDefault();
	let selectedType = event.target.value;
	console.debug(`Select extrusion event: ${selectedType}`);
	
	setExtrusionType(selectedType);
}

// Holes

/**
 * @param elem {HTMLElement}
 */
function setHoleEditorClickable(elem) {
	elem.onmousedown = editorMouseDown;
	
	/**
	 * @param e {MouseEvent}
	 */
	function editorMouseDown(e) {
		e.preventDefault();
		e.stopPropagation();
		
		// Ignore non-left click inputs
		if (e.button !== 0) {
			return;
		}
		
		let parentContainer = e.target.closest(".designer-holes-editor");
		let bounds = parentContainer.getBoundingClientRect();
		let relativePos = e.clientX - bounds.left;
		let newPos = Math.round(clampPosition(relativePos, bounds));
		addHole(newPos, parentContainer);
	}
}

/**
 * @param elem {HTMLElement}
 */
function setHoleDraggable(elem) {
	elem.onmousedown = dragMouseDown;
	
	let parentContainer = elem.closest(".designer-holes-editor");
	
	/**
	 * @param e {MouseEvent}
	 */
	function dragMouseDown(e) {
		e.preventDefault();
		e.stopPropagation();
		
		// Ignore non-left click inputs
		if (e.button !== 0) {
			return;
		}

		document.onmouseup = dragMouseUp;
		document.onmousemove = dragMouse;
	}
	
	/**
	 * @param _e {MouseEvent}
	 */
	function dragMouseUp(_e) {
		document.onmousemove = null;
		document.onmouseup = null;
	}
	
	/**
	 * @param e {DragEvent}
	 */
	function dragMouse(e) {
		e.preventDefault();
		
		// Ignore non-left click inputs
		if (e.button !== 0) {
			return;
		}
		
		let bounds = parentContainer.getBoundingClientRect();
		let relativePos = e.clientX - bounds.left;
		let newPos = Math.round(clampPosition(relativePos, bounds));
		//console.debug(`${newPos} [${e.clientX} -> ${relativePos}]`);
		
		elem.style.left = `${newPos}px`;
		elem.setAttribute("data-pos", newPos.toString());
	}
}

function clampPosition(pos, bounds) {
	return Math.max(0, Math.min(bounds.width - 2, pos));
}

function resetFrameEvent() {
	console.debug("Reset frame event");
	
}

