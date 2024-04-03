import { BufferInfo, Uniforms } from "../types/buffer-info";
import { Coordinates } from "../types/coordinates";
import { BufferType } from "../types/enum/buffer-type";
import { ModelType } from "../types/enum/model-state";

export class BaseModel {
    public type: ModelType = ModelType.NULL
    public positionBuffer: BufferInfo = new BufferInfo(0, []);
    public colorBuffer: BufferInfo =  new BufferInfo(0, []);
    public uniforms: Uniforms = {u_matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]};

    public getBufferData(type: BufferType, transformed: boolean) : Array<Coordinates>{
        let retval: Array<Coordinates> = []

        let targetBuffer;
        switch (type) {
            case BufferType.COLOR: targetBuffer = this.colorBuffer; break;
            case BufferType.POSITION: targetBuffer = transformed? this.positionBuffer.transform(this.uniforms) : this.positionBuffer; break;        
            default:
                throw Error("Invalid type buffer requested");
        }

        for (let index = 0; index < targetBuffer.data.length; index += 4) {
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

    public clone() : BaseModel {
        let retval = new BaseModel();
        retval.type = this.type;
        retval.positionBuffer = this.positionBuffer.clone();
        retval.colorBuffer = this.colorBuffer.clone();
        retval.uniforms = this.uniforms;
        return retval;
    }
}
