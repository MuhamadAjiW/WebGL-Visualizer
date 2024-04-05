import {BufferInfo} from "../types/buffer-info";
import {Coordinates} from "../types/coordinates";
import { BufferType } from "../types/enum/buffer-type";
import {ModelType} from "../types/enum/model-state";
import { m4 } from "../util/m4";
import {BaseModel} from "./base-model";

export class SquareModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if (points.length != 2) throw Error("Points in square is not 2")
        this.type = ModelType.SQUARE

        const center = new Coordinates((points[0].x + points[1].x) / 2, (points[0].y + points[1].y) / 2)

        const vector = new Coordinates(points[1].x - points[0].x, points[1].y - points[0].y)

        const theta = Math.atan2(vector.y, vector.x) - Math.PI / 4

        const translateRotate = m4.translate(m4.zRotate(m4.translation(center.x, center.y, 0),-theta), -center.x, -center.y, 0);
        const initVertex = m4.multiply4x1(translateRotate, points[0].getComponents());
        const endVertex = m4.multiply4x1(translateRotate, points[1].getComponents());

        this.positionBuffer = new BufferInfo(
            4,
            [
                initVertex[0], initVertex[1], 0, 1,
                initVertex[0], endVertex[1], 0, 1,
                endVertex[0], endVertex[1], 0, 1,
                endVertex[0], initVertex[1], 0, 1
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
        this.z_rotation = theta;
    }
    public override moveVertex(index: number, targetX: number, targetY: number) {
        // index = 2;
        // console.log("index", index);
        // const pivotIndex = (index + 2) % 4;
        const pivotIndex = 0

        const pivot = this.getBufferData(BufferType.POSITION, true)[pivotIndex];

        const target = new Coordinates(targetX, targetY);

        const newModel = new SquareModel([pivot, target]);

        return newModel;
    }
}