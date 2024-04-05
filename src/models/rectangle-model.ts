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


    // moveVertex(index: number, targetX: number, targetY: number) {
    //     console.log("index", index);
    //     console.log("targetX", targetX);
    //     console.log("targetY", targetY);
        
    //     const center = this.getCenter();
    //     // index = 2
    //     const target = new Coordinates(targetX, targetY);

    //     const counterSide = new Coordinates(target.x + 2 * (center.x - target.x), target.y + 2 * (center.y - target.y));

    //     const translateRotate = m4.translate(m4.zRotate(m4.translation(center.x, center.y, 0), -this.z_rotation), -center.x, -center.y, 0);

    //     const movedPivot = m4.multiply4x1(translateRotate, counterSide.getComponents());
    //     console.log("movedPivot", movedPivot);
    //     const movedTarget = m4.multiply4x1(translateRotate, target.getComponents());
    //     console.log("movedTarget", movedTarget);

    //     const newModel = new RectangleModel([new Coordinates(movedPivot[0], movedPivot[1]), 
    //                                          new Coordinates(movedTarget[0], movedTarget[1])]);

    //     console.log("newModel", newModel.getBufferData(BufferType.POSITION, true));

    //     const translateRotateReverse =  m4.translate(m4.zRotate(m4.translation(center.x, center.y, 0), this.z_rotation), -center.x, -center.y, 0);
    //     console.log("translateRotateReverse", m4.multiply4x1(translateRotateReverse, movedTarget));

    //     newModel.z_rotation = this.z_rotation;
    //     console.log("newModel.z_rotation", newModel.z_rotation);
    //     newModel.x_translation = 0
    //     newModel.y_translation = 0

    //     return newModel;
    // }

    moveVertex(index: number, targetX: number, targetY: number) {
        // index = 2;
        // console.log("index", index);
        // const pivotIndex = (index + 2) % 4;
        const pivotIndex = 0

        const pivot = this.getBufferData(BufferType.POSITION, true)[pivotIndex];
        console.log("pivotIndex", pivotIndex);
        console.log("pivot", pivot);

        const target = new Coordinates(targetX, targetY);
        console.log("target", target);

        const center = new Coordinates((pivot.x + target.x) / 2, (pivot.y + target.y) / 2);

        const translateRotate = m4.translate(m4.zRotate(m4.translation(center.x, center.y, 0),-this.z_rotation), -center.x, -center.y, 0);

        const movedPivot = m4.multiply4x1(translateRotate, pivot.getComponents());
        console.log("movedPivot", movedPivot);
        const movedTarget = m4.multiply4x1(translateRotate, target.getComponents());
        console.log("movedTarget", movedTarget);

        const newModel = new RectangleModel([new Coordinates(movedPivot[0], movedPivot[1]), 
                                             new Coordinates(movedTarget[0], movedTarget[1])]);

        console.log("newModel", newModel.getBufferData(BufferType.POSITION, true));
        const translateRotateReverse =  m4.translate(m4.zRotate(m4.translation(center.x, center.y, 0), this.z_rotation), -center.x, -center.y, 0);
        console.log("translateRotateReversePivot", m4.multiply4x1(translateRotateReverse, movedPivot));
        console.log("translateRotateReverseTarget", m4.multiply4x1(translateRotateReverse, movedTarget));

        newModel.z_rotation = this.z_rotation;
        newModel.x_translation = 0
        newModel.y_translation = 0

        return newModel;
    }
    
    // moveVertex(index: number, targetX: number, targetY: number) {
    //     console.log("index", index);
    //     console.log("targetX", targetX);
    //     console.log("targetY", targetY);

    //     const pivotIndex = (index + 2) % 4;
    //     // index = 2
    //     const pivot = this.getBufferData(BufferType.POSITION, true)[pivotIndex];
    //     console.log("pivotIndex", pivotIndex);
    //     console.log("pivot", pivot);

    //     const target = this.getBufferData(BufferType.POSITION, true)[index];
    //     const newTarget = new Coordinates(targetX, targetY);

    //     const translateRotate = m4.translate(m4.zRotate(m4.translation(pivot.x, pivot.y, 0),-this.z_rotation), -pivot.x, -pivot.y, 0);
    //     const reverse = m4.zRotate(m4.translation(pivot.x, pivot.y, 0), this.z_rotation);

    //     const movedPivot = m4.multiply4x1(translateRotate, pivot.getComponents());
    //     console.log("movedPivot", movedPivot);
    //     const movedTarget = m4.multiply4x1(translateRotate, newTarget.getComponents());
    //     console.log("movedTarget", movedTarget);

    //     const newModel = new RectangleModel([new Coordinates(movedPivot[0], movedPivot[1]), 
    //                                          new Coordinates(movedTarget[0], movedTarget[1])]);

    //     console.log("newModel", newModel.getBufferData(BufferType.POSITION, true));

    //     const translateRotateReverse =  m4.translate(m4.zRotate(m4.translation(pivot.x, pivot.y, 0),this.z_rotation), -pivot.x, -pivot.y, 0);

    //     const newBuffer = newModel.positionBuffer.data;

    //     const transformedData = new Float32Array(m4.multiply(translateRotateReverse, newBuffer));

    //     console.log("transformedData", transformedData);

    //     newModel.positionBuffer.data = transformedData;

    //     console.log("FInal", newModel.getBufferData(BufferType.POSITION, true));

    //     newModel.z_rotation = 0;
    //     newModel.x_translation = 0
    //     newModel.y_translation = 0

    //     return newModel;
    // }

    setVirtualPosition(x: number, y: number) {
    }


}