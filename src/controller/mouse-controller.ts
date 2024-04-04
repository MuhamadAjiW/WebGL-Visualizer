import { Config } from "../config";
import { BaseModel } from '../models/base-model';
import { LineModel } from "../models/line-model";
import { PolygonModel } from "../models/polygon-model";
import { RectangleModel } from "../models/rectangle-model";
import { SquareModel } from "../models/square-model";
import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { MarkerModel } from '../models/marker-model';
import { BufferType } from "../types/enum/buffer-type";
import { Observable } from "../types/events/web-gl-events";
import { CanvasMouseEvent } from "../types/events/canvas-mouse-event";
import { CanvasController } from "./canvas-controller";

export class MouseController extends Observable<CanvasMouseEvent> {
    public state: ModelType = ModelType.NULL
    public currentModelKey: string
    public currentMarkerKey: string
    
    private glWin: CanvasController
    private buffer: Array<Coordinates>
    private hoverMarkerKey: string
    private clickBlocked: boolean = false
    
    constructor(glWin: CanvasController){
        super()
        this.glWin = glWin
        this.buffer = []
        this.currentModelKey = ""
        this.currentMarkerKey = ""
        this.hoverMarkerKey = ""
    }
    
    public reset(){
        this.buffer = []
        this.setFocusModel(null)
    }

    public async handleClick(event:MouseEvent) {
        if(this.clickBlocked) return
        if(this.state == ModelType.NULL) return
        
        if(this.hoverMarkerKey != "") {
            this.setFocusMarker()
            return;
        };

        let coords = new Coordinates(event.offsetX, event.offsetY);

        if(this.buffer.length == 0) this.setFocusModel(null)
        this.buffer.push(coords)
        
        let markerSizeOffset = Config.MARKER_SIZE/2;
        let markerCoords = new Array<Coordinates>(
            new Coordinates(coords.x - markerSizeOffset, coords.y - markerSizeOffset),
            new Coordinates(coords.x + markerSizeOffset, coords.y + markerSizeOffset)
        )
        
        // TODO: Set using base color picker instead of default color
        let marker: MarkerModel = new MarkerModel(
            markerCoords, this.buffer.length - 1, new Coordinates(Config.DEFAULT_COLOR.x, Config.DEFAULT_COLOR.y, Config.DEFAULT_COLOR.z, Config.MARKER_ALPHA)
        )
        this.glWin.addModel(marker, markerCoords[0], "", "", true);
            
        if(this.buffer.length < 2) return

        let model: BaseModel;
        switch (this.state) {
            case ModelType.LINE:
                model = new LineModel(this.buffer)
                break;
            case ModelType.SQUARE:
                model = new SquareModel(this.buffer)
                break;
            case ModelType.RECTANGLE:
                model = new RectangleModel(this.buffer)
                break;
            case ModelType.POLYGON:
                if(this.buffer.length < 4) return;
                model = new PolygonModel(this.buffer)
                break;
        }
        this.clickBlocked = true;
        if(this.state != ModelType.POLYGON){
            this.currentModelKey = await this.glWin.addModel(model, this.buffer[0]);
            this.buffer = [];
        } else{
            this.currentModelKey = await this.glWin.addModel(model, this.buffer[0], "", this.currentModelKey);
            // this.buffer = model.getBufferData(BufferType.POSITION, false);
            // console.log(model.positionBuffer);
        }
        await this.setFocusModel(this.currentModelKey);
        this.clickBlocked = false;
    }

    public handleHover(event:MouseEvent) {
        if(this.clickBlocked) return
        const newMarkerKey = this.glWin.detectMarker(event.offsetX, event.offsetY);

        if(newMarkerKey != this.hoverMarkerKey){
            let marker = this.glWin.getMarker(this.hoverMarkerKey)
            if(marker != null && !marker.isActive()){
                marker.unhighlight();
                this.glWin.setMarker(this.hoverMarkerKey, marker);
            }
            this.hoverMarkerKey = newMarkerKey;
            if(this.hoverMarkerKey == null) return;
    
            marker = this.glWin.getMarker(this.hoverMarkerKey)
            if(marker != null){
                marker.highlight();
                this.glWin.setMarker(this.hoverMarkerKey, marker);
            }
        }
    }

