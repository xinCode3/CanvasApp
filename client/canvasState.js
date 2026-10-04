export const state = {
    drawing: false,
    paths: [],
    line: {
	    path: [],
	    color: null,
	    width: null
    },
    brushSize: 5,
    selectedColor: "black"
};

export function resetLine() {
    state.line = {
        path: [],
    	color: null,
    	width: null
    };
}
export function clear() {
    state.drawing = false;
    state.paths = [];
    resetLine();
}