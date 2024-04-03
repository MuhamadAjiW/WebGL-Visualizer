import { MouseController } from "./controller/mouse-controller"
import { ModelType } from "./types/enum/model-state"
import { CanvasController } from './controller/canvas-controller';

// Button Listener
const line_btn = document.getElementById("line-button") as HTMLButtonElement
const square_btn = document.getElementById("square-button") as HTMLButtonElement
const rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
const polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement
const clear_btn = document.getElementById("clear-button") as HTMLButtonElement
const save_btn = document.getElementById("save-button") as HTMLButtonElement
const load_btn = document.getElementById("load-button") as HTMLButtonElement

const file_input = document.getElementById("file-input") as HTMLInputElement

const glWin = new CanvasController("canvas");
const controller = new MouseController(glWin)

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
    file_input.files = null;
    file_input.value = '';
    controller.reset();
})

save_btn.addEventListener("click", () => {
    glWin.save();
})

file_input.addEventListener('change', async () => {
    if(file_input.files != null){
        const file = file_input.files[0]
        const fileReader = new FileReader();

        fileReader.onload = function (event) {
            if(event.target != null){
                const fileContents = event.target.result;
                glWin.load(fileContents as string);
            }
        };

        fileReader.readAsText(file)
    }
})

load_btn.addEventListener("click", () => {
    file_input.click();
})

glWin.canvas.addEventListener("mousedown", async (event) => {
    await controller.handleClick(event);
})

glWin.canvas.addEventListener("mousemove", (event) => {
    controller.handleHover(event);
})

glWin.clear();
