import { state, clear } from "./canvasState.js";
import { loadImages, displayImages, saveCanvas } from "./imageApi.js";
import { clearCanvas, drawCanvas } from "./canvasRenderer.js";

export function bindSaveButton(canvas, saveButton) {
    saveButton.addEventListener("click", () => {
        saveCanvas(canvas);
    });
}

export function bindLoadButton(canvas, loadButton) {
    loadButton.addEventListener("click", async () => {
	    const images = await loadImages();
	    await displayImages(images, canvas);
    });
}

export function bindUndoButton(canvas, undoButton) {
    undoButton.addEventListener("click", () => {
	    if (state.paths.length == 0) return;
	    const ctx = canvas.getContext("2d");
	    clearCanvas(ctx);
	    state.paths.pop();
        drawCanvas(ctx);
    });
}

export function bindClearButton(canvas, clearButton) {
    clearButton.addEventListener("click", () => {
	    if (state.paths.length == 0) return;
	    const ctx = canvas.getContext("2d");
    	clearCanvas(ctx);
    	clear();
	});
}