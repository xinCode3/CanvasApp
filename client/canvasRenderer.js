import { state } from "./canvasState.js";
import { server_url } from "./server_url.js";

export let cancel_drawing = false;
export let is_drawing = false;
export function cancel(cancel) {
    cancel_drawing = cancel;
}

const pencil = document.createElement('img');
pencil.classList.add("pencil");
pencil.src = server_url + "/client/pencil.png";


export function getCoords(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
           };
}

export function clearCanvas(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
 }

export async function drawStroke(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
}

export function updateCanvas(ctx) {
    for(const line of state.paths) {
        ctx.strokeStyle = line.color ?? "black";
        ctx.lineWidth = line.width ?? 5;
        for (let i = 0; i < line.path.length - 1; i++) {
            const coords1 = line.path[i];
            const coords2 = line.path[i+1];
            drawStroke(ctx, coords1.x, coords1.y, coords2.x, coords2.y);
        }
    }
}

export async function drawCanvas(ctx) {
    const canvas_container = document.querySelector(".drawing-area");
    canvas_container.appendChild(pencil);
    is_drawing = true;
    for (const line of state.paths) {
        if (cancel_drawing) {
            stopDrawing(ctx);
            return;
        }
        ctx.strokeStyle = line.color ?? "black";
        ctx.lineWidth = line.width ?? 5;
        for (let i = 0; i < line.path.length - 1; i++) {
            const coords1 = line.path[i];
            const coords2 = line.path[i+1];
            const completed = await selfDrawStroke(ctx, coords1.x, coords1.y, coords2.x, coords2.y);
            if (!completed) {
                stopDrawing(ctx);
                return;
            }
       	}
    }
    is_drawing = false;
    pencil.remove();
}

function stopDrawing(ctx) {
    clearCanvas(ctx);
    cancel(false);
    is_drawing = false;
    pencil.remove();
}

async function selfDrawStroke(ctx, x1, y1, x2, y2) {
        if (cancel_drawing) return false;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        pencil.style.left = `${x1}px`;
        pencil.style.top  = `${y1}px`;
        await sleep(2);
        if (cancel_drawing) return false;
        ctx.lineTo(x2, y2);
        pencil.style.left = `${x2}px`;
        pencil.style.top  = `${y2}px`;
        ctx.stroke();
        return true;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
