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
 * 
 * @param onlyChanged
 * @returns {DesignerState}
 */
export function getExtrusionState(onlyChanged = true) {
	const elem = document.getElementById("extrusion_designer");
	let prevState = {};
	if (!onlyChanged) {
		prevState = JSON.parse(elem.getAttribute("data-prev-state") || "{}");
	}
	
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
			slotHoles.push(getHolePositionMM(holeElem).toFixed(1));
		}
		slotHoles.sort();
		
		extrusionHoles[sideIndex][slotIndex] = slotHoles;
	}
	
	return {
		...prevState,
		type: extrusionType,
		length: extrusionLength,
		holes: extrusionHoles,
	};
}

/**
 * @param extrusionData {CartItem}
 */
export function setExtrusionState(extrusionData) {
	const elem = document.getElementById("extrusion_designer");
	elem.setAttribute("data-prev-state", JSON.stringify(extrusionData));
	
    // Set extrusion type
    const extrusionTypeSelect = elem.getElementsByClassName("extrusion-type-select")[0];
    extrusionTypeSelect.value = extrusionData.type;
    extrusionTypeSelect.dispatchEvent(new Event("change"));

    // Set extrusion length
    const extrusionLengthInput = elem.getElementsByClassName("designer-width-input")[0];
    extrusionLengthInput.value = extrusionData.length;
    extrusionLengthInput.dispatchEvent(new Event("change"));

    // Set holes
    for (const [sideIndex, slots] of Object.entries(extrusionData.holes)) {
        for (const [slotIndex, holePositions] of Object.entries(slots)) {
			const sideElem = elem.querySelector(`.designer-side[data-side="${sideIndex}"][data-slot="${slotIndex}"]`);
			
			// If the side element is not found, log a warning and skip to the next iteration.
			if (!sideElem) {
				console.warn(`Side element not found for sideIndex=${sideIndex}, slotIndex=${slotIndex}. Skipping...`);
				continue;
			}
        	
            const slotElem = sideElem.querySelector(`.designer-holes-editor`);
            
            // Clear existing holes before setting new ones
            slotElem.innerHTML = "";
            holePositions.forEach(position => {
                addHole(slotElem, { mmPos: parseFloat(position) });
            });
        }
    }
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
		case ExtrusionTypes.DLLPDF1515:
			setTypeImages(csDllpdf1515, [
				{id: "A", x: 45.5, y: 9},
				{id: "B", x: 92, y: 54.5},
			], 15);
			break;
		case ExtrusionTypes.DLLPDF2020:
			setTypeImages(csDllpdf2020, [
				{id: "A", x: 12, y: 2},
				{id: "B", x: 24.5, y: 14.5},
			]);
			break;
		case ExtrusionTypes.DLLPDF153030:
			setTypeImages(csDllpdf153030, [
				{id: "A", x: 5.6, y: 1.2},
				{id: "B", x: 18.8, y: 1.2},
				{id: "C", x: 26, y: 7.8},
				{id: "D", x: 26, y: 21},
			], 3);
			break;
		case ExtrusionTypes.MISUMI2040:
			setTypeImages(csMisumi2040, [
				{id: "A", x: 12, y: 2},
				{id: "B", x: 24.5, y: 14.5},
				{id: "C", x: 24.5, y: 41},
			]);
			break;
		case ExtrusionTypes.MISUMI4040:
			setTypeImages(csMisumi4040, [
				{id: "A", x: 21, y: 6},
				{id: "B", x: 71, y: 6},
				{id: "C", x: 95, y: 29},
				{id: "D", x: 95, y: 79},
			], 12);
			break;
		case ExtrusionTypes.MISUMI2020:
			setTypeImages(csDllpdf2020, [
				{id: "A", x: 12, y: 2},
				{id: "B", x: 24.5, y: 14.5},
			]);
			break;
		case ExtrusionTypes.MISUMI404020:
			setTypeImages(csMisumi404020, [
				{id: "A", x: 21, y: 5},
				{id: "B", x: 71, y: 55},
				{id: "C", x: 45, y: 29},
				{id: "D", x: 95, y: 79},
			], 12);
			break;
		default: console.error(`Unknown extrusion type ${type}`);
	}
	
	// Update hole editor
	switch (type) {
		case ExtrusionTypes.DLLPDF1515:
			setHoleEditorType([1, 1], 15);
			break;
		case ExtrusionTypes.DLLPDF2020:
		case ExtrusionTypes.MISUMI2020:
			setHoleEditorType([1, 1], 20);
			break;
			
		case ExtrusionTypes.DLLPDF153030:
			setHoleEditorType([2, 2], 15);
		case ExtrusionTypes.MISUMI4040:
		case ExtrusionTypes.MISUMI404020:
			setHoleEditorType([2, 2], 20);
			break;
		
		case ExtrusionTypes.MISUMI2040:
			setHoleEditorType([1, 2], 20);
			break;
			
		default: console.error(`Unknown extrusion type ${type}`);
	}
}

