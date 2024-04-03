import { ModelType } from "../types/enum/model-state";
import { CanvasMouseEvent } from "../types/events/canvas-mouse-event";
import { Observer } from "../types/events/web-gl-events";
import { CanvasController } from "./canvas-controller";
import { MouseController } from "./mouse-controller";

export class UIController extends Observer<CanvasMouseEvent> {
    private line_btn: HTMLButtonElement
    private square_btn: HTMLButtonElement
    private rectangle_btn: HTMLButtonElement
    private polygon_btn: HTMLButtonElement
    private clear_btn: HTMLButtonElement
    private save_btn: HTMLButtonElement
    private load_btn: HTMLButtonElement
    private file_input: HTMLInputElement
    private model_label: HTMLLabelElement
    private marker_label: HTMLLabelElement
    
    constructor(glWin: CanvasController, mouseCtrl: MouseController){
        super();
        this.line_btn = document.getElementById("line-button") as HTMLButtonElement
        this.square_btn = document.getElementById("square-button") as HTMLButtonElement
        this.rectangle_btn = document.getElementById("rectangle-button") as HTMLButtonElement
        this.polygon_btn = document.getElementById("polygon-button") as HTMLButtonElement
        this.clear_btn = document.getElementById("clear-button") as HTMLButtonElement
        this.save_btn = document.getElementById("save-button") as HTMLButtonElement
        this.load_btn = document.getElementById("load-button") as HTMLButtonElement
        this.file_input = document.getElementById("file-input") as HTMLInputElement
        this.model_label = document.getElementById("model-label") as HTMLLabelElement
        this.marker_label = document.getElementById("marker-label") as HTMLLabelElement
        
        this.line_btn.addEventListener("click", () => {
            mouseCtrl.state = ModelType.LINE;
            mouseCtrl.reset();
        })
        
        this.square_btn.addEventListener("click", () => {
            mouseCtrl.state = ModelType.SQUARE;
            mouseCtrl.reset();
        })
        
        this.rectangle_btn.addEventListener("click", () => {
            mouseCtrl.state = ModelType.RECTANGLE;
            mouseCtrl.reset();
        })
        
        this.polygon_btn.addEventListener("click", () => {
            mouseCtrl.state = ModelType.POLYGON;
            mouseCtrl.reset();
        })
        
        this.clear_btn.addEventListener("click", () => {
            glWin.clear();
            this.file_input.files = null;
            this.file_input.value = '';
            mouseCtrl.reset();
        })
        
        this.save_btn.addEventListener("click", () => {
            glWin.save();
        })
        
        this.file_input.addEventListener('change', async () => {
            if(this.file_input.files != null){
                const file = this.file_input.files[0]
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
        
        this.load_btn.addEventListener("click", () => {
            this.file_input.click();
        })
        
        glWin.canvas.addEventListener("mousedown", async (event) => {
            await mouseCtrl.handleClick(event);
        })
        
        glWin.canvas.addEventListener("mousemove", (event) => {
            mouseCtrl.handleHover(event);
        })
        
        
        this.subscribe(mouseCtrl);
        this.addEventListener(CanvasMouseEvent.EVENT_FOCUS_CHANGE, (data) => {
            this.model_label.innerText = data.modelFocusKey? data.modelFocusKey : "none";
            this.marker_label.innerText = data.markerFocusKey? data.markerFocusKey : "none";
        })
        
        glWin.clear();
    }   
}