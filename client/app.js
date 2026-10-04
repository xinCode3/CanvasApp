import * as ui from "./uiActions.js";
import * as canvasAction from "./CanvasEvents.js";

const canvas = document.getElementById("myCanvas");
const saveButton = document.getElementById("save");
const loadButton = document.getElementById("load");
const undoButton = document.getElementById("undo");
const clearButton = document.getElementById("clear");

const ctx = canvas.getContext('2d');
const currentColor = document.getElementById("selected_color");

ui.bindSaveButton(canvas, saveButton);
ui.bindLoadButton(canvas, loadButton);
ui.bindUndoButton(canvas, undoButton);
ui.bindClearButton(canvas, clearButton);

canvasAction.bindCanvasListeners(canvas, currentColor);
function createBoard() {
	// Board position and size
	const x = 0;
	const y = 0;
	const width = 1000;
	const height = 800;

	// Shadow settings
	ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
	ctx.shadowBlur = 10;
	ctx.shadowOffsetX = 6;
	ctx.shadowOffsetY = 6;

	// Draw board
	ctx.fillStyle = "white";
	ctx.fillRect(x, y, width, height);

	// Turn shadow off
	ctx.shadowColor = "transparent";

	// Add a slightly lighter top border
	ctx.fillStyle = "#eeeeee";
	ctx.fillRect(x, y, width, 5);

	// Add darker bottom border
	ctx.fillStyle = "#aaaaaa";
	ctx.fillRect(x, y + height - 5, width, 5);
}
createBoard();
