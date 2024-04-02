import { BufferInfo } from "../types/buffer-info";
import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { BaseModel } from "./base-model";

export class PolygonModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if(points.length < 3) throw Error("Points in polygon is less than 3")
        this.type = ModelType.POLYGON

        const positionData: number[] = []
        for (let index = 0; index < points.length; index++) {
            positionData.push(points[index].getComponents())
        }

        const colorData: number[] = []
        for (let index = 0; index < points.length; index++) {
            colorData.push(0.5, 0.5, 0.5, 1)
        }

        this.positionBuffer = new BufferInfo(
            positionData.length,
            positionData
        )
        this.colorBuffer = new BufferInfo(
            colorData.length,
            colorData
        )
    }
}