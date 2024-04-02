import { BufferInfo, Uniforms } from "../types/buffer-info";
import { ModelType } from "../types/enum/model-state";

export class BaseModel {
    public type: ModelType = ModelType.NULL
    public positionBuffer: BufferInfo = new BufferInfo(0, []);
    public colorBuffer: BufferInfo =  new BufferInfo(0, []);
    public uniforms: Uniforms = {u_matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1]};
}
