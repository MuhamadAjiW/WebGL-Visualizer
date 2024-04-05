import {BufferInfo} from "../types/buffer-info";
import {Coordinates} from "../types/coordinates";
import {BufferType} from "../types/enum/buffer-type";
import {ModelType} from "../types/enum/model-state";
import { m4 } from "../util/m4";
import {BaseModel} from "./base-model";

export class LineModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if (points.length != 2) throw Error("Points in line is not 2")
        this.type = ModelType.LINE

        this.positionBuffer = new BufferInfo(
            4,
            [
                points[0].x, points[0].y, 0, 1,
                points[1].x, points[1].y, 0, 1,
                points[0].x, points[0].y, 0, 1,
                points[1].x, points[1].y, 0, 1
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

    public override getBufferData(type: BufferType): Array<Coordinates> {
        let retval: Array<Coordinates> = []

        let targetBuffer;
        switch (type) {
            case BufferType.COLOR:
                targetBuffer = this.colorBuffer;
                break;
            case BufferType.POSITION:
                targetBuffer = this.positionBuffer.transform(this.uniforms);
                break;
            default:
                throw Error("Invalid type buffer requested");
        }

        for (let index = 0; index < 8; index += 4) {
            let coords = new Coordinates(
                targetBuffer.data[index],
                targetBuffer.data[index + 1],
                targetBuffer.data[index + 2],
                targetBuffer.data[index + 3]
            )
            retval.push(coords)
        }

        return retval;
    };

    moveVertex(index: number, targetX: number, targetY: number) {
        // index = 2;
        // console.log("index", index);
        // const pivotIndex = (index + 2) % 4;
        const pivotIndex = 0

        const pivot = this.getBufferData(BufferType.POSITION)[pivotIndex];
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

        const newModel = new LineModel([new Coordinates(movedPivot[0], movedPivot[1]), 
                                             new Coordinates(movedTarget[0], movedTarget[1])]);

        console.log("newModel", newModel.getBufferData(BufferType.POSITION));
        const translateRotateReverse =  m4.translate(m4.zRotate(m4.translation(center.x, center.y, 0), this.z_rotation), -center.x, -center.y, 0);
        console.log("translateRotateReversePivot", m4.multiply4x1(translateRotateReverse, movedPivot));
        console.log("translateRotateReverseTarget", m4.multiply4x1(translateRotateReverse, movedTarget));

        newModel.z_rotation = this.z_rotation;
        newModel.x_translation = 0
        newModel.y_translation = 0

        return newModel;
    }
}