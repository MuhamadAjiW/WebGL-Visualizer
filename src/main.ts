import { WebGlWindow } from "./util/web-gl-window.ts";
import { ModelState } from "./types/enum/model-state.ts";
import { RectangleModel } from "./models/rectangle-model.ts";
import { BaseModel } from "./models/base-model.ts";

var curr_state = ModelState.LINE


// Button Listener
const line_btn = document.getElementById("line-button") as HTMLButtonElement
const square_btn = document.getElementById("square-button") as HTMLButtonElement
const rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
const polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement
const glWin = new WebGlWindow("canvas");

let model: BaseModel;

line_btn.addEventListener("click", () => {
    curr_state = ModelState.LINE
    console.log(curr_state);
})

square_btn.addEventListener("click", () => {
    curr_state = ModelState.SQUARE
    console.log(curr_state)

    model = new RectangleModel(glWin.gl);
    model.init()
    model.draw()
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
    glWin.gl.clearColor(1, 1, 1, 1.0);
    glWin.gl.clear(glWin.gl.COLOR_BUFFER_BIT);
}
reset_canvas()
