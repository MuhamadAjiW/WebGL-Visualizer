import { RectangleModel } from "./models/rectangle-model.ts";
import { Coordinates } from "./types/coordinates.ts";
import { ModelType } from "./types/enum/model-state.ts";
import { ClickController } from "./util/click-controller.ts";
import { WebGlWindow } from "./util/web-gl-window.ts";

// Button Listener
const line_btn = document.getElementById("line-button") as HTMLButtonElement
const square_btn = document.getElementById("square-button") as HTMLButtonElement
const rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
const polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement
const clear_btn = document.getElementById("clear-button") as HTMLButtonElement
const save_btn = document.getElementById("save-button") as HTMLButtonElement
const load_btn = document.getElementById("load-button") as HTMLButtonElement

const file_input = document.getElementById("file-input") as HTMLInputElement

const glWin = new WebGlWindow("canvas");
const controller = new ClickController(glWin)

line_btn.addEventListener("click", () => {
    controller.state = ModelType.LINE;
    controller.reset();
})

square_btn.addEventListener("click", () => {
    controller.state = ModelType.SQUARE;
    controller.reset();
})

rectangle_btn.addEventListener("click", () => {
    controller.state = ModelType.RECTANGLE;
    controller.reset();
})

polygon_btn.addEventListener("click", () => {
    controller.state = ModelType.POLYGON;
    controller.reset();
})

clear_btn.addEventListener("click", () => {
    glWin.clear();
    controller.reset();
})

save_btn.addEventListener("click", () => {
    glWin.save();
})

file_input.addEventListener('change', async (event) => {
    if(file_input.files != null){
        const file = file_input.files[0]
        const fileReader = new FileReader();

        fileReader.onload = function (event) {
            if(event.target != null){
                const fileContents = event.target.result;
                glWin.load(fileContents as string);
                // glWin.addModel(
                //     new RectangleModel(
                //         [new Coordinates(0, 0),
                //         new Coordinates(100, 100)]
                //     ),
                //     new Coordinates(0, 0)
                // )
            }
        };

        fileReader.readAsText(file)
    }
})

load_btn.addEventListener("click", () => {
    file_input.click();
})

glWin.canvas.addEventListener("click", (event) =>{
    controller.handleClick(event)
})

glWin.clear();