import { WebGlWindow } from "./util/web-gl-window.ts";
import {ModelState} from "./types/model-state.ts";

var curr_state = ModelState.LINE


// Button Listener
const line_btn = document.getElementById("line-button") as HTMLButtonElement
const square_btn = document.getElementById("square-button") as HTMLButtonElement
const rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
const polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement

line_btn.addEventListener("click", () => {
    curr_state = ModelState.LINE
    console.log(curr_state)
})

square_btn.addEventListener("click", () => {
    curr_state = ModelState.SQUARE
    console.log(curr_state)
})

rectangle_btn.addEventListener("click", () => {
    curr_state = ModelState.RECTANGLE
    console.log(curr_state)
})

polygon_btn.addEventListener("click", () => {
    curr_state = ModelState.POLYGON
    console.log(curr_state)
})


function reset_canvas() {
    const glWin = new WebGlWindow("canvas");
    glWin.gl.clearColor(0, 0.6, 0.0, 1.0);
    glWin.gl.clear(glWin.gl.COLOR_BUFFER_BIT);
}
reset_canvas()
