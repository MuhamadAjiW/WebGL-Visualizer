import { BufferInfo } from "../types/buffer-info";
import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { BaseModel } from "./base-model";

export class SquareModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if(points.length != 2) throw Error("Points in square is not 2")
        this.type = ModelType.SQUARE

        this.positionBuffer = new BufferInfo(
            4,
            [
                100, 100, 0, 1,
                0, 100, 0, 1,
                0, 0, 0, 1,
                100, 0, 0, 1
            ]
        )
        this.colorBuffer = new BufferInfo(
            4,
            [
                0.5, 0.5, 0.5, 1,
                0.5, 0.5, 0.5, 1,
                0.5, 0.5, 0.5, 1,
                0.5, 0.5, 0.5, 1
            ]
        )
    }
}