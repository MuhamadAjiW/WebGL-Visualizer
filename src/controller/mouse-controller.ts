import {Config} from "../config";
import {BaseModel} from '../models/base-model';
import {LineModel} from "../models/line-model";
import {PolygonModel} from "../models/polygon-model";
import {RectangleModel} from "../models/rectangle-model";
import {SquareModel} from "../models/square-model";
import {Coordinates} from "../types/coordinates";
import {ModelType} from "../types/enum/model-state";
import {MarkerModel} from '../models/marker-model';
import {BufferType} from "../types/enum/buffer-type";
import {Observable} from "../types/events/observer-pattern.ts";
import {CanvasMouseEvent} from "../types/events/canvas-mouse-event";
import {CanvasController} from "./canvas-controller";
import {Color} from "../types/color.ts";

export class MouseController extends Observable<CanvasMouseEvent> {
    public state: ModelType = ModelType.NULL
    public currentModelKey: string
    public currentMarkerKey: string

    private glWin: CanvasController
    private buffer: Array<Coordinates>
    private hoverMarkerKey: string
    private clickBlocked: boolean = false

    constructor(glWin: CanvasController) {
        super()
        this.glWin = glWin
        this.buffer = []
        this.currentModelKey = ""
        this.currentMarkerKey = ""
        this.hoverMarkerKey = ""
    }

    public setCurrentMarkerKey(key: string){
        if(key != this.currentMarkerKey) this.emit(CanvasMouseEvent.EVENT_FOCUS_CHANGE_MARKER, new CanvasMouseEvent(this.currentModelKey, key));
        this.currentMarkerKey = key;
    }

    public setCurrentModelKey(key: string){
        if(key != this.currentModelKey) this.emit(CanvasMouseEvent.EVENT_FOCUS_CHANGE_MODEL, new CanvasMouseEvent(key, this.currentMarkerKey));
        this.currentModelKey = key;
    }

    public reset() {
        this.buffer = []
        this.setFocusModel(null)
    }

    public async handleClick(event: MouseEvent) {
        if (this.clickBlocked) return
        if (this.state == ModelType.NULL) return

        if (this.hoverMarkerKey != "") {
            this.setFocusMarker()
            return;
        }

        let coords = new Coordinates(event.offsetX, event.offsetY);

        if (this.buffer.length == 0) this.setFocusModel(null)
        this.buffer.push(coords)

        let markerSizeOffset = Config.MARKER_SIZE / 2;
        let markerCoords = new Array<Coordinates>(
            new Coordinates(coords.x - markerSizeOffset, coords.y - markerSizeOffset),
            new Coordinates(coords.x + markerSizeOffset, coords.y + markerSizeOffset)
        )

        // TODO: Set using base color picker instead of default color
        let marker: MarkerModel = new MarkerModel(
            markerCoords, this.buffer.length - 1, new Color(Config.DEFAULT_COLOR.r, Config.DEFAULT_COLOR.g, Config.DEFAULT_COLOR.b, Config.MARKER_ALPHA)
        )
        this.glWin.addModel(marker, markerCoords[0], "", "", true);

        if (this.buffer.length < 2) return

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
                if (this.buffer.length < 4) return;
                model = new PolygonModel(this.buffer)
                break;
        }
        this.clickBlocked = true;
        let newModelKey;
        if (this.state != ModelType.POLYGON) {
            newModelKey = await this.glWin.addModel(model, this.buffer[0]);
            this.buffer = [];
        } else {
            newModelKey = await this.glWin.addModel(model, this.buffer[0], "", this.currentModelKey);
        }
        this.setFocusModel(newModelKey);
        this.clickBlocked = false;
    }

    public handleHover(event: MouseEvent) {
        if (this.clickBlocked) return
        const newMarkerKey = this.glWin.detectMarker(event.offsetX, event.offsetY);
        
        if (newMarkerKey != this.hoverMarkerKey) {
            let marker = this.glWin.getMarker(this.hoverMarkerKey)
            if (marker != null && !marker.isActive()) {
                marker.unhighlight();
                this.glWin.setMarker(this.hoverMarkerKey, marker);
            }
            this.hoverMarkerKey = newMarkerKey;
            if (this.hoverMarkerKey == null) return;
            
            marker = this.glWin.getMarker(this.hoverMarkerKey)
            if (marker != null) {
                marker.highlight();
                this.glWin.setMarker(this.hoverMarkerKey, marker);
            }
        }
    }

    public async setFocusModel(modelKey: string | null) {
        if (modelKey == null) {
            this.setCurrentModelKey("");
            this.setCurrentMarkerKey("");
            this.hoverMarkerKey = "";
            this.glWin.clearMarker();
            return;
        }
        
        let model = this.glWin.getModel(modelKey);
        
        if (model == null) throw Error("Invalid model requested");
        
        this.setCurrentModelKey(modelKey);
        this.setCurrentMarkerKey("");
        this.hoverMarkerKey = ""

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
                markerCoords, index, new Color(colors[index].x, colors[index].y, colors[index].z, Config.MARKER_ALPHA)
            );

            this.glWin.addModel(marker, markerCoords[0], "", "", true);
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

    public async setFocusMarker() {
        if (this.currentMarkerKey != "") {
            const marker = this.glWin.getMarker(this.currentMarkerKey)
            if (marker != null) {
                marker.setActive(false);
                this.glWin.setMarker(this.currentMarkerKey, marker);
            }
        }

        if (this.hoverMarkerKey != this.currentMarkerKey) {
            const marker = this.glWin.getMarker(this.hoverMarkerKey)
            if(marker){
                marker.setActive(true);
                this.glWin.setMarker(this.hoverMarkerKey, marker);
                this.setCurrentMarkerKey(this.hoverMarkerKey);
            }
        } else{
            this.setCurrentMarkerKey("");
        }
    }

    public async removeMarker() {
        if (this.currentMarkerKey == "" || this.currentModelKey == "") throw Error("Invalid model or marker in focus");

        const model = this.glWin.getModel(this.currentModelKey);
        if (!model || model.type != ModelType.POLYGON) return;

        const marker = this.glWin.getMarker(this.currentMarkerKey);
        if (marker != null) {
            this.buffer = model.getBufferData(BufferType.POSITION, false);

            if (this.buffer.length <= 4) return;
            this.buffer.splice(marker.index, 1);

            const newModel = new PolygonModel(this.buffer);

            const newcode = await this.glWin.addModel(newModel);
            this.glWin.removeModel(this.currentMarkerKey, true);
            this.glWin.removeModel(this.currentModelKey, false);

            await this.setFocusModel(newcode);
            this.setCurrentModelKey(newcode);
        }
    }

    public async getModelBufferData() {
        if (this.currentModelKey == "") throw Error("Invalid model in focus");

        const model = this.glWin.getModel(this.currentMarkerKey)
        if (!model) return;

        this.buffer = model.getBufferData(BufferType.POSITION, false);
    }
}