    public async setFocusModel(modelKey: string | null) {
        if (modelKey == null) {
            this.currentModelKey = "";
            this.currentMarkerKey = ""
            this.hoverMarkerKey = ""
            this.glWin.clearMarker();
            this.emit(CanvasMouseEvent.EVENT_FOCUS_CHANGE, this.getCanvasEventData())
            return;
        }

        let model = this.glWin.getModel(modelKey);

        if (model == null) throw Error("Invalid model requested");

        this.currentModelKey = modelKey;
        this.currentMarkerKey = ""
        this.hoverMarkerKey = ""
        this.emit(CanvasMouseEvent.EVENT_FOCUS_CHANGE, this.getCanvasEventData());

        this.glWin.clearMarker();

        const coords: Array<Coordinates> = model.getBufferData(BufferType.POSITION, true);
        const colors: Array<Coordinates> = model.getBufferData(BufferType.COLOR, true);

        let counter = 0;
        for (const coord of coords) {
            const index = coords.indexOf(coord);
            let markerSizeOffset = Config.MARKER_SIZE / 2;
            let markerCoords = new Array<Coordinates>(
                new Coordinates(coord.x - markerSizeOffset, coord.y - markerSizeOffset),
                new Coordinates(coord.x + markerSizeOffset, coord.y + markerSizeOffset)
            );
            let marker: MarkerModel = new MarkerModel(
                markerCoords, index, new Coordinates(colors[index].x, colors[index].y, colors[index].z, Config.MARKER_ALPHA)
            );

            await this.glWin.addModel(marker, markerCoords[0], "", "", true);
            counter++;
        }

        await new Promise<void>(resolve => {
            const checkBuffer = () => {
                if (counter == coords.length) resolve();
                else setTimeout(checkBuffer, 100);
            };
            checkBuffer();
        });
    }

    public async restoreFocusModel() {
        await this.setFocusModel(this.currentModelKey);
        this.setFocusMarker();
    }

    public async setFocusMarker(){
        if(this.currentMarkerKey != ""){
            const marker = this.glWin.getMarker(this.currentMarkerKey)
            if(marker != null){
                marker.setActive(false);
                this.glWin.setMarker(this.currentMarkerKey, marker);
            }
        }

        this.currentMarkerKey = this.hoverMarkerKey;
        const marker = this.glWin.getMarker(this.hoverMarkerKey)
        if(marker != null){
            marker.setActive(true);
            this.glWin.setMarker(this.currentMarkerKey, marker);

            this.emit(CanvasMouseEvent.EVENT_FOCUS_CHANGE, this.getCanvasEventData());
        }
    }

    public async removeMarker(){
        if(this.currentMarkerKey == "" || this.currentModelKey == "") throw Error("Invalid model or marker in focus");;
        
        const model = this.glWin.getModel(this.currentModelKey);
        if(!model || model.type != ModelType.POLYGON) return;
        
        const marker = this.glWin.getMarker(this.currentMarkerKey)
        if(marker != null){
            this.buffer = model.getBufferData(BufferType.POSITION, false);
            
            if(this.buffer.length <= 4) return;
            this.buffer.splice(marker.index, 1);
            
            const newModel = new PolygonModel(this.buffer);

            const newcode = await this.glWin.addModel(newModel);
            this.glWin.removeModel(this.currentMarkerKey, true);
            this.glWin.removeModel(this.currentModelKey, false);

            this.currentModelKey = newcode;
            this.setFocusModel(this.currentModelKey);
        }
    }

    public async changeMarkerColor(color: Coordinates){
        if(this.currentMarkerKey == "" || this.currentModelKey == "") throw Error("Invalid model or marker in focus");
        
        const model = this.glWin.getModel(this.currentModelKey);
        if(!model) return;
        
        const marker = this.glWin.getMarker(this.currentMarkerKey)
        if(marker != null){
            const newModel = model.clone();
            const offset = marker.index * 4;
            newModel.colorBuffer.data[offset + 0] = color.x;
            newModel.colorBuffer.data[offset + 1] = color.y;
            newModel.colorBuffer.data[offset + 2] = color.z;
            newModel.colorBuffer.data[offset + 3] = color.p;

            const newMarker = marker.clone();
            newMarker.setColor(color);

            const [modelPromise, markerPromise] = await Promise.all([
                this.glWin.updateModel(newModel, this.currentModelKey, false),
                this.glWin.updateModel(newMarker, this.currentMarkerKey, true)
            ]);

            this.currentModelKey = modelPromise;
            this.currentMarkerKey = markerPromise;

            this.emit(CanvasMouseEvent.EVENT_FOCUS_CHANGE, this.getCanvasEventData())
        }
    }

    public async changeModelColor(color: Coordinates){
        const model = this.glWin.getModel(this.currentModelKey);
        if(!model) throw Error("Invalid model in focus");
        
        const newModel = model.clone();
        for (let index = 0; index < newModel.colorBuffer.data.length; index += 4) {
            newModel.colorBuffer.data[index + 0] = color.x;
            newModel.colorBuffer.data[index + 1] = color.y;
            newModel.colorBuffer.data[index + 2] = color.z;
            newModel.colorBuffer.data[index + 3] = color.p;
        }

        this.currentModelKey = await this.glWin.updateModel(newModel, this.currentModelKey, false),
        await this.setFocusModel(this.currentModelKey);
    }

    public async getModelBufferData(){
        if(this.currentModelKey == "") throw Error("Invalid model in focus");;

        const model = this.glWin.getModel(this.currentMarkerKey)
        if(!model) return;

        this.buffer = model.getBufferData(BufferType.POSITION, false);
    }

    private getCanvasEventData() : CanvasMouseEvent{
        return new CanvasMouseEvent(this.currentModelKey, this.currentMarkerKey);
    }
}