import {ModelType} from "../types/enum/model-state";
import {CanvasMouseEvent} from "../types/events/canvas-mouse-event";
import {Observer} from "../types/events/web-gl-events";
import {CanvasController} from "./canvas-controller";
import {MouseController} from "./mouse-controller";
import {m4, Matrix4} from "../util/m4.ts";
import {id4} from '../util/m4';
import {Color} from "../types/color.ts";

export class UIController extends Observer<CanvasMouseEvent> {
    constructor(glWin: CanvasController, mouseCtrl: MouseController) {
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
        const color_picker = document.getElementById("color-picker") as HTMLInputElement;

        let matrixTranslationX: Matrix4 = id4;
        let matrixTranslationY: Matrix4 = id4;
        let matrixRotationSlider: Matrix4 = id4;
        let matrixRotationMain: Matrix4 = id4;

        // TODO: delete, this a dummy button for function testing
        const test_btn = document.getElementById("test-button") as HTMLButtonElement

        test_btn.addEventListener("click", () => {
            // mouseCtrl.changeModelColor(new Coordinates(0, 0, 1, 1));
            // mouseCtrl.changeMarkerColor(new Coordinates(0, 0, 1, 1));
            // mouseCtrl.removeMarker();
            // glWin.clearMarker(true);
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
                color_picker.style.visibility = "hidden";

                const model = glWin.getModel(model_label.innerText);

                x_slider.value = model!.x_translation.toString();
                x_slider_label.innerText = "X Slider: " + x_slider.value;

                y_slider.value = model!.y_translation.toString();
                y_slider_label.innerText = "Y Slider: " + y_slider.value;

                rotate_slider.value = (model!.z_rotation * 180 / Math.PI).toString();
                rotate_slider_label.innerText = "Rotate Slider: " + rotate_slider.value;

                slider_container.style.visibility = "visible";
                mouseCtrl.setFocusModel(model_label.innerText);
            }
        }

        const showMatrix = () => {
            const model = glWin.getModel(model_label.innerText);
            if (model == null) return;

            let u_matrix: Matrix4 = id4;

            const center = model.getCenter();
            const matrixRotationT1 = m4.translation(-center.x, -center.y, 0);
            const matrixRotationT2 = m4.translation(center.x, center.y, 0);

            u_matrix = m4.multiply(matrixRotationT1, u_matrix);
            u_matrix = m4.multiply(matrixRotationSlider, u_matrix);
            u_matrix = m4.multiply(matrixRotationT2, u_matrix);

            u_matrix = m4.multiply(matrixRotationMain, u_matrix);
            u_matrix = m4.multiply(matrixTranslationX, u_matrix);
            u_matrix = m4.multiply(matrixTranslationY, u_matrix);

            model.uniforms.u_matrix = u_matrix;
            model.x_translation = u_matrix[12];
            model.y_translation = u_matrix[13];
            model.z_rotation = Math.atan2(u_matrix[1], u_matrix[0]);
            glWin.setModel(model_label.innerText, model);
        }

        x_slider.oninput = () => {
            x_slider_label.innerText = "X Slider: " + x_slider.value;
            matrixTranslationX = parseInt(x_slider.value) == 0 ? id4 : m4.translation(parseInt(x_slider.value), 0, 0);
            showMatrix();
        }

        x_slider.onmousedown = async () => {
            await glWin.clearMarker();
        }

        x_slider.onmouseup = async () => {
            await mouseCtrl.restoreFocusModel();
        }

        y_slider.oninput = () => {
            y_slider_label.innerText = "Y Slider: " + y_slider.value;
            matrixTranslationY = parseInt(y_slider.value) == 0 ? id4 : m4.translation(0, parseInt(y_slider.value), 0);
            showMatrix();
        }

        y_slider.onmousedown = async () => {
            await glWin.clearMarker();
        }

        y_slider.onmouseup = async () => {
            await mouseCtrl.restoreFocusModel();
        }

        rotate_slider.oninput = () => {
            rotate_slider_label.innerText = "Rotate Slider " + rotate_slider.value;
            const model = glWin.getModel(model_label.innerText);
            if (model == null) return;
            matrixRotationSlider = m4.zRotation(parseInt(rotate_slider.value) * Math.PI / (180));
            showMatrix();
        }

        rotate_slider.onmousedown = async () => {
            await glWin.clearMarker(true);
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

        color_picker.oninput = () => {
            const color = color_picker.value;
            const newColor = Color.fromHex(color);
            mouseCtrl.changeMarkerColor(newColor);
        }

        this.subscribe(mouseCtrl);
        this.addEventListener(CanvasMouseEvent.EVENT_FOCUS_CHANGE, (data) => {
            model_label.innerText = data.modelFocusKey ? data.modelFocusKey : "none";
            marker_label.innerText = data.markerFocusKey ? data.markerFocusKey : "none";
            console.log("model label: " + data.modelFocusKey)
            color_picker.style.visibility = marker_label.innerText !== "none" ? "visible" : "hidden";
            color_picker.value = marker_label.innerText !== "none" ? glWin.getMarker(marker_label.innerText)!.color.toHex() : "#808080";
            slider_container.style.visibility = model_label.innerText !== "none" ? "visible" : "hidden";
        })

        glWin.clear();
    }
}