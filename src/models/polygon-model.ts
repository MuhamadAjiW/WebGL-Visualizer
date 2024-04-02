import { BufferInfo } from "../types/buffer-info";
import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";
import { hull } from "../util/convex-hull";
import { BaseModel } from "./base-model";

export class PolygonModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if(points.length < 4) throw Error("Points in polygon is less than 3")
        this.type = ModelType.POLYGON
    
        let positionData: number[] = []
        for (let index = 0; index < points.length; index++) {
            positionData = positionData.concat(points[index].getComponents())
        }

        let colorData: number[] = []
        for (let index = 0; index < points.length; index++) {
            colorData = colorData.concat([0.5, 0.5, 0.5, 1])
        }

        this.positionBuffer = new BufferInfo(
            points.length,
            positionData
        )
        this.colorBuffer = new BufferInfo(
            points.length,
            colorData
        )
        const [resPos, resCol] = hull(this.positionBuffer, this.colorBuffer);
        this.positionBuffer = resPos;
        this.colorBuffer = resCol;
    }

    private convexHull(): void{
        const [resPos, resCol] = hull(this.positionBuffer, this.colorBuffer);
        this.positionBuffer = resPos;
        this.colorBuffer = resCol;
    }
}