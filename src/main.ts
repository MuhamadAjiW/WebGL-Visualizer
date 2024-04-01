import { BaseModel } from "./models/base-model.ts";
import { ModelState } from "./types/enum/model-state.ts";
import { m3 } from "./util/m3.ts";
import { WebGlWindow } from "./util/web-gl-window.ts";

var curr_state = ModelState.LINE


// Button Listener
const line_btn = document.getElementById("line-button") as HTMLButtonElement
const square_btn = document.getElementById("square-button") as HTMLButtonElement
const rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
const polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement
const glWin = new WebGlWindow("canvas");

line_btn.addEventListener("click", () => {
    curr_state = ModelState.LINE
    console.log(curr_state);

    const baseShape = new BaseModel();
    
    const line = new BaseModel();
    line.uniforms.u_matrix = m3.rotation(Math.PI / 4);
    
    glWin.draw([baseShape, line]);

    console.log("drawn")
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
    glWin.gl.clearColor(1, 1, 1, 1.0);
    glWin.gl.clear(glWin.gl.COLOR_BUFFER_BIT);
}
reset_canvas()
