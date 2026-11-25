import { state, resetLine } from "./canvasState.js";
import { getCoords, drawStroke, is_drawing } from "./canvasRenderer.js";

export function bindCanvasListeners(canvas, colorInput) {
    const ctx = canvas.getContext("2d");
    canvas.addEventListener("pointerdown", (event) => {
        if(is_drawing) return;
        const coords  = getCoords(event, canvas);
	    state.drawing = true;
	    state.selectedColor = colorInput.value;
	    state.line.color = state.selectedColor;
	    state.line.width = state.brushSize;
	    state.line.path.push(coords);
	    ctx.strokeStyle = state.selectedColor;
        ctx.lineWidth = state.brushSize;
    });

    canvas.addEventListener("pointermove", (event) => {
	    if(!state.drawing || is_drawing) return;
	    const next  = getCoords(event, canvas);
	    const last  = state.line.path.at(-1);
        drawStroke(ctx, last.x, last.y, next.x, next.y);
	    state.line.path.push(next);
    });

    canvas.addEventListener("pointerup", (event) => {
        if(is_drawing) return;
	    if(state.line.path.length > 0) {
	        state.paths.push(state.line);
	    }
	    state.drawing = false;
	    resetLine();
    });

    canvas.addEventListener("pointerout", (event) => {
        if(is_drawing) return;
	    if(state.drawing) {
		    const next  = getCoords(event, canvas);
            const last  = state.line.path.at(-1);
            drawStroke(ctx, last.x, last.y, next.x, next.y);
            state.line.path.push(next);
		    state.paths.push(state.line);
	    	resetLine();
	    }
	    state.drawing = false;
    });
}