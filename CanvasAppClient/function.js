//Fill in your local IP before running server!
const server_url = "http://10.0.0.107:8000";
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const saveButton = document.getElementById("save");
const loadButton = document.getElementById("load");
const undoButton = document.getElementById("undo");
const clearButton = document.getElementById("clear");

const brushSize = 10;
let selectedColor = selected_color.value;
let drawing = false;

let lastX = 0;
let lastY = 0;
let paths = [];

let line = {
	path: [],
	color: null,
	width: null
};

canvas.addEventListener("pointerdown", (event) => {
	drawing = true;
	const coords = getCoords(event);
	selectedColor = selected_color.value;
	ctx.strokeStyle = selectedColor;
	ctx.lineWidth = brushSize / 2;
	line.color = selectedColor;
	line.width = brushSize / 2;
	line.path.push([coords[0], coords[1]]);
});

canvas.addEventListener("pointerup", (event) => {
	drawing = false;
	const coords = getCoords(event);
	line.path.push([coords[0], coords[1]]);
	paths.push(line);
	line = {
		path: [],
		color: null,
		width: null
	};
});

canvas.addEventListener("pointerout", (event) => {
	if(drawing) {
		const coords = getCoords(event);
		line.path.push([coords[0], coords[1]]);
		paths.push(line);
		line = {
			path: [],
			color: null,
			width: null
		};
	}
	drawing = false;
});

canvas.addEventListener("pointermove", (event) => {
	if(!drawing) return;
	draw(event);
});

saveButton.addEventListener("click", () => {
    const overlay = document.createElement("div");
	overlay.classList.add("save-overlay");
	overlay.addEventListener("click", (event) => {
    		if(event.target === overlay)
    			overlay.remove();
    });
    if(paths.length == 0) {
        const notice = document.createElement("p");
        notice.classList.add("bad-notice");
        notice.textContent = "There's nothing to save!";
        overlay.appendChild(notice);
        document.body.appendChild(overlay);
    } else { saveCanvas(canvas, overlay); }
});

loadButton.addEventListener("click", async () => {
	const images = await loadImages();
	await displayImages(images);
});

undoButton.addEventListener("click", () => {
	if (paths.length == 0) return;
	clearCanvas();
	paths.pop();
    drawCanvas();
});

clearButton.addEventListener("click", () => {
	if (paths.length == 0) return;
	clearCanvas();
	paths = [];
	line = {
		path: [],
		color: null,
	};
});

function draw(event) {
	const coords = getCoords(event);
	const x = coords[0];
	const y = coords[1];
	ctx.beginPath();
	ctx.moveTo(line.path[line.path.length-1][0], line.path[line.path.length-1][1]);
    ctx.lineTo(x, y);
	ctx.lineCap = "round";
	ctx.lineJoin = "round";
	ctx.stroke();
	line.path.push([x, y]);
}

function saveCanvas(canvasElement, overlay) {

	const input = document.createElement("input");
	input.type = "text";
	input.placeholder = "enter image name";

	input.addEventListener("focus", () => {
		input.select();
	});

	const save = document.createElement("button");
	save.classList.add("save_button");
	save.textContent = "Save";

	overlay.appendChild(input);
	overlay.appendChild(save)
	document.body.appendChild(overlay);

	input.focus();
	input.select();

	save.addEventListener("click", () => {

		const fn = input.value.trim();

        const baseName = fn.replace(/\.[^/.]+$/, "");
        if (!baseName) {
          alert("Please enter a valid image name.");
          return;
        }

		canvasElement.toBlob(async (blob) => {
			const formData = new FormData();
            formData.append("file", blob, baseName);
			formData.append("jsondata", JSON.stringify(paths));

			const res = await fetch(server_url+"/data/img", {
				method: "POST",
				body: formData
			});
			if (!res.ok) {
				alert("Upload failed: " + res.status);
				return;
			}
			const content = await res.json();
			overlay.replaceChildren();

            const notice = document.createElement("p");
            notice.classList.add("save-notice");
            notice.textContent = content.message;
            overlay.appendChild(notice);
		}, "image/png");

	});
}

async function loadImages() {
	const res = await fetch(server_url+"/data/img");
	const data = await res.json();
	return data.images;
}

async function displayImages(images) {
  const overlay = document.createElement("div");
  const grid = document.createElement("div");
  overlay.classList.add("image-overlay");
  grid.classList.add("image-grid");
  overlay.addEventListener("click", event => {
      if (event.target === overlay) overlay.remove();
      return;
  });

  grid.addEventListener("click", (event) => {
    if(event.target === grid)
        overlay.remove();
        return;
  });

  for (const image of images) {
    const imgContainer = document.createElement("div");
    const imgElement = document.createElement("img");
    const imgName = document.createElement("p");

    imgContainer.classList.add("img_container");
    imgElement.classList.add("thumb");

    imgElement.src = server_url + image.url;
    imgElement.alt = image.filename;
    imgElement.addEventListener("click", async (event) => {
      const response = await fetch(
        server_url + "/data/json/" + encodeURIComponent(image.filename)
      );
      const content = await response.json();
      paths = content.paths;
      clearCanvas();
      drawCanvas();
      overlay.remove();
    });

    const index = image.filename.lastIndexOf("-");
    const basename = index === -1 ? image.filename : image.filename.slice(0, index);

    imgName.textContent = basename;
    imgContainer.appendChild(imgElement);
    imgContainer.appendChild(imgName);
    grid.appendChild(imgContainer);
  }
  overlay.appendChild(grid);
  document.body.appendChild(overlay);
}

function drawCanvas() {
    for (const line of paths) {
	    ctx.strokeStyle = line.color;
	    if(line.width == null) ctx.lineWidth = brushSize/2;
	    else ctx.lineWidth = line.width;
		for (let j = 0; j < line.path.length - 1; j++) {
			ctx.beginPath();
			ctx.moveTo(line.path[j][0], line.path[j][1]);
			ctx.lineTo(line.path[j + 1][0], line.path[j + 1][1]);
			ctx.lineCap = "round";
			ctx.lineJoin = "round";
			ctx.stroke();
		}
	}
}

function clearCanvas() {
    ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getCoords(event) {
	const rect = canvas.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	return [x, y];
}
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