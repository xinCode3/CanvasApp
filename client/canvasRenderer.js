import { state } from "./canvasState.js";

export function getCoords(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return [
        event.clientX - rect.left,
        event.clientY - rect.top
    ];
}

export function clearCanvas(ctx) {
    ctx.fillStyle = "white";
 	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
 }

export function drawStroke(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
}

export function drawCanvas(ctx) {
    for (const line of state.paths) {
        ctx.strokeStyle = line.color ?? "black";
        ctx.lineWidth = line.width ?? 5;
        for (let i = 0; i < line.path.length - 1; i++) {
       	    const [x1, y1] = line.path[i];
       	    const [x2, y2] = line.path[i+1];
       	    drawStroke(ctx, x1, y1, x2, y2);
       	}
    }
}
