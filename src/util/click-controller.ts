import { Config } from "../config";
import { BaseModel } from '../models/base-model';
import { LineModel } from "../models/line-model";
import { PolygonModel } from "../models/polygon-model";
import { RectangleModel } from "../models/rectangle-model";
import { SquareModel } from "../models/square-model";
import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { WebGlWindow } from "./web-gl-window";
import { MarkerModel } from '../models/marker-model';
import { BufferType } from "../types/enum/buffer-type";

export class MouseController{
    public state: ModelType = ModelType.NULL
    private glWin: WebGlWindow
    private buffer: Array<Coordinates>
    private currentModelKey: string
    private currentMarkerKey: string
    private hoverMarkerKey: string
    private clickBlocked: boolean = false
    
    constructor(glWin: WebGlWindow){
        this.glWin = glWin
        this.buffer = []
        this.currentModelKey = ""
        this.currentMarkerKey = ""
        this.hoverMarkerKey = ""
    }
    
    public reset(){
        this.buffer = []
        this.setFocus(null)
    }

    public async handleClick(event:MouseEvent) {
        if(this.clickBlocked) return
        if(this.state == ModelType.NULL) return

        if(this.hoverMarkerKey != "") {
            if(this.currentMarkerKey != ""){
                const marker = this.glWin.getMarker(this.currentMarkerKey)
                if(marker != null){
                    marker.setActive(false);
                    this.glWin.setMarker(this.currentMarkerKey, marker);
                }
            }

            this.currentMarkerKey = this.hoverMarkerKey;
            const marker = this.glWin.getMarker(this.currentMarkerKey)
            if(marker != null){
                marker.setActive(true);
                this.glWin.setMarker(this.currentMarkerKey, marker);
            }
            return;
        };

        let coords = new Coordinates(event.offsetX, event.offsetY);

        if(this.buffer.length == 0) this.setFocus(null)
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
            this.currentModelKey = await this.glWin.addModel(model, this.buffer[0])
            this.buffer = []
        } else{
            this.currentModelKey = await this.glWin.addModel(model, this.buffer[0], this.currentModelKey)
        }
        await this.setFocus(this.currentModelKey)
        this.clickBlocked = false;
    }

    public handleHover(event:MouseEvent) {
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

    public async setFocus(modelKey: string | null){
        if(modelKey == null){
            this.currentModelKey = "";
            this.currentMarkerKey = ""
            this.hoverMarkerKey = ""
            this.glWin.clearMarker();
            return;
        }
        
        let model = this.glWin.getModel(modelKey);
        if(model == null) return;

        this.currentModelKey = modelKey;
        this.glWin.clearMarker();

        const coords: Array<Coordinates> = model.getBufferData(BufferType.POSITION);
        const colors: Array<Coordinates> = model.getBufferData(BufferType.COLOR);

        coords.forEach(async (coord, index) => {
            let markerSizeOffset = Config.MARKER_SIZE/2;
            let markerCoords = new Array<Coordinates>(
                new Coordinates(coord.x - markerSizeOffset, coord.y - markerSizeOffset),
                new Coordinates(coord.x + markerSizeOffset, coord.y + markerSizeOffset)
            );
            let marker: MarkerModel = new MarkerModel(
                markerCoords, index * 4, new Coordinates(colors[index].x, colors[index].y, colors[index].z, Config.MARKER_ALPHA)
            );
            
            await this.glWin.addModel(marker, markerCoords[0], "", "", true);
        })
    }
}