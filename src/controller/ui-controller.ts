import {ModelType} from "../types/enum/model-state";
import {CanvasMouseEvent} from "../types/events/canvas-mouse-event";
import {EventListener} from "../types/events/observer-pattern.ts";
import {CanvasController} from "./canvas-controller";
import {MouseController} from "./mouse-controller";
import { CanvasModelEvent } from "../types/events/canvas-model-event.ts";
import { Color } from "../types/color.ts";
import { BaseModel } from "../models/base-model.ts";
import { MarkerModel } from "../models/marker-model.ts";

export class UIController {
    private eventListener: EventListener = new EventListener();
    
    constructor(glWin: CanvasController, mouseCtrl: MouseController) {
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
        const color_picker = document.getElementById("color-picker") as HTMLInputElement;
        const delete_vertex_button = document.getElementById("delete-vertex-button") as HTMLButtonElement;
        const delete_model_button = document.getElementById("delete-model-button") as HTMLButtonElement;

        let activeModel: BaseModel | undefined;
        let activeMarker: MarkerModel | undefined;

        // TODO: delete, this a dummy button for function testing
        const test_btn = document.getElementById("test-button") as HTMLButtonElement

        test_btn.addEventListener("click", () => {
            // mouseCtrl.changeModelColor(new Coordinates(0, 0, 1, 1));
            // mouseCtrl.changeMarkerColor(new Color(0, 0, 1, 1));
            // mouseCtrl.removeMarker();
            // glWin.clearMarker(true);
            load_btn.click();
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
            if (model_dropdown.value === "") {
                slider_container.style.visibility = "hidden";
                return;
            } else {
                const model = glWin.getModel(model_label.innerText);
                if(!model) return;

                x_slider.value = model.x_translation.toString();
                x_slider_label.innerText = "X Slider: " + x_slider.value;

                y_slider.value = model.y_translation.toString();
                y_slider_label.innerText = "Y Slider: " + y_slider.value;

                rotate_slider.value = (model.z_rotation).toString();
                rotate_slider_label.innerText = "Rotate Slider: " + rotate_slider.value;

                slider_container.style.visibility = "visible";

                if(model != activeModel) mouseCtrl.setFocusModel(model_label.innerText);
                activeModel = glWin.getModel(model_label.innerText);
            }
        }

        x_slider.oninput = () => {
            x_slider_label.innerText = "X Slider: " + x_slider.value;
            if(activeModel){
                activeModel.x_translation = parseInt(x_slider.value);
                glWin.setModel(model_label.innerText, activeModel);
            }
        }
        
        x_slider.onmousedown = async () => {
            await glWin.clearMarker();
        }
        
        x_slider.onmouseup = async () => {
            await mouseCtrl.restoreFocusModel();
        }
        
        y_slider.oninput = () => {
            y_slider_label.innerText = "Y Slider: " + y_slider.value;
            if(activeModel){
                activeModel.y_translation = parseInt(y_slider.value);
                glWin.setModel(model_label.innerText, activeModel);
            }
        }
        
        y_slider.onmousedown = async () => {
            await glWin.clearMarker();
        }
        
        y_slider.onmouseup = async () => {
            await mouseCtrl.restoreFocusModel();
        }

        rotate_slider.oninput = () => {
            rotate_slider_label.innerText = "Rotate Slider " + rotate_slider.value;
            if(activeModel){
                activeModel.z_rotation = parseInt(rotate_slider.value);
                glWin.setModel(model_label.innerText, activeModel);
            }
        }

        rotate_slider.onmousedown = async () => {
            await glWin.clearMarker(true);
        }

        rotate_slider.onmouseup = async () => {
            await mouseCtrl.restoreFocusModel();
        }

        color_picker.oninput = () => {
            const color = color_picker.value;
            const newColor = Color.fromHex(color);

            if(activeMarker){
                glWin.changeMarkerColor(mouseCtrl.currentModelKey, mouseCtrl.currentMarkerKey, newColor, false);
                activeModel = glWin.getModel(mouseCtrl.currentModelKey);
                activeMarker = glWin.getMarker(mouseCtrl.currentMarkerKey);
            } else{
                glWin.changeModelColor(mouseCtrl.currentModelKey, newColor, false);
                activeModel = glWin.getModel(mouseCtrl.currentModelKey);
                activeMarker = glWin.getMarker(mouseCtrl.currentMarkerKey);
            }
        }

        delete_vertex_button.onclick = () => {
            mouseCtrl.removeMarker();
        }

        delete_model_button.onclick = () => {
            mouseCtrl.removeModel();
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
            if (file_input.files != null) {
                const file = file_input.files[0]
                const fileReader = new FileReader();

                fileReader.onload = function (event) {
                    if (event.target != null) {
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

        this.eventListener.addObserver(CanvasModelEvent);
        this.eventListener.subscribe<CanvasModelEvent>(CanvasModelEvent, glWin);

        this.eventListener.addObserver(CanvasMouseEvent);
        this.eventListener.subscribe<CanvasMouseEvent>(CanvasMouseEvent, mouseCtrl);

        this.eventListener.listen<CanvasMouseEvent>(CanvasMouseEvent, CanvasMouseEvent.EVENT_FOCUS_CHANGE_MARKER, (data) => {
            marker_label.innerText = data.markerFocusKey ? data.markerFocusKey : "none";
            if (data.markerFocusKey) {
                activeMarker = glWin.getMarker(data.markerFocusKey);
                color_picker.value = activeMarker?.color.toHex() || "#000000";
            } else{
                activeMarker = undefined;
            }
        })

        this.eventListener.listen<CanvasMouseEvent>(CanvasMouseEvent, CanvasMouseEvent.EVENT_FOCUS_CHANGE_MODEL, (data) => {
            model_label.innerText = data.modelFocusKey ? data.modelFocusKey : "none";
            
            const old_value = model_dropdown.value;
            const new_value = data.modelFocusKey ? data.modelFocusKey : "";

            if(old_value != new_value){
                activeModel = glWin.getModel(new_value);
                model_dropdown.value = new_value;
                model_dropdown.dispatchEvent(new Event("change"));
            }
        })

        this.eventListener.listen<CanvasModelEvent>(CanvasModelEvent, CanvasModelEvent.EVENT_MODEL_ADD, (data) => {
            const optGroup = document.getElementById(data.model?.type.valueOf() + "-group") as HTMLOptGroupElement;
            const option = document.createElement("option");
            option.id = data.modelKey;
            option.text = data.modelKey;
            optGroup.style.display = "block";
            optGroup.append(option)
        })

        this.eventListener.listen<CanvasModelEvent>(CanvasModelEvent, CanvasModelEvent.EVENT_MODEL_DELETE, (data) => {
            const optGroup = document.getElementById(data.model?.type.valueOf() + "-group") as HTMLOptGroupElement;
            document.getElementById(data.modelKey)?.remove();
        })
        
        glWin.clear();
    }
}