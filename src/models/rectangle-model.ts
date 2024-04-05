import {BufferInfo} from "../types/buffer-info";
import {Coordinates} from "../types/coordinates";
import { BufferType } from "../types/enum/buffer-type";
import {ModelType} from "../types/enum/model-state";
import { m4 } from "../util/m4";
import {BaseModel} from "./base-model";

export class RectangleModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if (points.length != 2) throw Error("Points in rectangle is not 2")
        this.type = ModelType.RECTANGLE

        this.positionBuffer = new BufferInfo(
            4,
            [
                points[0].x, points[0].y, 0, 1,
                points[0].x, points[1].y, 0, 1,
                points[1].x, points[1].y, 0, 1,
                points[1].x, points[0].y, 0, 1
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

    moveVertex(index: number, offsetX: number, offsetY: number) {
        const pivotIndex = index + 2 % 4;
        const pivot = this.getBufferData(BufferType.POSITION, true)[pivotIndex];

        const target = this.getBufferData(BufferType.POSITION, true)[index];
        const newTarget = new Coordinates(target.x + offsetX, target.y + offsetY);

        const translateRotate = m4.translate(m4.zRotation(-this.z_rotation), -pivot.x, -pivot.y, 0);
        const reverse = m4.zRotate(m4.translation(pivot.x, pivot.y, 0), this.z_rotation);

        const movedPivot = m4.multiply(translateRotate, pivot.getComponents());
        const movedTarget = m4.multiply(translateRotate, newTarget.getComponents());

        const newModel = new RectangleModel([new Coordinates(movedPivot[0], movedPivot[1]), 
                                             new Coordinates(movedTarget[0], movedTarget[1])]);

        newModel.z_rotation = this.z_rotation;
        newModel.x_translation = pivot.x
        newModel.y_translation = pivot.y

        return newModel;
    }
}