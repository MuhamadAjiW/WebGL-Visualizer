import {BufferInfo} from "../types/buffer-info";
import {BaseModel} from '../models/base-model';
import {Coordinates} from "../types/coordinates";
import {lerp} from "../util/math-util";
import {ExportData} from '../types/export-data';
import {Config} from '../config';
import {MarkerModel} from "../models/marker-model";
import {WebGlController} from "./webgl-controller";
import {AnimationType} from "../types/enum/animate-type";
import { Observable } from "../types/events/observer-pattern";
import { CanvasModelEvent } from "../types/events/canvas-model-event";

export class CanvasController extends Observable<CanvasModelEvent> {
    public canvas: HTMLCanvasElement;
    private glController: WebGlController;

    private modelBuffer: Map<string, BaseModel> = new Map<string, BaseModel>();
    private modelMapKey: number = 0;

    private markerBuffer: Map<string, MarkerModel> = new Map<string, MarkerModel>();
    private markerMapKey: number = 0;

    private lerpCode: number = 0;


    constructor(id: string) {
        super();
        this.glController = new WebGlController(id);
        this.canvas = this.glController.canvas;
    }

    public unsetModel(modelKey: string) {
        this.modelBuffer.delete(modelKey);
        this.draw();
    }

    public setModel(modelKey: string, modelData: BaseModel) {
        this.modelBuffer.set(modelKey, modelData);
        this.draw()
    }

    public setMarker(markerKey: string, markerData: MarkerModel) {
        this.markerBuffer.set(markerKey, markerData);
        this.draw()
    }

    public getModel(modelKey: string): BaseModel | undefined {
        return this.modelBuffer.get(modelKey);
    }

    public getMarker(markerKey: string): MarkerModel | undefined {
        return this.markerBuffer.get(markerKey);
    }

    public async addModel(model: BaseModel, start: Coordinates | null = null, modelKey: string = "", replacedModelKey: string = "", isMarker: boolean = false): Promise<string> {
        const key: string = modelKey === "" ? (isMarker ? "Marker" + this.markerMapKey++ : "Model" + this.modelMapKey++) : modelKey;
        if (start == null) {
            isMarker ? this.setMarker(key, model as MarkerModel) : this.setModel(key, model);
            return key;
        }

        const buffer = isMarker ? this.markerBuffer : this.modelBuffer;

        this.lerpCode++;
        const lerpKey = this.lerpCode + "_lerp";
        const lerpModel = model.clone();


        let lerpModelData: number[] = []
        for (let index = 0; index < model.positionBuffer.len; index++) {
            lerpModelData = lerpModelData.concat(start!.getComponents())
        }

        lerpModel.positionBuffer = new BufferInfo(
            model.positionBuffer.len,
            lerpModelData
        )

        this.animateModel(AnimationType.POSITION, lerpKey, lerpModel, model, key, replacedModelKey, isMarker);

        await new Promise(resolve => {
            const checkBuffer = () => {
                const model = buffer.get(key);
                if (model !== undefined){
                    if (!isMarker){
                        this.emit(CanvasModelEvent.EVENT_MODEL_ADD, new CanvasModelEvent(this.modelBuffer, model, key, model.type));
                    }
                    resolve(key);
                }
                else setTimeout(checkBuffer, 100);
            };
            checkBuffer();
        });

        return key;
    }

    public async updateModel(type: AnimationType, targetModel: BaseModel, modelKey: string, isMarker: boolean = false): Promise<string> {
        const buffer = isMarker ? this.markerBuffer : this.modelBuffer;

        const originModel = buffer.get(modelKey);

        if (originModel == null) throw Error("No origin model found");
        if (targetModel.positionBuffer.len != originModel.positionBuffer.len) throw Error("Target and origin model does not have the same vertex count");
        if (type == AnimationType.NULL) {
            buffer.set(modelKey, targetModel);
            this.draw();
            return modelKey;
        }

        this.lerpCode++;
        const lerpModel = originModel.clone();
        let lerpKey = this.lerpCode + "_lerp";

        buffer.delete(modelKey);
        this.draw();

        const key: string = isMarker ? "Marker" + this.markerMapKey++ : "Model" + this.modelMapKey++;
        this.animateModel(type, lerpKey, lerpModel, targetModel, key, modelKey, isMarker);

        await new Promise(resolve => {
            const checkBuffer = () => {
                const model = buffer.get(key);
                if (model !== undefined){
                    if (!isMarker){
                        this.emit(CanvasModelEvent.EVENT_MODEL_UPDATE, new CanvasModelEvent(this.modelBuffer, model, key, model.type));
                    }
                    resolve(key);
                }
                else setTimeout(checkBuffer, 100);
            };
            checkBuffer();
        });

        return key;
    }

    public async removeModel(modelKey: string, isMarker = false): Promise<void> {
        const buffer = isMarker ? this.markerBuffer : this.modelBuffer;
        const model = buffer.get(modelKey);
        if (model == null) return;

        this.lerpCode++;
        const lerpKey = this.lerpCode + "_lerp";
        const lerpModel = model.clone()

        let start = new Coordinates(
            model.positionBuffer.data[0],
            model.positionBuffer.data[1],
            model.positionBuffer.data[2],
            model.positionBuffer.data[3]
        )

        let lerpModelData: number[] = []
        for (let index = 0; index < model.positionBuffer.len; index++) {
            lerpModelData = lerpModelData.concat(start.getComponents())
        }

        lerpModel.positionBuffer = new BufferInfo(
            model.positionBuffer.len,
            lerpModelData
        )

        this.animateModel(AnimationType.POSITION, lerpKey, model, lerpModel, modelKey, modelKey, isMarker);

        await new Promise<void>(resolve => {
            const checkBuffer = () => {
                if (buffer.get(modelKey) == undefined){
                    if (!isMarker){
                        this.emit(CanvasModelEvent.EVENT_MODEL_DELETE, new CanvasModelEvent(this.modelBuffer, null, modelKey, model.type));
                    }
                    resolve();
                }
                else setTimeout(checkBuffer, 100);
            };
            checkBuffer();
        });
    }

