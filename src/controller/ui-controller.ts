import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { CanvasMouseEvent } from "../types/events/canvas-mouse-event";
import { Observer } from "../types/events/web-gl-events";
import { CanvasController } from "./canvas-controller";
import { MouseController } from "./mouse-controller";
import {m4, Matrix4} from "../util/m4.ts";

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
        const model_dropdown = document.getElementById("model-dropdown") as HTMLSelectElement
        const slider_container = document.getElementById("slider-container") as HTMLDivElement
        const x_slider = document.getElementById("x-slider") as HTMLInputElement
        const x_slider_label = document.getElementById("x-slider-label") as HTMLLabelElement
        const y_slider = document.getElementById("y-slider") as HTMLInputElement
        const y_slider_label = document.getElementById("y-slider-label") as HTMLLabelElement
        const rotate_slider = document.getElementById("rotate-slider") as HTMLInputElement
        const rotate_slider_label = document.getElementById("rotate-slider-label") as HTMLLabelElement

        // TODO: delete, this a dummy button for function testing
        const test_btn = document.getElementById("test-button") as HTMLButtonElement
        test_btn.addEventListener("click", () => {
            // mouseCtrl.changeModelColor(new Coordinates(0, 0, 1, 1));
            mouseCtrl.changeMarkerColor(new Coordinates(0, 0, 1, 1));
            // mouseCtrl.removeMarker();
        })

        line_btn.onclick = () => {
            mouseCtrl.state = ModelType.LINE;
            mouseCtrl.reset();
        }
        
        square_btn.onclick = () => {
            mouseCtrl.state = ModelType.SQUARE;
            mouseCtrl.reset();
        }
        
        rectangle_btn.onclick = () => {
            mouseCtrl.state = ModelType.RECTANGLE;
            mouseCtrl.reset();
        }
        
        polygon_btn.onclick = () => {
            mouseCtrl.state = ModelType.POLYGON;
            mouseCtrl.reset();
        }

        model_dropdown.onchange = () => {
            model_label.innerText = model_dropdown.value;
            slider_container.style.visibility = "visible";
            if (model_dropdown.value === ""){
                slider_container.style.visibility = "hidden";
                return;
            } else {
                slider_container.style.visibility = "visible";
            }
        }

        x_slider.oninput = () => {
            x_slider_label.innerText = "X Slider: " + x_slider.value;
            const model = glWin.getModel(model_label.innerText);
            if (model == null) return;
            const matrixTranslation = m4.translation(parseInt(x_slider.value), 0, 0, model.uniforms.u_matrix as Matrix4);
            model.uniforms.u_matrix = m4.multiply(matrixTranslation, model.uniforms.u_matrix as Matrix4)
            glWin.setModel(model_label.innerText, model);
        }

        x_slider.onmousedown = async () => {
            glWin.clearMarker();
        }

        x_slider.onmouseup = async () => {
            await mouseCtrl.restoreFocusModel();
        }

        y_slider.oninput = () => {
            y_slider_label.innerText = "Y Slider: " + y_slider.value;
            const model = glWin.getModel(model_label.innerText);
            if (model == null) return;
            const matrixTranslation = m4.translation(0, parseInt(y_slider.value), 0, model.uniforms.u_matrix as Matrix4);
            model.uniforms.u_matrix = m4.multiply(matrixTranslation, model.uniforms.u_matrix as Matrix4)
            glWin.setModel(model_label.innerText, model)
        }

        y_slider.onmousedown = async () => {
            glWin.clearMarker();
        }

        y_slider.onmouseup = async () => {
            await mouseCtrl.restoreFocusModel();
        }

        rotate_slider.oninput = () => {
            rotate_slider_label.innerText = "Rotate Slider " + rotate_slider.value;
            const model = glWin.getModel(model_label.innerText);
            if (model == null) return;
            const tx = model.uniforms.u_matrix[12];
            const ty = model.uniforms.u_matrix[13];
            const matrixTranslation = m4.translation(-tx, -ty, 0, model.uniforms.u_matrix as Matrix4);
            model.uniforms.u_matrix = m4.multiply(matrixTranslation, model.uniforms.u_matrix as Matrix4)
            const matrixRotation = m4.zRotation(parseInt(rotate_slider.value) /180, model.uniforms.u_matrix as Matrix4);
            model.uniforms.u_matrix = m4.multiply(matrixRotation, model.uniforms.u_matrix as Matrix4)
            const matrixTranslationBack = m4.translation(tx, ty, 0, model.uniforms.u_matrix as Matrix4);
            model.uniforms.u_matrix = m4.multiply(matrixTranslationBack, model.uniforms.u_matrix as Matrix4)
            glWin.setModel(model_label.innerText, model)
        }

        rotate_slider.onmousedown = async () => {
            glWin.clearMarker();
        }

        rotate_slider.onmouseup = async () => {
            await mouseCtrl.restoreFocusModel();
        }

        clear_btn.onclick = () => {
            glWin.clear();
            file_input.files = null;
            file_input.value = '';
            mouseCtrl.reset();
        }
        
        save_btn.onclick = () => {
            glWin.save();
        }
        
        file_input.onchange = async () => {
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
        }
        
        load_btn.onclick = () => {
            file_input.click();
        }

        glWin.canvas.onmousedown = async (event) => {
            await mouseCtrl.handleClick(event);
        }
        
        glWin.canvas.onmousemove = (event) => {
            mouseCtrl.handleHover(event);
        }
        
        
        this.subscribe(mouseCtrl);
        this.addEventListener(CanvasMouseEvent.EVENT_FOCUS_CHANGE, (data) => {
            model_label.innerText = data.modelFocusKey? data.modelFocusKey : "none";
            marker_label.innerText = data.markerFocusKey? data.markerFocusKey : "none";
        })
        
        glWin.clear();
    }   
}