import { BufferInfo } from "../types/buffer-info";
import { Coordinates } from "../types/coordinates";
import { BufferType } from "../types/enum/buffer-type";
import { ModelType } from "../types/enum/model-state";
import { BaseModel } from "./base-model";

export class LineModel extends BaseModel {
    constructor(points: Array<Coordinates>) {
        super();
        if(points.length != 2) throw Error("Points in line is not 2")
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
    
    public override getBufferData(type: BufferType) : Array<Coordinates>{
        let retval: Array<Coordinates> = []

        let targetBuffer;
        switch (type) {
            case BufferType.COLOR: targetBuffer = this.colorBuffer; break;
            case BufferType.POSITION: targetBuffer = this.positionBuffer.transform(this.uniforms); break;        
            default:
                throw Error("Invalid type buffer requested");
        }

        for (let index = 0; index < 8; index += 4) {
            let coords = new Coordinates(
                targetBuffer.data[index],
                targetBuffer.data[index+1],
                targetBuffer.data[index+2],
                targetBuffer.data[index+3]
            )
            retval.push(coords)
        }

        return retval;
    };
}