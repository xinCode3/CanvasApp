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
        rel: [
            event.clientX - rect.left,     
            event.clientY - rect.top
        ], 
        abs: [
            event.clientX,
            event.clientY
        ]};
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

export async function drawCanvas(ctx) {
    const canvas_container = document.querySelector(".drawing-area");
    canvas_container.appendChild(pencil);
    is_drawing = true;
    for (const line of state.paths) {
        if(cancel_drawing) { 
            pencil.remove(); 
            clearCanvas();
            cancel = false;
            is_drawing = false;
            return; 
        }
        ctx.strokeStyle = line.color ?? "black";
        ctx.lineWidth = line.width ?? 5;
        for (let i = 0; i < line.path.length - 1; i++) {
       	    const { rel: rel1, abs: abs1 } = line.path[i];
       	    const { rel: rel2, abs: abs2 } = line.path[i+1];
       	    await selfDrawStroke(ctx, rel1[0], rel1[1], 
                                    rel2[0], rel2[1], 
                                    abs1[0], abs1[1], 
                                    abs2[0], abs2[1]);
       	}
    }
    is_drawing = false;
    pencil.remove();
}

async function selfDrawStroke(ctx, x1r, y1r, x2r, y2r, x1a, y1a, x2a, y2a) {
        if(cancel_drawing) {
            clearCanvas();
            cancel = false;
            is_drawing = false;
            pencil.remove();
            return;
        }
        ctx.beginPath();
        ctx.moveTo(x1r, y1r);
        pencil.style.left = `${x1a-5}px`;
        pencil.style.top  = `${y1a-20}px`;
        await sleep(1);
        ctx.lineTo(x2r, y2r);
        pencil.style.left = `${x2a-5}px`;
        pencil.style.top  = `${y2a-20}px`;
        ctx.stroke();
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
