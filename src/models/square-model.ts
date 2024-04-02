import { BufferInfo } from "../types/buffer-info";
import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { BaseModel } from "./base-model";

export class SquareModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if(points.length != 2) throw Error("Points in square is not 2")
        this.type = ModelType.SQUARE

        const hLen = Math.abs(points[0].x - points[1].x)
        const vLen = Math.abs(points[0].y - points[1].y)
        const offset = hLen > vLen? vLen : hLen

        const pivot = new Coordinates(
            points[1].x > points[0].x? points[0].x + offset : points[0].x - offset,
            points[1].y > points[0].y? points[0].y + offset : points[0].y - offset
        )

        this.positionBuffer = new BufferInfo(
            4,
            [
                points[0].x, points[0].y, 0, 1,
                points[0].x, pivot.y, 0, 1,
                pivot.x, pivot.y, 0, 1,
                pivot.x, points[0].y, 0, 1
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