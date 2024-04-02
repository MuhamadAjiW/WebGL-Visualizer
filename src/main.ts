import { ModelType } from "./types/enum/model-state.ts";
import { ClickController } from "./util/click-controller.ts";
import { WebGlWindow } from "./util/web-gl-window.ts";

// Button Listener
const line_btn = document.getElementById("line-button") as HTMLButtonElement
const square_btn = document.getElementById("square-button") as HTMLButtonElement
const rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
const polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement
const glWin = new WebGlWindow("canvas");
const controller = new ClickController(glWin)

line_btn.addEventListener("click", () => {
    controller.state = ModelType.LINE
    controller.reset()
})

square_btn.addEventListener("click", () => {
    controller.state = ModelType.SQUARE
    controller.reset()
})

rectangle_btn.addEventListener("click", () => {
    controller.state = ModelType.RECTANGLE
    controller.reset()
})

polygon_btn.addEventListener("click", () => {
    controller.state = ModelType.POLYGON
    controller.reset()
})

glWin.canvas.addEventListener("click", (event) =>{
    controller.handleClick(event)
})

function reset_canvas() {
    glWin.gl.clearColor(1, 1, 1, 1.0);
    glWin.gl.clear(glWin.gl.COLOR_BUFFER_BIT);
}
reset_canvas()
