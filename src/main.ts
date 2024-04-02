import { BaseModel } from "./models/base-model.ts";
import { RectangleModel } from "./models/rectangle-model.ts";
import { ModelState } from "./types/enum/model-state.ts";
import { ClickController } from "./util/click-controller.ts";
import { m3 } from "./util/m3.ts";
import { WebGlWindow } from "./util/web-gl-window.ts";

// Button Listener
const line_btn = document.getElementById("line-button") as HTMLButtonElement
const square_btn = document.getElementById("square-button") as HTMLButtonElement
const rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
const polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement
const glWin = new WebGlWindow("canvas");
const controller = new ClickController(glWin)

line_btn.addEventListener("click", () => {
    controller.state = ModelState.LINE
})

square_btn.addEventListener("click", () => {
    controller.state = ModelState.SQUARE
})

rectangle_btn.addEventListener("click", () => {
    controller.state = ModelState.RECTANGLE
    let rectangleModel = new RectangleModel()
    glWin.draw([rectangleModel])
})

polygon_btn.addEventListener("click", () => {
    controller.state = ModelState.POLYGON
    reset_canvas()
})

glWin.canvas.addEventListener("click", (event) =>{
    console.log(event.offsetX)
    console.log(event.offsetY)
})

function reset_canvas() {
    glWin.gl.clearColor(1, 1, 1, 1.0);
    glWin.gl.clear(glWin.gl.COLOR_BUFFER_BIT);
}
reset_canvas()
