import { state, resetLine } from "./canvasState.js";
import { getCoords, drawStroke } from "./canvasRenderer.js";

export function bindCanvasListeners(canvas, colorInput) {
    const ctx = canvas.getContext("2d");
    canvas.addEventListener("pointerdown", (event) => {
        const [x, y] = getCoords(event, canvas);
	    state.drawing = true;
	    state.selectedColor = colorInput.value;
	    state.line.color = state.selectedColor;
	    state.line.width = state.brushSize;
	    state.line.path.push([x, y]);
	    ctx.strokeStyle = state.selectedColor;
        ctx.lineWidth = state.brushSize;
    });

    canvas.addEventListener("pointermove", (event) => {
	    if(!state.drawing) return;
	    const [x, y] = getCoords(event, canvas);
	    const [x0, y0] = state.line.path[state.line.path.length-1];
	    drawStroke(ctx, x0, y0, x, y);
	    state.line.path.push([x, y]);
    });

    canvas.addEventListener("pointerup", (event) => {
	    if(state.line.path.length > 0) {
	        state.paths.push(state.line);
	    }
	    state.drawing = false;
	    resetLine();
    });

    canvas.addEventListener("pointerout", (event) => {
	    if(state.drawing) {
		    const [x, y] = getCoords(event, canvas);
            const [x0, y0] = state.line.path[state.line.path.length-1];
            drawStroke(ctx, x0, y0, x, y);
		    state.line.path.push([x, y]);
		    state.paths.push(state.line);
	    	resetLine();
	    }
	    state.drawing = false;
    });
}