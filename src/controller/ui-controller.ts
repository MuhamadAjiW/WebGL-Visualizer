import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { CanvasMouseEvent } from "../types/events/canvas-mouse-event";
import { Observer } from "../types/events/web-gl-events";
import { CanvasController } from "./canvas-controller";
import { MouseController } from "./mouse-controller";

export class UIController extends Observer<CanvasMouseEvent> {
    constructor(glWin: CanvasController, mouseCtrl: MouseController){
        super();
        const line_btn = document.getElementById("line-button") as HTMLButtonElement
        const square_btn = document.getElementById("square-button") as HTMLButtonElement
        const rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
        const polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement
        const clear_btn = document.getElementById("clear-button") as HTMLButtonElement
        const save_btn = document.getElementById("save-button") as HTMLButtonElement
        const load_btn = document.getElementById("load-button") as HTMLButtonElement
        const file_input = document.getElementById("file-input") as HTMLInputElement
        const model_label = document.getElementById("model-label") as HTMLLabelElement
        const marker_label = document.getElementById("marker-label") as HTMLLabelElement
        
        // TODO: delete, this a dummy button for function testing
        const test_btn = document.getElementById("test-button") as HTMLButtonElement
        test_btn.addEventListener("click", () => {
            mouseCtrl.changeMarkerColor(new Coordinates(0, 0, 1, 1));
        })

        line_btn.addEventListener("click", () => {
            mouseCtrl.state = ModelType.LINE;
            mouseCtrl.reset();
        })
        
        square_btn.addEventListener("click", () => {
            mouseCtrl.state = ModelType.SQUARE;
            mouseCtrl.reset();
        })
        
        rectangle_btn.addEventListener("click", () => {
            mouseCtrl.state = ModelType.RECTANGLE;
            mouseCtrl.reset();
        })
        
        polygon_btn.addEventListener("click", () => {
            mouseCtrl.state = ModelType.POLYGON;
            mouseCtrl.reset();
        })

        clear_btn.addEventListener("click", () => {
            glWin.clear();
            file_input.files = null;
            file_input.value = '';
            mouseCtrl.reset();
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
            await mouseCtrl.handleClick(event);
        })
        
        glWin.canvas.addEventListener("mousemove", (event) => {
            mouseCtrl.handleHover(event);
        })
        
        
        this.subscribe(mouseCtrl);
        this.addEventListener(CanvasMouseEvent.EVENT_FOCUS_CHANGE, (data) => {
            model_label.innerText = data.modelFocusKey? data.modelFocusKey : "none";
            marker_label.innerText = data.markerFocusKey? data.markerFocusKey : "none";
        })
        
        glWin.clear();
    }   
}