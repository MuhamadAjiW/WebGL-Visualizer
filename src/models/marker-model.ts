import { Coordinates } from "../types/coordinates";
import { BaseModel } from "./base-model";
import { SquareModel } from "./square-model";

export class MarkerModel extends SquareModel {
    public index: number;
    public color: Coordinates;

    constructor(points: Array<Coordinates>, boundIndex: number, color: Coordinates) {
        super(points);
        this.index = boundIndex;
        this.color = color;

        let colorData: Array<number> = [];
        for (let index = 0; index < 4; index++) {
            colorData = colorData.concat(color.getComponents());
        }
        this.colorBuffer.data = new Float32Array(colorData);
    }

    public isInside(x: number, y: number) : boolean{
        let upperLimitX;
        let lowerLimitX;
        let upperLimitY;
        let lowerLimitY;

        if(this.positionBuffer.data[0] > this.positionBuffer.data[8]){
            upperLimitX = this.positionBuffer.data[0];
            lowerLimitX = this.positionBuffer.data[8];
        } else{
            upperLimitX = this.positionBuffer.data[8];
            lowerLimitX = this.positionBuffer.data[0];
        }

        if(this.positionBuffer.data[1] > this.positionBuffer.data[9]){
            upperLimitY = this.positionBuffer.data[1];
            lowerLimitY = this.positionBuffer.data[9];
        } else{
            upperLimitY = this.positionBuffer.data[9];
            lowerLimitY = this.positionBuffer.data[1];
        }

        return (x < upperLimitX && x > lowerLimitX && y < upperLimitY && y > lowerLimitY);
    }

    public clone() : MarkerModel {
        let retval = new MarkerModel(
            [
                new Coordinates(this.positionBuffer.data[0], this.positionBuffer.data[1], this.positionBuffer.data[2], this.positionBuffer.data[3]),
                new Coordinates(this.positionBuffer.data[8], this.positionBuffer.data[9], this.positionBuffer.data[10], this.positionBuffer.data[11])
            ],
            this.index,
            new Coordinates(this.colorBuffer.data[0], this.colorBuffer.data[1], this.colorBuffer.data[2], this.colorBuffer.data[3])
        );
        return retval;
    }

    public setColor(color: Coordinates) {
        this.color = color;
        let colorData: Array<number> = [];
        for (let index = 0; index < 4; index++) {
            colorData = colorData.concat(color.getComponents());
        }
        this.colorBuffer.data = new Float32Array(colorData);
    }
}