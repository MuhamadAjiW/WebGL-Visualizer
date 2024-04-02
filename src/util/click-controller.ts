import { BaseModel } from "../models/base-model";
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

    constructor(glWin: WebGlWindow){
        this.glWin = glWin
        this.buffer = []
    }
    
    reset(){
        this.buffer = []
    }

    handleClick(event:MouseEvent) {
        if(this.state == ModelType.NULL) return

        this.buffer.push(new Coordinates(event.offsetX, event.offsetY))        
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
                model = new PolygonModel(this.buffer)
                break;
        }
        this.glWin.addModel(model, this.buffer[0])
        if(this.state != ModelType.POLYGON){
            this.buffer = []
        }
    }
}