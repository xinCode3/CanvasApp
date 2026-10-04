import { state } from "./canvasState.js";
import { clearCanvas, drawCanvas } from "./canvasRenderer.js";
const server_url = "http://10.0.0.107:8000";

export async function loadImages() {
	const res = await fetch(server_url+"/data/img");
	const data = await res.json();
	return data.images;
}

export async function displayImages(images, canvas) {
    const ctx = canvas.getContext("2d");
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
            state.paths = content.paths;
            clearCanvas(ctx);
            drawCanvas(ctx);
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

export function saveCanvas(canvas) {
    const overlay = document.createElement("div");
	overlay.classList.add("save-overlay");
	overlay.addEventListener("click", (event) => {
        if(event.target === overlay)
    	    overlay.remove();
    });
    if(state.paths.length == 0) {
        const notice = document.createElement("p");
        notice.classList.add("bad-notice");
        notice.textContent = "There's nothing to save!";
        overlay.appendChild(notice);
        document.body.appendChild(overlay);
    } else {
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
       		canvas.toBlob(async (blob) => {
       		    if (!blob) {
                    alert("Could not create image.");
                    return;
                }
        	    const formData = new FormData();
                formData.append("img-file", blob, baseName);
        	    formData.append("jsondata", JSON.stringify(state.paths));
   			    const res = await fetch(server_url + "/data/img", {
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
}