function setTypeImages(extrusionImg, labels, fontSize = 4) {
    for (let elem of document.getElementsByClassName("extrusion-cross-section")) {
        let svgWrapper = document.createElement("div");
        svgWrapper.innerHTML = extrusionImg;

        // Get the SVG element
        let svgElement = svgWrapper.querySelector("svg");
        if (!svgElement) {
            console.error("SVG not found in the provided extrusion image");
            continue;
        }

        // Add labels dynamically
        labels.forEach(label => {
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", label.x);
            text.setAttribute("y", label.y);
			text.setAttribute("class", "label");
			text.setAttribute("font-size", fontSize.toString());
            text.textContent = label.id;

            // Append text to the SVG
            svgElement.appendChild(text);
        });

        // Replace the inner HTML of the cross-section with updated SVG
        elem.innerHTML = "";
        elem.appendChild(svgElement);
    }
}

import editorTemplateRaw from "/views/hole_editor.ejs?raw";
const editorTemplate = compile(editorTemplateRaw);

/**
 * @param {number[]} editorLayout	Array of sides, where the value is the number of slots in that side.
 * @param extrusionSize {int}
 */
function setHoleEditorType(editorLayout, extrusionSize) {
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
				extrusionSize: extrusionSize,
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
 * @type {HTMLElement|undefined}
 */
let selectedHole = undefined;

import holeTemplateRaw from "/views/hole.ejs?raw";
const holeTemplate = compile(holeTemplateRaw);

/**
 * @param parent {HTMLElement|undefined}
 * @param [opt] {Object}
 * @param [opt.mmPos] {number}
 * @param [opt.pxPos] {number}
 * @param [opt.type] {string}
 */
function addHole(parent, opt = {}) {
	if (!opt.hasOwnProperty("mmPos") && !opt.hasOwnProperty("pxPos")) {
		console.error("Missing position parameter: mmPos or pxPos must be specified in opt");
	}
	
	if (parent == null) {
		console.error("Parent element not provided to addHole");
		throw Error("Parent element not provided to addHole");
	}
	console.debug(`Adding hole to parent ${parent.className} with options: ${JSON.stringify(opt, null, 2)}`);
	
	let holeElem = document.createElement("div");
	holeElem.innerHTML = holeTemplate({});
	holeElem = parent.appendChild(holeElem.children[0]);
	parent.appendChild(holeElem);
	
	updateHole(holeElem, parent, opt);
	setHoleDraggable(holeElem);
	setHoleClickable(holeElem);
	setHoleEditable(holeElem);
}

/**
 * @param holeElem {HTMLElement}
 * @param parentElem {HTMLElement}
 * @param [opt] {Object}
 * @param [opt.mmPos] {number}
 * @param [opt.pxPos] {number}
 * @param [opt.type] {string}
 */
function updateHole(holeElem, parentElem, opt) {
	// Validate options
	if (opt && opt.hasOwnProperty("mmPos") && opt.hasOwnProperty("pxPos")) {
		console.warn("Both mmPos and pxPos are specified in opt. Ignoring pxPos.");
		delete opt.pxPos;
	}
	
	// Set hole type
	if (opt && opt.hasOwnProperty("type") && opt.type != null) {
		holeElem.setAttribute("data-type", opt.type);
	}
	
	// Update element positions based on provided position
	if (opt && opt.hasOwnProperty("mmPos") && opt.mmPos != null) {
		let mmPos = opt.mmPos.toFixed(2);
		let pxPos = mmToPixels(opt.mmPos, parentElem).toFixed(0);
		console.debug(`Updating hole position to ${mmPos}mm (${pxPos}px)`);
		holeElem.setAttribute("data-pos", mmPos);
		holeElem.style.left = `${pxPos}px`;
		holeElem.setAttribute("data-pos-px", pxPos);
	}
	else if (opt && opt.hasOwnProperty("pxPos") && opt.pxPos != null) {
		let mmPos = pixelsToMm(opt.pxPos, parentElem);
		let pxPos = mmToPixels(mmPos, parentElem).toFixed(0);
		mmPos = mmPos.toFixed(2);
		console.debug(`Updating hole position to ${pxPos}px (${mmPos}mm)`);
		holeElem.setAttribute("data-pos", mmPos.toString());
		holeElem.style.left = `${pxPos}px`;
		holeElem.setAttribute("data-pos-px", pxPos);
	}
	// Update element positions based on existing positions.
	// No new position was specified, so the extrusion length was probably changed.
	else {
		let mmPos = getHolePositionMM(holeElem);
		let holeType = holeElem.getAttribute("data-type");
		switch (holeType) {
			case "blind-right":
				const sideElem = parentElem.closest(".designer-side");
				const extrusionSize = parseInt(sideElem.getAttribute("data-extrusion-size"));
				const extrusionLength = getExtrusionLength(parentElem);
				mmPos = extrusionLength - (extrusionSize / 2);
				break;
		}
		
		let pxPos = mmToPixels(mmPos, parentElem).toFixed(0);
		holeElem.setAttribute("data-pos", mmPos.toString());
		holeElem.style.left = `${pxPos}px`;
		holeElem.setAttribute("data-pos-px", pxPos);
		
		// TODO: clamp or remove holes if they go beyond the new maximum extrusion length
	}
		
	// Always update the displayed position label
	let mmPos = getHolePositionMM(holeElem).toFixed(1);
	holeElem.getElementsByClassName("hole-label")[0].textContent = mmPos || "?";
	holeElem.getElementsByClassName("hole-pos-input")[0].value = mmPos || 0;
}

/**
 * @param elem {HTMLElement?}
 * @param force {boolean?}
 */
function selectHole(elem, force) {
	// Deselect and return if the element is already selected.
	// This condition must be first, otherwise the other validations will override this check.
	if (elem?.classList.contains("selected") && !force) {
		selectedHole.classList.remove("selected");
		return;
	}
	// Clear existing selection
	if (selectedHole != null) {
		selectedHole.classList.remove("selected");
		selectedHole.classList.remove("editing");
	}
	selectedHole = elem;
	// Mark new selection
	if (selectedHole != null) {
		selectedHole.classList.add("selected");
	}
}

function deleteSelectedHole() {
	if (selectedHole != null) {
		selectedHole.remove();
		selectedHole = null;
	}
}

function getExtrusionLength(childElem) {
	return childElem.closest(".extrusion-designer").getElementsByClassName("designer-width-input")[0].valueAsNumber;
}

/**
 * Retrieves the position of a hole in millimeters from a given element's data attribute.
 *
 * @param {Element} holeElem Element representing the hole, containing a "data-pos" attribute with its position.
 * @return {number} Position of the hole in millimeters.
 */
function getHolePositionMM(holeElem) {
	return parseFloat(holeElem.getAttribute("data-pos"));
}

/**
 * Calculates the position of a hole element in pixels relative to a specified parent element.
 *
 * @param {HTMLElement} holeElem HTML element representing the hole whose position is to be calculated.
 * @return {Object} Position of the hole element in pixels.
 */
function getHolePositionPX(holeElem) {
	return parseInt(holeElem.getAttribute("data-pos-px"));
}

/**
 * Converts a real-world position in mm to pixel position for the UI.
 * 
 * @param mmPos {number} Real-world position in millimeters
 * @param parentElem {HTMLElement} The parent container element
 * @returns {number} Pixel position
 */
function mmToPixels(mmPos, parentElem) {
	const extrusionLength = getExtrusionLength(parentElem);
	const pxWidth = parentElem.getBoundingClientRect().width.toFixed(0) - 2;
	let pxPos = (mmPos / extrusionLength) * pxWidth;
	console.debug(`mmToPixels: mmPos= ${mmPos}, extrusionLength=${extrusionLength}, pxWidth=${pxWidth}) -> ${pxPos}`);
	return pxPos;
}

/**
 * Converts a pixel position to a real-world position in mm.
 * 
 * @param px {number} Pixel position
 * @param parent {HTMLElement} Parent container element
 * @returns {number} Real-world position in millimeters
 */
function pixelsToMm(px, parent) {
	const extrusionLength = getExtrusionLength(parent);
	const pxWidth = parent.getBoundingClientRect().width - 2;
	return (px / pxWidth) * extrusionLength;
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
	// Length
	parentElem.getElementsByClassName("designer-width-input")[0].addEventListener("change", extrusionLengthChange);
	// Hole presets
	for (let elem of parentElem.getElementsByClassName("add-holes-button")) {
		elem.addEventListener("click", addHolePreset);
	}
	// Hole deselection
	document.addEventListener("keydown", deselectHoleKeypress);
	document.addEventListener("mousedown", deselectHoleMousepress);
}

//
// - Controls
//

/**
 * @param event {Event}
 */
function selectExtrusionChange(event) {
	event.preventDefault();
	let selectedType = event.target.value;
	console.debug(`Select extrusion event: ${selectedType}`);
	
	setExtrusionType(selectedType);
}

/**
 * @param event {Event}
 */
function extrusionLengthChange(event) {
	const newLength = event.target.valueAsNumber;
	console.debug(`Extrusion length change: ${newLength} mm`);
	
	const editorElem = document.getElementById("extrusion_designer_sides");
	for (const slotElem of editorElem.getElementsByClassName("designer-holes-editor")) {
		for (let holeElem of slotElem.getElementsByClassName("designer-hole")) {
			updateHole(holeElem, slotElem);
		}
	}
}

/**
 * @param event {Event}
 */
function addHolePreset(event) {
	console.debug(`Add hole preset clicked: ${event.target.name}`);
	
	switch (event.target.name) {
		case "blind-joint-left":
			addBlindJoint(0.5);
			break;
		case "blind-joint-right":
			addBlindJoint(-0.5);
			break;
		default:
			console.info(`Unknown hole preset "${event.target.name}`);
	}
}

//
// - Holes
//

/**
 * @param elem {HTMLElement}
 */
function setHoleEditorClickable(elem) {
	elem.onmousedown = editorMouseDown;
	
	/**
	 * @param e {MouseEvent}
	 */
	function editorMouseDown(e) {
		console.debug("Editor mouse down");
		e.preventDefault();
		e.stopPropagation();
		
		// Ignore non-left click inputs
		if (e.button !== 0) {
			return;
		}
		
		let parentContainer = e.target.closest(".designer-holes-editor");
		// With elements outside the editor area but part of the editor, the parent container will be null.
		// Ignore these presses.
		if (parentContainer == null) {
			return;
		}
		
		let bounds = parentContainer.getBoundingClientRect();
		let relativePos = e.clientX - bounds.left;
		let newPos = Math.round(clampPosition(relativePos, bounds));
		addHole(parentContainer, {pxPos: newPos});
		selectHole();
	}
}

/**
 * @param elem {HTMLElement}
 */
function setHoleClickable(elem) {
	elem.onclick = holeClick;
	elem.ondblclick = holeDoubleClick;
	
	/**
	 * @param e {MouseEvent}
	 */
	function holeClick(e) {
		if (e.target.tagName === "INPUT") {
			return;
		}
		e.preventDefault();
		
		// Ignore non-left click inputs
		if (e.button !== 0) {
			return;
		}
		// Prevent duplicate event on double+ click
		if (e.detail > 1) {
			return;
		}
		console.debug("Hole click");
		
		selectHole(e.currentTarget);
	}
	
	/**
	 * @param e {MouseEvent}
	 */
	function holeDoubleClick(e) {
		e.preventDefault();
		
		// Ignore non-left click inputs
		if (e.button !== 0) {
			return;
		}
		console.debug("Hole double click");
		
		selectHole(e.currentTarget, true);
		e.currentTarget.classList.add("editing");
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
		if (e.target.tagName === "INPUT") {
			return;
		}
		
		e.preventDefault();
		e.stopPropagation();
		
		// Ignore non-left click inputs
		if (e.button !== 0) {
			return;
		}
		// console.debug("Drag mouse down");

		document.onmouseup = dragMouseUp;
		document.onmousemove = dragMouse;
	}
	
	/**
	 * @param e {MouseEvent}
	 */
	function dragMouseUp(e) {
		// Ignore non-left click inputs
		if (e.button !== 0) {
			return;
		}
		// console.debug("Drag mouse up");
		
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
		// console.debug("Drag mouse move");
		
		// Update hole position
		const bounds = parentContainer.getBoundingClientRect();
		let relativePos = e.clientX - bounds.left;
		let newPos = Math.round(clampPosition(relativePos, bounds));
		updateHole(elem, parentContainer, {pxPos: newPos, type: ""});
	}
}

/**
 * @param elem {HTMLElement}
 */
function setHoleEditable(elem) {
	const controlsElem = elem.querySelector(".hole-controls input");
	
	// Immediately stop propagation on basic click events to prevent the hole click events from capturing the event
	controlsElem.addEventListener("mousedown", (e) => e.stopPropagation());
	controlsElem.addEventListener("mouseup", (e) => e.stopPropagation());
	controlsElem.addEventListener("click", (e) => e.stopPropagation());
	controlsElem.addEventListener("dblclick", (e) => e.stopPropagation());
	
	controlsElem.addEventListener("focusout", holeEditCommit);
	controlsElem.addEventListener("keypress", holeKeyCommit);
	
	function commitValue(elem) {
		const newPos = parseFloat(elem.value);
		console.debug(`New value: ${newPos}`);
		const holeElem = elem.closest(".designer-hole");
		
		updateHole(holeElem, holeElem.closest(".designer-holes-editor"), {mmPos: newPos, type: ""});
	}
	
	/**
	 * @param e {FocusEvent}
	 */
	function holeEditCommit(e) {
		console.debug("Hole edit commit");
		commitValue(e.target);
	}
	
	/**
	 * @param e {KeyboardEvent}
	 */
	function holeKeyCommit(e) {
		if (e.key === "Enter") {
			console.debug("Hole edit commit (enter)");
			e.target.blur();
			selectHole();
		}
	}
}

/**
 * @param e {KeyboardEvent}
 */
function deselectHoleKeypress(e) {
	if (e.key === "Escape") {
		console.log("Escape key pressed");
		selectHole();
	}
	if (e.key === "Delete") {
		console.log("Delete key pressed");
		deleteSelectedHole();
	}
}

/**
 * @param e {MouseEvent}
 */
function deselectHoleMousepress(e) {
	console.debug("Global key pressed");
	if (e.button === 0) {
		selectHole();
	}
}

function clampPosition(pos, bounds) {
	return Math.max(0, Math.min(bounds.width - 2, pos));
}

/**
 * @param event {Event}
 */
function resetFrameEvent(event) {
	console.debug("Reset frame event");
	const designerElement = event.target.closest(".extrusion-designer");
	designerElement.setAttribute("data-prev-state", "");
	for (let elem of designerElement.getElementsByClassName("designer-width-input")) {
		elem.value = null;
	}
	for (let elem of designerElement.getElementsByClassName("designer-holes-editor")) {
		elem.innerHTML = "";
	}
	document.getElementById("save-edit").disabled = true;
}

/**
 * @param offsetMultiplier {int} Positive = from left; negative = from right
 */
function addBlindJoint(offsetMultiplier) {
	const designerElem = document.getElementById("extrusion_designer");
	const extrusionLength = designerElem.getElementsByClassName("designer-width-input")[0].valueAsNumber;
	
	let rootElem = document.getElementById("extrusion_designer_sides");
	for (let sideElem of rootElem.getElementsByClassName("designer-side")) {
		const size = parseInt(sideElem.getAttribute("data-extrusion-size"));
		console.debug(`Extrusion size=${size}`);
		console.debug(`Offset multiplier=${offsetMultiplier}`);
		let holePos = size * offsetMultiplier;
		if (holePos < 0) {
			holePos = extrusionLength + holePos;
		}
		console.debug(`Blind joint pos=${holePos}`);
		
		const sideEditorElem = sideElem.getElementsByClassName("designer-holes-editor")[0];
		addHole(sideEditorElem, {mmPos: holePos, type: offsetMultiplier < 0 ? "blind-right" : "blind-left"})
	}
}
