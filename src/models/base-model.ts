import { BufferInfo, Uniforms } from "../types/buffer-info";
import { Coordinates } from "../types/coordinates";
import { ModelType } from "../types/enum/model-state";

export class BaseModel {
    public type: ModelType = ModelType.NULL
    public positionBuffer: BufferInfo = new BufferInfo(0, []);
    public colorBuffer: BufferInfo =  new BufferInfo(0, []);
    public uniforms: Uniforms = {u_matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1]};

    public getCoordinates() : Array<Coordinates>{
        let retval: Array<Coordinates> = []

        for (let index = 0; index < this.positionBuffer.data.length; index += 4) {
            let coords = new Coordinates(
                this.positionBuffer.data[index],
                this.positionBuffer.data[index+1],
                this.positionBuffer.data[index+2],
                this.positionBuffer.data[index+3]
            )
            retval.push(coords)
        }

        return retval;
    };
}
