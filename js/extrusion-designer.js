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
	for (let designer of elem.getElementsByClassName("designer-side")) {
		let sideHoles = [];
		// TODO
		extrusionHoles[designer.getAttribute("data-side")] = sideHoles;
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
import csDllpdf1530 from "/dllpdf153030-web.svg?raw";
import csDllpdf2040 from "/dllpdf2040-web.svg?raw";

/**
 * @param {string} type
 */
function setExtrusionType(type) {
	let extrusionImg;
	switch (type) {
		case ExtrusionTypes.DLLPDF1515: extrusionImg = csDllpdf1515; break;
		case ExtrusionTypes.DLLPDF2020: extrusionImg = csDllpdf2020; break;
		case ExtrusionTypes.DLLPDF1530: extrusionImg = csDllpdf1530; break;
		case ExtrusionTypes.DLLPDF2040: extrusionImg = csDllpdf2040; break;
		default: console.error(`Unknown extrusion type ${type}`);
	}
	
	for (let elem of document.getElementsByClassName("extrusion-cross-section")) {
		elem.innerHTML = extrusionImg; 
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
	
	parent.appendChild(holeElem);
	setHoleDraggable(holeElem);
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
	// Set editors clickable
	for (let elem of parentElem.getElementsByClassName("designer-holes-editor")) {
		setHoleEditorClickable(elem);
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
		
		let parentContainer = elem.closest(".designer-holes-editor");
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
	 * @param e {MouseEvent}
	 */
	function dragMouseUp(e) {
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
	}
}

function clampPosition(pos, bounds) {
	return Math.max(0, Math.min(bounds.width - 2, pos));
}

function resetFrameEvent() {
	console.debug("Reset frame event");
	
}

