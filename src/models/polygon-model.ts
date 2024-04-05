import {BufferInfo} from "../types/buffer-info";
import {Coordinates} from "../types/coordinates";
import {ModelType} from "../types/enum/model-state";
import {hull} from "../util/convex-hull";
import {BaseModel} from "./base-model";

export class PolygonModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if (points.length < 4) throw Error("Points in polygon is less than 3")
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
        this.convexHull();
    }

    public override getCenter(): Coordinates {
        const numOfTriangles = this.positionBuffer.len - 2;
        let centerOfTrianglesX: number[] = []
        let centerOfTrianglesY: number[] = []
        let areaOfTriangles: number[] = []

        for (let index = 0; index < numOfTriangles; index++) {
            const x1 = this.positionBuffer.data[0]
            const y1 = this.positionBuffer.data[1]
            const x2 = this.positionBuffer.data[(index + 1) * 4]
            const y2 = this.positionBuffer.data[(index + 1) * 4 + 1]
            const x3 = this.positionBuffer.data[(index + 2) * 4]
            const y3 = this.positionBuffer.data[(index + 2) * 4 + 1]

            const area = 0.5 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2))
            const x = (x1 + x2 + x3) / 3
            const y = (y1 + y2 + y3) / 3

            areaOfTriangles.push(area)
            centerOfTrianglesX.push(x)
            centerOfTrianglesY.push(y)
        }

        let sumWeightedX = 0;
        let sumWeightedY = 0;
        let polygonArea = 0;
        for (let index = 0; index < centerOfTrianglesX.length; index++) {
            sumWeightedX += centerOfTrianglesX[index] * areaOfTriangles[index]
            sumWeightedY += centerOfTrianglesY[index] * areaOfTriangles[index]
            polygonArea += areaOfTriangles[index]
        }
        return new Coordinates(
            sumWeightedX / polygonArea,
            sumWeightedY / polygonArea,
            0,
            1
        )

    }

    private convexHull(): void {
        const [resPos, resCol] = hull(this.positionBuffer, this.colorBuffer);
        this.positionBuffer = resPos;
        this.colorBuffer = resCol;
    }

    moveVertex(index: number, targetX: number, targetY: number) {
        let positionBuffer = this.positionBuffer.data
        positionBuffer[4 * index] = targetX
        positionBuffer[4 * index + 1] = targetY
        this.positionBuffer.data = new Float32Array(positionBuffer) 
    }
}