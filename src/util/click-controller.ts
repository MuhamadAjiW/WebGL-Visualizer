import { Config } from "../config";
import { BaseModel } from '../models/base-model';
import { LineModel } from "../models/line-model";
import { PolygonModel } from "../models/polygon-model";
import { RectangleModel } from "../models/rectangle-model";
import { SquareModel } from "../models/square-model";
import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { WebGlWindow } from "./web-gl-window";

export class ClickController{
    public state: ModelType = ModelType.NULL
    private glWin: WebGlWindow
    private buffer: Array<Coordinates>
    private currentKey: string
    
    constructor(glWin: WebGlWindow){
        this.glWin = glWin
        this.buffer = []
        this.currentKey = ""
    }
    
    public reset(){
        this.buffer = []
        this.currentKey = ""
    }

    public async handleClick(event:MouseEvent) {
        if(this.state == ModelType.NULL) return

        let coords = new Coordinates(event.offsetX, event.offsetY);

        this.buffer.push(coords)
        
        let markerSizeOffset = Config.MARKER_SIZE/2;
        let markerCoords = new Array<Coordinates>(
            new Coordinates(coords.x - markerSizeOffset, coords.y - markerSizeOffset),
            new Coordinates(coords.x + markerSizeOffset, coords.y + markerSizeOffset)
        )
        let marker: SquareModel = new SquareModel(
            markerCoords
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
        if(this.state != ModelType.POLYGON){
            this.currentKey = await this.glWin.addModel(model, this.buffer[0])
            this.buffer = []
            this.setFocus(this.currentKey)
        } else{
            this.currentKey = await this.glWin.addModel(model, this.buffer[0], this.currentKey)
        }
    }

    public setFocus(key: string){
        let model = this.glWin.getModel(key);
        if(model == null) return;

        this.currentKey = key;
        this.glWin.clearMarker();

        let coords: Array<Coordinates> = model.getCoordinates();

        coords.forEach((coord) => {
            let markerSizeOffset = Config.MARKER_SIZE/2;
            let markerCoords = new Array<Coordinates>(
                new Coordinates(coord.x - markerSizeOffset, coord.y - markerSizeOffset),
                new Coordinates(coord.x + markerSizeOffset, coord.y + markerSizeOffset)
            )
            let marker: SquareModel = new SquareModel(
                markerCoords
            )
            this.glWin.addModel(marker, markerCoords[0], "", "", true);
        })
    }
}