import {Coordinates} from "../types/coordinates";
import {SquareModel} from "./square-model";
import {Color} from "../types/color.ts";

export class MarkerModel extends SquareModel {
    static ghost = new SquareModel([new Coordinates(), new Coordinates()]);
    
    public index: number;
    public color: Color;
    private active: boolean;

    constructor(points: Array<Coordinates>, boundIndex: number, color: Color) {
        super(points);
        this.index = boundIndex;
        this.color = color;
        this.active = false;

        let colorData: Array<number> = [];
        for (let index = 0; index < 4; index++) {
            colorData = colorData.concat(color.getComponents());
        }
        this.colorBuffer.data = new Float32Array(colorData);
    }

    public isInside(x: number, y: number): boolean {
        let upperLimitX;
        let lowerLimitX;
        let upperLimitY;
        let lowerLimitY;

        if (this.positionBuffer.data[0] > this.positionBuffer.data[8]) {
            upperLimitX = this.positionBuffer.data[0];
            lowerLimitX = this.positionBuffer.data[8];
        } else {
            upperLimitX = this.positionBuffer.data[8];
            lowerLimitX = this.positionBuffer.data[0];
        }

        if (this.positionBuffer.data[1] > this.positionBuffer.data[9]) {
            upperLimitY = this.positionBuffer.data[1];
            lowerLimitY = this.positionBuffer.data[9];
        } else {
            upperLimitY = this.positionBuffer.data[9];
            lowerLimitY = this.positionBuffer.data[1];
        }

        return (x < upperLimitX && x > lowerLimitX && y < upperLimitY && y > lowerLimitY);
    }

    public clone(): MarkerModel {
        let retval = new MarkerModel(
            [
                new Coordinates(this.positionBuffer.data[0], this.positionBuffer.data[1], this.positionBuffer.data[2], this.positionBuffer.data[3]),
                new Coordinates(this.positionBuffer.data[8], this.positionBuffer.data[9], this.positionBuffer.data[10], this.positionBuffer.data[11])
            ],
            this.index,
            new Color(this.colorBuffer.data[0], this.colorBuffer.data[1], this.colorBuffer.data[2], this.colorBuffer.data[3])
        );
        return retval;
    }

    public setColor(color: Color) {
        this.color = color;
        let colorData: Array<number> = [];
        for (let index = 0; index < 4; index++) {
            colorData = colorData.concat(color.getComponents());
        }
        this.colorBuffer.data = new Float32Array(colorData);
    }

    public highlight() {
        const newColor = new Color(this.color.r, this.color.g, this.color.b, 1);
        this.setColor(newColor);
    }

    public unhighlight() {
        const newColor = new Color(this.color.r, this.color.g, this.color.b, 0.8);
        this.setColor(newColor);
    }

    public setActive(status: boolean) {
        this.active = status;
        if (status) this.highlight();
        else this.unhighlight();
    }

    public isActive(): boolean {
        return this.active;
    }
}