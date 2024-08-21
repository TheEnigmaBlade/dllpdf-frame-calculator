import "./css/reset.css";
import "./css/style.css";

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

setHoleEditorClickable(document.querySelector(".designer-holes-editor"));

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

setHoleDraggable(document.querySelector(".designer-hole"))





// import javascriptLogo from './javascript.svg';
// import viteLogo from '/vite.svg';
// import { setupCounter } from './counter.js';

// <a href="https://vitejs.dev" target="_blank">
//   <img src="${viteLogo}" class="logo" alt="Vite logo" />
// </a>
// <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//   <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
// </a>
// document.querySelector("#app").innerHTML = `
//   <div>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//   </div>
// `;
//
// setupCounter(document.querySelector('#counter'));