    public async clear(): Promise<void> {
        this.clearMarker();
        this.modelBuffer.forEach((_, key) => {
            this.removeModel(key);
        })

        await new Promise<void>(resolve => {
            const checkBuffer = () => {
                if (this.modelBuffer.size == 0) resolve();
                else setTimeout(checkBuffer, 100);
            };
            checkBuffer();
        });
    }

    public async clearMarker(exceptActive: boolean = false) {
        if (exceptActive) {
            this.markerBuffer.forEach((value, key) => {
                if (!value.isActive()) this.removeModel(key, true);
            })

            await new Promise<void>(resolve => {
                const checkBuffer = () => {
                    if (this.markerBuffer.size == 1) resolve();
                    else setTimeout(checkBuffer, 100);
                };
                checkBuffer();
            });
        } else {
            this.markerBuffer.forEach((_, key) => {
                this.removeModel(key, true);
            })

            await new Promise<void>(resolve => {
                const checkBuffer = () => {
                    if (this.markerBuffer.size == 0) resolve();
                    else setTimeout(checkBuffer, 100);
                };
                checkBuffer();
            });
        }
    }

    public detectMarker(x: number, y: number): string {
        let keys: Array<string> = []
        this.markerBuffer.forEach((value, key) => {
            try {
                if (value.isInside(x, y)) keys.push(key);
            } catch (any) {
            }
        })

        return keys[0] ? keys[0] : "";
    }

    public save() {
        const serialized: ExportData = {
            modelMapKey: this.modelMapKey,
            modelBuffer: Array.from(this.modelBuffer.entries())
        }
        const jsonStr = JSON.stringify(serialized);
        const blob = new Blob([jsonStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);

        const temp = document.createElement('a');
        temp.href = url;
        temp.download = "export";
        document.body.appendChild(temp);
        temp.click();
        document.body.removeChild(temp);
        URL.revokeObjectURL(url);
    }

    public async load(jsonStr: string) {
        await this.clear()

        const parsed = JSON.parse(jsonStr) as ExportData;

        const buffer = new Map<string, BaseModel>(parsed.modelBuffer);
        this.modelMapKey = parsed.modelMapKey

        buffer.forEach((val, key) => {
            let model = val;
            model.colorBuffer.data = new Float32Array(Object.values(val.colorBuffer.data))
            model.positionBuffer.data = new Float32Array(Object.values(val.positionBuffer.data))

            let startCoords = new Coordinates(
                model.positionBuffer.data[0],
                model.positionBuffer.data[1],
                model.positionBuffer.data[2],
                model.positionBuffer.data[3]
            )

            this.addModel(model, startCoords, key);
        })

        this.draw();
    }

    private animateModel(type: AnimationType, lerpKey: string, lerpModel: BaseModel, targetModel: BaseModel, modelKey: string, replacedModelKey: string = "", isMarker: boolean = false) {
        if (type && AnimationType.POSITION) {
            lerpModel.positionBuffer.data.forEach((value, index) => {
                lerpModel.positionBuffer.data[index] =
                    lerp(value, targetModel.positionBuffer.data[index], Config.LERP_MODIFIER);
            })
        }
        if (type && AnimationType.COLOR) {
            lerpModel.colorBuffer.data.forEach((value, index) => {
                lerpModel.colorBuffer.data[index] =
                    lerp(value, targetModel.colorBuffer.data[index], Config.LERP_MODIFIER);
            });
        }
        if (type && AnimationType.UNIFORM) {
            lerpModel.uniforms["u_matrix"].forEach((value, index) => {
                lerpModel.uniforms["u_matrix"][index] =
                    lerp(value, targetModel.uniforms["u_matrix"][index], Config.LERP_MODIFIER);
            });
        }

        const buffer: Map<string, BaseModel> = isMarker ? this.markerBuffer : this.modelBuffer;

        buffer.set(lerpKey, lerpModel);
        this.draw();
        buffer.delete(lerpKey);

        if (lerpModel.positionBuffer.data.every((value, index) =>
                Math.abs(value - targetModel.positionBuffer.data[index]) < Config.LERP_TOLERANCE)
            &&
            lerpModel.colorBuffer.data.every((value, index) =>
                Math.abs(value - targetModel.colorBuffer.data[index]) < Config.LERP_TOLERANCE / 10)
            &&
            lerpModel.uniforms["u_matrix"].every((value, index) =>
                Math.abs(value - targetModel.uniforms["u_matrix"][index]) < Config.LERP_TOLERANCE)
        ) {
            buffer.set(modelKey, targetModel);
            if (replacedModelKey !== "") buffer.delete(replacedModelKey);
            this.draw();
            return;
        }
        ;

        requestAnimationFrame(() => {
            this.animateModel(type, lerpKey, lerpModel, targetModel, modelKey, replacedModelKey, isMarker)
        })
    }

    private draw(): void {
        this.glController.draw(this.modelBuffer);
        this.glController.draw(this.markerBuffer);
    }
}
