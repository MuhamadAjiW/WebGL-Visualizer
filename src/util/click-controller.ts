import { BaseModel } from "../models/base-model";
import { LineModel } from "../models/line-model";
import { PolygonModel } from "../models/polygon-model";
import { RectangleModel } from "../models/rectangle-model";
import { SquareModel } from "../models/square-model";
import { ModelState } from "../types/enum/model-state";
import { WebGlWindow } from "./web-gl-window";

export class ClickController{
    public state: ModelState = ModelState.LINE
    private clickCounter: number = 0
    private glWin: WebGlWindow
    private buffer: Array<Array<number>>

    constructor(glWin: WebGlWindow){
        this.glWin = glWin
        this.buffer = []
    }
    
    reset(){
        this.clickCounter = 0
        this.buffer = []
    }

    handleClick(event:MouseEvent) {
        this.buffer.push(new Array<number>(event.offsetX, event.offsetY))
        
        if(this.clickCounter++ < 2) return
        
        let model: BaseModel;
        switch (this.state) {
            case ModelState.LINE:
                model = new LineModel()
                break;
            case ModelState.SQUARE:
                model = new SquareModel()
                break;
            case ModelState.RECTANGLE:
                model = new RectangleModel()
                break;
            case ModelState.POLYGON:
                model = new PolygonModel()
                break;
        }

        if(this.state != ModelState.POLYGON){
            this.glWin.draw([model])
            this.clickCounter = 0 
        } else{
            // Handle polygon
        }
    }
}